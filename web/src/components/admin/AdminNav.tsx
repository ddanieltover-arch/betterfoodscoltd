import Link from "next/link";
import { AdminSignOutButton } from "@/components/admin/AdminSignOutButton";

const LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/quotes", label: "Quotes" },
  { href: "/admin/inquiries", label: "Inquiries" },
  { href: "/admin/products", label: "Products" },
] as const;

export function AdminNav({ current }: { current: string }) {
  return (
    <nav
      aria-label="Admin"
      className="flex flex-wrap items-center gap-2"
    >
      {LINKS.map((link) => {
        const active =
          link.href === "/admin"
            ? current === "/admin"
            : current === link.href || current.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={
              active
                ? "rounded-[var(--brand-radius-md)] bg-brand px-3 py-1.5 text-sm font-medium text-white"
                : "rounded-[var(--brand-radius-md)] px-3 py-1.5 text-sm text-muted transition hover:bg-surface hover:text-ink"
            }
          >
            {link.label}
          </Link>
        );
      })}
      <AdminSignOutButton />
    </nav>
  );
}
