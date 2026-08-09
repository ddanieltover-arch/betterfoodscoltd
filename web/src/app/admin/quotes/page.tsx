import Link from "next/link";
import {
  deleteQuoteAction,
  updateQuoteStatusAction,
} from "@/actions/adminQuotes";
import { AdminDeleteButton } from "@/components/admin/AdminDeleteButton";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatusForm } from "@/components/admin/AdminStatusForm";
import { formatAdminDate, statusLabel } from "@/lib/adminFormat";
import { listQuotes } from "@/services/quoteService";

export const metadata = {
  title: "Admin quotes",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const STATUSES = [
  "NEW",
  "IN_PROGRESS",
  "AWAITING_INFO",
  "QUOTED",
  "CLOSED",
  "SPAM",
  "ARCHIVED",
] as const;

export default async function AdminQuotesPage() {
  const quotes = await listQuotes();

  return (
    <div className="mx-auto max-w-[var(--brand-container)] px-4 py-10 md:px-6">
      <AdminPageHeader title="Quotes" current="/admin/quotes" />

      {quotes.length === 0 ? (
        <p className="rounded-[var(--brand-radius-md)] border border-dashed border-brand-border bg-surface px-4 py-12 text-center text-sm text-muted">
          No quote requests yet. New RFQs from the site will appear here.
        </p>
      ) : (
        <div className="overflow-x-auto border border-brand-border bg-surface">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-background text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Reference</th>
                <th className="px-4 py-3 font-medium">Contact</th>
                <th className="px-4 py-3 font-medium">Items</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Created</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {quotes.map((quote) => (
                <tr key={quote.id} className="border-t border-brand-border">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/quotes/${quote.id}`}
                      className="font-medium text-brand hover:underline"
                    >
                      {quote.referenceCode}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-ink">{quote.contactName}</div>
                    <div className="text-xs text-muted">
                      {quote.companyName || quote.email}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted">{quote.items.length}</td>
                  <td className="px-4 py-3">
                    <AdminStatusForm
                      action={updateQuoteStatusAction}
                      className="flex items-center gap-2"
                    >
                      <input type="hidden" name="id" value={quote.id} />
                      <select
                        name="status"
                        defaultValue={quote.status}
                        className="field !py-1.5"
                        aria-label={`Status for ${quote.referenceCode}`}
                      >
                        {STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {statusLabel(status)}
                          </option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        className="rounded-[var(--brand-radius-md)] bg-brand px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-brand-dark"
                      >
                        Save
                      </button>
                    </AdminStatusForm>
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {formatAdminDate(quote.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/admin/quotes/${quote.id}`}
                        className="text-sm text-brand hover:underline"
                      >
                        Open
                      </Link>
                      <AdminDeleteButton
                        action={deleteQuoteAction}
                        id={quote.id}
                        confirmMessage={`Delete quote ${quote.referenceCode}?`}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
