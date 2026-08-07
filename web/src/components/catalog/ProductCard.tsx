import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types";
import { AddToQuoteButton } from "./AddToQuoteButton";

type Props = {
  product: Product;
};

export function ProductCard({ product }: Props) {
  const image = product.images[0];
  const flags = product.flags;

  return (
    <article className="group flex flex-col transition-transform duration-300 ease-out hover:-translate-y-1">
      <Link
        href={`/product/${product.slug}/`}
        className="relative aspect-[4/3] overflow-hidden bg-surface shadow-sm ring-1 ring-ink/5 transition duration-300 group-hover:shadow-md group-hover:ring-brand/20"
      >
        {image ? (
          <Image
            src={image.src}
            alt={image.alt || product.name}
            fill
            className="object-cover transition duration-500 ease-out group-hover:scale-[1.04]"
            sizes="(max-width:768px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted">
            No image
          </div>
        )}
        {flags?.halal || flags?.organic ? (
          <div className="absolute left-2 top-2 flex flex-wrap gap-1">
            {flags?.halal ? (
              <span className="bg-brand px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                Halal
              </span>
            ) : null}
            {flags?.organic ? (
              <span className="bg-ink/80 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                Organic
              </span>
            ) : null}
          </div>
        ) : null}
      </Link>
      <div className="flex flex-1 flex-col gap-3 pt-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-brand">
            {product.categories[0]?.name ?? "Product"}
          </p>
          <h3 className="mt-1 font-display text-xl tracking-wide text-ink">
            <Link
              href={`/product/${product.slug}/`}
              className="transition-colors hover:text-brand"
            >
              {product.name}
            </Link>
          </h3>
        </div>
        <p className="text-sm text-muted">Request wholesale pricing</p>
        <AddToQuoteButton product={product} className="mt-auto w-full" />
      </div>
    </article>
  );
}
