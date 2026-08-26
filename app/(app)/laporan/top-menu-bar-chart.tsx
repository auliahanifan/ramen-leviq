"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatRupiah } from "../_components/price";

export type TopMenuChartDatum = { nama: string; omzet: number };

function TopMenuTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: TopMenuChartDatum }[];
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-input border border-rule bg-paper-3 px-3 py-2 shadow-offset-sm">
      <p className="text-xs font-medium text-muted">{point.nama}</p>
      <p className="font-outlier text-sm tabular-nums text-ink">
        {formatRupiah(point.omzet)}
      </p>
    </div>
  );
}

export default function TopMenuBarChart({ data }: { data: TopMenuChartDatum[] }) {
  return (
    <div style={{ height: data.length * 40 + 16 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
        >
          <CartesianGrid horizontal={false} stroke="var(--color-rule)" />
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="nama"
            axisLine={false}
            tickLine={false}
            width={110}
            tick={{ fill: "var(--color-muted)", fontSize: 11 }}
          />
          <Tooltip
            cursor={{ fill: "var(--color-rule-2)" }}
            content={<TopMenuTooltip />}
          />
          <Bar
            dataKey="omzet"
            fill="var(--color-accent-2)"
            radius={[0, 4, 4, 0]}
            maxBarSize={20}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
