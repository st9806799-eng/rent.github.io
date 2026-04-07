import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  bookingHoldAmountUah,
  decodeLiqPayData,
  liqpayVerifySignature,
} from "@/lib/liqpay";
import { newReminderLinkToken } from "@/lib/reminder-token";
import { notifyOwnerNewBooking } from "@/lib/telegram-notify";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let data = "";
  let signature = "";

  const ct = req.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) {
    try {
      const body = (await req.json()) as { data?: string; signature?: string };
      data = String(body.data ?? "");
      signature = String(body.signature ?? "");
    } catch {
      return new NextResponse("bad json", { status: 400 });
    }
  } else {
    const form = await req.formData();
    data = String(form.get("data") ?? "");
    signature = String(form.get("signature") ?? "");
  }

  if (!data || !liqpayVerifySignature(data, signature)) {
    return new NextResponse("invalid signature", { status: 400 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = decodeLiqPayData(data);
  } catch {
    return new NextResponse("bad data", { status: 400 });
  }

  const payStatus = String(payload.status ?? "");
  if (payStatus !== "success") {
    return NextResponse.json({ ok: true });
  }

  const currency = String(payload.currency ?? "").toUpperCase();
  if (currency && currency !== "UAH") {
    return NextResponse.json({ ok: true });
  }

  const orderId = String(payload.order_id ?? "");
  const amount = Number(payload.amount ?? 0);
  const minAmount = bookingHoldAmountUah();
  if (!orderId || amount + 1e-6 < minAmount) {
    return NextResponse.json({ ok: true });
  }

  const reservation = await prisma.reservation.findUnique({
    where: { id: orderId },
    include: { service: true, branch: { include: { business: true } } },
  });

  if (!reservation || reservation.status !== "pending_payment") {
    return NextResponse.json({ ok: true });
  }

  if (reservation.paymentExpiresAt && reservation.paymentExpiresAt < new Date()) {
    return NextResponse.json({ ok: true });
  }

  let token = reservation.reminderLinkToken;
  if (!token) {
    token = newReminderLinkToken();
  }

  await prisma.reservation.update({
    where: { id: reservation.id },
    data: {
      status: "confirmed",
      paymentExpiresAt: null,
      reminderLinkToken: token,
    },
  });

  const biz = reservation.branch.business;
  try {
    await notifyOwnerNewBooking({
      ownerChatId: biz.telegramChatId,
      businessName: biz.name,
      clientName: reservation.clientName,
      clientPhone: reservation.clientPhone,
      serviceName: reservation.service.name,
      startIso: reservation.startAt.toISOString(),
    });
  } catch (e) {
    console.error("Owner notify after payment:", e);
  }

  revalidatePath(`/b/${biz.slug}`);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/reservations");

  return NextResponse.json({ ok: true });
}
