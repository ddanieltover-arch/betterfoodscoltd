"use client";

import { useState } from "react";
import { useQuoteStore } from "@/store/quote";
import type { Product } from "@/types";
import { cn } from "@/lib/utils";

type Props = {
  product: Product;
  className?: string;
  variant?: "primary" | "ghost";
};

export function AddToQuoteButton({
  product,
  className,
  variant = "primary",
}: Props) {
  const addItem = useQuoteStore((s) => s.addItem);
  const [added, setAdded] = useState(false);

  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center justify-center rounded-md px-4 py-2.5 text-sm font-semibold transition",
        variant === "primary"
          ? "bg-brand text-white hover:bg-brand-dark"
          : "border border-brand text-brand hover:bg-brand hover:text-white",
        className,
      )}
      onClick={() => {
        addItem(product);
        setAdded(true);
        window.setTimeout(() => setAdded(false), 1600);
      }}
    >
      {added ? "Added to quote" : "Add to Quote"}
    </button>
  );
}
