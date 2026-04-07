import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getPrimaryBusinessForOwner } from "@/lib/business-context";
import { ScheduleForm } from "@/components/ScheduleForm";
import type { MessageKey } from "@/lib/i18n/dictionaries";
import { getTranslator } from "@/lib/i18n/server";

const DAY_KEYS = [
  "schedule.day0",
  "schedule.day1",
  "schedule.day2",
  "schedule.day3",
  "schedule.day4",
  "schedule.day5",
  "schedule.day6",
] as const satisfies readonly MessageKey[];

export default async function SchedulePage() {
  const { t } = await getTranslator();
  const DAYS = DAY_KEYS.map((k) => t(k));
  const user = await getCurrentUser();
  if (!user) return null;
  const biz = await getPrimaryBusinessForOwner(user.id);
  const branch = biz?.branches[0];
  if (!branch) return null;

  const hours = [...branch.hours].sort((a, b) => a.dayOfWeek - b.dayOfWeek);

  return (
    <div>
      <header className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{t("schedule.title")}</h1>
          <p className="text-sm text-[var(--muted)]">{t("schedule.subtitle")}</p>
        </div>
        <Link href="/dashboard" className="text-sm text-[var(--muted)] hover:text-[var(--text)]">
          {t("dash.back")}
        </Link>
      </header>
      <ScheduleForm
        days={DAYS}
        initial={hours.map((h) => ({
          dayOfWeek: h.dayOfWeek,
          isOpen: h.isOpen,
          openTime: h.openTime,
          closeTime: h.closeTime,
        }))}
      />
    </div>
  );
}
