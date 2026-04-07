"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/auth";
import { slugify, randomSuffix } from "@/lib/slug";
import { defaultWeeklyHours } from "@/lib/slots";

export async function createBusinessAction(
  _: string | null,
  formData: FormData
): Promise<string | null> {
  const user = await requireOwner();
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim() || null;
  if (!name || !phone) return "Name and phone required";

  let slug = `${slugify(name)}-${randomSuffix()}`;
  for (let i = 0; i < 8; i++) {
    const taken = await prisma.business.findUnique({ where: { slug } });
    if (!taken) break;
    slug = `${slugify(name)}-${randomSuffix()}`;
  }

  await prisma.$transaction(async (tx) => {
    const business = await tx.business.create({
      data: {
        name,
        phone,
        address,
        slug,
        ownerId: user.id,
      },
    });
    const branch = await tx.branch.create({
      data: {
        businessId: business.id,
        name: "Main",
      },
    });
    await tx.branchHours.createMany({
      data: defaultWeeklyHours(branch.id),
    });
  });

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function updateBusinessProfileAction(
  _: string | null,
  formData: FormData
): Promise<string | null> {
  const user = await requireOwner();
  const biz = await prisma.business.findFirst({ where: { ownerId: user.id } });
  if (!biz) return "Business not found";

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const address = String(formData.get("address") ?? "").trim() || null;
  const locationAddress = String(formData.get("locationAddress") ?? "").trim() || null;
  const latRaw = String(formData.get("locationLat") ?? "").trim();
  const lngRaw = String(formData.get("locationLng") ?? "").trim();
  const portfolioRaw = String(formData.get("portfolioJson") ?? "[]");

  if (!name) return "Name is required";

  let locationLat: number | null = null;
  let locationLng: number | null = null;
  if (latRaw && lngRaw) {
    const lat = Number(latRaw);
    const lng = Number(lngRaw);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return "Invalid map coordinates";
    }
    locationLat = lat;
    locationLng = lng;
  }

  let portfolio: string[] = [];
  try {
    const parsed = JSON.parse(portfolioRaw) as unknown;
    if (Array.isArray(parsed)) {
      portfolio = parsed
        .filter((v) => typeof v === "string")
        .map((v) => v.trim())
        .filter((v) => v.length > 0)
        .slice(0, 18);
    }
  } catch {
    return "Invalid portfolio data";
  }

  await prisma.business.update({
    where: { id: biz.id },
    data: {
      name,
      description,
      address,
      locationAddress,
      locationLat,
      locationLng,
      portfolio,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/profile");
  revalidatePath(`/b/${biz.slug}`);
  return null;
}

