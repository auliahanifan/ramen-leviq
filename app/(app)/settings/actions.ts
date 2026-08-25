"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";

export type SettingsState = { error?: string; success?: boolean };

export async function updateSettings(
  _prevState: SettingsState,
  formData: FormData
): Promise<SettingsState> {
  const taxPercent = Number(formData.get("tax_percent"));
  const serviceChargePercent = Number(formData.get("service_charge_percent"));

  if (!Number.isFinite(taxPercent) || taxPercent < 0 || taxPercent > 100) {
    return { error: "PPN harus berupa angka 0-100" };
  }
  if (
    !Number.isFinite(serviceChargePercent) ||
    serviceChargePercent < 0 ||
    serviceChargePercent > 100
  ) {
    return { error: "Service charge harus berupa angka 0-100" };
  }

  const { error } = await supabase
    .from("settings")
    .update({
      tax_percent: taxPercent,
      service_charge_percent: serviceChargePercent,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);

  if (error) {
    return { error: "Gagal menyimpan pengaturan" };
  }

  revalidatePath("/settings");
  return { success: true };
}
