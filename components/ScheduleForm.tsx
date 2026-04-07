"use client";

import { useActionState } from "react";
import { updateScheduleAction } from "@/app/actions/schedule";
import { useI18n } from "@/components/I18nProvider";
import { FormError, Submit } from "@/components/Shell";

type Row = { dayOfWeek: number; isOpen: boolean; openTime: string; closeTime: string };

export function ScheduleForm({ days, initial }: { days: string[]; initial: Row[] }) {
  const { t } = useI18n();
  const [error, formAction] = useActionState(updateScheduleAction, null);
  const byDay = Object.fromEntries(initial.map((r) => [r.dayOfWeek, r])) as Record<
    number,
    Row
  >;

  return (
    <form action={formAction} className="space-y-4">
      <FormError message={error} />
      <ul className="space-y-3">
        {days.map((label, dayOfWeek) => {
          const row = byDay[dayOfWeek] ?? {
            dayOfWeek,
            isOpen: true,
            openTime: "09:00",
            closeTime: "18:00",
          };
          return (
            <li
              key={dayOfWeek}
              className="flex flex-wrap items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3"
            >
              <label className="flex min-w-[5rem] items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name={`on_${dayOfWeek}`}
                  value="on"
                  defaultChecked={row.isOpen}
                />
                {label}
              </label>
              <input
                name={`open_${dayOfWeek}`}
                defaultValue={row.openTime}
                className="w-24 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-2 py-1 text-sm"
              />
              <span className="text-[var(--muted)]">–</span>
              <input
                name={`close_${dayOfWeek}`}
                defaultValue={row.closeTime}
                className="w-24 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-2 py-1 text-sm"
              />
            </li>
          );
        })}
      </ul>
      <Submit>{t("common.save")}</Submit>
    </form>
  );
}
