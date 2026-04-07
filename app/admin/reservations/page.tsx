import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatSlot } from "@/lib/format";

export default async function AdminReservationsPage({
  searchParams,
}: {
  searchParams: Promise<{ businessId?: string }>;
}) {
  const { businessId } = await searchParams;
  if (!businessId) {
    return (
      <div>
        <Link href="/admin" className="text-sm text-[var(--muted)] hover:text-[var(--text)]">
          ← Back
        </Link>
        <p className="mt-8 text-[var(--muted)]">Pick a business from the admin home.</p>
      </div>
    );
  }

  const business = await prisma.business.findUnique({
    where: { id: businessId },
    include: { branches: { take: 1 } },
  });
  if (!business) notFound();

  const branch = business.branches[0];
  const list = branch
    ? await prisma.reservation.findMany({
        where: { branchId: branch.id },
        orderBy: { startAt: "desc" },
        take: 80,
        include: { service: true },
      })
    : [];

  const total = list.length;
  const confirmed = list.filter((r) => r.status === "confirmed").length;
  const cancelled = list.filter((r) => r.status === "cancelled").length;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link href="/admin" className="text-sm text-[var(--muted)] hover:text-[var(--text)]">
            ← Businesses
          </Link>
          <h1 className="mt-2 text-2xl font-semibold">{business.name}</h1>
          <p className="text-sm text-[var(--muted)]">
            Showing last {list.length} · {confirmed} active · {cancelled} cancelled
          </p>
        </div>
        <Link
          href={`/b/${business.slug}`}
          className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm"
        >
          Public page
        </Link>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
          <p className="text-xs text-[var(--muted)]">In this list</p>
          <p className="text-xl font-semibold">{total}</p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
          <p className="text-xs text-[var(--muted)]">Confirmed</p>
          <p className="text-xl font-semibold">{confirmed}</p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
          <p className="text-xs text-[var(--muted)]">Cancelled</p>
          <p className="text-xl font-semibold">{cancelled}</p>
        </div>
      </div>

      <ul className="space-y-2">
        {list.map((r) => (
          <li
            key={r.id}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3"
          >
            <p className="font-medium">{r.clientName}</p>
            <p className="text-sm text-[var(--muted)]">
              {formatSlot(r.startAt.toISOString())} · {r.service.name} · {r.clientPhone}
            </p>
            <p className="mt-1 text-xs uppercase text-[var(--muted)]">{r.status}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
