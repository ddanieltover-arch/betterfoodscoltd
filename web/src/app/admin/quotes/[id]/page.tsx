import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteQuoteAction } from "@/actions/adminQuotes";
import { AdminDeleteButton } from "@/components/admin/AdminDeleteButton";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminQuoteEditForm } from "@/components/admin/AdminQuoteEditForm";
import { formatAdminDate } from "@/lib/adminFormat";
import { getQuoteById } from "@/services/quoteService";

export const metadata = {
  title: "Quote detail",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminQuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const quote = await getQuoteById(id);
  if (!quote) notFound();

  return (
    <div className="mx-auto max-w-[var(--brand-container)] px-4 py-10 md:px-6">
      <AdminPageHeader title={quote.referenceCode} current="/admin/quotes" />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-muted">
          <Link href="/admin/quotes" className="text-brand hover:underline">
            ← Back to quotes
          </Link>
          <span className="mx-2">·</span>
          Created {formatAdminDate(quote.createdAt)}
        </div>
        <AdminDeleteButton
          action={deleteQuoteAction}
          id={quote.id}
          hrefAfter="/admin/quotes"
          confirmMessage={`Delete quote ${quote.referenceCode}?`}
        />
      </div>

      <section className="border border-brand-border bg-surface p-5 md:p-6">
        <AdminQuoteEditForm quote={quote} />
      </section>
    </div>
  );
}
