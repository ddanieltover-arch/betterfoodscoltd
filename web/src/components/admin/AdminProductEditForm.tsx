"use client";

import type { Category, Product, ProductImage } from "@prisma/client";
import {
  addProductImageAction,
  deleteProductImageAction,
  updateProductAction,
} from "@/actions/adminProducts";
import { AdminDeleteButton } from "@/components/admin/AdminDeleteButton";
import { AdminStatusForm } from "@/components/admin/AdminStatusForm";

const STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;

type ProductWithRelations = Product & {
  category: Category | null;
  images: ProductImage[];
};

export function AdminProductEditForm({
  product,
  categories,
}: {
  product: ProductWithRelations;
  categories: Category[];
}) {
  let bullets = "";
  try {
    const parsed = JSON.parse(product.bulletsJson) as unknown;
    if (Array.isArray(parsed)) bullets = parsed.join("\n");
  } catch {
    bullets = "";
  }

  return (
    <div className="space-y-8">
      <AdminStatusForm action={updateProductAction} className="space-y-4">
        <input type="hidden" name="id" value={product.id} />

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm md:col-span-2">
            <span className="mb-1 block font-medium text-ink">Name</span>
            <input
              name="name"
              defaultValue={product.name}
              required
              className="field"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-ink">Slug</span>
            <input
              name="slug"
              defaultValue={product.slug}
              required
              className="field"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-ink">Category</span>
            <select
              name="categoryId"
              defaultValue={product.categoryId ?? ""}
              className="field"
            >
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
            <select name="status" defaultValue={product.status} className="field">
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-ink">Short description</span>
            <input
              name="shortDescription"
              defaultValue={product.shortDescription ?? ""}
              className="field"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-ink">Price</span>
            <input
              name="price"
              type="number"
              step="0.01"
              defaultValue={product.price}
              className="field"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-ink">Currency</span>
            <input
              name="currency"
              defaultValue={product.currency}
              className="field"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-ink">Stock status</span>
            <input
              name="stockStatus"
              defaultValue={product.stockStatus ?? ""}
              className="field"
            />
          </label>
        </div>

        <label className="block text-sm">
          <span className="mb-1 block font-medium text-ink">
            Bullets (one per line)
          </span>
          <textarea
            name="bullets"
            rows={4}
            defaultValue={bullets}
            className="field"
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block font-medium text-ink">Description</span>
          <textarea
            name="description"
            rows={6}
            defaultValue={product.description}
            className="field"
          />
        </label>

        <div className="flex flex-wrap gap-4 text-sm">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              name="quoteOnly"
              defaultChecked={product.quoteOnly}
            />
            Quote only
          </label>
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" name="halal" defaultChecked={product.halal} />
            HALAL
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              name="organic"
              defaultChecked={product.organic}
            />
            Organic
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              name="freshNoChemicals"
              defaultChecked={product.freshNoChemicals}
            />
            Fresh / no chemicals
          </label>
        </div>

        <p className="text-xs text-muted">
          Hybrid catalog: storefront still reads JSON. Admin edits apply here
          only until a sync is implemented.
        </p>

        <button
          type="submit"
          className="btn-press min-h-11 rounded-[var(--brand-radius-md)] bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          Save product
        </button>
      </AdminStatusForm>

      <section className="border-t border-brand-border pt-6">
        <h2 className="font-display mb-4 text-xl text-ink">Images</h2>
        {product.images.length === 0 ? (
          <p className="mb-4 rounded-[var(--brand-radius-md)] border border-dashed border-brand-border px-4 py-6 text-sm text-muted">
            No images attached.
          </p>
        ) : (
          <ul className="mb-4 space-y-2">
            {product.images.map((image) => (
              <li
                key={image.id}
                className="flex flex-wrap items-center justify-between gap-3 border border-brand-border px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm text-ink">{image.url}</p>
                  <p className="text-xs text-muted">
                    {image.alt || "No alt"}
                    {image.isPrimary ? " · Primary" : ""}
                  </p>
                </div>
                <AdminDeleteButton
                  action={deleteProductImageAction}
                  id={image.id}
                  label="Remove"
                  confirmMessage="Remove this image?"
                />
              </li>
            ))}
          </ul>
        )}

        <AdminStatusForm
          action={addProductImageAction}
          successMessage="Image added"
          className="grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end"
        >
          <input type="hidden" name="productId" value={product.id} />
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-ink">Image URL</span>
            <input name="url" required className="field" placeholder="/images/..." />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-ink">Alt text</span>
            <input name="alt" className="field" />
          </label>
          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" name="isPrimary" />
              Primary
            </label>
            <button
              type="submit"
              className="btn-press min-h-11 rounded-[var(--brand-radius-md)] bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-dark"
            >
              Add
            </button>
          </div>
        </AdminStatusForm>
      </section>
    </div>
  );
}
