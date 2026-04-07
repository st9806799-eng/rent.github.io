"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/auth";
import { getPrimaryBusinessForOwner } from "@/lib/business-context";

function hm(s: string) {
  return /^\d{1,2}:\d{2}$/.test(s);
}

export async function updateScheduleAction(
  _: string | null,
  formData: FormData
): Promise<string | null> {
  const user = await requireOwner();
  const biz = await getPrimaryBusinessForOwner(user.id);
  const branch = biz?.branches[0];
  if (!branch) return "No branch";

  const updates: { dayOfWeek: number; openTime: string; closeTime: string; isOpen: boolean }[] =
    [];

  for (let d = 0; d < 7; d++) {
    const open = String(formData.get(`open_${d}`) ?? "09:00").trim();
    const close = String(formData.get(`close_${d}`) ?? "18:00").trim();
    const isOpen = formData.get(`on_${d}`) === "on"; // absent when unchecked
    if (!hm(open) || !hm(close)) return "Use HH:MM for times";
    updates.push({ dayOfWeek: d, openTime: open, closeTime: close, isOpen });
  }

  await prisma.$transaction(
    updates.map((u) =>
      prisma.branchHours.update({
        where: {
          branchId_dayOfWeek: { branchId: branch.id, dayOfWeek: u.dayOfWeek },
        },
        data: {
          openTime: u.openTime,
          closeTime: u.closeTime,
          isOpen: u.isOpen,
        },
      })
    )
  );

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/schedule");
  revalidatePath(`/b/${biz.slug}`);
  redirect("/dashboard");
}
