import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getBusinessBySlug } from "@/lib/business-context";
import { readClientBooking } from "@/lib/client-session";
import { newReminderLinkToken } from "@/lib/reminder-token";
import { buildReminderDeepLink } from "@/lib/telegram";
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
        status: "confirmed",
      },
      orderBy: { startAt: "asc" },
      include: { service: true },
    });
    if (row) {
      let token = row.reminderLinkToken;
      if (!row.clientTelegramChatId && !token) {
        token = newReminderLinkToken();
        await prisma.reservation.update({
          where: { id: row.id },
          data: { reminderLinkToken: token },
        });
      }
      const telegramReminderUrl =
        !row.clientTelegramChatId && token ? buildReminderDeepLink(token) : null;

      existing = {
        id: row.id,
        serviceId: row.serviceId,
        serviceName: row.service.name,
        clientName: row.clientName,
        startIso: row.startAt.toISOString(),
        endIso: row.endAt.toISOString(),
        telegramReminderUrl,
      };
    }
  }

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
