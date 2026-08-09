import { Resend } from "resend";
import { siteConfig } from "@/config/site";

function requireEnv(name: string): string {
  const value = process.env[name]?.trim().replace(/^['"]|['"]$/g, "");
  if (!value) {
    throw new Error(
      `${name} is not set. Add it to .env.local — all form emails are sent via Resend only.`,
    );
  }
  return value;
}

/** Official Resend SDK client — the only mail transport in this app. */
export function getResendClient(): Resend {
  return new Resend(requireEnv("RESEND_API_KEY"));
}

/** Primary sales/admin inbox for form notifications. */
export function getAdminInbox(): string {
  return (
    process.env.QUOTE_INBOX_EMAIL?.trim().replace(/^['"]|['"]$/g, "") ||
    siteConfig.email
  );
}

/**
 * All admin recipients (primary + optional extras).
 * Set ADMIN_CC_EMAILS as comma-separated list if needed.
 */
export function getAdminRecipients(): string[] {
  const primary = getAdminInbox();
  const extras = (process.env.ADMIN_CC_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().replace(/^['"]|['"]$/g, ""))
    .filter(Boolean);
  return [...new Set([primary, ...extras])];
}

export function getFromEmail(): string {
  return (
    process.env.RESEND_FROM_EMAIL?.trim().replace(/^['"]|['"]$/g, "") ||
    "Better Foods <sales@betterfoodcoltd.com>"
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

export type SendMailPayload = {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
};

/**
 * Send a single email through Resend.
 * No SMTP, no console fallback — fails if Resend is unavailable.
 */
export async function sendMail(
  payload: SendMailPayload,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  try {
    const resend = getResendClient();
    const { data, error } = await resend.emails.send({
      from: getFromEmail(),
      to: payload.to,
      replyTo: payload.replyTo,
      subject: payload.subject,
      html: payload.html,
    });

    if (error) {
      console.error("[resend:error]", error);
      return {
        ok: false,
        error: error.message || "Failed to send email via Resend",
      };
    }

    const id = data?.id ?? "unknown";
    console.info("[resend:sent]", {
      id,
      to: payload.to,
      subject: payload.subject,
    });
    return { ok: true, id };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to send email via Resend";
    console.error("[resend:error]", message);
    return { ok: false, error: message };
  }
}

/**
 * Send admin notification + user confirmation through Resend.
 * Both deliveries must succeed.
 */
export async function notifyAdminAndUser(opts: {
  admin: Omit<SendMailPayload, "to"> & { to?: string | string[] };
  user: Omit<SendMailPayload, "to"> & { to: string };
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const adminTo = opts.admin.to ?? getAdminRecipients();

  const adminResult = await sendMail({
    ...opts.admin,
    to: adminTo,
  });
  if (!adminResult.ok) {
    return {
      ok: false,
      error: `Could not notify our team via Resend: ${adminResult.error}`,
    };
  }

  const userResult = await sendMail(opts.user);
  if (!userResult.ok) {
    return {
      ok: false,
      error: `Admin was notified via Resend, but your confirmation email failed: ${userResult.error}`,
    };
  }

  console.info("[resend:form-complete]", {
    adminId: adminResult.id,
    userId: userResult.id,
    adminTo,
    userTo: opts.user.to,
  });

  return { ok: true };
}
