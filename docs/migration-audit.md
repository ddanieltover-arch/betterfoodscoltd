# Better Foods Co. — WordPress → Next.js Migration Audit

**Source:** `https://betterfoodcoltd.com` + local dump (`betterfo_wp356.sql`, `wp-content/`)  
**Date:** 2026-08-07  
**Target:** Zero WordPress dependency · Next.js on Vercel

---

## 1. Executive Summary

BETTER FOODS CO., LTD is a Thailand-based B2B wholesale meat supplier (beef, pork, poultry). The live site is a WooCommerce + Elementor + GreenMart catalog with **quote-only pricing** (all products at 0 THB) and a **Get a Quote** funnel (`get-a-quote-button-for-woocommerce` + WPForms).

We will rebuild as a modern Next.js App Router site: typed product catalog, category pages, quote list + request form, About/Contact, SEO-preserving URLs, and no WooCommerce/Elementor/PHP.

---

## 2. Website Audit Report (Phase 1)

| Area | Finding |
|------|---------|
| Site name | BETTER FOODS CO., LTD |
| URL | https://betterfoodcoltd.com |
| Theme | GreenMart + greenmart-child (`fresh-el` skin) |
| Builder | Elementor + Elementor Pro |
| Commerce | WooCommerce (THB, country TH:TH-10 / Bangkok area) |
| Front page | Page ID 2269 (`home`) — Elementor |
| Blog | Disabled (`page_for_posts=0`) |
| Auth / accounts | My Account page exists; registration off |
| Media | Uploads missing locally; available on live CDN |

### Pages

| Slug | Title | Role |
|------|-------|------|
| `/` (home) | Home | Hero, featured products, about teaser, why choose us, brands |
| `/about-us/` | About Us | Story, commitment, mission/vision, why choose us |
| `/contact-us/` | Contact Us | Get a Quote form + factory address |
| `/shop/` | Shop | Product catalog |
| `/quote-list/` | Quote List | Quote cart (plugin) |
| `/product-category/{beef,pork,poultry}-products/` | Categories | 19 / 18 / 12 products |
| `/product/{slug}/` | Product | 49 simple products |

### Content types

- **Products:** 49 published simple products (quote-only)
- **Categories:** Beef Products, Pork Products, Poultry Products
- **Posts/blog:** unused for marketing
- **Forms:** WPForms “Get a Quote” (Name, Phone, Email, Subject, Message)
- **Menus:** Main Menu, Category, Menu 2

### Functional features

- Product catalog + category filters  
- Quick View (YITH)  
- Add to Quote / Quote List (not classic cart checkout for revenue)  
- Contact / quote form  
- Search (theme)  
- Email via WP Mail SMTP  

### Contact / identity

- **Email:** sales@betterfoodcoltd.com / sale@betterfoodcoltd.com  
- **Phone:** +66 2 098 1091  
- **Address:** 4/2 Moo 7 Soi Sukhaphiban 2 Phutthamonthon Sai 5 Rd. Om Noi, Krathum Baen, Samut Sakhon 74130, Thailand  

---

## 3. Business Analysis (Phase 2)

| Dimension | Assessment |
|-----------|------------|
| Industry | Frozen / fresh meat wholesale & export |
| Niche | B2B HALAL-capable bulk supply in Thailand + international network |
| Audience | Importers, distributors, HORECA, processors |
| Journey | Discover cuts → browse catalog → add to quote → submit RFQ → sales follow-up |
| Conversion goal | Qualified quote requests (not online payment) |
| Revenue model | Offline / negotiated wholesale; site is lead-gen catalog |
| Brand voice | Premium, quality-forward, logistics-confident, professional |

**Rebuild must improve:** faster catalog UX, clearer RFQ CTA, mobile performance, trust signals (certifications, cold-chain), SEO for product cut names — not a consumer grocery checkout.

---

## 4. Plugin Replacement Matrix (Phase 3)

| Plugin | Purpose | Replace With | Rationale |
|--------|---------|--------------|-----------|
| WooCommerce | Catalog, shop URLs | Typed JSON/MDX catalog + Next.js routes | Quote-only; no cart checkout needed v1 |
| Elementor / Pro | Page layouts | React sections (`Hero`, `WhyChooseUs`, …) | Native, typed, no builder |
| GreenMart + Tbays / Redux / CMB2 | Theme chrome | Custom layout components | Kill theme lock-in |
| get-a-quote-button-for-woocommerce | Quote list | Client quote store + `/quote-list` | Core business flow |
| WPForms Lite | Contact / quote form | React Hook Form + Zod + Server Action + Resend | Native |
| YITH Quick View | Modal product peek | Optional product dialog | Nice-to-have |
| WP Mail SMTP | Outbound mail | Resend | Transactional email |
| all-in-one-wp-migration | Backups | Git + Vercel | N/A post-migration |
| imunify-security / wp-perf-analytics | Host security/perf | Vercel + CSP + monitoring | Platform-native |
| native-render-toolkit-* | Unknown/host helper | Drop | Not required |

---

## 5. Content Inventory (Phase 4)

Extracted to `wordpress-reverse-engineer/extracted/`:

- `products.json` — 49 products (name, slug, bullets, images, categories)
- `categories.json` — 3 categories
- `pages.json` — Home, About, Contact, Shop, Quote List
- `site.json` — identity, logo, contact

**No content may be dropped:** all 49 product URLs and 3 category URLs must remain.

---

## 6. Design System Report (Phase 5)

| Token | Value | Notes |
|-------|-------|-------|
| Primary | `#00AB55` | Brand green (live CSS) |
| Primary dark | `#00a250` | Hover |
| Ink | `#1B252F` | Headings |
| Muted | `#637381` | Body secondary |
| Surface | `#F4F6F8` | Section backgrounds |
| Accent | `#F2A93C` | Warm highlight (sparingly) |
| Logo | BETTER FOODS CO. wordmark (PNG) | Keep |

**Typography (modernized):** Barlow Condensed (display) + Barlow (UI/body) via `next/font` — industrial wholesale character without default AI stacks.

**UX modernization (keep brand, fix UX):**

- One hero composition; brand-forward  
- Catalog-first IA; quote CTA always visible  
- No Elementor bloat; reduce plugin chrome  
- Full-bleed product photography where available  

---

## 7. Technology Stack (Phase 6)

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | Next.js 15 App Router + TS | Default per skill; RSC + SEO |
| Styling | Tailwind CSS v4 | Utility-first, design tokens |
| UI | Custom + minimal Shadcn primitives | Forms/dialogs only |
| Motion | Framer Motion | 2–3 intentional motions |
| Content | File-based JSON (v1) → Sanity later | 49 products; editors optional later |
| Forms | RHF + Zod + Server Actions | Replaces WPForms |
| Email | Resend | Quote notifications |
| Quote state | Zustand / context + localStorage | Replaces quote plugin |
| DB | Optional Supabase (quote leads) | Add when CRM needed |
| Hosting | Vercel | Edge CDN, ISR |
| Auth | None in v1 | No customer portal requirement |

---

## 8. Architecture / Folder Structure (Phase 7)

App lives in `/web` (WordPress dump stays at repo root until cutover).

See `references/project-structure.md` — adapted routes:

- `(marketing)/` — home, about, contact, shop  
- `(marketing)/product-category/[slug]`  
- `(marketing)/product/[slug]`  
- `(marketing)/quote-list`  
- `actions/quote.ts`, `actions/contact.ts`  
- `content/` — products, categories, site copy  

---

## 9. SEO Preservation Plan (Phase 8)

**Keep exactly:**

- `/about-us/`, `/contact-us/`, `/shop/`, `/quote-list/`  
- `/product-category/beef-products|pork-products|poultry-products/`  
- `/product/{slug}/` for all 49 slugs  

**Redirects:** trailing-slash normalization; any WP date permalinks for unused blog → 410/home if none exist.  
**Metadata:** per-page title/description; product OG images from catalog.  
**Sitemap + robots:** `app/sitemap.ts`, `app/robots.ts`.  
**JSON-LD:** Organization + Product (Offer with `priceSpecification` / inquiry).

---

## 10. Functionality Mapping (Phase 9)

| WP feature | Next.js implementation |
|------------|------------------------|
| Shop / categories | Static generation from `content/products.json` |
| Product page | RSC page + quote add button |
| Quote list | Client store + server email on submit |
| Contact / Get a Quote | Server Action → Resend |
| Quick View | Optional `<ProductQuickView>` dialog |
| Search | Client filter on catalog (scale &lt; 10k) |

---

## 11. Security Plan (Phase 10)

- Zod validation on all form/server inputs  
- Rate-limit quote endpoint (Upstash or in-memory edge later)  
- CSP / security headers in `next.config` / `vercel.json`  
- Sanitize any residual HTML from migrations  
- Secrets only in `.env.local`  
- No WP admin, XML-RPC, or PHP attack surface  

---

## 12. Performance Plan (Phase 11)

- `next/image` for all product/logo assets (remotePatterns for migrated CDN or `/public`)  
- Static generation for all product/category pages  
- Lazy below-fold sections; split quote client bundle  
- Target Lighthouse 95+ / CWV green  

---

## 13. Improvement Opportunities (ranked)

1. **RFQ UX** — multi-product quote with qty/spec notes (highest conversion)  
2. **Trust** — certifications, cold-chain, export docs section  
3. **Product specs** — pack size, origin, temp, HALAL badge as structured fields  
4. **i18n** — EN + TH for local buyers  
5. **CRM** — Supabase/HubSpot for quote pipeline  
6. **Sanity** — non-dev catalog edits  

---

## 14. Production Readiness Score (v1 scaffold — 2026-08-07)

| Dimension | Score | Notes |
|-----------|-------|-------|
| Code Quality | 78 | Strict TS, typed catalog, clean routes; tests TBD |
| Security | 72 | Zod + headers; rate-limit/CSP full TBD |
| Performance | 80 | SSG 62 routes, next/image; tune Lighthouse post-deploy |
| SEO | 88 | URL parity, sitemap, robots, product JSON-LD |
| Accessibility | 70 | Semantic layout; full AA audit TBD |
| Scalability | 85 | Static catalog; Sanity/CRM when needed |
| Maintainability | 82 | `/web` isolated, PEMS + audit docs |
| Business Alignment | 90 | Quote-first wholesale flow matches revenue model |
| **Weighted (est.)** | **~80** | Target 90+ after Resend + remaining images + QA |

---

## Gaps / needs

- ~~Local media~~ — 49 product images mirrored under `web/public/images/products/`
- ~~Brand logo~~ — fixed green/black header + light footer variants
- Resend API key required for production email (`web/.env.local`)
- Cart/checkout already 301 → `/quote-list/`

---

## 15. SQL dump mining (`betterfo_wp356.sql`) — 2026-08-07

Mined `wpd5_postmeta` for all 49 product IDs and Elementor pages.

| Finding | Detail |
|---------|--------|
| Yoast / Rank Math | **None** on products — no usable SEO titles/descriptions in SQL |
| SKU / weight / dimensions | **Empty** across catalog |
| Product source | Imported via External Importer from **betterfoodsthai.com** (`_ei_product`) |
| Rich copy recovered | HALAL / Organic / Fresh bullets + wholesale descriptions from `_ei_product` |
| Flags derived | HALAL **31**/49 · Organic **35**/49 · No-chemicals from bullets |
| Elementor | Home (41k), About (30k), Contact (10k) JSON — text extracted to `content/pages-copy.json` |
| Runtime DB | Still **not** used — enriched data written to `web/content/products.json` |

Artifacts: `wordpress-reverse-engineer/extracted/sql-mine-report.json`, `sql-enrichment-report.json`, `products-from-sql.json`, `elementor-page-copy.json`.
