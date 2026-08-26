import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  getPeriodRange,
  parsePeriod,
  PERIOD_LABELS,
  type Period,
} from "@/lib/wib-period";
import { Card } from "../_components/card";
import { LineRow } from "../_components/line-row";
import TopMenuRow, { type TopMenuItem } from "./top-menu-row";
import TopMenuCard from "./top-menu-card";

export const dynamic = "force-dynamic";

const PERIODS: Period[] = ["hari", "minggu", "bulan"];

const PAYMENT_METHODS = ["cash", "qris", "card", "transfer"] as const;
const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash: "Tunai",
  qris: "QRIS",
  card: "Kartu",
  transfer: "Transfer",
};

export default async function LaporanPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const { period: periodParam } = await searchParams;
  const period = parsePeriod(periodParam);
  const { start, end } = getPeriodRange(period);

  const { data: orders } = await supabase
    .from("orders")
    .select("id, total, discount, service_charge, tax, payment_method")
    .eq("status", "paid")
    .gte("paid_at", start.toISOString())
    .lt("paid_at", end.toISOString());

  const paidOrders = orders ?? [];

  const totalOmzet = paidOrders.reduce((sum, o) => sum + o.total, 0);
  const jumlahOrder = paidOrders.length;
  const rataRata = jumlahOrder > 0 ? totalOmzet / jumlahOrder : 0;
  const totalDiskon = paidOrders.reduce((sum, o) => sum + o.discount, 0);
  const totalService = paidOrders.reduce((sum, o) => sum + o.service_charge, 0);
  const totalPajak = paidOrders.reduce((sum, o) => sum + o.tax, 0);

  const omzetByMethod = new Map<string, number>();
  for (const order of paidOrders) {
    if (!order.payment_method) continue;
    omzetByMethod.set(
      order.payment_method,
      (omzetByMethod.get(order.payment_method) ?? 0) + order.total
    );
  }

  const orderIds = paidOrders.map((o) => o.id);
  const { data: orderItems } =
    orderIds.length > 0
      ? await supabase
          .from("order_items")
          .select("menu_item_id, qty, price_at_order, menu_items(nama)")
          .in("order_id", orderIds)
      : { data: null };

  const menuStats = new Map<string, TopMenuItem & { id: string }>();
  for (const item of orderItems ?? []) {
    const existing = menuStats.get(item.menu_item_id) ?? {
      id: item.menu_item_id,
      nama: item.menu_items?.nama ?? "-",
      qty: 0,
      omzet: 0,
    };
    existing.qty += item.qty;
    existing.omzet += item.qty * item.price_at_order;
    menuStats.set(item.menu_item_id, existing);
  }

  const topMenu = Array.from(menuStats.values()).sort((a, b) => {
    if (b.qty !== a.qty) return b.qty - a.qty;
    if (b.omzet !== a.omzet) return b.omzet - a.omzet;
    return a.nama.localeCompare(b.nama);
  });

  return (
    <div className="flex flex-1 flex-col bg-paper px-4 py-8">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="font-display text-display font-bold text-ink">
            Laporan
          </h1>
          <div className="flex items-center gap-5">
            {PERIODS.map((p) => (
              <Link
                key={p}
                href={`/laporan?period=${p}`}
                className={`text-sm font-medium transition-colors duration-150 ease-out ${
                  p === period
                    ? "text-accent underline decoration-2 underline-offset-4"
                    : "text-ink-2 hover:text-ink"
                }`}
              >
                {PERIOD_LABELS[p]}
              </Link>
            ))}
          </div>
        </div>

        <Card className="mb-4">
          <h2 className="mb-3 text-xs font-semibold tracking-wide text-muted uppercase">
            Ringkasan Omzet
          </h2>
          <div className="space-y-2">
            <LineRow label="Total Omzet" value={totalOmzet} emphasis />
            <div className="flex items-baseline justify-between gap-4 text-sm text-ink-2">
              <span>Jumlah Order</span>
              <span className="font-outlier tabular-nums">{jumlahOrder}</span>
            </div>
            <LineRow label="Rata-rata per Order" value={rataRata} />
          </div>
        </Card>

        <Card className="mb-4">
          <h2 className="mb-3 text-xs font-semibold tracking-wide text-muted uppercase">
            Metode Pembayaran
          </h2>
          <div className="space-y-2">
            {PAYMENT_METHODS.map((method) => (
              <LineRow
                key={method}
                label={PAYMENT_METHOD_LABELS[method]}
                value={omzetByMethod.get(method) ?? 0}
              />
            ))}
          </div>
        </Card>

        <Card className="mb-6">
          <h2 className="mb-3 text-xs font-semibold tracking-wide text-muted uppercase">
            Diskon, Service Charge &amp; Pajak
          </h2>
          <div className="space-y-2">
            <LineRow label="Diskon" value={totalDiskon} />
            <LineRow label="Service Charge" value={totalService} />
            <LineRow label="Pajak" value={totalPajak} />
          </div>
        </Card>

        <h2 className="mb-3 text-xs font-semibold tracking-wide text-muted uppercase">
          Menu Terlaris
        </h2>

        {topMenu.length > 0 ? (
          <>
            <Card padding="none" className="sm:hidden">
              {topMenu.map((item) => (
                <TopMenuCard key={item.id} item={item} />
              ))}
            </Card>

            <Card padding="none" className="hidden overflow-x-auto sm:block">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-rule text-left text-xs font-semibold tracking-wide text-muted uppercase">
                    <th className="px-4 py-3">Menu</th>
                    <th className="px-4 py-3">Qty</th>
                    <th className="px-4 py-3 text-right">Omzet</th>
                  </tr>
                </thead>
                <tbody>
                  {topMenu.map((item) => (
                    <TopMenuRow key={item.id} item={item} />
                  ))}
                </tbody>
              </table>
            </Card>
          </>
        ) : (
          <Card className="text-center text-sm text-muted">
            Belum ada data menu di periode ini.
          </Card>
        )}
      </div>
    </div>
  );
}
