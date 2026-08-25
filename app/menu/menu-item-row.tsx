"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { deleteMenuItem, toggleAvailability } from "./actions";
import type { Tables } from "@/lib/database.types";

export default function MenuItemRow({
  item,
}: {
  item: Tables<"menu_items">;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleToggle() {
    setError(null);
    startTransition(async () => {
      const result = await toggleAvailability(item.id, item.is_available);
      if (result.error) setError(result.error);
    });
  }

  function handleDelete() {
    if (!window.confirm(`Hapus menu "${item.nama}"?`)) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteMenuItem(item.id);
      if (result.error) setError(result.error);
    });
  }

  return (
    <tr className="border-b border-zinc-200 dark:border-zinc-800">
      <td className="px-4 py-3 text-sm text-zinc-900 dark:text-zinc-50">
        {item.nama}
      </td>
      <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">
        {item.kategori}
      </td>
      <td className="px-4 py-3 text-sm text-zinc-900 dark:text-zinc-50">
        Rp{item.harga.toLocaleString("id-ID")}
      </td>
      <td className="px-4 py-3">
        <button
          type="button"
          onClick={handleToggle}
          disabled={isPending}
          className={`rounded-full px-3 py-1 text-xs font-medium disabled:opacity-60 ${
            item.is_available
              ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
              : "bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
          }`}
        >
          {item.is_available ? "Tersedia" : "Habis"}
        </button>
        {error && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
      </td>
      <td className="px-4 py-3 text-right text-sm">
        <Link
          href={`/menu/${item.id}/edit`}
          className="mr-3 font-medium text-zinc-700 hover:underline dark:text-zinc-300"
        >
          Edit
        </Link>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          className="font-medium text-red-600 hover:underline disabled:opacity-60 dark:text-red-400"
        >
          Hapus
        </button>
      </td>
    </tr>
  );
}
