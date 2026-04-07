function botToken(): string | null {
  return process.env.TELEGRAM_BOT_TOKEN?.trim() || null;
}

function botUsername(): string | null {
  const u = process.env.TELEGRAM_BOT_USERNAME?.trim();
  return u ? u.replace(/^@/, "") : null;
}

export function isTelegramConfigured(): boolean {
  return !!(botToken() && botUsername());
}

export async function sendTelegramMessage(chatId: string, text: string): Promise<void> {
  const token = botToken();
  if (!token) return;

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Telegram sendMessage failed:", err);
  }
}

/** Повідомлення без HTML (відповіді бота в чат) */
export async function sendTelegramPlain(chatId: string, text: string): Promise<void> {
  const token = botToken();
  if (!token) return;
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      disable_web_page_preview: true,
    }),
  });
  if (!res.ok) {
    console.error("Telegram plain send failed:", await res.text());
  }
}

export function buildReminderDeepLink(token: string): string | null {
  const user = botUsername();
  if (!user || !token) return null;
  return `https://t.me/${user}?start=reminder_${token}`;
}

export function formatDateTimeUk(iso: string): string {
  return new Date(iso).toLocaleString("uk-UA", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
