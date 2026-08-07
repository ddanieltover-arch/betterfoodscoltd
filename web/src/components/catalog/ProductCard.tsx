import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types";
import { AddToQuoteButton } from "./AddToQuoteButton";

type Props = {
  product: Product;
};

export function ProductCard({ product }: Props) {
  const image = product.images[0];

  return (
    <article className="group flex flex-col">
      <Link
        href={`/product/${product.slug}/`}
        className="relative aspect-[4/3] overflow-hidden bg-surface"
      >
        {image ? (
          <Image
            src={image.src}
            alt={image.alt || product.name}
            fill
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
            sizes="(max-width:768px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted">
            No image
          </div>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-3 pt-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-brand">
            {product.categories[0]?.name ?? "Product"}
          </p>
          <h3 className="mt-1 font-display text-xl tracking-wide text-ink">
            <Link href={`/product/${product.slug}/`} className="hover:text-brand">
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
