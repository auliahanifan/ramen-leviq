"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";

export type PayState = { error?: string };

const PAYMENT_METHODS = ["cash", "qris", "card", "transfer"] as const;

export async function payOrder(
  orderId: string,
  tableId: string,
  _prevState: PayState,
  formData: FormData
): Promise<PayState> {
  const { data: order } = await supabase
    .from("orders")
    .select("status")
    .eq("id", orderId)
    .single();
  if (!order || order.status !== "open") {
    return { error: "Pesanan sudah tidak aktif" };
  }

  const { data: items } = await supabase
    .from("order_items")
    .select("qty, price_at_order")
    .eq("order_id", orderId);
  if (!items || items.length === 0) {
    return { error: "Pesanan belum ada item" };
  }

  const { data: settings } = await supabase
    .from("settings")
    .select("tax_percent, service_charge_percent")
    .eq("id", 1)
    .single();
  if (!settings) {
    return { error: "Pengaturan tidak ditemukan" };
  }

  const subtotal = items.reduce(
    (sum, item) => sum + item.qty * item.price_at_order,
    0
  );

  const discountType = formData.get("discount_type");
  const discountValueRaw = Number(formData.get("discount_value") || 0);
  const paymentMethod = formData.get("payment_method");

  if (discountType !== "nominal" && discountType !== "percent") {
    return { error: "Jenis diskon tidak valid" };
  }
  if (!Number.isFinite(discountValueRaw) || discountValueRaw < 0) {
    return { error: "Diskon tidak valid" };
  }
  if (
    typeof paymentMethod !== "string" ||
    !PAYMENT_METHODS.includes(paymentMethod as (typeof PAYMENT_METHODS)[number])
  ) {
    return { error: "Metode pembayaran tidak valid" };
  }

  let discountAmount =
    discountType === "percent"
      ? subtotal * (discountValueRaw / 100)
      : discountValueRaw;
  discountAmount = Math.round(Math.min(Math.max(discountAmount, 0), subtotal));

  const afterDiscount = subtotal - discountAmount;
  const serviceChargeAmount = Math.round(
    afterDiscount * (settings.service_charge_percent / 100)
  );
  const afterServiceCharge = afterDiscount + serviceChargeAmount;
  const taxAmount = Math.round(afterServiceCharge * (settings.tax_percent / 100));
  const total = afterServiceCharge + taxAmount;

  let cashPaid: number | null = null;
  if (paymentMethod === "cash") {
    cashPaid = Number(formData.get("cash_paid") || 0);
    if (!Number.isFinite(cashPaid) || cashPaid < total) {
      return { error: "Jumlah dibayar kurang dari total" };
    }
  }

  const { error } = await supabase
    .from("orders")
    .update({
      status: "paid",
      subtotal,
      discount: discountAmount,
      service_charge: serviceChargeAmount,
      tax: taxAmount,
      total,
      payment_method: paymentMethod,
      paid_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  if (error) return { error: "Gagal menyimpan pembayaran" };

  const { error: tableError } = await supabase
    .from("tables")
    .update({ status: "empty" })
    .eq("id", tableId);
  if (tableError) return { error: "Gagal memperbarui status meja" };

  revalidatePath("/");
  const query = cashPaid !== null ? `?cash_paid=${cashPaid}` : "";
  redirect(`/orders/${orderId}/receipt${query}`);
}
