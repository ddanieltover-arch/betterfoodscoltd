# PEMS — Better Foods Co. (betterfoodcoltd)

## Project profile

- **Client:** BETTER FOODS CO., LTD
- **Domain:** betterfoodcoltd.com
- **Type:** B2B wholesale meat catalog + RFQ (quote) lead-gen
- **Migration:** WordPress/WooCommerce/Elementor → Next.js (zero WP)

## Technology profile

- Next.js App Router, TypeScript, Tailwind v4
- File-based catalog JSON for **storefront** (v1)
- Prisma + SQLite (local) for admin CRM / product CMS
- Auth.js (Credentials) for `/admin`
- Resend for quote/contact email
- Vercel hosting

## Architecture profile

- App in `/web`
- Content in `/web/content` (from extracted WP API data) — storefront still reads JSON via `lib/catalog.ts`
- Admin CMS at `/admin` (Pulse B2B Admin CMS kit): Quotes, Inquiries, Products
- Hybrid catalog: Prisma seeded from JSON for admin; storefront JSON until sync
- Marketing route group; product + category SSG
- Client quote list (localStorage) + server actions for submit (persist + email)

## Design profile

- Token prefix: `brand` (`--brand`, `--brand-dark`, `--ink`, `--muted`, `--surface`, `--cream`, `--accent`)
- Admin extras: `--brand-border`, `--brand-error`, `--brand-success`, `--brand-radius-md`, `--brand-container`
- Fonts: Barlow / Barlow Condensed (`font-display`)

## Active work

- WordPress reverse-engineer skill phases 1–12 done in `/web`
- SQL dump mined: product flags/descriptions from `_ei_product`; no Yoast SEO in DB
- Admin CMS v1 enabled (Quotes, Inquiries, Products); Dealers/Distributors/Certs/Pages off
- Motion/UX Level 2 pass: shared `Reveal`/`FadeIn`, nav + card polish, reduced-motion

## Reusable assets

- `web/src/components/motion/Reveal.tsx` — scroll reveal + mount fade with `prefers-reduced-motion`
- `.btn-press` in `globals.css` — shared CTA hover/press/focus treatment
- `pulse-b2b-admin-cms/project-config.md` — filled module + brand map

## Decision log

- 2026-08-07: File-based content over Sanity for v1 (49 products)
- 2026-08-07: Motion via existing Framer Motion + CSS; no second animation library
- 2026-08-07: Replace Woo quote plugin with custom quote list + Resend
- 2026-08-07: Keep WP dump at repo root; new app isolated in `/web`
- 2026-08-07: SQL used for forensic enrichment, not as runtime database
- 2026-08-07: Product HALAL/Organic flags derived from importer HTML in SQL meta
- 2026-08-09: Pulse B2B Admin CMS — Auth.js + Prisma; modules Quotes/Inquiries/Products on; Dealers/Distributors/Certifications/Pages off
- 2026-08-09: Hybrid catalog (2B) — admin Products in Prisma; storefront keeps JSON until later sync
- 2026-08-09: Seed admin email `sales@betterfoodcoltd.com` (password from `ADMIN_PASSWORD`)

## Auth notes

- Roles: SUPER_ADMIN | ADMIN | EDITOR | SALES_MANAGER | READ_ONLY
- Gate: `web/src/proxy.ts` on `/admin/*`
- Seed: `npm run db:seed` with `ADMIN_EMAIL` / `ADMIN_PASSWORD`
