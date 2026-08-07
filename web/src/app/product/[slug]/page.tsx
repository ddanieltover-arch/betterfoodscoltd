import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToQuoteButton } from "@/components/catalog/AddToQuoteButton";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import {
  getProductBySlug,
  getProductsByCategory,
  products,
} from "@/lib/catalog";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: "Product" };
  return {
    title: product.name,
    description:
      product.description ||
      `Wholesale ${product.name} from BETTER FOODS CO., LTD — request a quote.`,
    alternates: { canonical: `/product/${product.slug}/` },
    openGraph: {
      images: product.images[0]?.src ? [product.images[0].src] : undefined,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const category = product.categories[0];
  const related = category
    ? getProductsByCategory(category.slug)
        .filter((p) => p.id !== product.id)
        .slice(0, 4)
    : [];
  const image = product.images[0];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: image?.src,
    brand: { "@type": "Brand", name: "BETTER FOODS CO., LTD" },
    offers: {
      "@type": "Offer",
      priceCurrency: "THB",
      availability: "https://schema.org/InStock",
      url: `https://betterfoodcoltd.com/product/${product.slug}/`,
      priceSpecification: {
        "@type": "PriceSpecification",
        priceCurrency: "THB",
        description: "Quote on request",
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="py-12 sm:py-16">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-2">
          <div className="relative aspect-[4/3] overflow-hidden bg-surface">
            {image ? (
              <Image
                src={image.src}
                alt={image.alt || product.name}
                fill
                className="object-cover"
                sizes="(max-width:1024px) 100vw, 50vw"
                priority
              />
            ) : null}
          </div>
          <div>
            {category ? (
              <Link
                href={`/product-category/${category.slug}/`}
                className="text-xs font-semibold uppercase tracking-[0.2em] text-brand"
              >
                {category.name}
              </Link>
            ) : null}
            <h1 className="mt-3 font-display text-4xl tracking-wide text-ink">
              {product.name}
            </h1>
            <p className="mt-4 text-muted">Wholesale pricing on request</p>

            {product.flags?.halal ||
            product.flags?.organic ||
            product.flags?.freshNoChemicals ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {product.flags.halal ? (
                  <span className="border border-brand/30 bg-brand/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-brand">
                    HALAL
                  </span>
                ) : null}
                {product.flags.organic ? (
                  <span className="border border-ink/15 bg-surface px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-ink">
                    Organic
                  </span>
                ) : null}
                {product.flags.freshNoChemicals ? (
                  <span className="border border-ink/15 bg-surface px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-ink">
                    No chemicals
                  </span>
                ) : null}
              </div>
            ) : null}

            {product.bullets.length > 0 ? (
              <ul className="mt-6 space-y-2 text-sm text-ink/80">
                {product.bullets.map((b) => (
                  <li key={b} className="flex gap-2">
                    <span className="text-brand" aria-hidden>
                      ✓
                    </span>
                    {b}
                  </li>
                ))}
              </ul>
            ) : null}

            {product.description ? (
              <p className="mt-6 leading-relaxed text-muted">
                {product.description}
              </p>
            ) : null}

            <div className="mt-8 flex flex-wrap gap-3">
              <AddToQuoteButton product={product} />
              <Link
                href="/quote-list/"
                className="inline-flex items-center rounded-md border border-ink/15 px-4 py-2.5 text-sm font-semibold text-ink hover:border-brand hover:text-brand"
              >
                View quote list
              </Link>
            </div>
          </div>
        </div>
      </section>

      {related.length > 0 ? (
        <section className="border-t border-ink/10 py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="font-display text-3xl tracking-wide text-ink">
              Related products
            </h2>
            <div className="mt-8">
              <ProductGrid products={related} />
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
