"use server";

import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";

export async function startOrder(tableId: string) {
  const { data: order, error } = await supabase
    .from("orders")
    .insert({ table_id: tableId })
    .select("id")
    .single();

  if (error) {
    // Another request already opened an order for this table (e.g. a
    // double submit) — the unique index on (table_id) where status='open'
    // rejects the duplicate. Just go to the existing open order instead.
    if (error.code === "23505") {
      const { data: existing } = await supabase
        .from("orders")
        .select("id")
        .eq("table_id", tableId)
        .eq("status", "open")
        .single();
      if (existing) redirect(`/orders/${existing.id}`);
    }
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
