import { cookies } from "next/headers";
import {
  LOCALE_COOKIE,
  defaultLocale,
  isLocale,
  type Locale,
} from "@/lib/i18n/config";
import { createTranslator, dictionaries, type TranslateFn } from "@/lib/i18n/dictionaries";

export async function getLocale(): Promise<Locale> {
  const raw = (await cookies()).get(LOCALE_COOKIE)?.value;
  return isLocale(raw) ? raw : defaultLocale;
}

export async function getTranslator(): Promise<{ locale: Locale; t: TranslateFn }> {
  const locale = await getLocale();
  return { locale, t: createTranslator(dictionaries[locale]) };
}
