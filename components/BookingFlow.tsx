"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  bookAction,
  clientCancelAction,
  clientRescheduleAction,
  getAvailableSlotsAction,
  rememberClientPhoneAction,
} from "@/app/actions/reservation";
import { formatPrice, formatSlot } from "@/lib/format";
import { useI18n } from "@/components/I18nProvider";
import { localeToBcp47 } from "@/lib/i18n/config";

function TelegramReminderModal({
  telegramUrl,
  onClose,
}: {
  telegramUrl: string;
  onClose: () => void;
}) {
  const { t } = useI18n();
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="tg-reminder-gate-title"
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="tg-reminder-gate-title" className="text-lg font-semibold">
          {t("booking.modal.title")}
        </h2>
        <p className="mt-3 text-sm text-[var(--muted)] leading-relaxed">{t("booking.modal.body")}</p>
        <a
          href={telegramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 flex w-full justify-center rounded-xl bg-[var(--accent)] py-3 text-sm font-medium text-white hover:bg-[var(--accent-hover)]"
        >
          {t("booking.modal.openTelegram")}
        </a>
        <button
          type="button"
          onClick={onClose}
          className="mt-3 w-full rounded-xl border border-[var(--border)] py-2.5 text-sm text-[var(--muted)] hover:bg-[var(--bg)]"
        >
          {t("booking.modal.close")}
        </button>
      </div>
    </div>
  );
}

export type BookingService = {
  id: string;
  name: string;
  durationMinutes: number;
  priceCents: number | null;
};

export type ExistingReservation = {
  id: string;
  serviceId: string;
  serviceName: string;
  clientName: string;
  startIso: string;
  endIso: string;
  /** Посилання на бота для нагадування, якщо ще не підключено */
  telegramReminderUrl: string | null;
};

type View = "home" | "services" | "times" | "details" | "success" | "rescheduleTimes";

export function BookingFlow({
  businessName,
  slug,
  services,
  existing,
}: {
  businessName: string;
  slug: string;
  services: BookingService[];
  existing: ExistingReservation | null;
}) {
  const { t, locale } = useI18n();
  const dateLocale = localeToBcp47[locale];
  const router = useRouter();
  const [view, setView] = useState<View>(() => (existing ? "home" : "services"));
  const [serviceId, setServiceId] = useState<string | null>(existing?.serviceId ?? null);
  const [slots, setSlots] = useState<string[]>([]);
  const [startIso, setStartIso] = useState<string | null>(null);
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [lookupPhone, setLookupPhone] = useState("");
  const [tgReminderUrl, setTgReminderUrl] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const afterPhoneLookup = useRef(false);
  const [tgModalUrl, setTgModalUrl] = useState<string | null>(null);

  useEffect(() => {
    if (afterPhoneLookup.current && existing) {
      setView("home");
      afterPhoneLookup.current = false;
    }
  }, [existing]);

  useEffect(() => {
    if (existing && view === "home") return;
    if (!serviceId) return;
    if (view !== "times" && view !== "rescheduleTimes") return;
    let cancelled = false;
    (async () => {
      const { slots: s } = await getAvailableSlotsAction({
        businessSlug: slug,
        serviceId,
        ...(view === "rescheduleTimes" && existing
          ? { ignoreReservationId: existing.id }
          : {}),
      });
      if (!cancelled) setSlots(s);
    })();
    return () => {
      cancelled = true;
    };
  }, [view, serviceId, slug, existing]);

  useEffect(() => {
    if (existing) {
      setServiceId(existing.serviceId);
    }
  }, [existing]);

  useEffect(() => {
    if (!tgModalUrl) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setTgModalUrl(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [tgModalUrl]);

  const selectedService = services.find((s) => s.id === serviceId) ?? null;

  const goBookAnother = useCallback(() => {
    setErr(null);
    setStartIso(null);
    setClientName("");
    setClientPhone("");
    setServiceId(null);
    setView("services");
  }, []);

  const openReschedule = useCallback(() => {
    if (!existing) return;
    setErr(null);
    setServiceId(existing.serviceId);
    setView("rescheduleTimes");
  }, [existing]);

  const pickTime = useCallback((iso: string) => {
    setStartIso(iso);
    setView("details");
  }, []);

  const submitBook = useCallback(() => {
    if (!serviceId || !startIso) return;
    setErr(null);
    start(async () => {
      try {
        const out = await bookAction({
          businessSlug: slug,
          serviceId,
          startIso,
          clientName,
          clientPhone,
        });
        setTgReminderUrl(out.telegramReminderUrl);
        setView("success");
      } catch (e) {
        setErr(e instanceof Error ? e.message : t("booking.error.bookFailed"));
      }
    });
  }, [slug, serviceId, startIso, clientName, clientPhone, router, t]);

  const cancelBooking = useCallback(() => {
    if (!existing) return;
    setErr(null);
    start(async () => {
      try {
        await clientCancelAction({ businessSlug: slug, reservationId: existing.id });
        setView("services");
        router.refresh();
      } catch (e) {
        setErr(e instanceof Error ? e.message : t("booking.error.failed"));
      }
    });
  }, [existing, slug, router, t]);

  const applyReschedule = useCallback(
    (iso: string) => {
      if (!existing) return;
      setErr(null);
      start(async () => {
        try {
          await clientRescheduleAction({
            businessSlug: slug,
            reservationId: existing.id,
            newStartIso: iso,
          });
          setView("home");
          router.refresh();
        } catch (e) {
          setErr(e instanceof Error ? e.message : t("booking.error.failed"));
        }
      });
    },
    [existing, slug, router, t]
  );

  const lookup = useCallback(() => {
    setErr(null);
    start(async () => {
      try {
        await rememberClientPhoneAction({ businessSlug: slug, phone: lookupPhone });
        setLookupPhone("");
        afterPhoneLookup.current = true;
        router.refresh();
      } catch {
        setErr(t("booking.error.lookupFailed"));
      }
    });
  }, [lookupPhone, slug, router, t]);

  return (
    <main className="mx-auto min-h-dvh max-w-lg px-4 py-8">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold">{businessName}</h1>
        <p className="text-sm text-[var(--muted)]">{t("booking.tagline")}</p>
      </header>

      {err && (
        <p className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {err}
        </p>
      )}

      {view === "home" && existing && (
        <section className="space-y-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <h2 className="text-lg font-medium">{t("booking.reservation.title")}</h2>
          <p className="text-[var(--muted)]">{existing.serviceName}</p>
          <p className="text-lg">{formatSlot(existing.startIso, dateLocale)}</p>
          <p className="text-sm text-[var(--muted)]">{existing.clientName}</p>
          {existing.telegramReminderUrl && (
            <button
              type="button"
              onClick={() => setTgModalUrl(existing.telegramReminderUrl)}
              className="inline-flex w-full justify-center rounded-lg border border-[var(--accent)] py-2 text-sm font-medium text-[var(--accent)] hover:bg-[var(--accent)]/10"
            >
              {t("booking.confirmBooking")}
            </button>
          )}
          <div className="flex flex-wrap gap-2 pt-2">
            <button
              type="button"
              disabled={pending}
              onClick={openReschedule}
              className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent-hover)] disabled:opacity-50"
            >
              {t("booking.changeTime")}
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={cancelBooking}
              className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm hover:bg-[var(--bg)] disabled:opacity-50"
            >
              {t("booking.cancel")}
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={goBookAnother}
              className="rounded-lg border border-dashed border-[var(--border)] px-4 py-2 text-sm text-[var(--muted)] hover:bg-[var(--bg)] disabled:opacity-50"
            >
              {t("booking.newBooking")}
            </button>
          </div>
        </section>
      )}

      {(view === "services" || (view === "home" && !existing)) && (
        <section className="space-y-3">
          <h2 className="sr-only">{t("booking.services.srOnly")}</h2>
          {services.length === 0 ? (
            <p className="text-[var(--muted)]">{t("booking.services.empty")}</p>
          ) : (
            <ul className="space-y-2">
              {services.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => {
                      setServiceId(s.id);
                      setErr(null);
                      setView("times");
                    }}
                    className="flex w-full items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-4 text-left hover:border-[var(--accent)] disabled:opacity-50"
                  >
                    <span className="font-medium">{s.name}</span>
                    <span className="text-sm text-[var(--muted)]">
                      {t("booking.durationFmt", { n: s.durationMinutes })} {formatPrice(s.priceCents)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {view === "times" && selectedService && (
        <section>
          <button
            type="button"
            onClick={() => setView(existing ? "home" : "services")}
            className="mb-4 text-sm text-[var(--muted)] hover:text-[var(--text)]"
          >
            {t("booking.back")}
          </button>
          <h2 className="mb-3 text-lg font-medium">{t("booking.pickTime")}</h2>
          <div className="max-h-[60vh] overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2">
            {slots.length === 0 ? (
              <p className="p-4 text-sm text-[var(--muted)]">{t("booking.loadingTimes")}</p>
            ) : (
              <ul className="grid gap-1 sm:grid-cols-2">
                {slots.map((iso) => (
                  <li key={iso}>
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => pickTime(iso)}
                      className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-[var(--bg)] disabled:opacity-50"
                    >
                      {formatSlot(iso, dateLocale)}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      )}

      {view === "details" && selectedService && startIso && (
        <section className="space-y-4">
          <button
            type="button"
            onClick={() => setView("times")}
            className="text-sm text-[var(--muted)] hover:text-[var(--text)]"
          >
            {t("booking.back")}
          </button>
          <h2 className="text-lg font-medium">{t("booking.almostThere")}</h2>
          <p className="text-sm text-[var(--muted)]">
            {selectedService.name} · {formatSlot(startIso, dateLocale)}
          </p>
          <label className="block">
            <span className="mb-1 block text-sm text-[var(--muted)]">{t("booking.label.name")}</span>
            <input
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 outline-none focus:border-[var(--accent)]"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-[var(--muted)]">{t("booking.label.phone")}</span>
            <input
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
              type="tel"
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 outline-none focus:border-[var(--accent)]"
            />
          </label>
          <button
            type="button"
            disabled={pending || !clientName.trim() || !clientPhone.trim()}
            onClick={submitBook}
            className="w-full rounded-xl bg-[var(--accent)] py-3 font-medium text-white hover:bg-[var(--accent-hover)] disabled:opacity-50"
          >
            {t("booking.book.submit")}
          </button>
        </section>
      )}

      {view === "success" && (
        <section className="space-y-4 rounded-xl border border-[var(--success)]/40 bg-[var(--success)]/10 p-4">
          <h2 className="text-lg font-medium text-[var(--success)]">{t("booking.success.title")}</h2>
          <p className="text-sm text-[var(--muted)]">{t("booking.success.saved")}</p>
          {tgReminderUrl && (
            <p className="text-sm text-[var(--muted)]">{t("booking.success.telegramHint")}</p>
          )}
          <button
            type="button"
            onClick={() => {
              router.refresh();
              setView("home");
            }}
            className="w-full rounded-xl bg-[var(--accent)] py-3 font-medium text-white hover:bg-[var(--accent-hover)]"
          >
            {t("booking.done")}
          </button>
        </section>
      )}

      {view === "rescheduleTimes" && existing && selectedService && (
        <section>
          <button
            type="button"
            onClick={() => setView("home")}
            className="mb-4 text-sm text-[var(--muted)] hover:text-[var(--text)]"
          >
            {t("booking.back")}
          </button>
          <h2 className="mb-3 text-lg font-medium">{t("booking.reschedule.newTime")}</h2>
          <div className="max-h-[60vh] overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2">
            {slots.length === 0 ? (
              <p className="p-4 text-sm text-[var(--muted)]">{t("booking.loadingTimes")}</p>
            ) : (
              <ul className="grid gap-1 sm:grid-cols-2">
                {slots.map((iso) => (
                  <li key={iso}>
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => applyReschedule(iso)}
                      className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-[var(--bg)] disabled:opacity-50"
                    >
                      {formatSlot(iso, dateLocale)}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      )}

      {tgModalUrl && <TelegramReminderModal telegramUrl={tgModalUrl} onClose={() => setTgModalUrl(null)} />}

      <footer className="mt-12 border-t border-[var(--border)] pt-6">
        <p className="mb-2 text-sm text-[var(--muted)]">{t("booking.footer.lookupTitle")}</p>
        <div className="flex gap-2">
          <input
            value={lookupPhone}
            onChange={(e) => setLookupPhone(e.target.value)}
            placeholder={t("booking.footer.phonePlaceholder")}
            className="min-w-0 flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
          />
          <button
            type="button"
            disabled={pending || !lookupPhone.trim()}
            onClick={lookup}
            className="shrink-0 rounded-lg bg-[var(--surface)] px-4 py-2 text-sm font-medium hover:bg-[var(--border)] disabled:opacity-50"
          >
            {t("booking.footer.find")}
          </button>
        </div>
      </footer>

      {view === "success" && tgReminderUrl && (
        <div className="mt-12 px-2">
          <a
            href={tgReminderUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full justify-center border-2 border-[var(--accent)] px-4 py-4 text-3xl font-medium text-[var(--accent)] hover:bg-[var(--accent)]/10"
          >
            {t("booking.modal.openTelegram")}
          </a>
        </div>
      )}
    </main>
  );
}
