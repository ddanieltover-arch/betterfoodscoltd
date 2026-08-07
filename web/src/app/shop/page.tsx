import type { Metadata } from "next";
import Link from "next/link";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { categories, products } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Wholesale beef, pork, and poultry catalog — request a quote for bulk supply.",
  alternates: { canonical: "/shop/" },
};

export default function ShopPage() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h1 className="font-display text-4xl tracking-wide text-ink">Shop</h1>
        <p className="mt-3 text-muted">
          {products.length} wholesale products across beef, pork, and poultry.
        </p>

        <ul className="mt-8 flex flex-wrap gap-3">
          {categories.map((cat) => (
            <li key={cat.slug}>
              <Link
                href={`/product-category/${cat.slug}/`}
                className="inline-flex rounded-md border border-ink/15 px-3 py-1.5 text-sm font-medium text-ink transition hover:border-brand hover:text-brand"
              >
                {cat.name} ({cat.count})
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-12">
          <ProductGrid products={products} />
        </div>
      </div>
    </section>
  );
}
