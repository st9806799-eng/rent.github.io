"use client";

import Link from "next/link";
import { useActionState } from "react";
import { registerAction } from "@/app/actions/auth";
import { useI18n } from "@/components/I18nProvider";
import { Field, FormError, Shell, Submit } from "@/components/Shell";

export default function RegisterPage() {
  const { t } = useI18n();
  const [error, formAction] = useActionState(registerAction, null);

  return (
    <Shell title={t("auth.register.title")}>
      <form action={formAction} className="flex flex-col gap-4">
        <FormError message={error} />
        <Field label={t("auth.field.email")} name="email" type="email" required />
        <Field label={t("auth.field.password")} name="password" type="password" required />
        <Submit>{t("auth.register.submit")}</Submit>
      </form>
      <p className="mt-6 text-center text-sm text-[var(--muted)]">
        {t("auth.register.haveAccount")}{" "}
        <Link href="/login" className="text-[var(--accent)] hover:underline">
          {t("auth.register.signIn")}
        </Link>
      </p>
    </Shell>
  );
}
