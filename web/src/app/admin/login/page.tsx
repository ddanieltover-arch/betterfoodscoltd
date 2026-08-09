import { LoginForm } from "@/features/admin/LoginForm";
import { safeAdminCallbackUrl } from "@/lib/adminAuth";

export const metadata = {
  title: "Admin login",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const params = await searchParams;
  const callbackUrl = safeAdminCallbackUrl(params.callbackUrl);

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md border border-brand-border bg-surface p-6 md:p-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          Admin
        </p>
        <h1 className="font-display mt-1 text-3xl text-brand">
          Better Foods
        </h1>
        <p className="mt-2 text-sm text-muted">
          Sign in to manage quotes, inquiries, and products.
        </p>
        <div className="mt-6">
          <LoginForm callbackUrl={callbackUrl} />
        </div>
      </div>
    </div>
  );
}
