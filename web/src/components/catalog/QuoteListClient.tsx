"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ClipboardList } from "lucide-react";
import { z } from "zod";
import { useQuoteStore } from "@/store/quote";
import { submitQuoteRequest } from "@/actions/contact";

const formSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(6),
  company: z.string().optional(),
  message: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function QuoteListClient() {
  const { items, removeItem, setQuantity, setNotes, clear } = useQuoteStore();
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      company: "",
      message: "",
    },
  });

  if (items.length === 0 && status !== "success") {
    return (
      <div className="flex flex-col items-center py-16 text-center">
        <ClipboardList className="size-10 text-muted/50" aria-hidden />
        <p className="mt-4 text-lg text-muted">Your quote list is empty.</p>
        <p className="mt-1 max-w-sm text-sm text-muted/80">
          Add wholesale cuts from the catalog, then submit one request for
          pricing.
        </p>
        <Link
          href="/shop/"
          className="btn-press mt-6 inline-flex rounded-md bg-brand px-5 py-3 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          Browse products
        </Link>
      </div>
    );
  }

  const onSubmit = form.handleSubmit(async (data) => {
    setError(null);
    const result = await submitQuoteRequest({
      ...data,
      items: items.map((i) => ({
        productId: i.productId,
        name: i.name,
        slug: i.slug,
        quantity: i.quantity,
        notes: i.notes,
      })),
    });
    if (!result.success) {
      setStatus("error");
      setError(result.error);
      return;
    }
    setStatus("success");
    clear();
    form.reset();
  });

  if (status === "success") {
    return (
      <div className="py-16 text-center">
        <p className="font-display text-2xl text-ink">Quote request sent</p>
        <p className="mt-3 text-muted">
          A confirmation email was sent to you, and our sales team has been
          notified. We will follow up with wholesale pricing.
        </p>
        <Link
          href="/shop/"
          className="mt-6 inline-flex text-sm font-semibold text-brand"
        >
          Continue browsing →
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr]">
      <ul className="space-y-6">
        {items.map((item) => (
          <li
            key={item.productId}
            className="grid grid-cols-[88px_1fr] gap-4 border-b border-ink/10 pb-6"
          >
            <div className="relative aspect-square overflow-hidden bg-surface">
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="88px"
                />
              ) : null}
            </div>
            <div>
              <div className="flex items-start justify-between gap-3">
                <Link
                  href={`/product/${item.slug}/`}
                  className="font-display text-lg text-ink hover:text-brand"
                >
                  {item.name}
                </Link>
                <button
                  type="button"
                  className="text-xs font-medium text-muted hover:text-red-700"
                  onClick={() => removeItem(item.productId)}
                >
                  Remove
                </button>
              </div>
              <label className="mt-3 inline-flex items-center gap-2 text-sm text-muted">
                Qty
                <input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) =>
                    setQuantity(item.productId, Number(e.target.value) || 1)
                  }
                  className="field w-20"
                />
              </label>
              <input
                type="text"
                placeholder="Notes (pack size, destination…)"
                value={item.notes ?? ""}
                onChange={(e) => setNotes(item.productId, e.target.value)}
                className="field mt-2"
              />
            </div>
          </li>
        ))}
      </ul>

      <form
        onSubmit={onSubmit}
        className="space-y-4 self-start bg-surface p-6 sm:p-8"
        noValidate
      >
        <h2 className="font-display text-2xl tracking-wide text-ink">
          Submit request
        </h2>
        <input {...form.register("name")} placeholder="Name *" className="field" />
        <input
          {...form.register("company")}
          placeholder="Company"
          className="field"
        />
        <input
          {...form.register("email")}
          type="email"
          placeholder="Email *"
          className="field"
        />
        <input {...form.register("phone")} placeholder="Phone *" className="field" />
        <textarea
          {...form.register("message")}
          rows={4}
          placeholder="Additional requirements"
          className="field resize-y"
        />
        <button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="w-full rounded-md bg-brand px-5 py-3 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
        >
          {form.formState.isSubmitting ? "Sending…" : "Request quote"}
        </button>
        {error ? (
          <p className="text-sm text-red-700" role="alert">
            {error.includes("RESEND_API_KEY")
              ? "Email is not configured yet. Add RESEND_API_KEY to .env.local and restart the server."
              : error}
          </p>
        ) : null}
      </form>
    </div>
  );
}
