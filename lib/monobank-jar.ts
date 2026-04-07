/** Публічне посилання на банку (1 ₴) — перевірка перед підтвердженням у Telegram. */
const DEFAULT_JAR = "https://send.monobank.ua/jar/9aR5cytJDb/";

export function monobankJarPaymentUrl(): string {
  return process.env.NEXT_PUBLIC_MONOBANK_JAR_URL?.trim() || DEFAULT_JAR;
}
