"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";

export type AddItemState = { error?: string };

export async function addOrderItem(
  orderId: string,
  _prevState: AddItemState,
  formData: FormData
): Promise<AddItemState> {
  const menuItemId = formData.get("menu_item_id");
  const qty = Number(formData.get("qty"));

  if (typeof menuItemId !== "string" || !menuItemId) {
    return { error: "Pilih menu" };
  }
  if (!Number.isInteger(qty) || qty < 1) {
    return { error: "Qty harus angka bulat >= 1" };
  }

  const { data: order } = await supabase
    .from("orders")
    .select("status")
    .eq("id", orderId)
    .single();
  if (!order || order.status !== "open") {
    return { error: "Pesanan sudah tidak aktif" };
  }

  const { data: menuItem, error: menuError } = await supabase
    .from("menu_items")
    .select("harga, is_available")
    .eq("id", menuItemId)
    .single();

  if (menuError || !menuItem || !menuItem.is_available) {
    return { error: "Menu tidak tersedia" };
  }

  const { error } = await supabase.from("order_items").insert({
    order_id: orderId,
    menu_item_id: menuItemId,
    qty,
    price_at_order: menuItem.harga,
  });

  if (error) return { error: "Gagal menambahkan item" };

  revalidatePath(`/orders/${orderId}`);
  return {};
}

export async function cancelOrder(orderId: string, tableId: string) {
  const { data: order } = await supabase
    .from("orders")
    .select("status")
    .eq("id", orderId)
    .single();
  if (!order || order.status !== "open") {
    redirect("/");
  }

  const { error } = await supabase
    .from("orders")
    .update({ status: "cancelled" })
    .eq("id", orderId);
  if (error) throw new Error("Gagal membatalkan pesanan");

  const { error: tableError } = await supabase
    .from("tables")
    .update({ status: "empty" })
    .eq("id", tableId);
  if (tableError) throw new Error("Gagal memperbarui status meja");

  revalidatePath("/");
  redirect("/");
}
