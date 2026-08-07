# Better Foods — Next.js storefront

Zero-WordPress rebuild of [betterfoodcoltd.com](https://betterfoodcoltd.com).

## Develop

```bash
cd web
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment

Copy `.env.example` → `.env.local` and set Resend keys for production quote emails. Without `RESEND_API_KEY`, submissions log to the server console (local-friendly).

## Content

Catalog JSON lives in `content/` (exported from WooCommerce REST). Product images in `public/images/products/` (remote CDN fallback allowed via `next.config.ts`).

## Deploy

Connect the `web` directory (or monorepo root with Root Directory = `web`) to Vercel. Set env vars from `.env.example`.
