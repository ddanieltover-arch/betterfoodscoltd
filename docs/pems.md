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

- WordPress reverse-engineer skill phases 1–11 documented in `docs/migration-audit.md`
- Phase 12: building Next.js replacement in `/web`

## Constraints

- Preserve all product/category/page URLs
- Quote-only commerce (no Stripe checkout in v1)
- Brand green `#00AB55`

## Decision log

- 2026-08-07: File-based content over Sanity for v1 (49 products)
- 2026-08-07: Replace Woo quote plugin with custom quote list + Resend
- 2026-08-07: Keep WP dump at repo root; new app isolated in `/web`
