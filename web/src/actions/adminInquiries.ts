"use server";

import { revalidatePath } from "next/cache";
import type { InquiryStatus } from "@prisma/client";
import { requireSalesWrite } from "@/lib/adminAuth";
import {
  deleteInquiry,
  updateInquiry,
  updateInquiryStatus,
} from "@/services/inquiryService";

const INQUIRY_STATUSES: InquiryStatus[] = [
  "NEW",
  "IN_PROGRESS",
  "CLOSED",
  "SPAM",
  "ARCHIVED",
];

function asInquiryStatus(value: FormDataEntryValue | null): InquiryStatus {
  const status = String(value ?? "");
  if (!INQUIRY_STATUSES.includes(status as InquiryStatus)) {
    throw new Error("Invalid inquiry status");
  }
  return status as InquiryStatus;
}

function revalidateInquiries(id?: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/inquiries");
  if (id) revalidatePath(`/admin/inquiries/${id}`);
}

export async function updateInquiryStatusAction(formData: FormData) {
  await requireSalesWrite();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing inquiry id");
  await updateInquiryStatus(id, asInquiryStatus(formData.get("status")));
  revalidateInquiries(id);
}

export async function updateInquiryAction(formData: FormData) {
  await requireSalesWrite();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing inquiry id");

  await updateInquiry(id, {
    companyName: String(formData.get("companyName") ?? "") || null,
    contactName: String(formData.get("contactName") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    phone: String(formData.get("phone") ?? "") || null,
    country: String(formData.get("country") ?? "") || null,
    subject: String(formData.get("subject") ?? "") || null,
    message: String(formData.get("message") ?? "").trim(),
    status: asInquiryStatus(formData.get("status")),
  });
  revalidateInquiries(id);
}

export async function deleteInquiryAction(formData: FormData) {
  await requireSalesWrite();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing inquiry id");
  await deleteInquiry(id);
  revalidateInquiries();
}
