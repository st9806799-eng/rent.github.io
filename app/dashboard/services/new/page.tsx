"use client";

import Link from "next/link";
import { useActionState } from "react";
import { createServiceAction } from "@/app/actions/service";
import { useI18n } from "@/components/I18nProvider";
import { Field, FormError, Shell, Submit } from "@/components/Shell";

export default function NewServicePage() {
  const { t } = useI18n();
  const [error, formAction] = useActionState(createServiceAction, null);

  return (
    <Shell
      title={t("serviceNew.title")}
      action={
        <Link href="/dashboard" className="text-sm text-[var(--muted)] hover:text-[var(--text)]">
          {t("dash.back")}
        </Link>
      }
    >
      <form action={formAction} className="flex flex-col gap-4">
        <FormError message={error} />
        <Field
          label={t("serviceNew.name")}
          name="name"
          required
          placeholder={t("serviceNew.placeholder.name")}
        />
        <Field
          label={t("serviceNew.duration")}
          name="duration"
          type="number"
          required
          defaultValue="30"
        />
        <Field
          label={t("serviceNew.price")}
          name="price"
          placeholder={t("serviceNew.placeholder.price")}
        />
        <Submit>{t("common.save")}</Submit>
      </form>
      <p className="mt-4 text-sm text-[var(--muted)]">{t("serviceNew.hint")}</p>
    </Shell>
  );
}
