"use client";

import type { QuoteLineItem, QuoteRequest } from "@prisma/client";
import { updateQuoteAction } from "@/actions/adminQuotes";
import { AdminStatusForm } from "@/components/admin/AdminStatusForm";

const STATUSES = [
  "NEW",
  "IN_PROGRESS",
  "AWAITING_INFO",
  "QUOTED",
  "CLOSED",
  "SPAM",
  "ARCHIVED",
] as const;

type Quote = QuoteRequest & { items: QuoteLineItem[] };

export function AdminQuoteEditForm({ quote }: { quote: Quote }) {
  return (
    <AdminStatusForm action={updateQuoteAction} className="space-y-4">
      <input type="hidden" name="id" value={quote.id} />
      <input type="hidden" name="version" value={quote.version} />

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-ink">Contact name</span>
          <input
            name="contactName"
            defaultValue={quote.contactName}
            required
            className="field"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-ink">Company</span>
          <input
            name="companyName"
            defaultValue={quote.companyName ?? ""}
            className="field"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-ink">Email</span>
          <input
            name="email"
            type="email"
            defaultValue={quote.email}
            required
            className="field"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-ink">Phone</span>
          <input
            name="phone"
            defaultValue={quote.phone ?? ""}
            className="field"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-ink">Country</span>
          <input
            name="country"
            defaultValue={quote.country ?? ""}
            className="field"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-ink">Status</span>
          <select name="status" defaultValue={quote.status} className="field">
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {status.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block text-sm">
        <span className="mb-1 block font-medium text-ink">Message</span>
        <textarea
          name="message"
          rows={4}
          defaultValue={quote.message ?? ""}
          className="field"
        />
      </label>

      <div>
        <p className="mb-2 text-sm font-medium text-ink">Line items</p>
        <div className="overflow-x-auto border border-brand-border">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-background text-muted">
              <tr>
                <th className="px-3 py-2 font-medium">Product</th>
                <th className="px-3 py-2 font-medium">Qty</th>
                <th className="px-3 py-2 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody>
              {quote.items.map((item) => (
                <tr key={item.id} className="border-t border-brand-border">
                  <td className="px-3 py-2 text-ink">
                    {item.name}
                    <span className="block text-xs text-muted">{item.slug}</span>
                  </td>
                  <td className="px-3 py-2">{item.quantity}</td>
                  <td className="px-3 py-2 text-muted">{item.notes || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <button
        type="submit"
        className="btn-press min-h-11 rounded-[var(--brand-radius-md)] bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-dark"
      >
        Save quote
      </button>
    </AdminStatusForm>
  );
}
