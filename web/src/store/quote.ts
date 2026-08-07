import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product, QuoteItem } from "@/types";

type QuoteState = {
  items: QuoteItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: number) => void;
  setQuantity: (productId: number, quantity: number) => void;
  setNotes: (productId: number, notes: string) => void;
  clear: () => void;
  count: () => number;
};

export const useQuoteStore = create<QuoteState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, quantity = 1) => {
        set((state) => {
          const existing = state.items.find((i) => i.productId === product.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === product.id
                  ? { ...i, quantity: i.quantity + quantity }
                  : i,
              ),
            };
          }
          return {
            items: [
              ...state.items,
              {
                productId: product.id,
                slug: product.slug,
                name: product.name,
                image: product.images[0]?.src,
                quantity,
              },
            ],
          };
        });
      },
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),
      setQuantity: (productId, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId
              ? { ...i, quantity: Math.max(1, quantity) }
              : i,
          ),
        })),
      setNotes: (productId, notes) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId ? { ...i, notes } : i,
          ),
        })),
      clear: () => set({ items: [] }),
      count: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: "better-foods-quote" },
  ),
);
