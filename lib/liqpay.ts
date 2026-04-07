import crypto from "crypto";
import { getPublicBaseUrl } from "@/lib/site-url";

const CHECKOUT_URL = "https://www.liqpay.ua/api/3/checkout";

export function isLiqPayConfigured(): boolean {
  return !!(process.env.LIQPAY_PUBLIC_KEY?.trim() && process.env.LIQPAY_PRIVATE_KEY?.trim());
}

export function liqpayCheckoutUrl(): string {
  return CHECKOUT_URL;
}

function privateKey(): string {
  return process.env.LIQPAY_PRIVATE_KEY!.trim();
}

export function liqpaySignBase64Data(data: string): string {
  const key = privateKey();
  const hash = crypto.createHash("sha1").update(key + data + key).digest("binary");
  return Buffer.from(hash, "binary").toString("base64");
}

export function liqpayVerifySignature(data: string, signature: string): boolean {
  try {
    return liqpaySignBase64Data(data) === signature;
  } catch {
    return false;
  }
}

export function bookingHoldAmountUah(): number {
  const n = Number(process.env.BOOKING_HOLD_UAH ?? "1");
  return Number.isFinite(n) && n > 0 ? n : 1;
}

export function bookingHoldMinutes(): number {
  const n = Number(process.env.BOOKING_HOLD_MINUTES ?? "30");
  return Number.isFinite(n) && n >= 5 ? Math.min(n, 120) : 30;
}

export type LiqPayCheckout = { data: string; signature: string };

export function buildReservationHoldCheckout(input: {
  reservationId: string;
  businessName: string;
  serviceName: string;
  clientName: string;
  businessSlug: string;
}): LiqPayCheckout {
  const publicKey = process.env.LIQPAY_PUBLIC_KEY!.trim();
  const base = getPublicBaseUrl();
  if (!base) {
    throw new Error("NEXT_PUBLIC_APP_URL не заданий — потрібен для LiqPay");
  }

  const amount = bookingHoldAmountUah();
  const sandbox = process.env.LIQPAY_SANDBOX === "1" ? 1 : undefined;

  const params: Record<string, string | number> = {
    version: 3,
    public_key: publicKey,
    action: "pay",
    amount,
    currency: "UAH",
    description: `Бронь: ${input.businessName} · ${input.serviceName} (${input.clientName})`,
    order_id: input.reservationId,
    result_url: `${base}/b/${input.businessSlug}`,
    server_url: `${base}/api/payments/liqpay/callback`,
  };
  if (sandbox) params.sandbox = sandbox;

  const data = Buffer.from(JSON.stringify(params), "utf8").toString("base64");
  return { data, signature: liqpaySignBase64Data(data) };
}

export function decodeLiqPayData(data: string): Record<string, unknown> {
  const json = Buffer.from(data, "base64").toString("utf8");
  return JSON.parse(json) as Record<string, unknown>;
}
