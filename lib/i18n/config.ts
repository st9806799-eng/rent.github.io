export const locales = ["uk", "en"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "uk";

export const LOCALE_COOKIE = "app_locale";

export const localeToBcp47: Record<Locale, string> = {
  uk: "uk-UA",
  en: "en-US",
};

export function isLocale(v: string | undefined | null): v is Locale {
  return v === "uk" || v === "en";
}
