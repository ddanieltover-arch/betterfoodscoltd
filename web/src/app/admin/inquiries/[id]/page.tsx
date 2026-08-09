import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteInquiryAction } from "@/actions/adminInquiries";
import { AdminDeleteButton } from "@/components/admin/AdminDeleteButton";
import { AdminInquiryEditForm } from "@/components/admin/AdminInquiryEditForm";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { formatAdminDate } from "@/lib/adminFormat";
import { getInquiryById } from "@/services/inquiryService";

export const metadata = {
  title: "Inquiry detail",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminInquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const inquiry = await getInquiryById(id);
  if (!inquiry) notFound();

  return (
    <div className="mx-auto max-w-[var(--brand-container)] px-4 py-10 md:px-6">
      <AdminPageHeader title={inquiry.contactName} current="/admin/inquiries" />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-muted">
          <Link href="/admin/inquiries" className="text-brand hover:underline">
            ← Back to inquiries
          </Link>
          <span className="mx-2">·</span>
          Created {formatAdminDate(inquiry.createdAt)}
        </div>
        <AdminDeleteButton
          action={deleteInquiryAction}
          id={inquiry.id}
          hrefAfter="/admin/inquiries"
          confirmMessage={`Delete inquiry from ${inquiry.contactName}?`}
        />
      </div>

      <section className="border border-brand-border bg-surface p-5 md:p-6">
        <AdminInquiryEditForm inquiry={inquiry} />
      </section>
    </div>
  );
}
