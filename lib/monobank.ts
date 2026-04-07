import { bookingHoldAmountUah } from "@/lib/liqpay";
import { getPublicBaseUrl } from "@/lib/site-url";

const INVOICE_CREATE_URL = "https://api.monobank.ua/api/merchant/invoice/create";

/** Токен з кабінету https://web.monobank.ua/ (еквайринг → API). */
export function isMonobankConfigured(): boolean {
  return !!process.env.MONOBANK_MERCHANT_TOKEN?.trim();
}

export async function createReservationMonobankInvoice(input: {
  reservationId: string;
  businessName: string;
  serviceName: string;
  clientName: string;
  businessSlug: string;
}): Promise<{ pageUrl: string }> {
  const token = process.env.MONOBANK_MERCHANT_TOKEN!.trim();
  const base = getPublicBaseUrl();
  if (!base) {
    throw new Error("NEXT_PUBLIC_APP_URL не заданий — потрібен для Monobank redirectUrl");
  }

  const uah = bookingHoldAmountUah();
  const amount = Math.max(100, Math.round(uah * 100));
  if (!Number.isFinite(amount)) {
    throw new Error("Некоректна сума утримання");
  }

  const redirectUrl = `${base}/b/${input.businessSlug}`;

  const res = await fetch(INVOICE_CREATE_URL, {
    method: "POST",
    headers: {
      "X-Token": token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount,
      ccy: 980,
      merchantPaymInfo: {
        reference: input.reservationId.slice(0, 128),
        destination: `Бронь: ${input.businessName} · ${input.serviceName} (${input.clientName})`,
      },
      redirectUrl,
    }),
  });

  const raw = await res.text();
  if (!res.ok) {
    throw new Error(`Monobank API: ${res.status} ${raw.slice(0, 500)}`);
  }

  let data: { pageUrl?: string };
  try {
    data = JSON.parse(raw) as { pageUrl?: string };
  } catch {
    throw new Error("Monobank API: не JSON у відповіді");
  }

  if (!data.pageUrl?.trim()) {
    throw new Error("Monobank API: у відповіді немає pageUrl");
  }

  return { pageUrl: data.pageUrl.trim() };
}
