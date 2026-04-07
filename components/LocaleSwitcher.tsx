"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { setLocaleAction } from "@/app/actions/locale";
import { locales, type Locale } from "@/lib/i18n/config";
import { useI18n } from "@/components/I18nProvider";

const labels: Record<Locale, string> = {
  uk: "УК",
  en: "EN",
};

export function LocaleSwitcher() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const { locale } = useI18n();

  const pick = (next: Locale) => {
    if (next === locale) return;
    start(async () => {
      await setLocaleAction(next);
      router.refresh();
    });
  };

  return (
    <div
      className="flex rounded-lg border border-[var(--border)] bg-[var(--surface)] p-0.5 text-xs shadow-sm"
      role="group"
      aria-label="Language / Мова"
    >
      {locales.map((l) => (
        <button
          key={l}
          type="button"
          disabled={pending}
          onClick={() => pick(l)}
          className={`rounded-md px-2.5 py-1 font-semibold transition-colors ${
            locale === l
              ? "bg-[var(--accent)] text-white"
              : "text-[var(--muted)] hover:text-[var(--text)]"
          }`}
        >
          {labels[l]}
        </button>
      ))}
    </div>
  );
}
