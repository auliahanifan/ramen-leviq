"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { formatRupiah } from "../_components/price";
import { getSliceColor, type PaymentMethodDatum } from "./payment-method-colors";

function DonutTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: PaymentMethodDatum }[];
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-input border border-rule bg-paper-3 px-3 py-2 shadow-offset-sm">
      <p className="text-xs font-medium text-muted">{point.label}</p>
      <p className="font-outlier text-sm tabular-nums text-ink">
        {formatRupiah(point.omzet)}
      </p>
    </div>
  );
}

export default function PaymentMethodDonut({
  data,
}: {
  data: PaymentMethodDatum[];
}) {
  return (
    <div className="h-40 w-40 shrink-0">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip content={<DonutTooltip />} />
          <Pie
            data={data}
            dataKey="omzet"
            nameKey="label"
            innerRadius="60%"
            outerRadius="100%"
            strokeWidth={2}
            stroke="var(--color-paper-2)"
          >
            {data.map((entry) => (
              <Cell key={entry.method} fill={getSliceColor(data, entry.method)} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
