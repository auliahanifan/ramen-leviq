"use client";

import Link from "next/link";
import { useMenuItemActions } from "./use-menu-item-actions";
import type { Tables } from "@/lib/database.types";

export default function MenuItemCard({
  item,
}: {
  item: Tables<"menu_items">;
}) {
  const { isPending, error, handleToggle, handleDelete } =
    useMenuItemActions(item);

  return (
    <div className="border-b border-zinc-200 p-4 last:border-0 dark:border-zinc-800">
      <div className="mb-2 flex items-start justify-between gap-3">
        <div>
          <p className="text-base font-medium text-zinc-900 dark:text-zinc-50">
            {item.nama}
          </p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {item.kategori} &middot; Rp{item.harga.toLocaleString("id-ID")}
          </p>
        </div>
        <button
          type="button"
          onClick={handleToggle}
          disabled={isPending}
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium disabled:opacity-60 ${
            item.is_available
              ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
              : "bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
          }`}
        >
          {item.is_available ? "Tersedia" : "Habis"}
        </button>
      </div>

      {error && (
        <p className="mb-2 text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      <div className="flex gap-4 text-sm">
        <Link
          href={`/menu/${item.id}/edit`}
          className="font-medium text-zinc-700 dark:text-zinc-300"
        >
          Edit
        </Link>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          className="font-medium text-red-600 disabled:opacity-60 dark:text-red-400"
        >
          Hapus
        </button>
      </div>
    </div>
  );
}
