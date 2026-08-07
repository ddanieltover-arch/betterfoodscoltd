import Link from "next/link";
import { Hero } from "@/components/sections/Hero";
import { AboutTeaser } from "@/components/sections/AboutTeaser";
import { WhyChooseUs } from "@/components/sections/WhyChooseUs";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { Reveal } from "@/components/motion/Reveal";
import { getFeaturedProducts } from "@/lib/catalog";

export default function HomePage() {
  const featured = getFeaturedProducts(8);

  return (
    <>
      <Hero />
      <AboutTeaser />
      <section className="pb-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal className="mb-10 flex items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-3xl tracking-wide text-ink sm:text-4xl">
                Featured products
              </h2>
              <p className="mt-2 text-muted">
                Popular wholesale cuts — add to your quote list.
              </p>
            </div>
            <Link
              href="/shop/"
              className="hidden text-sm font-semibold text-brand transition-colors hover:text-brand-dark sm:inline"
            >
              View all →
            </Link>
          </Reveal>
          <ProductGrid products={featured} />
        </div>
      </section>
      <WhyChooseUs />
      <section className="bg-ink py-16 text-cream">
        <Reveal className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-4 sm:px-6 md:flex-row md:items-center">
          <div>
            <h2 className="font-display text-3xl tracking-wide text-white">
              Ready for a wholesale quote?
            </h2>
            <p className="mt-2 max-w-xl text-cream/70">
              Tell us what you need — pack sizes, destinations, and volume.
            </p>
          </div>
          <Link
            href="/contact-us/"
            className="btn-press rounded-md bg-brand px-5 py-3 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            Get a quote
          </Link>
        </Reveal>
      </section>
    </>
  );
}
