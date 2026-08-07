import { siteConfig } from "@/config/site";
import { escapeHtml } from "@/lib/email/resend";
import {
  detailTable,
  getSiteUrl,
  messageBox,
  paragraph,
  renderEmailLayout,
} from "@/lib/email/templates/layout";

export type ContactEmailData = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
};

export function contactAdminEmail(data: ContactEmailData) {
  const siteUrl = getSiteUrl();
  const bodyHtml = [
    paragraph(
      "A new message was submitted via the <strong>Contact / Get a Quote</strong> form on the website.",
    ),
    detailTable([
      { label: "Name", valueHtml: escapeHtml(data.name) },
      {
        label: "Email",
        valueHtml: `<a href="mailto:${escapeHtml(data.email)}" style="color:#008F47;text-decoration:none;font-weight:700;">${escapeHtml(data.email)}</a>`,
      },
      { label: "Phone", valueHtml: escapeHtml(data.phone) },
      { label: "Subject", valueHtml: escapeHtml(data.subject) },
      {
        label: "Message",
        valueHtml: escapeHtml(data.message).replaceAll("\n", "<br/>"),
      },
    ]),
    paragraph(
      '<span style="color:#637381;font-size:13px;">Tip: reply to this email to respond directly to the customer.</span>',
    ),
  ].join("");

  return {
    subject: `[Contact] ${data.subject} — ${data.name}`,
    html: renderEmailLayout({
      preheader: `New contact from ${data.name}: ${data.subject}`,
      eyebrow: "Sales notification",
      title: "New contact message",
      bodyHtml,
      ctas: [
        {
          label: "Reply to customer",
          href: `mailto:${data.email}?subject=${encodeURIComponent(`Re: ${data.subject}`)}`,
        },
        {
          label: "Open website",
          href: `${siteUrl}/`,
          variant: "secondary",
        },
      ],
      footerNote: "Internal notification — do not forward externally.",
    }),
  };
}

export function contactUserEmail(data: ContactEmailData) {
  const siteUrl = getSiteUrl();
  const bodyHtml = [
    paragraph(`Hi <strong>${escapeHtml(data.name)}</strong>,`),
    paragraph(
      `Thank you for contacting <strong>${escapeHtml(siteConfig.name)}</strong>. We have received your message and our sales team will follow up shortly.`,
    ),
    paragraph("<strong>Your message summary</strong>"),
    detailTable([
      { label: "Subject", valueHtml: escapeHtml(data.subject) },
      { label: "Phone", valueHtml: escapeHtml(data.phone) },
    ]),
    messageBox(escapeHtml(data.message).replaceAll("\n", "<br/>")),
    paragraph(
      "In the meantime, you can browse our wholesale catalog or reply to this email with any extra details (pack size, destination, volume).",
    ),
  ].join("");

  return {
    subject: `We received your message — ${siteConfig.name}`,
    html: renderEmailLayout({
      preheader:
        "Thanks for contacting Better Foods. Our sales team will respond shortly.",
      eyebrow: "Confirmation",
      title: "We've received your message",
      bodyHtml,
      ctas: [
        {
          label: "Browse catalog",
          href: `${siteUrl}/shop/`,
        },
        {
          label: "View categories",
          href: `${siteUrl}/product-category/beef-products/`,
          variant: "secondary",
        },
      ],
      footerNote:
        "You are receiving this because you submitted the contact form on our website.",
    }),
  };
}
