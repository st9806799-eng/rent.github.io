"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction } from "@/app/actions/auth";
import { useI18n } from "@/components/I18nProvider";
import { Field, FormError, Shell, Submit } from "@/components/Shell";

export default function LoginPage() {
  const { t } = useI18n();
  const [error, formAction] = useActionState(loginAction, null);

  return (
    <Shell title={t("auth.login.title")}>
      <form action={formAction} className="flex flex-col gap-4">
        <FormError message={error} />
        <Field label={t("auth.field.email")} name="email" type="email" required />
        <Field label={t("auth.field.password")} name="password" type="password" required />
        <Submit>{t("auth.login.continue")}</Submit>
      </form>
      <p className="mt-6 text-center text-sm text-[var(--muted)]">
        {t("auth.login.noAccount")}{" "}
        <Link href="/register" className="text-[var(--accent)] hover:underline">
          {t("auth.login.register")}
        </Link>
      </p>
    </Shell>
  );
}
