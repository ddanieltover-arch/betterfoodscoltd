import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { formatAdminDate, statusLabel } from "@/lib/adminFormat";
import { countProducts } from "@/services/adminProductService";
import {
  countNewInquiries,
  listRecentInquiries,
} from "@/services/inquiryService";
import {
  countQuotesByStatuses,
  listRecentQuotes,
} from "@/services/quoteService";

export const metadata = {
  title: "Admin dashboard",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [pendingQuotes, newInquiries, productCount, recentQuotes, recentInquiries] =
    await Promise.all([
      countQuotesByStatuses(["NEW", "IN_PROGRESS", "AWAITING_INFO"]),
      countNewInquiries(),
      countProducts(),
      listRecentQuotes(6),
      listRecentInquiries(6),
    ]);

  const widgets = [
    {
      href: "/admin/quotes",
      label: "Pending quotations",
      value: pendingQuotes,
    },
    {
      href: "/admin/inquiries",
      label: "New inquiries",
      value: newInquiries,
    },
    {
      href: "/admin/products",
      label: "Products",
      value: productCount,
    },
  ];

  return (
    <div className="mx-auto max-w-[var(--brand-container)] px-4 py-10 md:px-6">
      <AdminPageHeader title="Dashboard" current="/admin" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {widgets.map((widget) => (
          <Link
            key={widget.href}
            href={widget.href}
            className="border border-brand-border bg-surface p-5 transition hover:border-accent"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              {widget.label}
            </p>
            <p className="font-display mt-2 text-4xl text-brand">
              {widget.value}
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="border border-brand-border bg-surface p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-display text-xl text-ink">Recent quotes</h2>
            <Link href="/admin/quotes" className="text-sm text-brand hover:underline">
              View all
            </Link>
          </div>
          {recentQuotes.length === 0 ? (
            <p className="rounded-[var(--brand-radius-md)] border border-dashed border-brand-border px-4 py-8 text-center text-sm text-muted">
              No quote requests yet.
            </p>
          ) : (
            <ul className="divide-y divide-brand-border">
              {recentQuotes.map((quote) => (
                <li key={quote.id} className="flex items-center justify-between gap-3 py-3">
                  <div>
                    <Link
                      href={`/admin/quotes/${quote.id}`}
                      className="font-medium text-ink hover:text-brand"
                    >
                      {quote.referenceCode}
                    </Link>
                    <p className="text-sm text-muted">
                      {quote.companyName || quote.contactName} ·{" "}
                      {statusLabel(quote.status)}
                    </p>
                  </div>
                  <time className="shrink-0 text-xs text-muted">
                    {formatAdminDate(quote.createdAt)}
                  </time>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="border border-brand-border bg-surface p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-display text-xl text-ink">Recent inquiries</h2>
            <Link
              href="/admin/inquiries"
              className="text-sm text-brand hover:underline"
            >
              View all
            </Link>
          </div>
          {recentInquiries.length === 0 ? (
            <p className="rounded-[var(--brand-radius-md)] border border-dashed border-brand-border px-4 py-8 text-center text-sm text-muted">
              No inquiries yet.
            </p>
          ) : (
            <ul className="divide-y divide-brand-border">
              {recentInquiries.map((inquiry) => (
                <li
                  key={inquiry.id}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <div>
                    <Link
                      href={`/admin/inquiries/${inquiry.id}`}
                      className="font-medium text-ink hover:text-brand"
                    >
                      {inquiry.contactName}
                    </Link>
                    <p className="text-sm text-muted">
                      {inquiry.subject || inquiry.email} ·{" "}
                      {statusLabel(inquiry.status)}
                    </p>
                  </div>
                  <time className="shrink-0 text-xs text-muted">
                    {formatAdminDate(inquiry.createdAt)}
                  </time>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
