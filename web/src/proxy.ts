import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

/** Normalize for trailingSlash: true (e.g. /admin/login/ → /admin/login). */
function normalizePathname(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

/**
 * Edge-safe Auth.js instance (no Prisma). Reads the same JWT cookies that
 * sign-in sets — including `__Secure-authjs.session-token` on HTTPS.
 */
const { auth } = NextAuth(authConfig);

export const proxy = auth((request) => {
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
  const isLoggedIn = !!request.auth?.user;

  if (isLogin) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/admin/", request.url));
    }
    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  if (!isLoggedIn) {
    const loginUrl = new URL("/admin/login/", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images|.*\\..*).*)"],
};
