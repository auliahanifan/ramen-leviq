"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { TablesUpdate } from "@/lib/database.types";

export type MenuFormState = { error?: string };

async function uploadMenuPhoto(
  photo: FormDataEntryValue | null
): Promise<{ url?: string; error?: string }> {
  if (!(photo instanceof File) || photo.size === 0) return {};

  const ext = photo.name.split(".").pop() || "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from("menu-photos")
    .upload(path, photo, { contentType: photo.type || undefined });
  if (error) return { error: "Gagal mengunggah foto" };

  const { data } = supabase.storage.from("menu-photos").getPublicUrl(path);
  return { url: data.publicUrl };
}

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

  const photoResult = await uploadMenuPhoto(formData.get("photo"));
  if (photoResult.error) return { error: photoResult.error };

  const { error } = await supabase
    .from("menu_items")
    .insert({ ...parsed.values, image_url: photoResult.url });
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

  const photoResult = await uploadMenuPhoto(formData.get("photo"));
  if (photoResult.error) return { error: photoResult.error };

  const updateValues: TablesUpdate<"menu_items"> = {
    ...parsed.values,
    updated_at: new Date().toISOString(),
  };
  if (photoResult.url) updateValues.image_url = photoResult.url;

  const { error } = await supabase
    .from("menu_items")
    .update(updateValues)
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
