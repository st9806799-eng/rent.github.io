import type { BranchHours } from "@prisma/client";

function parseHm(s: string): { h: number; m: number } {
  const [h, m] = s.split(":").map((x) => parseInt(x, 10));
  return { h: h || 0, m: m || 0 };
}

export function getHoursForDay(hours: BranchHours[], dayOfWeek: number): BranchHours | undefined {
  return hours.find((h) => h.dayOfWeek === dayOfWeek);
}

/** Generate slot start times for a calendar day; capacity=1 handled by caller (exclude booked). */
export function slotsForDay(
  day: Date,
  hoursRows: BranchHours[],
  durationMinutes: number,
  stepMinutes: number
): Date[] {
  const dow = day.getDay();
  const row = getHoursForDay(hoursRows, dow);
  if (!row || !row.isOpen) return [];

  const open = parseHm(row.openTime);
  const close = parseHm(row.closeTime);
  const openM = open.h * 60 + open.m;
  const closeM = close.h * 60 + close.m;
  if (closeM <= openM) return [];

  const out: Date[] = [];
  const base = new Date(day);
  base.setHours(0, 0, 0, 0);

  for (let t = openM; t + durationMinutes <= closeM; t += stepMinutes) {
    const start = new Date(base);
    start.setHours(Math.floor(t / 60), t % 60, 0, 0);
    if (start.getTime() >= Date.now() - 60 * 1000) out.push(start);
  }
  return out;
}

export function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart < bEnd && bStart < aEnd;
}

export function defaultWeeklyHours(branchId: string): Omit<BranchHours, "id">[] {
  return Array.from({ length: 7 }, (_, dayOfWeek) => ({
    branchId,
    dayOfWeek,
    openTime: "09:00",
    closeTime: "18:00",
    isOpen: true,
  }));
}
