import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getPrimaryBusinessForOwner } from "@/lib/business-context";
import { formatSlot } from "@/lib/format";
import { DashboardLinkActions } from "@/components/DashboardLinkActions";
import { TelegramSettings } from "@/components/TelegramSettings";
import { isTelegramConfigured } from "@/lib/telegram";
import { localeToBcp47 } from "@/lib/i18n/config";
import { getTranslator } from "@/lib/i18n/server";

export default async function DashboardPage() {
  const { locale, t } = await getTranslator();
  const dateLocale = localeToBcp47[locale];
  const user = await getCurrentUser();
  if (!user) return null;
  const biz = await getPrimaryBusinessForOwner(user.id);
  const branch = biz?.branches[0];
  if (!branch) return null;

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);

  const sharedBotEnabled = isTelegramConfigured();

  const today = await prisma.reservation.findMany({
    where: {
      branchId: branch.id,
      status: "confirmed",
      startAt: { gte: startOfDay, lt: endOfDay },
    },
    orderBy: { startAt: "asc" },
    include: { service: true },
  });

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-2xl font-semibold">{t("dash.today.title")}</h1>
        <p className="text-sm text-[var(--muted)]">{t("dash.today.count", { n: today.length })}</p>
      </header>

      <section className="space-y-3">
        {today.length === 0 ? (
          <p className="rounded-xl border border-dashed border-[var(--border)] px-4 py-8 text-center text-[var(--muted)]">
            {t("dash.today.empty")}
          </p>
        ) : (
          <ul className="space-y-2">
            {today.map((r) => (
              <li
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3"
              >
                <div>
                  <p className="font-medium">{r.clientName}</p>
                  <p className="text-sm text-[var(--muted)]">
                    {formatSlot(r.startAt.toISOString(), dateLocale)} · {r.service.name}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="grid gap-3 sm:grid-cols-4">
        <Link
          href="/dashboard/services/new"
          className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-4 text-center font-medium hover:border-[var(--accent)]"
        >
          {t("dash.link.addService")}
        </Link>
        <Link
          href="/dashboard/schedule"
          className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-4 text-center font-medium hover:border-[var(--accent)]"
        >
          {t("dash.link.schedule")}
        </Link>
        <Link
          href="/dashboard/profile"
          className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-4 text-center font-medium hover:border-[var(--accent)]"
        >
          Store profile
        </Link>
        <DashboardLinkActions slug={biz.slug} />
      </section>

      <TelegramSettings initialChatId={biz.telegramChatId} sharedBotEnabled={sharedBotEnabled} />
    </div>
  );
}
