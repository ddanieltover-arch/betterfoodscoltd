"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type ReactNode } from "react";

type Props = {
  action: (formData: FormData) => Promise<void>;
  children: ReactNode;
  className?: string;
  successMessage?: string;
};

export function AdminStatusForm({
  action,
  children,
  className,
  successMessage = "Saved",
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className={className}
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        setError(null);
        startTransition(async () => {
          try {
            await action(formData);
            setToast(successMessage);
            router.refresh();
            window.setTimeout(() => setToast(null), 2200);
          } catch (err) {
            setError(err instanceof Error ? err.message : "Save failed");
          }
        });
      }}
    >
      {children}
      {toast ? (
        <p className="mt-2 text-sm text-brand-success" role="status">
          {toast}
        </p>
      ) : null}
      {error ? (
        <p className="mt-2 text-sm text-brand-error" role="alert">
          {error}
        </p>
      ) : null}
      {pending ? (
        <p className="mt-2 text-xs text-muted" aria-live="polite">
          Saving…
        </p>
      ) : null}
    </form>
  );
}
