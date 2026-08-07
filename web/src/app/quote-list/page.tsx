import type { Metadata } from "next";
import { QuoteListClient } from "@/components/catalog/QuoteListClient";

export const metadata: Metadata = {
  title: "Quote List",
  description: "Review products and submit a wholesale quote request.",
  alternates: { canonical: "/quote-list/" },
  robots: { index: false, follow: true },
};

export default function QuoteListPage() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h1 className="font-display text-4xl tracking-wide text-ink">
          Quote list
        </h1>
        <p className="mt-3 text-muted">
          Adjust quantities and notes, then send your request to sales.
        </p>
        <div className="mt-10">
          <QuoteListClient />
        </div>
      </div>
    </section>
  );
}
