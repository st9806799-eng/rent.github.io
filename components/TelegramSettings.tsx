"use client";

import { useActionState } from "react";
import { updateOwnerTelegramChatAction } from "@/app/actions/settings";
import { useI18n } from "@/components/I18nProvider";
import { FormError, Submit } from "@/components/Shell";

export function TelegramSettings({
  initialChatId,
  sharedBotEnabled,
}: {
  initialChatId: string | null;
  /** Один бот уже прописан в .env на сервере (для всех владельцев и клиентов) */
  sharedBotEnabled: boolean;
}) {
  const { t } = useI18n();
  const [error, formAction] = useActionState(updateOwnerTelegramChatAction, null);

  return (
    <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <h2 className="text-lg font-medium">{t("telegram.title")}</h2>

      {!sharedBotEnabled && (
        <p className="mt-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
          {t("telegram.botOff")}
        </p>
      )}

      {sharedBotEnabled && (
        <p className="mt-2 text-sm text-[var(--muted)]">{t("telegram.botOn")}</p>
      )}

      <p className="mt-2 text-sm text-[var(--muted)]">{t("telegram.chatIdHint")}</p>

      <form action={formAction} className="mt-4 flex flex-col gap-3">
        <FormError message={error} />
        <label className="block">
          <span className="mb-1 block text-sm text-[var(--muted)]">{t("telegram.field.chatId")}</span>
          <input
            name="telegramChatId"
            type="text"
            defaultValue={initialChatId ?? ""}
            placeholder={t("telegram.placeholder.chatId")}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 outline-none focus:border-[var(--accent)]"
          />
        </label>
        <Submit>{t("telegram.save")}</Submit>
      </form>

      <p className="mt-3 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-xs text-[var(--muted)]">
        {t("telegram.faq")}
      </p>
    </section>
  );
}
