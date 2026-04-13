"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  getAvailableSlotsAction,
  ownerCancelReservationAction,
  ownerMoveReservationAction,
} from "@/app/actions/reservation";
import { useI18n } from "@/components/I18nProvider";
import { formatSlot } from "@/lib/format";
import { localeToBcp47 } from "@/lib/i18n/config";

export function OwnerReservationRow({
  id,
  name,
  serviceName,
  serviceId,
  startIso,
  businessSlug,
}: {
  id: string;
  name: string;
  serviceName: string;
  serviceId: string;
  startIso: string;
  businessSlug: string;
}) {
  const { t, locale } = useI18n();
  const dateLocale = localeToBcp47[locale];
  const router = useRouter();
  const [moving, setMoving] = useState(false);
  const [slots, setSlots] = useState<string[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();

  useEffect(() => {
    if (!moving) return;
    let cancelled = false;
    (async () => {
      const { slots: s } = await getAvailableSlotsAction({
        businessSlug,
        serviceId,
        ignoreReservationId: id,
      });
      if (!cancelled) setSlots(s);
    })();
    return () => {
      cancelled = true;
    };
  }, [moving, businessSlug, serviceId, id]);

  const cancel = useCallback(() => {
    setErr(null);
    start(async () => {
      try {
        await ownerCancelReservationAction(id);
        router.refresh();
      } catch (e) {
        setErr(e instanceof Error ? e.message : t("booking.error.failed"));
      }
    });
  }, [id, router, t]);

  const move = useCallback(
    (iso: string) => {
      setErr(null);
      start(async () => {
        try {
          await ownerMoveReservationAction(id, iso);
          setMoving(false);
          router.refresh();
        } catch (e) {
          setErr(e instanceof Error ? e.message : t("booking.error.failed"));
        }
      });
    },
    [id, router, t]
  );

  return (
    <li className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-medium">{name}</p>
          <p className="text-sm text-[var(--muted)]">
            {formatSlot(startIso, dateLocale)} · {serviceName}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={cancel}
            disabled={pending}
            className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-sm hover:bg-[var(--bg)] disabled:opacity-50"
          >
            {t("ownerRow.cancel")}
          </button>
          <button
            type="button"
            onClick={() => setMoving((m) => !m)}
            disabled={pending}
            className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-sm hover:bg-[var(--bg)] disabled:opacity-50"
          >
            {moving ? t("ownerRow.close") : t("ownerRow.move")}
          </button>
        </div>
      </div>
      {err && <p className="mt-2 text-sm text-red-300">{err}</p>}
      {moving && (
        <div className="mt-3 max-h-48 overflow-y-auto rounded-lg border border-[var(--border)] bg-[var(--bg)] p-2">
          {slots.length === 0 ? (
            <p className="p-2 text-sm text-[var(--muted)]">{t("booking.loadingTimes")}</p>
          ) : (
            <ul className="grid gap-1 sm:grid-cols-2">
              {slots.map((iso) => (
                <li key={iso}>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => move(iso)}
                    className="w-full rounded-md px-2 py-1.5 text-left text-sm hover:bg-[var(--surface)] disabled:opacity-50"
                  >
                    {formatSlot(iso, dateLocale)}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </li>
  );
}
