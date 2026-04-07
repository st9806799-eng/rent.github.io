"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  createOwnerSession,
  hashPassword,
  setOwnerSessionCookie,
  verifyPassword,
  clearOwnerSessionCookie,
} from "@/lib/auth";
import { getPrimaryBusinessForOwner } from "@/lib/business-context";

export async function registerAction(_: string | null, formData: FormData): Promise<string | null> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return "Email and password required";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return "Account already exists";

  const passwordHash = await hashPassword(password);
  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
  const role = adminEmail && email === adminEmail ? "ADMIN" : "OWNER";

  const user = await prisma.user.create({
    data: { email, passwordHash, role },
  });

  const token = await createOwnerSession(user.id);
  await setOwnerSessionCookie(token);
  redirect(user.role === "ADMIN" ? "/admin" : "/business/create");
}

export async function loginAction(_: string | null, formData: FormData): Promise<string | null> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return "Invalid credentials";
  }
  const token = await createOwnerSession(user.id);
  await setOwnerSessionCookie(token);

  if (user.role === "ADMIN") redirect("/admin");
  const biz = await getPrimaryBusinessForOwner(user.id);
  redirect(biz ? "/dashboard" : "/business/create");
}

export async function logoutAction() {
  await clearOwnerSessionCookie();
  redirect("/login");
}
