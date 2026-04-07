"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/auth";
import { getPrimaryBusinessForOwner, getBusinessBySlug } from "@/lib/business-context";
import { slotsForDay, overlaps } from "@/lib/slots";
import {
  signClientBooking,
  setClientBookingCookie,
} from "@/lib/client-session";
import { newReminderLinkToken } from "@/lib/reminder-token";
import { buildReminderDeepLink } from "@/lib/telegram";
import {
  bookingHoldMinutes,
  buildReservationHoldCheckout,
  isLiqPayConfigured,
} from "@/lib/liqpay";
import { createReservationMonobankInvoice, isMonobankConfigured } from "@/lib/monobank";
import { getPublicBaseUrl } from "@/lib/site-url";
import {
  notifyOwnerNewBooking,
  notifyOwnerBookingCancelled,
  notifyOwnerBookingMoved,
  notifyClientBookingCancelledByOwner,
  notifyClientBookingRescheduledByOwner,
  notifyClientBookingRescheduledSelf,
  notifyClientBookingCancelledSelf,
} from "@/lib/telegram-notify";

const ACTIVE = "confirmed";
const PAYMENT_PENDING = "pending_payment";

export type BookActionResult =
  | {
      kind: "confirmed";
      id: string;
      telegramReminderUrl: string | null;
    }
  | {
      kind: "needs_payment";
      reservationId: string;
      liqpayData: string;
      liqpaySignature: string;
    }
  | {
      kind: "redirect_monobank";
      pageUrl: string;
    };

function blockingSlotStatusesFilter() {
  const now = new Date();
  return {
    OR: [
      { status: ACTIVE },
      { status: PAYMENT_PENDING, paymentExpiresAt: { gt: now } },
    ],
  };
}

export async function getAvailableSlotsAction(input: {
  businessSlug: string;
  serviceId: string;
  daysAhead?: number;
  ignoreReservationId?: string;
}) {
  const biz = await getBusinessBySlug(input.businessSlug);
  const branch = biz?.branches[0];
  const service = branch?.services.find((s) => s.id === input.serviceId);
  if (!branch || !service) return { slots: [] as string[] };

  const daysAhead = Math.min(input.daysAhead ?? 14, 60);
  const step = Math.max(5, Math.min(service.durationMinutes, 30));

  const booked = await prisma.reservation.findMany({
    where: {
      branchId: branch.id,
      endAt: { gte: new Date() },
      AND: [blockingSlotStatusesFilter()],
      ...(input.ignoreReservationId
        ? { id: { not: input.ignoreReservationId } }
        : {}),
    },
  });

  const slotStarts: Date[] = [];
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  for (let i = 0; i < daysAhead; i++) {
    const day = new Date(start);
    day.setDate(day.getDate() + i);
    const daySlots = slotsForDay(day, branch.hours, service.durationMinutes, step);
    for (const s of daySlots) {
      const e = new Date(s.getTime() + service.durationMinutes * 60 * 1000);
      const conflict = booked.some((b) => overlaps(s, e, b.startAt, b.endAt));
      if (!conflict) slotStarts.push(s);
    }
  }

  return {
    slots: slotStarts.map((d) => d.toISOString()),
  };
}

export async function bookAction(input: {
  businessSlug: string;
  serviceId: string;
  startIso: string;
  clientName: string;
  clientPhone: string;
}): Promise<BookActionResult> {
  const biz = await getBusinessBySlug(input.businessSlug);
  const branch = biz?.branches[0];
  const service = branch?.services.find((s) => s.id === input.serviceId);
  if (!branch || !service) throw new Error("Not found");

  const startAt = new Date(input.startIso);
  const endAt = new Date(startAt.getTime() + service.durationMinutes * 60 * 1000);
  if (!Number.isFinite(startAt.getTime())) throw new Error("Bad time");

  const conflict = await prisma.reservation.findFirst({
    where: {
      branchId: branch.id,
      AND: [
        blockingSlotStatusesFilter(),
        { startAt: { lt: endAt } },
        { endAt: { gt: startAt } },
      ],
    },
  });
  if (conflict) throw new Error("Slot taken");

  const useMonobank = isMonobankConfigured();
  const useLiqPay = isLiqPayConfigured() && !useMonobank;
  const usePayment = useMonobank || useLiqPay;
  if (usePayment && !getPublicBaseUrl()) {
    throw new Error(
      "Онлайн-оплата увімкнена, але не задано NEXT_PUBLIC_APP_URL (публічна адреса сайту)."
    );
  }

  const paymentExpiresAt = useLiqPay
    ? new Date(Date.now() + bookingHoldMinutes() * 60 * 1000)
    : null;
  const reminderToken = useLiqPay ? null : newReminderLinkToken();

  const r = await prisma.reservation.create({
    data: {
      branchId: branch.id,
      serviceId: service.id,
      startAt,
      endAt,
      clientName: input.clientName.trim(),
      clientPhone: input.clientPhone.trim(),
      status: useLiqPay ? PAYMENT_PENDING : ACTIVE,
      paymentExpiresAt,
      reminderLinkToken: reminderToken,
    },
    include: { service: true },
  });

  const sessionToken = await signClientBooking({
    businessSlug: input.businessSlug,
    phone: r.clientPhone,
  });
  await setClientBookingCookie(sessionToken);

  revalidatePath(`/b/${input.businessSlug}`);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/reservations");

  if (useLiqPay) {
    const checkout = buildReservationHoldCheckout({
      reservationId: r.id,
      businessName: biz.name,
      serviceName: r.service.name,
      clientName: r.clientName,
      businessSlug: input.businessSlug,
    });
    return {
      kind: "needs_payment",
      reservationId: r.id,
      liqpayData: checkout.data,
      liqpaySignature: checkout.signature,
    };
  }

  if (useMonobank) {
    try {
      const { pageUrl } = await createReservationMonobankInvoice({
        reservationId: r.id,
        businessName: biz.name,
        serviceName: r.service.name,
        clientName: r.clientName,
        businessSlug: input.businessSlug,
      });
      try {
        await notifyOwnerNewBooking({
          ownerChatId: biz.telegramChatId,
          businessName: biz.name,
          clientName: r.clientName,
          clientPhone: r.clientPhone,
          serviceName: r.service.name,
          startIso: r.startAt.toISOString(),
        });
      } catch (e) {
        console.error("Owner telegram notify failed:", e);
      }
      return { kind: "redirect_monobank", pageUrl };
    } catch (e) {
      await prisma.reservation.delete({ where: { id: r.id } });
      revalidatePath(`/b/${input.businessSlug}`);
      revalidatePath("/dashboard");
      revalidatePath("/dashboard/reservations");
      throw e instanceof Error ? e : new Error("Не вдалося створити оплату Monobank");
    }
  }

  try {
    await notifyOwnerNewBooking({
      ownerChatId: biz.telegramChatId,
      businessName: biz.name,
      clientName: r.clientName,
      clientPhone: r.clientPhone,
      serviceName: r.service.name,
      startIso: r.startAt.toISOString(),
    });
  } catch (e) {
    console.error("Owner telegram notify failed:", e);
  }

  return {
    kind: "confirmed",
    id: r.id,
    telegramReminderUrl: buildReminderDeepLink(reminderToken!),
  };
}

export async function clientCancelAction(input: { businessSlug: string; reservationId: string }) {
  const biz = await getBusinessBySlug(input.businessSlug);
  const branch = biz?.branches[0];
  if (!branch) throw new Error("Not found");

  const row = await prisma.reservation.findFirst({
    where: {
      id: input.reservationId,
      branchId: branch.id,
      status: { in: [ACTIVE, PAYMENT_PENDING] },
    },
    include: { service: true },
  });

  await prisma.reservation.updateMany({
    where: {
      id: input.reservationId,
      branchId: branch.id,
      status: { in: [ACTIVE, PAYMENT_PENDING] },
    },
    data: { status: "cancelled" },
  });

  if (row) {
    if (row.status === ACTIVE) {
      try {
        await notifyOwnerBookingCancelled({
          ownerChatId: biz.telegramChatId,
          businessName: biz.name,
          clientName: row.clientName,
          serviceName: row.service.name,
          startIso: row.startAt.toISOString(),
        });
      } catch (e) {
        console.error("Owner telegram cancel notify failed:", e);
      }
    }
    if (row.clientTelegramChatId) {
      try {
        await notifyClientBookingCancelledSelf({
          clientChatId: row.clientTelegramChatId,
          businessName: biz.name,
          serviceName: row.service.name,
          startIso: row.startAt.toISOString(),
        });
      } catch (e) {
        console.error("Client telegram cancel self notify failed:", e);
      }
    }
  }

  revalidatePath(`/b/${input.businessSlug}`);
  revalidatePath("/dashboard");
}

export async function clientRescheduleAction(input: {
  businessSlug: string;
  reservationId: string;
  newStartIso: string;
}) {
  const biz = await getBusinessBySlug(input.businessSlug);
  const branch = biz?.branches[0];
  if (!branch) throw new Error("Not found");

  const existing = await prisma.reservation.findFirst({
    where: {
      id: input.reservationId,
      branchId: branch.id,
      status: ACTIVE,
    },
    include: { service: true },
  });
  if (!existing) throw new Error("Not found");

  const startAt = new Date(input.newStartIso);
  const endAt = new Date(startAt.getTime() + existing.service.durationMinutes * 60 * 1000);

  const conflict = await prisma.reservation.findFirst({
    where: {
      branchId: branch.id,
      id: { not: existing.id },
      AND: [
        blockingSlotStatusesFilter(),
        { startAt: { lt: endAt } },
        { endAt: { gt: startAt } },
      ],
    },
  });
  if (conflict) throw new Error("Slot taken");

  const oldIso = existing.startAt.toISOString();

  await prisma.reservation.update({
    where: { id: existing.id },
    data: { startAt, endAt, reminderSentAt: null },
  });

  try {
    await notifyOwnerBookingMoved({
      ownerChatId: biz.telegramChatId,
      businessName: biz.name,
      clientName: existing.clientName,
      serviceName: existing.service.name,
      oldStartIso: oldIso,
      newStartIso: startAt.toISOString(),
    });
  } catch (e) {
    console.error("Owner telegram reschedule notify failed:", e);
  }

  if (existing.clientTelegramChatId) {
    try {
      await notifyClientBookingRescheduledSelf({
        clientChatId: existing.clientTelegramChatId,
        businessName: biz.name,
        serviceName: existing.service.name,
        newStartIso: startAt.toISOString(),
      });
    } catch (e) {
      console.error("Client telegram reschedule self notify failed:", e);
    }
  }

  revalidatePath(`/b/${input.businessSlug}`);
  revalidatePath("/dashboard");
}

export async function ownerCancelReservationAction(reservationId: string) {
  const user = await requireOwner();
  const biz = await getPrimaryBusinessForOwner(user.id);
  const branch = biz?.branches[0];
  if (!branch) throw new Error("No branch");

  const row = await prisma.reservation.findFirst({
    where: {
      id: reservationId,
      branchId: branch.id,
      status: { in: [ACTIVE, PAYMENT_PENDING] },
    },
    include: { service: true, branch: { include: { business: true } } },
  });
  if (!row) throw new Error("Not found");

  await prisma.reservation.update({
    where: { id: reservationId },
    data: { status: "cancelled" },
  });

  if (row.status === ACTIVE && row.clientTelegramChatId) {
    try {
      await notifyClientBookingCancelledByOwner({
        clientChatId: row.clientTelegramChatId,
        businessName: row.branch.business.name,
        serviceName: row.service.name,
        startIso: row.startAt.toISOString(),
      });
    } catch (e) {
      console.error("Client telegram cancel notify failed:", e);
    }
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/reservations");
}

export async function ownerMoveReservationAction(reservationId: string, newStartIso: string) {
  const user = await requireOwner();
  const biz = await getPrimaryBusinessForOwner(user.id);
  const branch = biz?.branches[0];
  if (!branch) throw new Error("No branch");

  const existing = await prisma.reservation.findFirst({
    where: { id: reservationId, branchId: branch.id, status: ACTIVE },
    include: { service: true },
  });
  if (!existing) throw new Error("Not found");

  const startAt = new Date(newStartIso);
  const endAt = new Date(startAt.getTime() + existing.service.durationMinutes * 60 * 1000);

  const conflict = await prisma.reservation.findFirst({
    where: {
      branchId: branch.id,
      id: { not: existing.id },
      AND: [
        blockingSlotStatusesFilter(),
        { startAt: { lt: endAt } },
        { endAt: { gt: startAt } },
      ],
    },
  });
  if (conflict) throw new Error("Slot taken");

  await prisma.reservation.update({
    where: { id: existing.id },
    data: { startAt, endAt, reminderSentAt: null },
  });

  if (existing.clientTelegramChatId && biz) {
    try {
      await notifyClientBookingRescheduledByOwner({
        clientChatId: existing.clientTelegramChatId,
        businessName: biz.name,
        serviceName: existing.service.name,
        newStartIso: startAt.toISOString(),
      });
    } catch (e) {
      console.error("Client telegram move notify failed:", e);
    }
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/reservations");
}

export async function lookupReservationByPhoneAction(input: {
  businessSlug: string;
  phone: string;
}) {
  const biz = await getBusinessBySlug(input.businessSlug);
  const branch = biz?.branches[0];
  if (!branch) return null;

  return prisma.reservation.findFirst({
    where: {
      branchId: branch.id,
      clientPhone: input.phone.trim(),
      endAt: { gte: new Date() },
      OR: [
        { status: ACTIVE },
        { status: PAYMENT_PENDING, paymentExpiresAt: { gt: new Date() } },
      ],
    },
    orderBy: { startAt: "asc" },
    include: { service: true },
  });
}

export async function rememberClientPhoneAction(input: {
  businessSlug: string;
  phone: string;
}) {
  const row = await lookupReservationByPhoneAction(input);
  if (!row) throw new Error("No active reservation");
  const token = await signClientBooking({
    businessSlug: input.businessSlug,
    phone: input.phone.trim(),
  });
  await setClientBookingCookie(token);
}
