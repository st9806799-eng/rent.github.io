import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getBusinessBySlug } from "@/lib/business-context";
import { readClientBooking } from "@/lib/client-session";
import { newReminderLinkToken } from "@/lib/reminder-token";
import { buildReminderDeepLink } from "@/lib/telegram";
import { buildReservationHoldCheckout, isLiqPayConfigured } from "@/lib/liqpay";
import { isMonobankConfigured } from "@/lib/monobank";
import { BookingFlow, type ExistingReservation } from "@/components/BookingFlow";
import { PublicBusinessProfile } from "@/components/PublicBusinessProfile";

export default async function PublicBookingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const biz = await getBusinessBySlug(slug);
  const branch = biz?.branches[0];
  if (!biz || !branch) notFound();

  let existing: ExistingReservation | null = null;
  const session = await readClientBooking();
  if (session?.businessSlug === slug) {
    const row = await prisma.reservation.findFirst({
      where: {
        branchId: branch.id,
        clientPhone: session.phone,
        endAt: { gte: new Date() },
        OR: [
          { status: "confirmed" },
          {
            status: "pending_payment",
            paymentExpiresAt: { gt: new Date() },
          },
        ],
      },
      orderBy: { startAt: "asc" },
      include: { service: true },
    });
    if (row) {
      const isPending = row.status === "pending_payment";
      let token = row.reminderLinkToken;
      if (!isPending && !row.clientTelegramChatId && !token) {
        token = newReminderLinkToken();
        await prisma.reservation.update({
          where: { id: row.id },
          data: { reminderLinkToken: token },
        });
      }
      const telegramReminderUrl =
        !isPending && !row.clientTelegramChatId && token
          ? buildReminderDeepLink(token)
          : null;

      let liqpayData: string | null = null;
      let liqpaySignature: string | null = null;
      if (isPending && isLiqPayConfigured()) {
        try {
          const c = buildReservationHoldCheckout({
            reservationId: row.id,
            businessName: biz.name,
            serviceName: row.service.name,
            clientName: row.clientName,
            businessSlug: slug,
          });
          liqpayData = c.data;
          liqpaySignature = c.signature;
        } catch {
          liqpayData = null;
          liqpaySignature = null;
        }
      }

      existing = {
        id: row.id,
        serviceId: row.serviceId,
        serviceName: row.service.name,
        clientName: row.clientName,
        startIso: row.startAt.toISOString(),
        endIso: row.endAt.toISOString(),
        telegramReminderUrl,
        bookingStatus: row.status as "confirmed" | "pending_payment",
        paymentExpiresAtIso: row.paymentExpiresAt?.toISOString() ?? null,
        liqpayData,
        liqpaySignature,
      };
    }
  }

  const paymentProvider = isMonobankConfigured()
    ? ("monobank" as const)
    : isLiqPayConfigured()
      ? ("liqpay" as const)
      : null;

  const portfolio = Array.isArray(biz.portfolio)
    ? biz.portfolio.filter((v): v is string => typeof v === "string")
    : [];

  return (
    <>
      <PublicBusinessProfile
        name={biz.name}
        description={biz.description}
        address={biz.address}
        locationAddress={biz.locationAddress}
        location={
          biz.locationLat != null && biz.locationLng != null
            ? { lat: biz.locationLat, lng: biz.locationLng }
            : null
        }
        portfolio={portfolio}
      />
      <BookingFlow
        businessName={biz.name}
        slug={biz.slug}
        paymentProvider={paymentProvider}
        services={branch.services.map((s) => ({
          id: s.id,
          name: s.name,
          durationMinutes: s.durationMinutes,
          priceCents: s.priceCents,
        }))}
        existing={existing}
      />
    </>
  );
}
