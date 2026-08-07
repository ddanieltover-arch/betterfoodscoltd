"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { categories } from "@/lib/catalog";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(0,171,85,0.18),_transparent_55%),linear-gradient(160deg,#0f1a14_0%,#1B252F_45%,#243328_100%)]"
        aria-hidden
      />
      <div
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.35'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        }}
        aria-hidden
      />

      <div className="relative mx-auto flex min-h-[78vh] max-w-6xl flex-col justify-end px-4 pb-16 pt-28 sm:px-6 sm:pb-20">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="font-display text-4xl uppercase tracking-[0.08em] text-brand-light sm:text-5xl md:text-6xl"
        >
          BETTER FOODS CO., LTD
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.08 }}
          className="mt-4 max-w-2xl font-display text-3xl leading-tight tracking-wide text-white sm:text-4xl md:text-5xl"
        >
          Wholesale meat, cold-chain ready.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.16 }}
          className="mt-4 max-w-xl text-base text-white/75 sm:text-lg"
        >
          Beef, pork, and poultry for importers, distributors, and foodservice —
          request a quote, not a cart total.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.24 }}
          className="mt-8 flex flex-wrap gap-3"
        >
          <Link
            href="/shop/"
            className="rounded-md bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark"
          >
            Browse catalog
          </Link>
          <Link
            href="/contact-us/"
            className="rounded-md border border-white/30 px-5 py-3 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10"
          >
            Get a quote
          </Link>
        </motion.div>

        <motion.ul
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-14 flex flex-wrap gap-x-8 gap-y-2 text-sm text-white/60"
        >
          {categories.map((cat) => (
            <li key={cat.slug}>
              <Link
                href={`/product-category/${cat.slug}/`}
                className="transition hover:text-brand-light"
              >
                {cat.name} ({cat.count})
              </Link>
            </li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
