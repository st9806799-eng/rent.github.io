import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifyClientReminder } from "@/lib/telegram-notify";

export const runtime = "nodejs";

/** Викликайте щонайменше раз на годину (cron / Windows Task Scheduler) з заголовком Authorization: Bearer CRON_SECRET */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const now = Date.now();
  const from = new Date(now + 1 * 60 * 60 * 1000);
  const to = new Date(now + 3 * 60 * 60 * 1000);

  const rows = await prisma.reservation.findMany({
    where: {
      status: "confirmed",
      clientTelegramChatId: { not: null },
      reminderSentAt: null,
      startAt: { gte: from, lte: to },
    },
    include: { service: true, branch: { include: { business: true } } },
  });

  let sent = 0;
  for (const r of rows) {
    if (!r.clientTelegramChatId) continue;
    try {
      await notifyClientReminder({
        clientChatId: r.clientTelegramChatId,
        businessName: r.branch.business.name,
        serviceName: r.service.name,
        startIso: r.startAt.toISOString(),
      });
      await prisma.reservation.update({
        where: { id: r.id },
        data: { reminderSentAt: new Date() },
      });
      sent += 1;
    } catch (e) {
      console.error("Reminder failed for", r.id, e);
    }
  }

  return NextResponse.json({
    ok: true,
    checked: rows.length,
    sent,
  });
}
