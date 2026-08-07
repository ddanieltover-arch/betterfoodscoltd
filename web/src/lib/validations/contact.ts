import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(6, "Phone is required"),
  subject: z.string().min(2, "Subject is required").optional(),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export type ContactFormData = z.infer<typeof contactSchema>;

export const quoteRequestSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(6, "Phone is required"),
  company: z.string().optional(),
  message: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.number(),
        name: z.string(),
        slug: z.string(),
        quantity: z.number().min(1),
        notes: z.string().optional(),
      }),
    )
    .min(1, "Add at least one product to your quote"),
});

export type QuoteRequestData = z.infer<typeof quoteRequestSchema>;
