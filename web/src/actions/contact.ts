"use server";

import { contactSchema, quoteRequestSchema } from "@/lib/validations/contact";
import {
  escapeHtml,
  getFromEmail,
  getQuoteInbox,
  getResendClient,
} from "@/lib/email/resend";

type ActionResult =
  | { success: true }
  | { success: false; error: string; fields?: Record<string, string[]> };

async function sendMail(payload: {
  subject: string;
  html: string;
  replyTo: string;
  to?: string | string[];
}): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const resend = getResendClient();
    const { error } = await resend.emails.send({
      from: getFromEmail(),
      to: payload.to ?? getQuoteInbox(),
      replyTo: payload.replyTo,
      subject: payload.subject,
      html: payload.html,
    });

    if (error) {
      console.error("[resend]", error);
      return {
        ok: false,
        error: error.message || "Failed to send email via Resend",
      };
    }

    return { ok: true };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to send email via Resend";
    console.error("[resend]", message);
    return { ok: false, error: message };
  }
}

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
  const result = await sendMail({
    subject: subject
      ? `[Contact] ${escapeHtml(subject)}`
      : `[Contact] Message from ${escapeHtml(name)}`,
    replyTo: email,
    html: `
      <h2>New contact message</h2>
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
      <p><strong>Subject:</strong> ${escapeHtml(subject ?? "—")}</p>
      <p><strong>Message:</strong></p>
      <p>${escapeHtml(message).replaceAll("\n", "<br/>")}</p>
    `,
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

  const rows = items
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px;border:1px solid #ddd">${escapeHtml(item.name)}</td>
          <td style="padding:8px;border:1px solid #ddd">${item.quantity}</td>
          <td style="padding:8px;border:1px solid #ddd">${escapeHtml(item.notes ?? "")}</td>
          <td style="padding:8px;border:1px solid #ddd">${escapeHtml(item.slug)}</td>
        </tr>`,
    )
    .join("");

  const salesHtml = `
    <h2>New wholesale quote request</h2>
    <p><strong>Name:</strong> ${escapeHtml(name)}</p>
    <p><strong>Company:</strong> ${escapeHtml(company ?? "—")}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
    <p><strong>Notes:</strong> ${escapeHtml(message ?? "—").replaceAll("\n", "<br/>")}</p>
    <table style="border-collapse:collapse;width:100%;margin-top:16px">
      <thead>
        <tr>
          <th style="padding:8px;border:1px solid #ddd;text-align:left">Product</th>
          <th style="padding:8px;border:1px solid #ddd;text-align:left">Qty</th>
          <th style="padding:8px;border:1px solid #ddd;text-align:left">Notes</th>
          <th style="padding:8px;border:1px solid #ddd;text-align:left">Slug</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;

  const salesResult = await sendMail({
    subject: `[Quote Request] ${name}${company ? ` — ${company}` : ""}`,
    replyTo: email,
    html: salesHtml,
  });

  if (!salesResult.ok) {
    return { success: false, error: salesResult.error };
  }

  // Best-effort confirmation to the requester (does not fail the quote if this fails)
  const confirmResult = await sendMail({
    to: email,
    replyTo: getQuoteInbox(),
    subject: "We received your quote request — BETTER FOODS CO., LTD",
    html: `
      <p>Hi ${escapeHtml(name)},</p>
      <p>Thanks for your wholesale quote request. Our sales team will follow up shortly.</p>
      <p><strong>Items requested:</strong></p>
      <ul>
        ${items
          .map(
            (item) =>
              `<li>${escapeHtml(item.name)} × ${item.quantity}${
                item.notes ? ` — ${escapeHtml(item.notes)}` : ""
              }</li>`,
          )
          .join("")}
      </ul>
      <p>Questions? Reply to this email or call +66 2 098 1091.</p>
      <p>— BETTER FOODS CO., LTD</p>
    `,
  });

  if (!confirmResult.ok) {
    console.warn("[resend] customer confirmation failed:", confirmResult.error);
  }

  return { success: true };
}
