import Link from "next/link";
import Image from "next/image";
import { siteConfig, navItems } from "@/config/site";
import { categories } from "@/lib/catalog";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-ink/10 bg-ink text-cream">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-3">
        <div>
          <div className="relative mb-4 h-12 w-[220px]">
            <Image
              src="/images/logo-light.png"
              alt={siteConfig.name}
              fill
              className="object-contain object-left"
              sizes="220px"
            />
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-cream/70">
            {siteConfig.description}
          </p>
        </div>

        <div>
          <h2 className="font-display text-lg tracking-wide text-white">
            Explore
          </h2>
          <ul className="mt-4 space-y-2 text-sm text-cream/75">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-brand-light">
                  {item.label}
                </Link>
              </li>
            ))}
            {categories.map((cat) => (
              <li key={cat.slug}>
                <Link
                  href={`/product-category/${cat.slug}/`}
                  className="hover:text-brand-light"
                >
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-display text-lg tracking-wide text-white">
            Contact
          </h2>
          <ul className="mt-4 space-y-3 text-sm text-cream/75">
            <li>
              <a href={siteConfig.phoneHref} className="hover:text-brand-light">
                {siteConfig.phone}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${siteConfig.email}`}
                className="hover:text-brand-light"
              >
                {siteConfig.email}
              </a>
            </li>
            <li className="leading-relaxed">{siteConfig.address}</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-4 text-center text-xs text-cream/50">
        © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
      </div>
    </footer>
  );
}
