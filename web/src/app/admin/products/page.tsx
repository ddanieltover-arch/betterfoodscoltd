import Link from "next/link";
import {
  createProductAction,
  deleteProductAction,
  updateProductStatusAction,
} from "@/actions/adminProducts";
import { AdminDeleteButton } from "@/components/admin/AdminDeleteButton";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatusForm } from "@/components/admin/AdminStatusForm";
import { formatAdminDate, statusLabel } from "@/lib/adminFormat";
import {
  listAdminProducts,
  listCategories,
} from "@/services/adminProductService";

export const metadata = {
  title: "Admin products",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;

export default async function AdminProductsPage() {
  const [products, categories] = await Promise.all([
    listAdminProducts(),
    listCategories(),
  ]);

  return (
    <div className="mx-auto max-w-[var(--brand-container)] px-4 py-10 md:px-6">
      <AdminPageHeader title="Products" current="/admin/products" />

      <section className="mb-8 border border-brand-border bg-surface p-5 md:p-6">
        <h2 className="font-display mb-4 text-xl text-ink">Create product</h2>
        <p className="mb-4 text-xs text-muted">
          Creates in the admin database only. Storefront catalog remains JSON
          until sync.
        </p>
        <AdminStatusForm
          action={createProductAction}
          successMessage="Product created"
          className="grid gap-4 md:grid-cols-2"
        >
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-ink">Name</span>
            <input name="name" required className="field" />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-ink">Slug (optional)</span>
            <input name="slug" className="field" placeholder="auto from name" />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-ink">Category</span>
            <select name="categoryId" className="field" defaultValue="">
              <option value="">Uncategorized</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-ink">Status</span>
            <select name="status" defaultValue="DRAFT" className="field">
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm md:col-span-2">
            <span className="mb-1 block font-medium text-ink">Description</span>
            <textarea name="description" rows={3} className="field" />
          </label>
          <div className="md:col-span-2">
            <button
              type="submit"
              className="btn-press min-h-11 rounded-[var(--brand-radius-md)] bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-dark"
            >
              Create product
            </button>
          </div>
        </AdminStatusForm>
      </section>

      {products.length === 0 ? (
        <p className="rounded-[var(--brand-radius-md)] border border-dashed border-brand-border bg-surface px-4 py-12 text-center text-sm text-muted">
          No products in the admin database. Run{" "}
          <code className="text-ink">npm run db:seed</code> to import the JSON
          catalog.
        </p>
      ) : (
        <div className="overflow-x-auto border border-brand-border bg-surface">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-background text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Updated</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-t border-brand-border">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="font-medium text-brand hover:underline"
                    >
                      {product.name}
                    </Link>
                    <div className="text-xs text-muted">{product.slug}</div>
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {product.category?.name || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <AdminStatusForm
                      action={updateProductStatusAction}
                      className="flex items-center gap-2"
                    >
                      <input type="hidden" name="id" value={product.id} />
                      <select
                        name="status"
                        defaultValue={product.status}
                        className="field !py-1.5"
                        aria-label={`Status for ${product.name}`}
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
                    {formatAdminDate(product.updatedAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="text-sm text-brand hover:underline"
                      >
                        Open
                      </Link>
                      <AdminDeleteButton
                        action={deleteProductAction}
                        id={product.id}
                        confirmMessage={`Delete product ${product.name}?`}
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
