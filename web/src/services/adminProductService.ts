import type { PublishStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function countProducts() {
  return prisma.product.count();
}

export async function listCategories() {
  return prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
}

export async function listAdminProducts() {
  return prisma.product.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      category: true,
      images: { orderBy: { sortOrder: "asc" } },
    },
  });
}

export async function getAdminProductById(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      images: { orderBy: { sortOrder: "asc" } },
    },
  });
}

export async function createProduct(data: {
  name: string;
  slug: string;
  categoryId?: string | null;
  shortDescription?: string | null;
  description?: string;
  bulletsJson?: string;
  status?: PublishStatus;
  quoteOnly?: boolean;
  price?: number;
  currency?: string;
  halal?: boolean;
  organic?: boolean;
  freshNoChemicals?: boolean;
}) {
  return prisma.product.create({
    data: {
      name: data.name,
      slug: data.slug,
      categoryId: data.categoryId || null,
      shortDescription: data.shortDescription,
      description: data.description ?? "",
      bulletsJson: data.bulletsJson ?? "[]",
      status: data.status ?? "DRAFT",
      publishedAt: data.status === "PUBLISHED" ? new Date() : null,
      quoteOnly: data.quoteOnly ?? true,
      price: data.price ?? 0,
      currency: data.currency ?? "THB",
      halal: data.halal ?? false,
      organic: data.organic ?? false,
      freshNoChemicals: data.freshNoChemicals ?? false,
    },
  });
}

export async function updateProduct(
  id: string,
  data: {
    name: string;
    slug: string;
    categoryId?: string | null;
    shortDescription?: string | null;
    description?: string;
    bulletsJson?: string;
    status: PublishStatus;
    quoteOnly?: boolean;
    price?: number;
    currency?: string;
    stockStatus?: string | null;
    halal?: boolean;
    organic?: boolean;
    freshNoChemicals?: boolean;
  },
) {
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) throw new Error("Product not found");

  return prisma.product.update({
    where: { id },
    data: {
      name: data.name,
      slug: data.slug,
      categoryId: data.categoryId || null,
      shortDescription: data.shortDescription,
      description: data.description ?? "",
      bulletsJson: data.bulletsJson ?? "[]",
      status: data.status,
      publishedAt:
        data.status === "PUBLISHED"
          ? (existing.publishedAt ?? new Date())
          : null,
      quoteOnly: data.quoteOnly ?? true,
      price: data.price ?? 0,
      currency: data.currency ?? "THB",
      stockStatus: data.stockStatus,
      halal: data.halal ?? false,
      organic: data.organic ?? false,
      freshNoChemicals: data.freshNoChemicals ?? false,
    },
  });
}

export async function updateProductStatus(id: string, status: PublishStatus) {
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) throw new Error("Product not found");
  return prisma.product.update({
    where: { id },
    data: {
      status,
      publishedAt:
        status === "PUBLISHED" ? (existing.publishedAt ?? new Date()) : null,
    },
  });
}

export async function deleteProduct(id: string) {
  return prisma.product.delete({ where: { id } });
}

export async function addProductImage(data: {
  productId: string;
  url: string;
  alt?: string;
  isPrimary?: boolean;
}) {
  const count = await prisma.productImage.count({
    where: { productId: data.productId },
  });
  if (data.isPrimary) {
    await prisma.productImage.updateMany({
      where: { productId: data.productId },
      data: { isPrimary: false },
    });
  }
  return prisma.productImage.create({
    data: {
      productId: data.productId,
      url: data.url,
      alt: data.alt ?? "",
      sortOrder: count,
      isPrimary: data.isPrimary ?? count === 0,
    },
  });
}

export async function deleteProductImage(id: string) {
  return prisma.productImage.delete({ where: { id } });
}
