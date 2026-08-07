import { Resend } from "resend";
import { siteConfig } from "@/config/site";

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(
      `${name} is not set. Add it to .env.local to send quote emails via Resend.`,
    );
  }
  return value;
}

export function getResendClient() {
  return new Resend(requireEnv("RESEND_API_KEY"));
}

export function getQuoteInbox() {
  return process.env.QUOTE_INBOX_EMAIL?.trim() || siteConfig.email;
}

export function getFromEmail() {
  return (
    process.env.RESEND_FROM_EMAIL?.trim() ||
    "Better Foods <onboarding@resend.dev>"
  );
}

export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
