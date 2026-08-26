export type PaymentMethodDatum = { method: string; label: string; omzet: number };
export type PaymentMethodSlice = PaymentMethodDatum & { color: string };

const FALLBACK_COLORS = [
  "var(--color-accent-2)",
  "var(--color-ink-2)",
  "var(--color-muted)",
];

// Computed once on the server and threaded through as data — keeps this
// pure color-ranking logic out of the client bundle entirely, since a
// module reachable through a "use client" boundary gets pulled into the
// client graph even when another Server Component also imports it directly.
export function withSliceColors(data: PaymentMethodDatum[]): PaymentMethodSlice[] {
  const maxOmzet = Math.max(...data.map((d) => d.omzet));
  if (maxOmzet === 0) {
    return data.map((d) => ({ ...d, color: "var(--color-rule)" }));
  }
  const maxIndex = data.findIndex((d) => d.omzet === maxOmzet);
  let otherIndex = 0;
  return data.map((d, i) => {
    if (i === maxIndex) return { ...d, color: "var(--color-accent)" };
    const color = FALLBACK_COLORS[otherIndex % FALLBACK_COLORS.length];
    otherIndex += 1;
    return { ...d, color };
  });
}
