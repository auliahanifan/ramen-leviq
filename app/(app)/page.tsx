import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { startOrder } from "./table-actions";

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
    <div className="flex flex-1 flex-col bg-zinc-50 px-4 py-8 dark:bg-black">
      <div className="mx-auto w-full max-w-3xl">
        <h1 className="mb-6 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Meja
        </h1>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
          {tables?.map((table) => {
            const isOccupied = table.status === "occupied";
            const orderId = openOrderByTable.get(table.id);

            if (isOccupied && orderId) {
              return (
                <Link
                  key={table.id}
                  href={`/orders/${orderId}`}
                  className="flex aspect-square flex-col items-center justify-center rounded-2xl border border-amber-300 bg-amber-100 text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200"
                >
                  <span className="text-2xl font-semibold">
                    {table.nomor}
                  </span>
                  <span className="text-xs font-medium">Terisi</span>
                </Link>
              );
            }

            return (
              <form key={table.id} action={startOrder.bind(null, table.id)}>
                <button
                  type="submit"
                  className="flex aspect-square w-full flex-col items-center justify-center rounded-2xl border border-zinc-200 bg-white text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300"
                >
                  <span className="text-2xl font-semibold">
                    {table.nomor}
                  </span>
                  <span className="text-xs font-medium">Kosong</span>
                </button>
              </form>
            );
          })}
        </div>
      </div>
    </div>
  );
}
