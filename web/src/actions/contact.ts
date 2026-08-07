"use server";

import { contactSchema, quoteRequestSchema } from "@/lib/validations/contact";
import { getAdminInbox, notifyAdminAndUser } from "@/lib/email/resend";
import {
  contactAdminEmail,
  contactUserEmail,
} from "@/lib/email/templates/contact";
import { quoteAdminEmail, quoteUserEmail } from "@/lib/email/templates/quote";

type ActionResult =
  | { success: true }
  | { success: false; error: string; fields?: Record<string, string[]> };

export async function submitContactForm(data: unknown): Promise<ActionResult> {
  const parsed = contactSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: "Invalid form data",
      fields: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { name, email, phone, subject, message } = parsed.data;
  const payload = {
    name,
    email,
    phone,
    subject: subject?.trim() || "General inquiry",
    message,
  };

  const admin = contactAdminEmail(payload);
  const user = contactUserEmail(payload);

  const result = await notifyAdminAndUser({
    admin: {
      replyTo: email,
      subject: admin.subject,
      html: admin.html,
    },
    user: {
      to: email,
      replyTo: getAdminInbox(),
      subject: user.subject,
      html: user.html,
    },
  });

  if (!result.ok) {
    return { success: false, error: result.error };
  }
  return { success: true };
}

export async function submitQuoteRequest(data: unknown): Promise<ActionResult> {
  const parsed = quoteRequestSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: "Invalid quote request",
      fields: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { name, email, phone, company, message, items } = parsed.data;
  const payload = {
    name,
    email,
    phone,
    company,
    message,
    items: items.map((item) => ({
      name: item.name,
      slug: item.slug,
      quantity: item.quantity,
      notes: item.notes,
    })),
  };

  const admin = quoteAdminEmail(payload);
  const user = quoteUserEmail(payload);

  const result = await notifyAdminAndUser({
    admin: {
      replyTo: email,
      subject: admin.subject,
      html: admin.html,
    },
    user: {
      to: email,
      replyTo: getAdminInbox(),
      subject: user.subject,
      html: user.html,
    },
  });

  if (!result.ok) {
    return { success: false, error: result.error };
  }
  return { success: true };
}
