"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

type Props = {
  action: (formData: FormData) => Promise<void>;
  id: string;
  confirmMessage?: string;
  hrefAfter?: string;
  label?: string;
};

export function AdminDeleteButton({
  action,
  id,
  confirmMessage = "Delete this record permanently?",
  hrefAfter,
  label = "Delete",
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      className="rounded-[var(--brand-radius-md)] border border-brand-error/30 px-3 py-1.5 text-sm text-brand-error transition hover:bg-brand-error/5 disabled:opacity-60"
      onClick={() => {
        if (!window.confirm(confirmMessage)) return;
        const formData = new FormData();
        formData.set("id", id);
        startTransition(async () => {
          await action(formData);
          if (hrefAfter) {
            router.push(hrefAfter);
          } else {
            router.refresh();
          }
        });
      }}
    >
      {pending ? "Deleting…" : label}
    </button>
  );
}
