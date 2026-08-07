import { siteConfig } from "@/config/site";
import { escapeHtml } from "@/lib/email/resend";

const BRAND = "#00AB55";
const BRAND_DARK = "#008F47";
const INK = "#1B252F";
const MUTED = "#637381";
const SURFACE = "#F4F6F8";
const WHITE = "#FFFFFF";

export function getSiteUrl(): string {
  // Prefer a public URL so logo/CTAs work in email clients (not localhost).
  const raw =
    process.env.NEXT_PUBLIC_EMAIL_ASSET_BASE?.trim().replace(
      /^['"]|['"]$/g,
      "",
    ) ||
    process.env.NEXT_PUBLIC_URL?.trim().replace(/^['"]|['"]$/g, "") ||
    siteConfig.url;
  // Avoid localhost asset URLs in outbound mail — clients cannot fetch them.
  if (/localhost|127\.0\.0\.1/i.test(raw)) {
    return siteConfig.url.replace(/\/$/, "");
  }
  return raw.replace(/\/$/, "");
}

export function getLogoUrl(): string {
  // Light logo for dark/green header bars
  return `${getSiteUrl()}/images/logo-light.png`;
}

export function getLogoDarkUrl(): string {
  return `${getSiteUrl()}/images/logo.png`;
}

type Cta = {
  label: string;
  href: string;
  variant?: "primary" | "secondary";
};

type LayoutOptions = {
  preheader?: string;
  eyebrow?: string;
  title: string;
  bodyHtml: string;
  ctas?: Cta[];
  footerNote?: string;
};

function renderCta(cta: Cta): string {
  const primary = cta.variant !== "secondary";
  const bg = primary ? BRAND : WHITE;
  const color = primary ? WHITE : INK;
  const border = primary ? BRAND : "#D0D5DD";

  return `
    <td style="padding:0 8px 0 0;">
      <a href="${escapeHtml(cta.href)}"
         style="display:inline-block;background:${bg};color:${color};border:1px solid ${border};font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;line-height:1;text-decoration:none;padding:14px 22px;border-radius:6px;">
        ${escapeHtml(cta.label)}
      </a>
    </td>
  `;
}

/**
 * Professional transactional email shell (email-client safe tables + inline CSS).
 */
export function renderEmailLayout(opts: LayoutOptions): string {
  const siteUrl = getSiteUrl();
  const logoUrl = getLogoUrl();
  const year = new Date().getFullYear();
  const preheader = opts.preheader
    ? `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:#fff;opacity:0;">${escapeHtml(opts.preheader)}</div>`
    : "";

  const ctaRow =
    opts.ctas && opts.ctas.length > 0
      ? `
      <tr>
        <td style="padding:8px 32px 28px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
            <tr>
              ${opts.ctas.map(renderCta).join("")}
            </tr>
          </table>
        </td>
      </tr>`
      : "";

  const eyebrow = opts.eyebrow
    ? `<p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${BRAND};">${escapeHtml(opts.eyebrow)}</p>`
    : "";

  const footerNote = opts.footerNote
    ? `<p style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;color:${MUTED};">${escapeHtml(opts.footerNote)}</p>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <title>${escapeHtml(opts.title)}</title>
</head>
<body style="margin:0;padding:0;background:${SURFACE};">
  ${preheader}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${SURFACE};padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:${WHITE};border-radius:12px;overflow:hidden;border:1px solid #E4E7EC;">
          <!-- Header -->
          <tr>
            <td style="background:${INK};padding:22px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <a href="${escapeHtml(siteUrl)}/" style="text-decoration:none;">
                      <img src="${escapeHtml(logoUrl)}" width="200" height="36" alt="${escapeHtml(siteConfig.name)}" style="display:block;border:0;outline:none;height:auto;max-width:200px;" />
                    </a>
                  </td>
                  <td align="right" style="font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:rgba(255,255,255,0.65);">
                    Wholesale · Thailand
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Accent bar -->
          <tr>
            <td style="height:4px;background:${BRAND};font-size:0;line-height:0;">&nbsp;</td>
          </tr>
          <!-- Title -->
          <tr>
            <td style="padding:28px 32px 8px;">
              ${eyebrow}
              <h1 style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:24px;line-height:1.3;font-weight:700;color:${INK};">
                ${escapeHtml(opts.title)}
              </h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:12px 32px 8px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:${INK};">
              ${opts.bodyHtml}
            </td>
          </tr>
          ${ctaRow}
          <!-- Contact strip -->
          <tr>
            <td style="padding:0 32px 28px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${SURFACE};border-radius:8px;">
                <tr>
                  <td style="padding:16px 18px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.55;color:${MUTED};">
                    <strong style="color:${INK};">Need help?</strong><br/>
                    Call <a href="${escapeHtml(siteConfig.phoneHref)}" style="color:${BRAND_DARK};text-decoration:none;font-weight:700;">${escapeHtml(siteConfig.phone)}</a>
                    or email <a href="mailto:${escapeHtml(siteConfig.email)}" style="color:${BRAND_DARK};text-decoration:none;font-weight:700;">${escapeHtml(siteConfig.email)}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px 28px;border-top:1px solid #E4E7EC;background:#FAFBFC;">
              ${footerNote}
              <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;color:${INK};">
                ${escapeHtml(siteConfig.name)}
              </p>
              <p style="margin:0 0 10px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;color:${MUTED};">
                ${escapeHtml(siteConfig.address)}
              </p>
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#98A2B3;">
                <a href="${escapeHtml(siteUrl)}/" style="color:${BRAND_DARK};text-decoration:none;">Website</a>
                &nbsp;·&nbsp;
                <a href="${escapeHtml(siteUrl)}/shop/" style="color:${BRAND_DARK};text-decoration:none;">Catalog</a>
                &nbsp;·&nbsp;
                <a href="${escapeHtml(siteUrl)}/contact-us/" style="color:${BRAND_DARK};text-decoration:none;">Contact</a>
                <br/>© ${year} ${escapeHtml(siteConfig.name)}. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function detailTable(
  rows: Array<{ label: string; valueHtml: string }>,
): string {
  const body = rows
    .map(
      (row, i) => `
      <tr>
        <td style="padding:10px 12px;border-top:${i === 0 ? "0" : "1px solid #E4E7EC"};width:34%;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;color:${MUTED};vertical-align:top;">
          ${escapeHtml(row.label)}
        </td>
        <td style="padding:10px 12px;border-top:${i === 0 ? "0" : "1px solid #E4E7EC"};font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${INK};vertical-align:top;">
          ${row.valueHtml}
        </td>
      </tr>`,
    )
    .join("");

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:16px 0;border:1px solid #E4E7EC;border-radius:8px;overflow:hidden;">
      ${body}
    </table>
  `;
}

export function productsTable(
  items: Array<{ name: string; quantity: number; notes?: string }>,
): string {
  const rows = items
    .map(
      (item, i) => `
      <tr>
        <td style="padding:10px 12px;border-top:${i === 0 ? "0" : "1px solid #E4E7EC"};font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${INK};">
          ${escapeHtml(item.name)}
        </td>
        <td style="padding:10px 12px;border-top:${i === 0 ? "0" : "1px solid #E4E7EC"};font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${INK};text-align:center;width:64px;">
          ${item.quantity}
        </td>
        <td style="padding:10px 12px;border-top:${i === 0 ? "0" : "1px solid #E4E7EC"};font-family:Arial,Helvetica,sans-serif;font-size:13px;color:${MUTED};">
          ${escapeHtml(item.notes?.trim() || "—")}
        </td>
      </tr>`,
    )
    .join("");

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:16px 0;border:1px solid #E4E7EC;border-radius:8px;overflow:hidden;">
      <tr>
        <th align="left" style="padding:10px 12px;background:${SURFACE};font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;color:${MUTED};">Product</th>
        <th align="center" style="padding:10px 12px;background:${SURFACE};font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;color:${MUTED};width:64px;">Qty</th>
        <th align="left" style="padding:10px 12px;background:${SURFACE};font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;color:${MUTED};">Notes</th>
      </tr>
      ${rows}
    </table>
  `;
}

export function paragraph(text: string): string {
  return `<p style="margin:0 0 14px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:${INK};">${text}</p>`;
}

export function messageBox(html: string): string {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 16px;">
      <tr>
        <td style="padding:14px 16px;background:${SURFACE};border-left:4px solid ${BRAND};border-radius:0 8px 8px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:${INK};">
          ${html}
        </td>
      </tr>
    </table>
  `;
}
