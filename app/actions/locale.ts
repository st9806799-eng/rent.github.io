"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { isLocale, LOCALE_COOKIE, type Locale } from "@/lib/i18n/config";

export async function setLocaleAction(locale: string) {
  const l: Locale = isLocale(locale) ? locale : "uk";
  const store = await cookies();
  store.set(LOCALE_COOKIE, l, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  revalidatePath("/", "layout");
}
