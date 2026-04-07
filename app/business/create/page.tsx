"use client";

import { useActionState } from "react";
import { createBusinessAction } from "@/app/actions/business";
import { useI18n } from "@/components/I18nProvider";
import { Field, FormError, Shell, Submit } from "@/components/Shell";

export default function CreateBusinessPage() {
  const { t } = useI18n();
  const [error, formAction] = useActionState(createBusinessAction, null);

  return (
    <Shell title={t("business.create.title")}>
      <p className="mb-6 text-[var(--muted)]">{t("business.create.intro")}</p>
      <form action={formAction} className="flex flex-col gap-4">
        <FormError message={error} />
        <Field
          label={t("business.field.name")}
          name="name"
          required
          placeholder={t("business.placeholder.name")}
        />
        <Field
          label={t("business.field.phone")}
          name="phone"
          type="tel"
          required
          placeholder={t("business.placeholder.phone")}
        />
        <Field
          label={t("business.field.address")}
          name="address"
          placeholder={t("business.placeholder.address")}
        />
        <Submit>{t("business.submit")}</Submit>
      </form>
    </Shell>
  );
}
