import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/** Normalize for trailingSlash: true (e.g. /admin/login/ → /admin/login). */
function normalizePathname(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const path = normalizePathname(pathname);
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  if (!path.startsWith("/admin")) {
    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  const isLogin = path === "/admin/login";
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
  });

  if (isLogin) {
    if (token) {
      return NextResponse.redirect(new URL("/admin/", request.url));
    }
    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  if (!token) {
    const loginUrl = new URL("/admin/login/", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images|.*\\..*).*)"],
};
