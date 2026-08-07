"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";
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
  const reduceMotion = useReducedMotion();

  return (
    <motion.button
      type="button"
      whileTap={reduceMotion ? undefined : { scale: 0.97 }}
      className={cn(
        "btn-press inline-flex items-center justify-center gap-1.5 rounded-md px-4 py-2.5 text-sm font-semibold",
        variant === "primary"
          ? "bg-brand text-white hover:bg-brand-dark"
          : "border border-brand text-brand hover:bg-brand hover:text-white",
        added && "bg-brand-dark",
        className,
      )}
      onClick={() => {
        addItem(product);
        setAdded(true);
        window.setTimeout(() => setAdded(false), 1600);
      }}
    >
      {added ? (
        <>
          <Check className="size-4" aria-hidden />
          Added to quote
        </>
      ) : (
        "Add to Quote"
      )}
    </motion.button>
  );
}
