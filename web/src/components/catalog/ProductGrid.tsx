import Link from "next/link";
import { Package } from "lucide-react";
import type { Product } from "@/types";
import { Reveal } from "@/components/motion/Reveal";
import { ProductCard } from "./ProductCard";

type Props = {
  products: Product[];
};

export function ProductGrid({ products }: Props) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center py-16 text-center">
        <Package className="size-10 text-muted/50" aria-hidden />
        <p className="mt-4 text-lg text-muted">No products found.</p>
        <p className="mt-1 max-w-sm text-sm text-muted/80">
          Try another category, or browse the full wholesale catalog.
        </p>
        <Link
          href="/shop/"
          className="btn-press mt-6 inline-flex rounded-md bg-brand px-5 py-3 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          Browse catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product, index) => (
        <Reveal key={product.id} delay={Math.min(index, 8) * 0.05}>
          <ProductCard product={product} />
        </Reveal>
      ))}
    </div>
  );
}
