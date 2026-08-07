import type { Metadata } from "next";
import { ContactForm } from "@/components/sections/ContactForm";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Request a wholesale quote from BETTER FOODS CO., LTD. Factory address in Samut Sakhon, Thailand.",
  alternates: { canonical: "/contact-us/" },
};

export default function ContactPage() {
  return (
    <section className="py-16">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
            Contact
          </p>
          <h1 className="mt-3 font-display text-4xl tracking-wide text-ink">
            Get a quote
          </h1>
          <p className="mt-4 text-muted">
            Tell us what you need. Our sales team responds with wholesale
            availability and pricing.
          </p>

          <dl className="mt-10 space-y-6 text-sm">
            <div>
              <dt className="font-semibold text-ink">Address (Factory)</dt>
              <dd className="mt-1 text-muted">{siteConfig.address}</dd>
            </div>
            <div>
              <dt className="font-semibold text-ink">Phone</dt>
              <dd className="mt-1">
                <a
                  href={siteConfig.phoneHref}
                  className="text-brand hover:text-brand-dark"
                >
                  {siteConfig.phone}
                </a>
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-ink">Email</dt>
              <dd className="mt-1">
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="text-brand hover:text-brand-dark"
                >
                  {siteConfig.email}
                </a>
              </dd>
            </div>
          </dl>
        </div>

        <div className="bg-surface p-6 sm:p-8">
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
