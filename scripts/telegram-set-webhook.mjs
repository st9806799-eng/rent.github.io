/**
 * Підключення бота до вашого сайту (Telegram вимагає публічний HTTPS).
 * Використання:
 *   node scripts/telegram-set-webhook.mjs https://your-domain.com
 * База без шляху: скрипт додасть /api/telegram/webhook
 *
 * Читає з .env у корені: TELEGRAM_BOT_TOKEN, TELEGRAM_WEBHOOK_SECRET (опційно)
 */
import { existsSync, readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = join(root, ".env");

function loadEnvFile() {
  if (!existsSync(envPath)) return;
  const raw = readFileSync(envPath, "utf8");
  for (const line of raw.split(/\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq < 1) continue;
    const key = t.slice(0, eq).trim();
    let val = t.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

loadEnvFile();

const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
const secret = process.env.TELEGRAM_WEBHOOK_SECRET?.trim() || "";
const baseArg = process.argv[2]?.trim();

if (!token) {
  console.error("Немає TELEGRAM_BOT_TOKEN у .env");
  process.exit(1);
}

if (!baseArg || !baseArg.startsWith("https://")) {
  console.error("Вкажіть публічний HTTPS URL, наприклад:");
  console.error("  node scripts/telegram-set-webhook.mjs https://abc.ngrok-free.app");
  process.exit(1);
}

const base = baseArg.replace(/\/$/, "");
const webhookUrl = `${base}/api/telegram/webhook`;

const params = new URLSearchParams();
params.set("url", webhookUrl);
if (secret) params.set("secret_token", secret);
params.set(
  "allowed_updates",
  JSON.stringify(["message", "edited_message"])
);

const url = `https://api.telegram.org/bot${token}/setWebhook?${params.toString()}`;
const res = await fetch(url);
const data = await res.json();

if (!data.ok) {
  console.error("setWebhook помилка:", data);
  process.exit(1);
}

console.log("OK: вебхук встановлено на", webhookUrl);
if (secret) {
  console.log("Використано secret_token з TELEGRAM_WEBHOOK_SECRET");
} else {
  console.log(
    "TELEGRAM_WEBHOOK_SECRET порожній — ок. Якщо додасте секрет у .env, запустіть скрипт знову."
  );
}

const info = await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`).then((r) =>
  r.json()
);
console.log("getWebhookInfo:", JSON.stringify(info, null, 2));
