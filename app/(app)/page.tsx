import { supabase } from "@/lib/supabase";
import { startOrder } from "./table-actions";
import { EmptyTableTile, OccupiedTableTile } from "./_components/table-status-tile";

export const dynamic = "force-dynamic";

export default async function TablesPage() {
  const [{ data: tables }, { data: openOrders }] = await Promise.all([
    supabase.from("tables").select("*").order("nomor"),
    supabase.from("orders").select("id, table_id").eq("status", "open"),
  ]);

  const openOrderByTable = new Map(
    (openOrders ?? []).map((order) => [order.table_id, order.id])
  );

  return (
    <div className="flex flex-1 flex-col bg-paper px-4 py-8">
      <div className="mx-auto w-full max-w-3xl">
        <h1 className="mb-6 font-display text-display font-bold text-ink">
          Meja
        </h1>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
          {tables?.map((table) => {
            const isOccupied = table.status === "occupied";
            const orderId = openOrderByTable.get(table.id);

            if (isOccupied && orderId) {
              return (
                <OccupiedTableTile
                  key={table.id}
                  nomor={table.nomor}
                  orderId={orderId}
                />
              );
            }

            return (
              <EmptyTableTile
                key={table.id}
                nomor={table.nomor}
                action={startOrder.bind(null, table.id)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
