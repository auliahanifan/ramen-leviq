import Link from "next/link";
import { supabase } from "@/lib/supabase";
import MenuItemRow from "./menu-item-row";

export default async function MenuPage() {
  const { data: items } = await supabase
    .from("menu_items")
    .select("*")
    .order("kategori")
    .order("nama");

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 px-4 py-8 dark:bg-black">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Kelola Menu
          </h1>
          <Link
            href="/menu/new"
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-50 dark:text-zinc-900"
          >
            + Tambah Menu
          </Link>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-200 text-left text-xs font-medium uppercase text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                <th className="px-4 py-3">Nama</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3">Harga</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items && items.length > 0 ? (
                items.map((item) => <MenuItemRow key={item.id} item={item} />)
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-sm text-zinc-500 dark:text-zinc-400"
                  >
                    Belum ada menu.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
