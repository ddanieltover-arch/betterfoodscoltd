import { AdminNav } from "@/components/admin/AdminNav";

export function AdminPageHeader({
  title,
  current,
}: {
  title: string;
  current: string;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          Admin
        </p>
        <h1 className="font-display text-3xl text-brand">{title}</h1>
      </div>
      <AdminNav current={current} />
    </div>
  );
}
