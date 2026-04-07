"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/auth";
import { getPrimaryBusinessForOwner } from "@/lib/business-context";

export async function updateOwnerTelegramChatAction(
  _: string | null,
  formData: FormData
): Promise<string | null> {
  const user = await requireOwner();
  const biz = await getPrimaryBusinessForOwner(user.id);
  if (!biz) return "Бізнес не знайдено";

  const raw = String(formData.get("telegramChatId") ?? "").trim();
  const telegramChatId = raw === "" ? null : raw;

  await prisma.business.update({
    where: { id: biz.id },
    data: { telegramChatId },
  });

  revalidatePath("/dashboard");
  return null;
}
