"use client";

import type { Inquiry } from "@prisma/client";
import { updateInquiryAction } from "@/actions/adminInquiries";
import { AdminStatusForm } from "@/components/admin/AdminStatusForm";

const STATUSES = [
  "NEW",
  "IN_PROGRESS",
  "CLOSED",
  "SPAM",
  "ARCHIVED",
] as const;

export function AdminInquiryEditForm({ inquiry }: { inquiry: Inquiry }) {
  return (
    <AdminStatusForm action={updateInquiryAction} className="space-y-4">
      <input type="hidden" name="id" value={inquiry.id} />

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-ink">Contact name</span>
          <input
            name="contactName"
            defaultValue={inquiry.contactName}
            required
            className="field"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-ink">Company</span>
          <input
            name="companyName"
            defaultValue={inquiry.companyName ?? ""}
            className="field"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-ink">Email</span>
          <input
            name="email"
            type="email"
            defaultValue={inquiry.email}
            required
            className="field"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-ink">Phone</span>
          <input
            name="phone"
            defaultValue={inquiry.phone ?? ""}
            className="field"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-ink">Country</span>
          <input
            name="country"
            defaultValue={inquiry.country ?? ""}
            className="field"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-ink">Status</span>
          <select name="status" defaultValue={inquiry.status} className="field">
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {status.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block text-sm">
        <span className="mb-1 block font-medium text-ink">Subject</span>
        <input
          name="subject"
          defaultValue={inquiry.subject ?? ""}
          className="field"
        />
      </label>

      <label className="block text-sm">
        <span className="mb-1 block font-medium text-ink">Message</span>
        <textarea
          name="message"
          rows={6}
          defaultValue={inquiry.message}
          required
          className="field"
        />
      </label>

      <button
        type="submit"
        className="btn-press min-h-11 rounded-[var(--brand-radius-md)] bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-dark"
      >
        Save inquiry
      </button>
    </AdminStatusForm>
  );
}
