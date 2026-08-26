"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import { formatRupiah } from "../_components/price";

export type DailyOmzetPoint = { date: string; label: string; omzet: number };

function DailyTrendTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: DailyOmzetPoint }[];
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

export default function DailyTrendChart({ data }: { data: DailyOmzetPoint[] }) {
  return (
    <div className="h-56 sm:h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--color-rule)" />
          <XAxis
            dataKey="label"
            axisLine={{ stroke: "var(--color-rule)" }}
            tickLine={false}
            interval={data.length > 14 ? Math.ceil(data.length / 8) - 1 : 0}
            tick={{ fill: "var(--color-muted)", fontSize: 11 }}
          />
          <Tooltip
            cursor={{ fill: "var(--color-rule-2)" }}
            content={<DailyTrendTooltip />}
          />
          <Bar
            dataKey="omzet"
            fill="var(--color-accent)"
            radius={[4, 4, 0, 0]}
            maxBarSize={28}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
