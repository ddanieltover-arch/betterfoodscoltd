"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, X, ClipboardList } from "lucide-react";
import { navItems, siteConfig } from "@/config/site";
import { useQuoteStore } from "@/store/quote";
import { cn } from "@/lib/utils";

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const reduceMotion = useReducedMotion();
  const items = useQuoteStore((s) => s.items);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-[background,box-shadow,height] duration-300",
        scrolled
          ? "border-b border-ink/10 bg-cream/95 shadow-sm backdrop-blur-md"
          : "bg-cream/80 backdrop-blur-sm",
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:h-20 sm:px-6">
        <Link
          href="/"
          className="relative block h-11 w-[200px] shrink-0 transition-opacity hover:opacity-90 sm:h-12 sm:w-[240px]"
        >
          <Image
            src="/images/logo.png"
            alt={siteConfig.name}
            fill
            className="object-contain object-left"
            sizes="240px"
            priority
          />
        </Link>

        <nav className="hidden items-center gap-6 lg:flex" aria-label="Primary">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group relative text-sm font-medium tracking-wide text-ink/80 transition-colors hover:text-brand"
            >
              {item.label}
              <span
                aria-hidden
                className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-brand transition-transform duration-300 ease-out group-hover:scale-x-100"
              />
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/quote-list/"
            className="btn-press relative inline-flex items-center gap-2 rounded-md bg-brand px-3 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            <ClipboardList className="size-4" aria-hidden />
            <span className="hidden sm:inline">Quote List</span>
            <AnimatePresence mode="popLayout">
              {count > 0 ? (
                <motion.span
                  key={count}
                  initial={
                    reduceMotion ? false : { scale: 0.6, opacity: 0 }
                  }
                  animate={{ scale: 1, opacity: 1 }}
                  exit={reduceMotion ? undefined : { scale: 0.6, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 420, damping: 22 }}
                  className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-accent text-[11px] font-bold text-ink"
                >
                  {count}
                </motion.span>
              ) : null}
            </AnimatePresence>
          </Link>

          <button
            type="button"
            className="btn-press inline-flex size-10 items-center justify-center rounded-md border border-ink/15 text-ink lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            id="mobile-nav"
            key="mobile-nav"
            initial={
              reduceMotion ? false : { height: 0, opacity: 0 }
            }
            animate={{ height: "auto", opacity: 1 }}
            exit={
              reduceMotion
                ? { opacity: 0 }
                : { height: 0, opacity: 0 }
            }
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-ink/10 bg-cream lg:hidden"
          >
            <nav
              className="mx-auto flex max-w-6xl flex-col px-4 py-3"
              aria-label="Mobile"
            >
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="border-b border-ink/5 py-3 text-base font-medium text-ink transition-colors hover:text-brand"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
