import { notFound, redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { addOrderItem, cancelOrder } from "./actions";
import AddItemForm from "./add-item-form";
import CancelOrderButton from "./cancel-order-button";
import { Card } from "../../_components/card";
import { ButtonLink } from "../../_components/button";
import { Price } from "../../_components/price";

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
      .select("id, qty, price_at_order, customer_name, menu_items(nama)")
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
  const hasItems = Boolean(items && items.length > 0);

  return (
    <div className="flex flex-1 flex-col bg-paper px-4 py-8">
      <div className="mx-auto w-full max-w-2xl">
        <h1 className="mb-6 font-display text-display font-bold text-ink">
          Meja {order.tables?.nomor}
        </h1>

        <Card padding="none" className="mb-4">
          {items && items.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-rule text-left text-xs font-semibold tracking-wide text-muted uppercase">
                  <th className="px-4 py-3">Menu</th>
                  <th className="px-4 py-3">Qty</th>
                  <th className="px-4 py-3 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-rule last:border-0">
                    <td className="px-4 py-3 text-sm text-ink">
                      {item.menu_items?.nama}
                      {item.customer_name && (
                        <span className="block text-xs text-muted">
                          oleh {item.customer_name}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm font-outlier text-ink-2">
                      {item.qty}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-ink">
                      <Price value={item.qty * item.price_at_order} />
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={2} className="px-4 py-3 text-sm font-semibold text-ink">
                    Subtotal
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-semibold text-ink">
                    <Price value={subtotal} />
                  </td>
                </tr>
              </tfoot>
            </table>
          ) : (
            <p className="px-4 py-8 text-center text-sm text-muted">
              Belum ada item.
            </p>
          )}
        </Card>

        <div className="mb-6">
          <AddItemForm action={addItemAction} menuItems={availableMenu ?? []} />
        </div>

        <div className="flex gap-3">
          <CancelOrderButton action={cancelAction} />
          {hasItems ? (
            <ButtonLink href={`/orders/${id}/checkout`} fullWidth>
              Checkout
            </ButtonLink>
          ) : (
            <span className="flex min-h-14 flex-1 items-center justify-center rounded-button bg-paper-3 px-4 text-center text-base font-medium text-muted">
              Checkout
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
