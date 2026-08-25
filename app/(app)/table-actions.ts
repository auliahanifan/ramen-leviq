"use server";

import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";

export async function startOrder(tableId: string) {
  const { data: order, error } = await supabase
    .from("orders")
    .insert({ table_id: tableId })
    .select("id")
    .single();

  if (error || !order) {
    throw new Error("Gagal membuat pesanan");
  }

  const { error: tableError } = await supabase
    .from("tables")
    .update({ status: "occupied" })
    .eq("id", tableId);

  if (tableError) {
    throw new Error("Gagal memperbarui status meja");
  }

  redirect(`/orders/${order.id}`);
}
