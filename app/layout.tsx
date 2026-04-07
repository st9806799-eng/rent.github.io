import type { Metadata } from "next";
import "./globals.css";
import { I18nProvider } from "@/components/I18nProvider";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { dictionaries } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  if (locale === "uk") {
    return {
      title: "Rent — просте бронювання",
      description: "Бронювання для клієнтів за кілька кроків",
    };
  }
  return {
    title: "Rent — simple bookings",
    description: "Two-tap reservations for your clients",
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = dictionaries[locale];

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        <I18nProvider locale={locale} messages={messages}>
          <div className="fixed right-3 top-3 z-[100]">
            <LocaleSwitcher />
          </div>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
