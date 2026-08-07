export type ProductCategory = {
  id: number;
  name: string;
  slug: string;
  count?: number;
  description?: string;
};

export type ProductImage = {
  src: string;
  alt: string;
  thumbnail?: string;
};

export type Product = {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  categories: ProductCategory[];
  bullets: string[];
  description: string;
  images: ProductImage[];
  price: number;
  currency: string;
  quoteOnly: boolean;
};

export type SiteInfo = {
  name: string;
  url: string;
  email: string;
  phone: string;
  address: string;
  currency: string;
  country: string;
  logo: string;
  favicon: string;
};

export type QuoteItem = {
  productId: number;
  slug: string;
  name: string;
  image?: string;
  quantity: number;
  notes?: string;
};
