export type PaymentMethodDatum = { method: string; label: string; omzet: number };

const FALLBACK_COLORS = [
  "var(--color-accent-2)",
  "var(--color-ink-2)",
  "var(--color-muted)",
];

export function getSliceColor(data: PaymentMethodDatum[], method: string): string {
  const maxOmzet = Math.max(...data.map((d) => d.omzet));
  if (maxOmzet === 0) return "var(--color-rule)";
  const maxIndex = data.findIndex((d) => d.omzet === maxOmzet);
  if (data[maxIndex].method === method) return "var(--color-accent)";
  const others = data.filter((_, i) => i !== maxIndex);
  const otherIndex = others.findIndex((d) => d.method === method);
  return FALLBACK_COLORS[otherIndex % FALLBACK_COLORS.length];
}
