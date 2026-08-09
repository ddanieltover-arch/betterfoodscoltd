import type { QuoteStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type CreateQuoteInput = {
  companyName?: string;
  contactName: string;
  email: string;
  phone?: string;
  country?: string;
  message?: string;
  items: {
    productId?: number;
    name: string;
    slug: string;
    quantity: number;
    notes?: string;
  }[];
};

function referenceCode() {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `BF-Q-${stamp}-${rand}`;
}

export async function createQuoteRequest(input: CreateQuoteInput) {
  return prisma.quoteRequest.create({
    data: {
      referenceCode: referenceCode(),
      companyName: input.companyName,
      contactName: input.contactName,
      email: input.email,
      phone: input.phone,
      country: input.country,
      message: input.message,
      items: {
        create: input.items.map((item, sortOrder) => ({
          productId: item.productId,
          name: item.name,
          slug: item.slug,
          quantity: item.quantity,
          notes: item.notes,
          sortOrder,
        })),
      },
    },
    include: { items: true },
  });
}

export async function listQuotes() {
  return prisma.quoteRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      items: { orderBy: { sortOrder: "asc" } },
    },
  });
}

export async function getQuoteById(id: string) {
  return prisma.quoteRequest.findUnique({
    where: { id },
    include: {
      items: { orderBy: { sortOrder: "asc" } },
    },
  });
}

export async function countQuotesByStatuses(statuses: QuoteStatus[]) {
  return prisma.quoteRequest.count({
    where: { status: { in: statuses } },
  });
}

export async function listRecentQuotes(take = 5) {
  return prisma.quoteRequest.findMany({
    take,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      referenceCode: true,
      contactName: true,
      companyName: true,
      status: true,
      createdAt: true,
    },
  });
}

export async function updateQuoteStatus(id: string, status: QuoteStatus) {
  return prisma.quoteRequest.update({
    where: { id },
    data: { status },
  });
}

export async function updateQuote(
  id: string,
  data: {
    companyName?: string | null;
    contactName: string;
    email: string;
    phone?: string | null;
    country?: string | null;
    message?: string | null;
    status: QuoteStatus;
    version: number;
  },
) {
  const existing = await prisma.quoteRequest.findUnique({ where: { id } });
  if (!existing) throw new Error("Quote not found");
  if (existing.version !== data.version) {
    throw new Error("Quote was updated elsewhere. Refresh and try again.");
  }

  return prisma.quoteRequest.update({
    where: { id },
    data: {
      companyName: data.companyName,
      contactName: data.contactName,
      email: data.email,
      phone: data.phone,
      country: data.country,
      message: data.message,
      status: data.status,
      version: { increment: 1 },
    },
  });
}

export async function deleteQuote(id: string) {
  return prisma.quoteRequest.delete({ where: { id } });
}

export type QuoteWithItems = Prisma.QuoteRequestGetPayload<{
  include: { items: true };
}>;
