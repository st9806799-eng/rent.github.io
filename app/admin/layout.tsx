import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { logoutAction } from "@/app/actions/auth";
import { getTranslator } from "@/lib/i18n/server";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { t } = await getTranslator();
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
  const allowed =
    user.role === "ADMIN" || (!!adminEmail && user.email.toLowerCase() === adminEmail);
  if (!allowed) redirect("/dashboard");

  return (
    <div className="min-h-dvh">
      <nav className="border-b border-[var(--border)] bg-[var(--bg)]">
        <div className="mx-auto flex max-w-4xl items-center gap-4 px-4 py-3">
          <Link href="/admin" className="font-semibold">
            {t("admin.nav.title")}
          </Link>
          <Link href="/" className="text-sm text-[var(--muted)] hover:text-[var(--text)]">
            {t("admin.nav.home")}
          </Link>
          <form action={logoutAction} className="ml-auto">
            <button type="submit" className="text-sm text-[var(--muted)] hover:text-[var(--text)]">
              {t("dash.nav.logout")}
            </button>
          </form>
        </div>
      </nav>
      <div className="mx-auto max-w-4xl px-4 py-8">{children}</div>
    </div>
  );
}
