"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  contactSchema,
  type ContactFormData,
} from "@/lib/validations/contact";
import { submitContactForm } from "@/actions/contact";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    setStatus("idle");
    setError(null);
    const result = await submitContactForm(data);
    if (!result.success) {
      setStatus("error");
      setError(result.error);
      return;
    }
    setStatus("success");
    form.reset();
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <Field label="Name" error={form.formState.errors.name?.message}>
        <input
          {...form.register("name")}
          className="field"
          autoComplete="name"
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Phone" error={form.formState.errors.phone?.message}>
          <input
            {...form.register("phone")}
            className="field"
            autoComplete="tel"
          />
        </Field>
        <Field label="Email" error={form.formState.errors.email?.message}>
          <input
            {...form.register("email")}
            type="email"
            className="field"
            autoComplete="email"
          />
        </Field>
      </div>
      <Field label="Subject" error={form.formState.errors.subject?.message}>
        <input {...form.register("subject")} className="field" />
      </Field>
      <Field label="Message" error={form.formState.errors.message?.message}>
        <textarea
          {...form.register("message")}
          rows={5}
          className="field resize-y"
        />
      </Field>

      <button
        type="submit"
        disabled={form.formState.isSubmitting}
        className="rounded-md bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
      >
        {form.formState.isSubmitting ? "Sending…" : "Get a Quote"}
      </button>

      {status === "success" ? (
        <p className="text-sm font-medium text-brand" role="status">
          Thank you — a confirmation email was sent to you, and our sales team
          has been notified.
        </p>
      ) : null}
      {status === "error" && error ? (
        <p className="text-sm font-medium text-red-700" role="alert">
          {error.includes("RESEND_API_KEY")
            ? "Email is not configured yet. Add RESEND_API_KEY to .env.local and restart the server."
            : error}
        </p>
      ) : null}
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      {children}
      {error ? (
        <span className="mt-1 block text-xs text-red-700">{error}</span>
      ) : null}
    </label>
  );
}
