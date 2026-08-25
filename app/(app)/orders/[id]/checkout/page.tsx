import { notFound, redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { payOrder } from "./actions";
import CheckoutForm from "./checkout-form";

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: order } = await supabase
    .from("orders")
    .select("id, table_id, status, tables(nomor)")
    .eq("id", id)
    .single();

  if (!order) notFound();
  if (order.status === "paid") redirect(`/orders/${id}/receipt`);
  if (order.status === "cancelled") redirect("/");

  const [{ data: items }, { data: settings }] = await Promise.all([
    supabase.from("order_items").select("qty, price_at_order").eq("order_id", id),
    supabase
      .from("settings")
      .select("tax_percent, service_charge_percent")
      .eq("id", 1)
      .single(),
  ]);

  if (!items || items.length === 0) redirect(`/orders/${id}`);

  const subtotal = items.reduce(
    (sum, item) => sum + item.qty * item.price_at_order,
    0
  );

  const action = payOrder.bind(null, id, order.table_id);

  return (
    <div className="flex flex-1 flex-col items-center bg-zinc-50 px-4 py-8 dark:bg-black">
      <div className="w-full max-w-md">
        <h1 className="mb-6 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Checkout Meja {order.tables?.nomor}
        </h1>
        <CheckoutForm
          action={action}
          subtotal={subtotal}
          taxPercent={settings?.tax_percent ?? 0}
          serviceChargePercent={settings?.service_charge_percent ?? 0}
        />
      </div>
    </div>
  );
}
