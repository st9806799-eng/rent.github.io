import { prisma } from "./prisma";

/** v1: first owned business + its default branch */
export async function getPrimaryBusinessForOwner(ownerId: string) {
  return prisma.business.findFirst({
    where: { ownerId },
    orderBy: { createdAt: "asc" },
    include: {
      branches: {
        orderBy: { id: "asc" },
        take: 1,
        include: { hours: true },
      },
    },
  });
}

export async function getBusinessBySlug(slug: string) {
  return prisma.business.findUnique({
    where: { slug },
    include: {
      branches: {
        orderBy: { id: "asc" },
        take: 1,
        include: {
          hours: true,
          services: { orderBy: { name: "asc" } },
        },
      },
    },
  });
}
