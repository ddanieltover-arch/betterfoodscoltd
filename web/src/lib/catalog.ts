import productsData from "../../content/products.json";
import categoriesData from "../../content/categories.json";
import siteData from "../../content/site.json";
import type { Product, ProductCategory, SiteInfo } from "@/types";

export const products = productsData as Product[];
export const categories = categoriesData as ProductCategory[];
export const site = {
  ...siteData,
  logo: "/images/logo.png",
  favicon: "/images/icon-192.png",
} as SiteInfo;

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductsByCategory(categorySlug: string): Product[] {
  return products.filter((p) =>
    p.categories.some((c) => c.slug === categorySlug),
  );
}

export function getCategoryBySlug(slug: string): ProductCategory | undefined {
  return categories.find((c) => c.slug === slug);
}

export function getFeaturedProducts(limit = 8): Product[] {
  const beef = getProductsByCategory("beef-products").slice(0, 4);
  const pork = getProductsByCategory("pork-products").slice(0, 4);
  return [...beef, ...pork].slice(0, limit);
}
