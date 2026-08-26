const TIMEZONE = "Asia/Jakarta";

export type Period = "hari" | "minggu" | "bulan";

export const PERIOD_LABELS: Record<Period, string> = {
  hari: "Hari ini",
  minggu: "Minggu ini",
  bulan: "Bulan ini",
};

export function parsePeriod(value: string | undefined): Period {
  if (value === "hari" || value === "minggu" || value === "bulan") return value;
  return "hari";
}

export function dateKeyInWIB(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

function todayWIBKey(): string {
  return dateKeyInWIB(new Date());
}

function wibMidnight(year: number, month: number, day: number): Date {
  const mm = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return new Date(`${year}-${mm}-${dd}T00:00:00+07:00`);
}

export function getPeriodRange(period: Period): { start: Date; end: Date } {
  const [year, month, day] = todayWIBKey().split("-").map(Number);

  if (period === "hari") {
    const start = wibMidnight(year, month, day);
    const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
    return { start, end };
  }

  if (period === "minggu") {
    const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
    const daysSinceMonday = (weekday + 6) % 7;
    const monday = new Date(Date.UTC(year, month - 1, day - daysSinceMonday));
    const start = wibMidnight(
      monday.getUTCFullYear(),
      monday.getUTCMonth() + 1,
      monday.getUTCDate()
    );
    const end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
    return { start, end };
  }

  const start = wibMidnight(year, month, 1);
  const nextMonth = new Date(Date.UTC(year, month, 1));
  const end = wibMidnight(
    nextMonth.getUTCFullYear(),
    nextMonth.getUTCMonth() + 1,
    1
  );
  return { start, end };
}

/**
 * Every WIB calendar day in [start, end), inclusive of empty days.
 * Safe to step by exactly 24h because Asia/Jakarta (WIB) has no DST.
 */
export function getDailyBuckets(
  start: Date,
  end: Date
): { date: string; label: string }[] {
  const dayLabel = new Intl.DateTimeFormat("id-ID", {
    timeZone: TIMEZONE,
    day: "2-digit",
    month: "short",
  });
  const buckets: { date: string; label: string }[] = [];
  for (let t = start.getTime(); t < end.getTime(); t += 24 * 60 * 60 * 1000) {
    const cursor = new Date(t);
    buckets.push({ date: dateKeyInWIB(cursor), label: dayLabel.format(cursor) });
  }
  return buckets;
}
