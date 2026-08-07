import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import {
  categories,
  getCategoryBySlug,
  getProductsByCategory,
} from "@/lib/catalog";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) return { title: "Category" };
  return {
    title: category.name,
    description:
      category.description ||
      `Wholesale ${category.name} from BETTER FOODS CO., LTD.`,
    alternates: { canonical: `/product-category/${category.slug}/` },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) notFound();

  const items = getProductsByCategory(slug);

  return (
    <section className="py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h1 className="font-display text-4xl tracking-wide text-ink">
          {category.name}
        </h1>
        {category.description ? (
          <p className="mt-4 max-w-3xl whitespace-pre-line text-muted">
            {category.description}
          </p>
        ) : (
          <p className="mt-3 text-muted">
            {items.length} wholesale products available for quote.
          </p>
        )}
        <div className="mt-12">
          <ProductGrid products={items} />
        </div>
      </div>
    </section>
  );
}
