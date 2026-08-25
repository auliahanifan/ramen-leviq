"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { MenuFormState } from "./actions";

const initialState: MenuFormState = {};

export default function MenuForm({
  title,
  action,
  initialValues,
}: {
  title: string;
  action: (
    prevState: MenuFormState,
    formData: FormData
  ) => Promise<MenuFormState>;
  initialValues?: { nama: string; harga: number; kategori: string };
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4 py-12 dark:bg-black">
      <form
        action={formAction}
        className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        <h1 className="mb-6 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          {title}
        </h1>

        <label
          htmlFor="nama"
          className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Nama
        </label>
        <input
          id="nama"
          name="nama"
          type="text"
          defaultValue={initialValues?.nama}
          autoFocus
          className="mb-4 w-full rounded-lg border border-zinc-300 px-4 py-3 text-base focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
        />

        <label
          htmlFor="harga"
          className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Harga (Rp)
        </label>
        <input
          id="harga"
          name="harga"
          type="number"
          min="0"
          step="500"
          defaultValue={initialValues?.harga}
          className="mb-4 w-full rounded-lg border border-zinc-300 px-4 py-3 text-base focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
        />

        <label
          htmlFor="kategori"
          className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Kategori
        </label>
        <input
          id="kategori"
          name="kategori"
          type="text"
          defaultValue={initialValues?.kategori}
          className="mb-4 w-full rounded-lg border border-zinc-300 px-4 py-3 text-base focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
        />

        {state.error && (
          <p className="mb-4 text-sm text-red-600 dark:text-red-400">
            {state.error}
          </p>
        )}

        <div className="flex gap-3">
          <Link
            href="/menu"
            className="flex-1 rounded-lg border border-zinc-300 px-4 py-3 text-center text-base font-medium text-zinc-700 dark:border-zinc-700 dark:text-zinc-300"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={pending}
            className="flex-1 rounded-lg bg-zinc-900 px-4 py-3 text-base font-medium text-white disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900"
          >
            {pending ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </form>
    </div>
  );
}
