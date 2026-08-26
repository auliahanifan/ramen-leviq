"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";

export type SubmitCartState = { error?: string };

export type CartItemInput = { menuItemId: string; qty: number };

async function getOrCreateOpenOrder(
  tableId: string
): Promise<{ orderId: string } | { error: string }> {
  const { data: existing } = await supabase
    .from("orders")
    .select("id")
    .eq("table_id", tableId)
    .eq("status", "open")
    .maybeSingle();

  if (existing) return { orderId: existing.id };

  const { data: created, error } = await supabase
    .from("orders")
    .insert({ table_id: tableId })
    .select("id")
    .single();

  if (error) {
    // Another device at the same table submitted first — the unique index
    // on (table_id) where status='open' rejected our duplicate. Reuse it.
    if (error.code === "23505") {
      const { data: raced } = await supabase
        .from("orders")
        .select("id")
        .eq("table_id", tableId)
        .eq("status", "open")
        .single();
      if (raced) return { orderId: raced.id };
    }
    return { error: "Gagal membuat pesanan" };
  }

  const { error: tableError } = await supabase
    .from("tables")
    .update({ status: "occupied" })
    .eq("id", tableId);
  if (tableError) return { error: "Gagal memperbarui status meja" };

  return { orderId: created.id };
}

export async function submitCart(
  tableId: string,
  customerName: string,
  items: CartItemInput[]
): Promise<SubmitCartState> {
  const name = customerName.trim();
  if (!name) return { error: "Nama wajib diisi" };
  if (items.length === 0) return { error: "Keranjang masih kosong" };
  for (const item of items) {
    if (!item.menuItemId || !Number.isInteger(item.qty) || item.qty < 1) {
      return { error: "Item pesanan tidak valid" };
    }
  }

  const { data: table } = await supabase
    .from("tables")
    .select("id")
    .eq("id", tableId)
    .maybeSingle();
  if (!table) return { error: "Meja tidak ditemukan" };

  const orderResult = await getOrCreateOpenOrder(tableId);
  if ("error" in orderResult) return orderResult;
  const { orderId } = orderResult;

  const { data: order } = await supabase
    .from("orders")
    .select("status")
    .eq("id", orderId)
    .single();
  if (!order || order.status !== "open") {
    return { error: "Pesanan sudah tidak aktif, panggil staff" };
  }

  const { data: menuItems, error: menuError } = await supabase
    .from("menu_items")
    .select("id, harga, is_available")
    .in(
      "id",
      items.map((item) => item.menuItemId)
    );
  if (menuError || !menuItems) return { error: "Gagal memuat menu" };

  const menuById = new Map(menuItems.map((menuItem) => [menuItem.id, menuItem]));
  const rows = [];
  for (const item of items) {
    const menuItem = menuById.get(item.menuItemId);
    if (!menuItem || !menuItem.is_available) {
      return { error: "Ada menu yang sudah tidak tersedia, muat ulang halaman" };
    }
    rows.push({
      order_id: orderId,
      menu_item_id: item.menuItemId,
      qty: item.qty,
      price_at_order: menuItem.harga,
      customer_name: name,
    });
  }

  const { error: insertError } = await supabase.from("order_items").insert(rows);
  if (insertError) return { error: "Gagal mengirim pesanan" };

  revalidatePath("/order");
  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/");
  return {};
}
