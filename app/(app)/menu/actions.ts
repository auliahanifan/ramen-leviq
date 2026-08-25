"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";

export type MenuFormState = { error?: string };

function parseMenuForm(formData: FormData) {
  const nama = formData.get("nama");
  const harga = Number(formData.get("harga"));
  const kategori = formData.get("kategori");

  if (typeof nama !== "string" || !nama.trim()) {
    return { error: "Nama wajib diisi" } as const;
  }
  if (!Number.isFinite(harga) || harga < 0) {
    return { error: "Harga harus berupa angka >= 0" } as const;
  }
  if (typeof kategori !== "string" || !kategori.trim()) {
    return { error: "Kategori wajib diisi" } as const;
  }

  return {
    values: { nama: nama.trim(), harga, kategori: kategori.trim() },
  } as const;
}

export async function createMenuItem(
  _prevState: MenuFormState,
  formData: FormData
): Promise<MenuFormState> {
  const parsed = parseMenuForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  const { error } = await supabase.from("menu_items").insert(parsed.values);
  if (error) return { error: "Gagal menambahkan menu" };

  revalidatePath("/menu");
  redirect("/menu");
}

export async function updateMenuItem(
  id: string,
  _prevState: MenuFormState,
  formData: FormData
): Promise<MenuFormState> {
  const parsed = parseMenuForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  const { error } = await supabase
    .from("menu_items")
    .update({ ...parsed.values, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { error: "Gagal menyimpan perubahan" };

  revalidatePath("/menu");
  redirect("/menu");
}

export async function deleteMenuItem(id: string) {
  const { error } = await supabase.from("menu_items").delete().eq("id", id);
  if (error) {
    if (error.code === "23503") {
      return { error: "Menu tidak bisa dihapus karena sudah pernah dipesan" };
    }
    return { error: "Gagal menghapus menu" };
  }
  revalidatePath("/menu");
  return {};
}

export async function toggleAvailability(id: string, isAvailable: boolean) {
  const { error } = await supabase
    .from("menu_items")
    .update({ is_available: !isAvailable, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { error: "Gagal mengubah status" };
  revalidatePath("/menu");
  return {};
}
