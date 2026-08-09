import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteProductAction } from "@/actions/adminProducts";
import { AdminDeleteButton } from "@/components/admin/AdminDeleteButton";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminProductEditForm } from "@/components/admin/AdminProductEditForm";
import {
  getAdminProductById,
  listCategories,
} from "@/services/adminProductService";

export const metadata = {
  title: "Product detail",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    getAdminProductById(id),
    listCategories(),
  ]);
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-[var(--brand-container)] px-4 py-10 md:px-6">
      <AdminPageHeader title={product.name} current="/admin/products" />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Link href="/admin/products" className="text-sm text-brand hover:underline">
          ← Back to products
        </Link>
        <AdminDeleteButton
          action={deleteProductAction}
          id={product.id}
          hrefAfter="/admin/products"
          confirmMessage={`Delete product ${product.name}?`}
        />
      </div>

      <section className="border border-brand-border bg-surface p-5 md:p-6">
        <AdminProductEditForm product={product} categories={categories} />
      </section>
    </div>
  );
}
