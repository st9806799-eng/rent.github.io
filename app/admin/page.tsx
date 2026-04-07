import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  const businesses = await prisma.business.findMany({
    where: query
      ? {
          OR: [
            { name: { contains: query } },
            { slug: { contains: query } },
            { phone: { contains: query } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: 40,
    include: {
      branches: {
        take: 1,
        include: {
          _count: {
            select: { reservations: true },
          },
        },
      },
    },
  });

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold">Businesses</h1>
        <p className="text-sm text-[var(--muted)]">Search by name, slug, or phone</p>
      </header>

      <form className="flex gap-2">
        <input
          name="q"
          defaultValue={query}
          placeholder="Search…"
          className="min-w-0 flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2"
        />
        <button
          type="submit"
          className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white"
        >
          Search
        </button>
      </form>

      <ul className="space-y-2">
        {businesses.map((b) => {
          const branch = b.branches[0];
          const count = branch?._count.reservations ?? 0;
          return (
            <li
              key={b.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3"
            >
              <div>
                <p className="font-medium">{b.name}</p>
                <p className="text-sm text-[var(--muted)]">
                  /b/{b.slug} · {count} reservations
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/b/${b.slug}`}
                  className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-sm hover:bg-[var(--bg)]"
                >
                  Open booking
                </Link>
                <Link
                  href={`/admin/reservations?businessId=${b.id}`}
                  className="rounded-lg bg-[var(--accent)] px-3 py-1.5 text-sm text-white hover:bg-[var(--accent-hover)]"
                >
                  Reservations
                </Link>
              </div>
            </li>
          );
        })}
      </ul>

      {businesses.length === 0 && (
        <p className="text-[var(--muted)]">No businesses match.</p>
      )}
    </div>
  );
}
