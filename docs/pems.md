# PEMS — Better Foods Co. (betterfoodcoltd)

## Project profile

- **Client:** BETTER FOODS CO., LTD
- **Domain:** betterfoodcoltd.com
- **Type:** B2B wholesale meat catalog + RFQ (quote) lead-gen
- **Migration:** WordPress/WooCommerce/Elementor → Next.js (zero WP)

## Technology profile

- Next.js App Router, TypeScript, Tailwind
- File-based catalog JSON (v1)
- Resend for quote/contact email
- Vercel hosting

## Architecture profile

- App in `/web`
- Content in `/web/content` (from extracted WP API data)
- Marketing route group; product + category SSG
- Client quote list (localStorage) + server actions for submit

## Active work

- WordPress reverse-engineer skill phases 1–12 done in `/web`
- SQL dump mined: product flags/descriptions from `_ei_product`; no Yoast SEO in DB
- Quote emails via Resend only (no CRM DB yet)
- Motion/UX Level 2 pass: shared `Reveal`/`FadeIn`, nav + card polish, reduced-motion

## Reusable assets

- `web/src/components/motion/Reveal.tsx` — scroll reveal + mount fade with `prefers-reduced-motion`
- `.btn-press` in `globals.css` — shared CTA hover/press/focus treatment

## Decision log

- 2026-08-07: File-based content over Sanity for v1 (49 products)
- 2026-08-07: Motion via existing Framer Motion + CSS; no second animation library
- 2026-08-07: Replace Woo quote plugin with custom quote list + Resend
- 2026-08-07: Keep WP dump at repo root; new app isolated in `/web`
- 2026-08-07: SQL used for forensic enrichment, not as runtime database
- 2026-08-07: Product HALAL/Organic flags derived from importer HTML in SQL meta
