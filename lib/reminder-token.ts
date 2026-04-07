import { randomBytes } from "crypto";

/** Тільки 0-9a-f для Telegram deep link ?start=reminder_<token> */
export function newReminderLinkToken(): string {
  return randomBytes(16).toString("hex");
}
