import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { addOrderItem, cancelOrder } from "./actions";
import AddItemForm from "./add-item-form";
import CancelOrderButton from "./cancel-order-button";

export default async function OrderPage({
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

  const [{ data: items }, { data: availableMenu }] = await Promise.all([
    supabase
      .from("order_items")
      .select("id, qty, price_at_order, menu_items(nama)")
      .eq("order_id", id)
      .order("created_at"),
    supabase
      .from("menu_items")
      .select("id, nama, harga, kategori")
      .eq("is_available", true)
      .order("kategori")
      .order("nama"),
  ]);

  const subtotal = (items ?? []).reduce(
    (sum, item) => sum + item.qty * item.price_at_order,
    0
  );

  const addItemAction = addOrderItem.bind(null, id);
  const cancelAction = cancelOrder.bind(null, id, order.table_id);

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 px-4 py-8 dark:bg-black">
      <div className="mx-auto w-full max-w-2xl">
        <h1 className="mb-6 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Meja {order.tables?.nomor}
        </h1>

        <div className="mb-4 overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          {items && items.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-200 text-left text-xs font-medium uppercase text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                  <th className="px-4 py-3">Menu</th>
                  <th className="px-4 py-3">Qty</th>
                  <th className="px-4 py-3 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-zinc-200 last:border-0 dark:border-zinc-800"
                  >
                    <td className="px-4 py-3 text-sm text-zinc-900 dark:text-zinc-50">
                      {item.menu_items?.nama}
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">
                      {item.qty}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-zinc-900 dark:text-zinc-50">
                      Rp{(item.qty * item.price_at_order).toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td
                    colSpan={2}
                    className="px-4 py-3 text-sm font-medium text-zinc-900 dark:text-zinc-50"
                  >
                    Subtotal
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-medium text-zinc-900 dark:text-zinc-50">
                    Rp{subtotal.toLocaleString("id-ID")}
                  </td>
                </tr>
              </tfoot>
            </table>
          ) : (
            <p className="px-4 py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
              Belum ada item.
            </p>
          )}
        </div>

        <div className="mb-6">
          <AddItemForm action={addItemAction} menuItems={availableMenu ?? []} />
        </div>

        <div className="flex gap-3">
          <CancelOrderButton action={cancelAction} />
          {items && items.length > 0 ? (
            <Link
              href={`/orders/${id}/checkout`}
              className="flex-1 rounded-lg bg-zinc-900 px-4 py-3 text-center text-base font-medium text-white dark:bg-zinc-50 dark:text-zinc-900"
            >
              Checkout
            </Link>
          ) : (
            <span className="flex-1 rounded-lg bg-zinc-200 px-4 py-3 text-center text-base font-medium text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600">
              Checkout
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
