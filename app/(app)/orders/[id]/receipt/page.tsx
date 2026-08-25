import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash: "Tunai",
  qris: "QRIS",
  card: "Kartu",
  transfer: "Transfer",
};

function formatRupiah(n: number) {
  return `Rp${Math.round(n).toLocaleString("id-ID")}`;
}

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
    <div className="flex flex-1 flex-col items-center bg-zinc-50 px-4 py-8 dark:bg-black">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <h1 className="mb-1 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Struk Pembayaran
        </h1>
        <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
          Meja {order.tables?.nomor} &middot;{" "}
          {order.paid_at
            ? new Date(order.paid_at).toLocaleString("id-ID")
            : ""}
        </p>

        <div className="mb-4 space-y-1 border-b border-zinc-200 pb-4 text-sm dark:border-zinc-800">
          {items?.map((item) => (
            <div key={item.id} className="flex justify-between">
              <span className="text-zinc-700 dark:text-zinc-300">
                {item.menu_items?.nama} x{item.qty}
              </span>
              <span className="text-zinc-900 dark:text-zinc-50">
                {formatRupiah(item.qty * item.price_at_order)}
              </span>
            </div>
          ))}
        </div>

        <div className="mb-4 space-y-1 border-b border-zinc-200 pb-4 text-sm dark:border-zinc-800">
          <div className="flex justify-between text-zinc-700 dark:text-zinc-300">
            <span>Subtotal</span>
            <span>{formatRupiah(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-zinc-700 dark:text-zinc-300">
            <span>Diskon</span>
            <span>-{formatRupiah(order.discount)}</span>
          </div>
          <div className="flex justify-between text-zinc-700 dark:text-zinc-300">
            <span>Service Charge</span>
            <span>+{formatRupiah(order.service_charge)}</span>
          </div>
          <div className="flex justify-between text-zinc-700 dark:text-zinc-300">
            <span>PPN</span>
            <span>+{formatRupiah(order.tax)}</span>
          </div>
        </div>

        <div className="mb-4 space-y-1 text-sm">
          <div className="flex justify-between text-base font-semibold text-zinc-900 dark:text-zinc-50">
            <span>Total</span>
            <span>{formatRupiah(order.total)}</span>
          </div>
          <div className="flex justify-between text-zinc-700 dark:text-zinc-300">
            <span>Metode Pembayaran</span>
            <span>
              {order.payment_method
                ? PAYMENT_METHOD_LABELS[order.payment_method]
                : "-"}
            </span>
          </div>
          {cashPaidNum !== null && change !== null && (
            <>
              <div className="flex justify-between text-zinc-700 dark:text-zinc-300">
                <span>Dibayar</span>
                <span>{formatRupiah(cashPaidNum)}</span>
              </div>
              <div className="flex justify-between text-zinc-700 dark:text-zinc-300">
                <span>Kembalian</span>
                <span>{formatRupiah(change)}</span>
              </div>
            </>
          )}
        </div>

        <Link
          href="/"
          className="block w-full rounded-lg bg-zinc-900 px-4 py-3 text-center text-base font-medium text-white dark:bg-zinc-50 dark:text-zinc-900"
        >
          Kembali ke Meja
        </Link>
      </div>
    </div>
  );
}
