import { notFound, redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Card } from "../../../_components/card";
import { ButtonLink } from "../../../_components/button";
import { LineRow } from "../../../_components/line-row";
import { Price } from "../../../_components/price";

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash: "Tunai",
  qris: "QRIS",
  card: "Kartu",
  transfer: "Transfer",
};

export default async function ReceiptPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ cash_paid?: string }>;
}) {
  const { id } = await params;
  const { cash_paid } = await searchParams;

  const { data: order } = await supabase
    .from("orders")
    .select(
      "id, status, subtotal, discount, service_charge, tax, total, payment_method, paid_at, tables(nomor)"
    )
    .eq("id", id)
    .single();

  if (!order) notFound();
  if (order.status !== "paid") redirect("/");

  const { data: items } = await supabase
    .from("order_items")
    .select("id, qty, price_at_order, menu_items(nama)")
    .eq("order_id", id)
    .order("created_at");

  const cashPaidNum = cash_paid ? Number(cash_paid) : null;
  const change =
    cashPaidNum !== null && Number.isFinite(cashPaidNum)
      ? cashPaidNum - order.total
      : null;

  return (
    <div className="flex flex-1 flex-col items-center bg-paper px-4 py-8">
      <div className="relative w-full max-w-md">
        <div className="absolute -top-3 -right-2 z-10 rotate-12 rounded border-2 border-accent-2 px-3 py-1 text-sm font-semibold tracking-widest text-accent-2 uppercase">
          Lunas
        </div>

        <Card accentEdge>
          <h1 className="mb-1 font-display text-2xl font-bold text-ink">
            Struk Pembayaran
          </h1>
          <p className="mb-6 text-sm text-muted">
            Meja {order.tables?.nomor} &middot;{" "}
            {order.paid_at
              ? new Date(order.paid_at).toLocaleString("id-ID")
              : ""}
          </p>

          <div className="mb-4 space-y-1 border-b border-rule pb-4 text-sm">
            {items?.map((item) => (
              <div key={item.id} className="flex justify-between">
                <span className="text-ink-2">
                  {item.menu_items?.nama} x{item.qty}
                </span>
                <Price value={item.qty * item.price_at_order} className="text-ink" />
              </div>
            ))}
          </div>

          <div className="mb-4 space-y-1 border-b border-rule pb-4">
            <LineRow label="Subtotal" value={order.subtotal} />
            <LineRow label="Diskon" value={order.discount} sign="-" />
            <LineRow label="Service Charge" value={order.service_charge} sign="+" />
            <LineRow label="PPN" value={order.tax} sign="+" />
          </div>

          <div className="mb-6 space-y-1">
            <LineRow label="Total" value={order.total} emphasis />
            <div className="flex justify-between text-sm text-ink-2">
              <span>Metode Pembayaran</span>
              <span>
                {order.payment_method
                  ? PAYMENT_METHOD_LABELS[order.payment_method]
                  : "-"}
              </span>
            </div>
            {cashPaidNum !== null && change !== null && (
              <>
                <LineRow label="Dibayar" value={cashPaidNum} />
                <LineRow label="Kembalian" value={change} />
              </>
            )}
          </div>

          <ButtonLink href="/" fullWidth>
            Kembali ke Meja
          </ButtonLink>
        </Card>
      </div>
    </div>
  );
}
