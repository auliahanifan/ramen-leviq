import type { ReactNode } from "react";
import { Price } from "./price";

export function LineRow({
  label,
  value,
  sign,
  emphasis = false,
}: {
  label: ReactNode;
  value: number;
  sign?: "+" | "-";
  emphasis?: boolean;
}) {
  return (
    <div
      className={`flex items-baseline justify-between gap-4 ${
        emphasis
          ? "border-t border-rule pt-3 text-lg font-semibold text-ink"
          : "text-sm text-ink-2"
      }`}
    >
      <span>{label}</span>
      <span className="inline-flex items-baseline gap-0.5">
        {sign && <span aria-hidden>{sign}</span>}
        <Price value={value} />
      </span>
    </div>
  );
}
