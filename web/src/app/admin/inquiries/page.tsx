import Link from "next/link";
import {
  deleteInquiryAction,
  updateInquiryStatusAction,
} from "@/actions/adminInquiries";
import { AdminDeleteButton } from "@/components/admin/AdminDeleteButton";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatusForm } from "@/components/admin/AdminStatusForm";
import { formatAdminDate, statusLabel } from "@/lib/adminFormat";
import { listInquiries } from "@/services/inquiryService";

export const metadata = {
  title: "Admin inquiries",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const STATUSES = [
  "NEW",
  "IN_PROGRESS",
  "CLOSED",
  "SPAM",
  "ARCHIVED",
] as const;

export default async function AdminInquiriesPage() {
  const inquiries = await listInquiries();

  return (
    <div className="mx-auto max-w-[var(--brand-container)] px-4 py-10 md:px-6">
      <AdminPageHeader title="Inquiries" current="/admin/inquiries" />

      {inquiries.length === 0 ? (
        <p className="rounded-[var(--brand-radius-md)] border border-dashed border-brand-border bg-surface px-4 py-12 text-center text-sm text-muted">
          No inquiries yet. Contact form submissions will appear here.
        </p>
      ) : (
        <div className="overflow-x-auto border border-brand-border bg-surface">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-background text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Contact</th>
                <th className="px-4 py-3 font-medium">Subject</th>
                <th className="px-4 py-3 font-medium">Source</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Created</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {inquiries.map((inquiry) => (
                <tr key={inquiry.id} className="border-t border-brand-border">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/inquiries/${inquiry.id}`}
                      className="font-medium text-brand hover:underline"
                    >
                      {inquiry.contactName}
                    </Link>
                    <div className="text-xs text-muted">{inquiry.email}</div>
                  </td>
                  <td className="px-4 py-3 text-ink">
                    {inquiry.subject || "—"}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {statusLabel(inquiry.source)}
                  </td>
                  <td className="px-4 py-3">
                    <AdminStatusForm
                      action={updateInquiryStatusAction}
                      className="flex items-center gap-2"
                    >
                      <input type="hidden" name="id" value={inquiry.id} />
                      <select
                        name="status"
                        defaultValue={inquiry.status}
                        className="field !py-1.5"
                        aria-label={`Status for ${inquiry.contactName}`}
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
                    {formatAdminDate(inquiry.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/admin/inquiries/${inquiry.id}`}
                        className="text-sm text-brand hover:underline"
                      >
                        Open
                      </Link>
                      <AdminDeleteButton
                        action={deleteInquiryAction}
                        id={inquiry.id}
                        confirmMessage={`Delete inquiry from ${inquiry.contactName}?`}
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
