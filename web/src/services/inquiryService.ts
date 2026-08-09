import type { InquirySource, InquiryStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type CreateInquiryInput = {
  companyName?: string;
  contactName: string;
  email: string;
  phone?: string;
  country?: string;
  subject?: string;
  message: string;
  source?: InquirySource;
  sourcePath?: string;
};

export async function createInquiry(input: CreateInquiryInput) {
  return prisma.inquiry.create({
    data: {
      companyName: input.companyName,
      contactName: input.contactName,
      email: input.email,
      phone: input.phone,
      country: input.country,
      subject: input.subject,
      message: input.message,
      source: input.source ?? "CONTACT",
      sourcePath: input.sourcePath,
    },
  });
}

export async function listInquiries() {
  return prisma.inquiry.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function getInquiryById(id: string) {
  return prisma.inquiry.findUnique({ where: { id } });
}

export async function countNewInquiries() {
  return prisma.inquiry.count({ where: { status: "NEW" } });
}

export async function listRecentInquiries(take = 5) {
  return prisma.inquiry.findMany({
    take,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      contactName: true,
      email: true,
      subject: true,
      status: true,
      createdAt: true,
    },
  });
}

export async function updateInquiryStatus(id: string, status: InquiryStatus) {
  return prisma.inquiry.update({
    where: { id },
    data: { status },
  });
}

export async function updateInquiry(
  id: string,
  data: {
    companyName?: string | null;
    contactName: string;
    email: string;
    phone?: string | null;
    country?: string | null;
    subject?: string | null;
    message: string;
    status: InquiryStatus;
  },
) {
  return prisma.inquiry.update({
    where: { id },
    data,
  });
}

export async function deleteInquiry(id: string) {
  return prisma.inquiry.delete({ where: { id } });
}
