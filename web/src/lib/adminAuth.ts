import type { AdminRole } from "@prisma/client";
import { auth } from "@/auth";

export type AdminSessionUser = {
  id: string;
  email: string;
  name?: string | null;
  role: AdminRole;
};

const WRITE_ROLES: AdminRole[] = ["SUPER_ADMIN", "ADMIN"];
const CMS_WRITE_ROLES: AdminRole[] = ["SUPER_ADMIN", "ADMIN", "EDITOR"];
const SALES_WRITE_ROLES: AdminRole[] = [
  "SUPER_ADMIN",
  "ADMIN",
  "SALES_MANAGER",
];

export async function requireAdmin(): Promise<AdminSessionUser> {
  const session = await auth();
  const user = session?.user;
  if (!user?.id || !user.email || !user.role) {
    throw new Error("Unauthorized");
  }
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}

export async function requireAdminWrite(): Promise<AdminSessionUser> {
  const user = await requireAdmin();
  if (!WRITE_ROLES.includes(user.role)) {
    throw new Error("Forbidden");
  }
  return user;
}

export async function requireCmsWrite(): Promise<AdminSessionUser> {
  const user = await requireAdmin();
  if (!CMS_WRITE_ROLES.includes(user.role)) {
    throw new Error("Forbidden");
  }
  return user;
}

export async function requireSalesWrite(): Promise<AdminSessionUser> {
  const user = await requireAdmin();
  if (!SALES_WRITE_ROLES.includes(user.role)) {
    throw new Error("Forbidden");
  }
  return user;
}

export function safeAdminCallbackUrl(raw: string | null | undefined): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) {
    return "/admin/";
  }
  const path = raw.length > 1 && raw.endsWith("/") ? raw.slice(0, -1) : raw;
  if (!path.startsWith("/admin") || path === "/admin/login") {
    return "/admin/";
  }
  return `${path}/`;
}
