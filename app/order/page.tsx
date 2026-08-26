import { supabase } from "@/lib/supabase";
import OrderClient from "./order-client";
import { Card } from "../(app)/_components/card";

export const dynamic = "force-dynamic";

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-1 items-center justify-center bg-paper px-4">
      <Card accentEdge className="w-full max-w-sm text-center">
        <p className="text-base text-ink">{message}</p>
      </Card>
    </div>
  );
}

export default async function OrderPage({
  searchParams,
}: {
  searchParams: Promise<{ table?: string }>;
}) {
  const { table: tableId } = await searchParams;

  if (!tableId) {
    return (
      <ErrorState message="Link tidak valid — QR meja tidak ditemukan. Panggil staff." />
    );
  }

  const { data: table } = await supabase
    .from("tables")
    .select("id, nomor, status")
    .eq("id", tableId)
    .maybeSingle();

  if (!table) {
    return <ErrorState message="Meja tidak ditemukan. Panggil staff." />;
  }

  const { data: openOrder } = await supabase
    .from("orders")
    .select("id")
    .eq("table_id", table.id)
    .eq("status", "open")
    .maybeSingle();

  if (!openOrder && table.status === "occupied") {
    return (
      <ErrorState message="Meja ini sudah checkout. Panggil staff untuk mulai pesanan baru." />
    );
  }

  const [{ data: availableMenu }, { data: submittedItems }] = await Promise.all([
    supabase
      .from("menu_items")
      .select("id, nama, harga, kategori, image_url")
      .eq("is_available", true)
      .order("kategori")
      .order("nama"),
    openOrder
      ? supabase
          .from("order_items")
          .select("id, qty, price_at_order, customer_name, menu_items(nama)")
          .eq("order_id", openOrder.id)
          .order("created_at")
      : Promise.resolve({ data: null }),
  ]);

  return (
    <OrderClient
      tableId={table.id}
      tableNomor={table.nomor}
      menu={availableMenu ?? []}
      submittedItems={submittedItems ?? []}
    />
  );
}
