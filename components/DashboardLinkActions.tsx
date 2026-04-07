"use client";

import { useCallback, useState } from "react";
import { useI18n } from "@/components/I18nProvider";

export function DashboardLinkActions({ slug }: { slug: string }) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async () => {
    const url = `${window.location.origin}/b/${slug}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [slug]);

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3">
      <button
        type="button"
        onClick={copy}
        className="w-full rounded-lg bg-[var(--accent)] py-2.5 text-sm font-medium text-white hover:bg-[var(--accent-hover)]"
      >
        {copied ? t("dash.copy.copied") : t("dash.copy.link")}
      </button>
      <a
        href={`/api/qr/${slug}`}
        download={`booking-${slug}.png`}
        className="block w-full rounded-lg border border-[var(--border)] py-2.5 text-center text-sm font-medium hover:bg-[var(--bg)]"
      >
        {t("dash.copy.qr")}
      </a>
      <p className="truncate text-xs text-[var(--muted)]">/b/{slug}</p>
    </div>
  );
}
