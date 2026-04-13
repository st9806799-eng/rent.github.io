import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendTelegramPlain } from "@/lib/telegram";
import { notifyClientBookingConfirmed } from "@/lib/telegram-notify";

export const runtime = "nodejs";

/** Після /start інколи приходить `/start@BotName payload` — вирізаємо аргумент після команди */
function telegramStartPayload(text: string): string {
  const t = text.trim();
  if (!/^\/start/i.test(t)) return "";
  return t.replace(/^\/start(@\S+)?\s*/i, "").trim();
}

/** Діагностика вебхука: dev — відкрийте GET у браузері; prod — заголовок Authorization: Bearer CRON_SECRET */
export async function GET(req: NextRequest) {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  if (!token) {
    return NextResponse.json(
      { ok: false, error: "TELEGRAM_BOT_TOKEN не заданий у .env" },
      { status: 500 }
    );
  }

  const isProd = process.env.NODE_ENV === "production";
  const cronSecret = process.env.CRON_SECRET?.trim();
  if (isProd) {
    if (!cronSecret || req.headers.get("authorization") !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const infoRes = await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`);
  const info = (await infoRes.json()) as Record<string, unknown>;

  const vercel = process.env.VERCEL_URL?.trim();
  const publicBase =
    process.env.NEXT_PUBLIC_APP_URL?.trim()?.replace(/\/$/, "") ||
    (vercel ? `https://${vercel}` : null);

  return NextResponse.json({
    ok: true,
    telegram: info,
    envHasWebhookSecret: !!process.env.TELEGRAM_WEBHOOK_SECRET?.trim(),
    suggestedWebhookUrl: publicBase ? `${publicBase}/api/telegram/webhook` : null,
    hints: [
      "Telegram не викликає вебхук на http://localhost — потрібен публічний HTTPS (деплой або ngrok/cloudflared).",
      "Один раз виконайте: npm run telegram:set-webhook -- https://ваш-домен",
      "Якщо в .env задано TELEGRAM_WEBHOOK_SECRET, при setWebhook той самий рядок має бути в secret_token (скрипт це робить сам).",
    ],
  });
}

export async function POST(req: NextRequest) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET?.trim();
  if (secret) {
    const got = req.headers.get("x-telegram-bot-api-secret-token");
    if (got !== secret) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
  }

  let update: {
    message?: { text?: string; chat?: { id: number } };
    edited_message?: { text?: string; chat?: { id: number } };
  };
  try {
    update = await req.json();
  } catch {
    return NextResponse.json({ ok: true });
  }

  const msg = update.message ?? update.edited_message;
  if (!msg?.chat?.id) {
    return NextResponse.json({ ok: true });
  }

  const chatId = String(msg.chat.id);
  const text = msg.text?.trim() ?? "";

  if (!/^\/start/i.test(text)) {
    return NextResponse.json({ ok: true });
  }

  const arg = telegramStartPayload(text);
  if (!arg.startsWith("reminder_")) {
    await sendTelegramPlain(
      chatId,
      "Привіт! Забронюйте час на сайті салону, потім натисніть «Підтвердження та нагадування в Telegram» після броні."
    );
    return NextResponse.json({ ok: true });
  }

  const linkToken = arg.slice("reminder_".length);
  if (!linkToken) {
    return NextResponse.json({ ok: true });
  }

  const res = await prisma.reservation.findFirst({
    where: {
      reminderLinkToken: linkToken,
      status: "confirmed",
      endAt: { gte: new Date() },
    },
    include: { service: true, branch: { include: { business: true } } },
  });

  if (!res) {
    await sendTelegramPlain(
      chatId,
      "Посилання недійсне або бронь уже скасована. Забронюйте знову на сайті."
    );
    return NextResponse.json({ ok: true });
  }

  if (res.clientTelegramChatId === chatId) {
    await sendTelegramPlain(
      chatId,
      "Ця бронь уже підключена до цього чату. Нагадування надійде приблизно за 2 години до візиту."
    );
    return NextResponse.json({ ok: true });
  }

  await prisma.reservation.update({
    where: { id: res.id },
    data: {
      clientTelegramChatId: chatId,
      reminderSentAt: null,
    },
  });

  try {
    await notifyClientBookingConfirmed({
      clientChatId: chatId,
      businessName: res.branch.business.name,
      serviceName: res.service.name,
      clientName: res.clientName,
      startIso: res.startAt.toISOString(),
    });
  } catch (e) {
    console.error("Client booking confirmed telegram failed:", e);
  }

  return NextResponse.json({ ok: true });
}
