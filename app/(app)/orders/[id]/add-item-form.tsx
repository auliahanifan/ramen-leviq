"use client";

import { useActionState } from "react";
import type { AddItemState } from "./actions";

const initialState: AddItemState = {};

export default function AddItemForm({
  action,
  menuItems,
}: {
  action: (prevState: AddItemState, formData: FormData) => Promise<AddItemState>;
  menuItems: { id: string; nama: string; harga: number; kategori: string }[];
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form
      action={formAction}
      className="flex flex-wrap items-end gap-3 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
    >
      <div className="flex-1 min-w-[180px]">
        <label
          htmlFor="menu_item_id"
          className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Menu
        </label>
        <select
          id="menu_item_id"
          name="menu_item_id"
          required
          defaultValue=""
          className="w-full rounded-lg border border-zinc-300 px-3 py-3 text-base focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
        >
          <option value="" disabled>
            Pilih menu
          </option>
          {menuItems.map((item) => (
            <option key={item.id} value={item.id}>
              {item.nama} — Rp{item.harga.toLocaleString("id-ID")}
            </option>
          ))}
        </select>
      </div>

      <div className="w-24">
        <label
          htmlFor="qty"
          className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Qty
        </label>
        <input
          id="qty"
          name="qty"
          type="number"
          min="1"
          step="1"
          defaultValue={1}
          required
          className="w-full rounded-lg border border-zinc-300 px-3 py-3 text-base focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-zinc-900 px-4 py-3 text-base font-medium text-white disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900"
      >
        {pending ? "Menambahkan..." : "Tambah"}
      </button>

      {state.error && (
        <p className="w-full text-sm text-red-600 dark:text-red-400">
          {state.error}
        </p>
      )}
    </form>
  );
}
