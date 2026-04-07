import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getPrimaryBusinessForOwner } from "@/lib/business-context";
import { getTranslator } from "@/lib/i18n/server";

export default async function AnalyticsPage() {
  const { t } = await getTranslator();
  const user = await getCurrentUser();
  if (!user) return null;
  const biz = await getPrimaryBusinessForOwner(user.id);
  const branch = biz?.branches[0];
  if (!branch) return null;

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);

  const [total, todayCount, cancelled, byService] = await Promise.all([
    prisma.reservation.count({ where: { branchId: branch.id } }),
    prisma.reservation.count({
      where: {
        branchId: branch.id,
        status: "confirmed",
        startAt: { gte: startOfDay, lt: endOfDay },
      },
    }),
    prisma.reservation.count({
      where: { branchId: branch.id, status: "cancelled" },
    }),
    prisma.reservation.groupBy({
      by: ["serviceId"],
      where: { branchId: branch.id, status: "confirmed" },
      _count: { serviceId: true },
      orderBy: { _count: { serviceId: "desc" } },
      take: 1,
    }),
  ]);

  let topService = "—";
  if (byService[0]) {
    const s = await prisma.service.findUnique({
      where: { id: byService[0].serviceId },
      select: { name: true },
    });
    topService = s?.name ?? "—";
  }

  const cards = [
    { key: "analytics.totalBookings" as const, value: String(total) },
    { key: "analytics.today" as const, value: String(todayCount) },
    { key: "analytics.cancellations" as const, value: String(cancelled) },
    { key: "analytics.topService" as const, value: topService },
  ];

  return (
    <div>
      <header className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">{t("analytics.title")}</h1>
        <Link href="/dashboard" className="text-sm text-[var(--muted)] hover:text-[var(--text)]">
          {t("dash.back")}
        </Link>
      </header>
      <div className="grid gap-3 sm:grid-cols-2">
        {cards.map((c) => (
          <div
            key={c.key}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-4"
          >
            <p className="text-sm text-[var(--muted)]">{t(c.key)}</p>
            <p className="mt-1 text-2xl font-semibold">{c.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
