# Project config — Better Foods Co., Ltd

## Identity

| Field | Value |
|---|---|
| Client / project name | Better Foods Co., Ltd |
| Legal / display name | BETTER FOODS CO., LTD |
| Primary domain | betterfoodcoltd.com |
| Admin seed email | sales@betterfoodcoltd.com |
| Product domain (1 line) | B2B wholesale meat catalog + RFQ (poultry, beef, pork) |

## Brand tokens

| Semantic role | CSS variable in this project | Tailwind / utility class |
|---|---|---|
| Token prefix | `brand` | |
| Primary | `--brand` | `bg-brand` / `text-brand` |
| Primary hover | `--brand-dark` | `bg-brand-dark` / `hover:bg-brand-dark` |
| Secondary / accent | `--accent` | `border-accent` / `text-accent` |
| Background | `--background` / `--cream` | `bg-background` / `bg-cream` |
| Surface | `--surface` | `bg-surface` |
| Text | `--ink` / `--foreground` | `text-ink` |
| Muted | `--muted` | `text-muted` |
| Border | `--brand-border` | `border-brand-border` |
| Error | `--brand-error` | `text-brand-error` |
| Success | `--brand-success` | `text-brand-success` |
| Radius md | `--brand-radius-md` | `rounded-[var(--brand-radius-md)]` |
| Container width | `--brand-container` | `max-w-[var(--brand-container)]` |
| Display font | `--font-barlow-condensed` | `font-display` |

**Rule:** Admin classes must use **this table**, not another client’s prefix. Never use `tg-*`.

## Modules

Mark each: `on` | `off` | `later`

### Core (required)

| Module | Status |
|---|---|
| Login + session gate | on |
| Dashboard | on |
| Users / roles (seed admin at minimum) | on |

### Sales

| Module | Status | Notes |
|---|---|---|
| Quotes / RFQ | on | Multi-line quote items |
| Inquiries / contact | on | Contact form → Inquiry |
| Dealers | off | |
| Distributors | off | |

### CMS

| Module | Status | Notes |
|---|---|---|
| Products (+ specs / packaging / images) | on | Hybrid: Prisma admin CMS; storefront still JSON |
| Categories | on | Seeded with products; edited via product category |
| Certifications | off | |
| Site pages (fixed slugs) | off | |
| Media library (dedicated) | later | URL attach is enough for v1 |

## Stack assumptions

| Layer | Expected default | This project |
|---|---|---|
| Framework | Next.js App Router | Next.js 16 App Router in `/web` |
| DB | Prisma (SQLite local / Postgres prod) | Prisma + SQLite local |
| Auth | Auth.js credentials → `/admin/login` | Auth.js (next-auth v5) |
| Styling | Tailwind + CSS variables | Tailwind v4 + brand tokens |
| Mutations | Server Actions | Server Actions |
| Email (optional) | Resend or existing mailer | Resend (existing) |
| Media (optional) | Supabase Storage or URL-only | URL-only |

## Out of scope for v1 (unless user insists)

Inventory, freight, analytics, newsletter, global search, MFA/SSO, custom RBAC UI, rich blog CMS, JSON↔Prisma storefront sync, dealers/distributors, certifications, site pages CMS.
