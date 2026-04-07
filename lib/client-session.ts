import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const COOKIE = "client_booking";

export type ClientBookingPayload = {
  businessSlug: string;
  phone: string;
};

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error("AUTH_SECRET is not set");
  return new TextEncoder().encode(s);
}

export async function signClientBooking(payload: ClientBookingPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("90d")
    .sign(secret());
}

export async function readClientBooking(): Promise<ClientBookingPayload | null> {
  const jar = await cookies();
  const t = jar.get(COOKIE)?.value;
  if (!t) return null;
  try {
    const { payload } = await jwtVerify(t, secret());
    const businessSlug = payload.businessSlug;
    const phone = payload.phone;
    if (typeof businessSlug !== "string" || typeof phone !== "string") return null;
    return { businessSlug, phone };
  } catch {
    return null;
  }
}

export async function setClientBookingCookie(token: string) {
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 90,
  });
}

export async function clearClientBookingCookie() {
  const jar = await cookies();
  jar.delete(COOKIE);
}
