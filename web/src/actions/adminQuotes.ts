"use server";

import { revalidatePath } from "next/cache";
import type { QuoteStatus } from "@prisma/client";
import { requireSalesWrite } from "@/lib/adminAuth";
import {
  deleteQuote,
  updateQuote,
  updateQuoteStatus,
} from "@/services/quoteService";

const QUOTE_STATUSES: QuoteStatus[] = [
  "NEW",
  "IN_PROGRESS",
  "AWAITING_INFO",
  "QUOTED",
  "CLOSED",
  "SPAM",
  "ARCHIVED",
];

function asQuoteStatus(value: FormDataEntryValue | null): QuoteStatus {
  const status = String(value ?? "");
  if (!QUOTE_STATUSES.includes(status as QuoteStatus)) {
    throw new Error("Invalid quote status");
  }
  return status as QuoteStatus;
}

function revalidateQuotes(id?: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/quotes");
  if (id) revalidatePath(`/admin/quotes/${id}`);
}

export async function updateQuoteStatusAction(formData: FormData) {
  await requireSalesWrite();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing quote id");
  await updateQuoteStatus(id, asQuoteStatus(formData.get("status")));
  revalidateQuotes(id);
}

export async function updateQuoteAction(formData: FormData) {
  await requireSalesWrite();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing quote id");

  await updateQuote(id, {
    companyName: String(formData.get("companyName") ?? "") || null,
    contactName: String(formData.get("contactName") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    phone: String(formData.get("phone") ?? "") || null,
    country: String(formData.get("country") ?? "") || null,
    message: String(formData.get("message") ?? "") || null,
    status: asQuoteStatus(formData.get("status")),
    version: Number(formData.get("version") ?? 0),
  });
  revalidateQuotes(id);
}

export async function deleteQuoteAction(formData: FormData) {
  await requireSalesWrite();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing quote id");
  await deleteQuote(id);
  revalidateQuotes();
}
