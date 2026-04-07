"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/auth";
import { getPrimaryBusinessForOwner } from "@/lib/business-context";

export async function createServiceAction(
  _: string | null,
  formData: FormData
): Promise<string | null> {
  const user = await requireOwner();
  const biz = await getPrimaryBusinessForOwner(user.id);
  if (!biz?.branches[0]) return "No branch";

  const name = String(formData.get("name") ?? "").trim();
  const durationMinutes = parseInt(String(formData.get("duration") ?? "30"), 10);
  const priceRaw = String(formData.get("price") ?? "").trim();
  const priceCents =
    priceRaw === "" ? null : Math.round(parseFloat(priceRaw.replace(",", ".")) * 100);

  if (!name || !Number.isFinite(durationMinutes) || durationMinutes < 5) {
    return "Check name and duration (min 5 min)";
  }
  if (priceCents !== null && (!Number.isFinite(priceCents) || priceCents < 0)) {
    return "Invalid price";
  }

  await prisma.service.create({
    data: {
      branchId: biz.branches[0].id,
      name,
      durationMinutes,
      priceCents,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath(`/b/${biz.slug}`);
  redirect("/dashboard");
}
