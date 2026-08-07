import Link from "next/link";

export function AboutTeaser() {
  return (
    <section className="py-20">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
            About us
          </p>
          <h2 className="mt-3 font-display text-3xl tracking-wide text-ink sm:text-4xl">
            More than just meat.
          </h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted">
            Our journey began with an audacious but simple goal: to change how
            people think about and enjoy meat. Founded by a team that includes a
            meat specialist with twenty years of industry expertise, we believe
            every cut should be a pleasure — and every shipment should arrive
            right.
          </p>
        </div>
        <div className="border-l-2 border-brand pl-6">
          <p className="text-sm leading-relaxed text-ink/80">
            Trusted sourcing, curated selection, and craftsmanship from harvest
            to delivery — your reliable meat supplier in Thailand.
          </p>
          <Link
            href="/about-us/"
            className="mt-6 inline-flex text-sm font-semibold text-brand hover:text-brand-dark"
          >
            Read our story →
          </Link>
        </div>
      </div>
    </section>
  );
}
