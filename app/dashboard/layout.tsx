import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getPrimaryBusinessForOwner } from "@/lib/business-context";
import { logoutAction } from "@/app/actions/auth";
import { getTranslator } from "@/lib/i18n/server";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { t } = await getTranslator();
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role === "ADMIN") redirect("/admin");
  const biz = await getPrimaryBusinessForOwner(user.id);
  if (!biz) redirect("/business/create");

  return (
    <div className="min-h-dvh">
      <nav className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--bg)]/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-2 px-4 py-3">
          <Link href="/dashboard" className="font-semibold">
            {biz.name}
          </Link>
          <span className="text-[var(--muted)]">·</span>
          <Link href="/dashboard/reservations" className="text-sm text-[var(--muted)] hover:text-[var(--text)]">
            {t("dash.nav.reservations")}
          </Link>
          <Link href="/dashboard/analytics" className="text-sm text-[var(--muted)] hover:text-[var(--text)]">
            {t("dash.nav.analytics")}
          </Link>
          <Link href="/dashboard/profile" className="text-sm text-[var(--muted)] hover:text-[var(--text)]">
            {t("profile.title")}
          </Link>
          <div className="ml-auto">
            <form action={logoutAction}>
              <button
                type="submit"
                className="text-sm text-[var(--muted)] hover:text-[var(--text)] min-h-11 px-2 -mx-2 rounded-md"
              >
                {t("dash.nav.logout")}
              </button>
            </form>
          </div>
        </div>
      </nav>
      <div className="mx-auto max-w-3xl px-4 py-8">{children}</div>
    </div>
  );
}
