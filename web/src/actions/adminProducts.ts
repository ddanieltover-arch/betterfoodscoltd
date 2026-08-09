"use server";

import { revalidatePath } from "next/cache";
import type { PublishStatus } from "@prisma/client";
import { requireCmsWrite } from "@/lib/adminAuth";
import {
  addProductImage,
  createProduct,
  deleteProduct,
  deleteProductImage,
  updateProduct,
  updateProductStatus,
} from "@/services/adminProductService";

const PUBLISH_STATUSES: PublishStatus[] = ["DRAFT", "PUBLISHED", "ARCHIVED"];

function asPublishStatus(value: FormDataEntryValue | null): PublishStatus {
  const status = String(value ?? "");
  if (!PUBLISH_STATUSES.includes(status as PublishStatus)) {
    throw new Error("Invalid publish status");
  }
  return status as PublishStatus;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function bulletsToJson(raw: string) {
  const lines = raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  return JSON.stringify(lines);
}

function revalidateProducts(id?: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/products");
  if (id) revalidatePath(`/admin/products/${id}`);
}

export async function createProductAction(formData: FormData) {
  await requireCmsWrite();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("Name is required");
  const slugInput = String(formData.get("slug") ?? "").trim();
  const slug = slugify(slugInput || name);
  if (!slug) throw new Error("Slug is required");

  const product = await createProduct({
    name,
    slug,
    categoryId: String(formData.get("categoryId") ?? "") || null,
    shortDescription: String(formData.get("shortDescription") ?? "") || null,
    description: String(formData.get("description") ?? ""),
    bulletsJson: bulletsToJson(String(formData.get("bullets") ?? "")),
    status: asPublishStatus(formData.get("status") ?? "DRAFT"),
    quoteOnly: formData.get("quoteOnly") === "on",
    price: Number(formData.get("price") ?? 0) || 0,
    currency: String(formData.get("currency") ?? "THB") || "THB",
    halal: formData.get("halal") === "on",
    organic: formData.get("organic") === "on",
    freshNoChemicals: formData.get("freshNoChemicals") === "on",
  });
  revalidateProducts(product.id);
}

export async function updateProductAction(formData: FormData) {
  await requireCmsWrite();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing product id");
  const name = String(formData.get("name") ?? "").trim();
  const slug = slugify(String(formData.get("slug") ?? "").trim() || name);
  if (!name || !slug) throw new Error("Name and slug are required");

  await updateProduct(id, {
    name,
    slug,
    categoryId: String(formData.get("categoryId") ?? "") || null,
    shortDescription: String(formData.get("shortDescription") ?? "") || null,
    description: String(formData.get("description") ?? ""),
    bulletsJson: bulletsToJson(String(formData.get("bullets") ?? "")),
    status: asPublishStatus(formData.get("status")),
    quoteOnly: formData.get("quoteOnly") === "on",
    price: Number(formData.get("price") ?? 0) || 0,
    currency: String(formData.get("currency") ?? "THB") || "THB",
    stockStatus: String(formData.get("stockStatus") ?? "") || null,
    halal: formData.get("halal") === "on",
    organic: formData.get("organic") === "on",
    freshNoChemicals: formData.get("freshNoChemicals") === "on",
  });
  revalidateProducts(id);
}

export async function updateProductStatusAction(formData: FormData) {
  await requireCmsWrite();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing product id");
  await updateProductStatus(id, asPublishStatus(formData.get("status")));
  revalidateProducts(id);
}

export async function deleteProductAction(formData: FormData) {
  await requireCmsWrite();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing product id");
  await deleteProduct(id);
  revalidateProducts();
}

export async function addProductImageAction(formData: FormData) {
  await requireCmsWrite();
  const productId = String(formData.get("productId") ?? "");
  const url = String(formData.get("url") ?? "").trim();
  if (!productId || !url) throw new Error("Product and image URL are required");
  await addProductImage({
    productId,
    url,
    alt: String(formData.get("alt") ?? ""),
    isPrimary: formData.get("isPrimary") === "on",
  });
  revalidateProducts(productId);
}

export async function deleteProductImageAction(formData: FormData) {
  await requireCmsWrite();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing image id");
  const { prisma } = await import("@/lib/prisma");
  const image = await prisma.productImage.findUnique({ where: { id } });
  await deleteProductImage(id);
  revalidateProducts(image?.productId);
}
