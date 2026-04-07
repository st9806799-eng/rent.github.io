import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getPrimaryBusinessForOwner } from "@/lib/business-context";
import { getTranslator } from "@/lib/i18n/server";

export default async function HomePage() {
  const { t } = await getTranslator();
  const user = await getCurrentUser();
  let href = "/login";
  let label = t("home.cta.signIn");

  if (user) {
    if (user.role === "ADMIN") {
      href = "/admin";
      label = t("home.cta.admin");
    } else {
      const biz = await getPrimaryBusinessForOwner(user.id);
      href = biz ? "/dashboard" : "/business/create";
      label = biz ? t("home.cta.dashboard") : t("home.cta.createBusiness");
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center gap-8 px-4 py-12">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight" suppressHydrationWarning>
          {t("home.title")}
        </h1>
        <p className="mt-2 text-[var(--muted)]" suppressHydrationWarning>
          {t("home.subtitle")}
        </p>
        <ul className="mt-6 space-y-2 text-sm text-[var(--muted)]">
          <li className="flex gap-2">
            <span className="text-[var(--text)]">·</span>
            <span>{t("home.feature.schedules")}</span>
          </li>
          <li className="flex gap-2">
            <span className="text-[var(--text)]">·</span>
            <span>{t("home.feature.capacity")}</span>
          </li>
          <li className="flex gap-2">
            <span className="text-[var(--text)]">·</span>
            <span>{t("home.feature.verification")}</span>
          </li>
          <li className="flex gap-2">
            <span className="text-[var(--text)]">·</span>
            <span>{t("home.feature.resources")}</span>
          </li>
        </ul>
      </div>
      <div className="flex flex-col gap-3">
        <Link
          href={href}
          className="rounded-xl bg-[var(--accent)] px-4 py-3 text-center font-medium text-white hover:bg-[var(--accent-hover)]"
          suppressHydrationWarning
        >
          {label}
        </Link>
        {!user && (
          <Link
            href="/register"
            className="rounded-xl border border-[var(--border)] px-4 py-3 text-center font-medium hover:bg-[var(--surface)]"
            suppressHydrationWarning
          >
            {t("home.cta.register")}
          </Link>
        )}
      </div>
    </main>
  );
}
