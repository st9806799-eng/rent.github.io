import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getPrimaryBusinessForOwner } from "@/lib/business-context";
import { OwnerReservationRow } from "@/components/OwnerReservationRow";
import { getTranslator } from "@/lib/i18n/server";

export default async function ReservationsPage() {
  const { t } = await getTranslator();
  const user = await getCurrentUser();
  if (!user) return null;
  const biz = await getPrimaryBusinessForOwner(user.id);
  const branch = biz?.branches[0];
  if (!biz || !branch) return null;

  const now = new Date();
  const list = await prisma.reservation.findMany({
    where: {
      branchId: branch.id,
      endAt: { gte: now },
      status: "confirmed",
    },
    orderBy: { startAt: "asc" },
    include: { service: true },
  });

  return (
    <div>
      <header className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{t("reservations.title")}</h1>
          <p className="text-sm text-[var(--muted)]">{t("reservations.subtitle")}</p>
        </div>
        <Link href="/dashboard" className="text-sm text-[var(--muted)] hover:text-[var(--text)]">
          {t("dash.back")}
        </Link>
      </header>
      {list.length === 0 ? (
        <p className="text-[var(--muted)]">{t("reservations.empty")}</p>
      ) : (
        <ul className="space-y-3">
          {list.map((r) => (
            <OwnerReservationRow
              key={r.id}
              id={r.id}
              name={r.clientName}
              serviceName={r.service.name}
              serviceId={r.serviceId}
              startIso={r.startAt.toISOString()}
              businessSlug={biz.slug}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
