import { siteConfig } from "@/config/site";
import { escapeHtml } from "@/lib/email/resend";
import {
  detailTable,
  getSiteUrl,
  messageBox,
  paragraph,
  productsTable,
  renderEmailLayout,
} from "@/lib/email/templates/layout";

export type QuoteItemEmail = {
  name: string;
  slug: string;
  quantity: number;
  notes?: string;
};

export type QuoteEmailData = {
  name: string;
  email: string;
  phone: string;
  company?: string;
  message?: string;
  items: QuoteItemEmail[];
};

export function quoteAdminEmail(data: QuoteEmailData) {
  const siteUrl = getSiteUrl();
  const itemCount = data.items.reduce((sum, i) => sum + i.quantity, 0);
  const companyLabel = data.company?.trim() || "—";

  const bodyHtml = [
    paragraph(
      `A new <strong>wholesale quote request</strong> was submitted with <strong>${data.items.length}</strong> product line(s) and <strong>${itemCount}</strong> total unit(s).`,
    ),
    detailTable([
      { label: "Name", valueHtml: escapeHtml(data.name) },
      { label: "Company", valueHtml: escapeHtml(companyLabel) },
      {
        label: "Email",
        valueHtml: `<a href="mailto:${escapeHtml(data.email)}" style="color:#008F47;text-decoration:none;font-weight:700;">${escapeHtml(data.email)}</a>`,
      },
      { label: "Phone", valueHtml: escapeHtml(data.phone) },
      {
        label: "Notes",
        valueHtml: escapeHtml(data.message?.trim() || "—").replaceAll(
          "\n",
          "<br/>",
        ),
      },
    ]),
    paragraph("<strong>Requested products</strong>"),
    productsTable(data.items),
    paragraph(
      '<span style="color:#637381;font-size:13px;">Tip: reply to this email to respond directly to the buyer.</span>',
    ),
  ].join("");

  return {
    subject: `[Quote Request] ${data.name}${data.company ? ` — ${data.company}` : ""} (${data.items.length} products)`,
    html: renderEmailLayout({
      preheader: `Quote request from ${data.name}: ${data.items.length} products`,
      eyebrow: "Sales notification",
      title: "New wholesale quote request",
      bodyHtml,
      ctas: [
        {
          label: "Reply to buyer",
          href: `mailto:${data.email}?subject=${encodeURIComponent(`Re: Wholesale quote request — ${data.name}`)}`,
        },
        {
          label: "Open catalog",
          href: `${siteUrl}/shop/`,
          variant: "secondary",
        },
      ],
      footerNote: "Internal notification — do not forward externally.",
    }),
  };
}

export function quoteUserEmail(data: QuoteEmailData) {
  const siteUrl = getSiteUrl();

  const bodyHtml = [
    paragraph(`Hi <strong>${escapeHtml(data.name)}</strong>,`),
    paragraph(
      `Thank you for your wholesale quote request with <strong>${escapeHtml(siteConfig.name)}</strong>. Our sales team has been notified and will follow up with availability, pack options, and pricing.`,
    ),
    data.company?.trim()
      ? detailTable([
          { label: "Company", valueHtml: escapeHtml(data.company.trim()) },
          { label: "Phone", valueHtml: escapeHtml(data.phone) },
        ])
      : detailTable([{ label: "Phone", valueHtml: escapeHtml(data.phone) }]),
    paragraph("<strong>Items you requested</strong>"),
    productsTable(data.items),
    data.message?.trim()
      ? [
          paragraph("<strong>Your notes</strong>"),
          messageBox(escapeHtml(data.message.trim()).replaceAll("\n", "<br/>")),
        ].join("")
      : "",
    paragraph(
      "Need to adjust quantities or add more cuts? Reply to this email or continue browsing the catalog and submit another quote list.",
    ),
  ].join("");

  return {
    subject: `We received your quote request — ${siteConfig.name}`,
    html: renderEmailLayout({
      preheader:
        "Your wholesale quote request was received. Our sales team will follow up shortly.",
      eyebrow: "Confirmation",
      title: "Your quote request is in",
      bodyHtml,
      ctas: [
        {
          label: "Continue shopping",
          href: `${siteUrl}/shop/`,
        },
        {
          label: "Contact sales",
          href: `${siteUrl}/contact-us/`,
          variant: "secondary",
        },
      ],
      footerNote:
        "You are receiving this because you submitted a quote request on our website.",
    }),
  };
}
