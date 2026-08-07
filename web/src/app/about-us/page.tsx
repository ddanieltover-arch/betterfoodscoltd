import type { Metadata } from "next";
import { whyChooseUs, siteConfig } from "@/config/site";
import { WhyChooseUs } from "@/components/sections/WhyChooseUs";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "BETTER FOODS CO., LTD — premium meat wholesale in Thailand. Trusted sourcing, cold-chain logistics, and craftsmanship from harvest to delivery.",
  alternates: { canonical: "/about-us/" },
};

export default function AboutPage() {
  return (
    <>
      <section className="border-b border-ink/10 bg-ink py-16 text-cream">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-light">
            About us
          </p>
          <h1 className="mt-3 font-display text-4xl tracking-wide text-white sm:text-5xl">
            More than just meat
          </h1>
          <p className="mt-4 max-w-2xl text-cream/75">
            At {siteConfig.name}, we are more than a premium meat market — we
            are a community united by exceptional flavor and responsible
            operations.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-2xl tracking-wide text-ink">
              Our story
            </h2>
            <p className="mt-4 leading-relaxed text-muted">
              Our journey began with an audacious but simple goal: to change how
              people think about and enjoy meat. Founded by a team that includes
              a meat specialist with twenty years of industry expertise, we
              believe every bite, slice, and cut should be a pleasure.
            </p>
            <p className="mt-4 leading-relaxed text-muted">
              We are proud to be your reliable meat supplier in Thailand. Join
              us as we strive for meat perfection — and taste the results of
              hard work and passion.
            </p>
          </div>
          <div>
            <h2 className="font-display text-2xl tracking-wide text-ink">
              Our commitment to quality
            </h2>
            <ul className="mt-4 space-y-4 text-muted">
              <li>
                <strong className="text-ink">Trusted sourcing:</strong> We
                carefully choose items from reliable vendors and nearby farms.
              </li>
              <li>
                <strong className="text-ink">The finest selection:</strong>{" "}
                Grass-fed beef, heritage pork, and free-range poultry.
              </li>
              <li>
                <strong className="text-ink">Craftsmanship:</strong> Skilled
                butchers create each product with care and accuracy.
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-surface py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="font-display text-2xl tracking-wide text-ink">
            Mission / Vision
          </h2>
          <p className="mt-4 max-w-3xl leading-relaxed text-muted">
            <strong className="text-ink">Our vision:</strong> To redefine the
            experience of buying and enjoying meat by linking trustworthy
            suppliers with discerning customers. We are dedicated to
            sustainability, quality, and client happiness in every cut.
          </p>
          <p className="mt-6 text-sm text-muted">
            Capabilities that matter day to day:{" "}
            {whyChooseUs.map((w) => w.title).join(" · ")}
          </p>
        </div>
      </section>

      <WhyChooseUs />
    </>
  );
}
