"use client";

import { useActionState } from "react";
import { updateSettings, type SettingsState } from "./actions";

const initialState: SettingsState = {};

export default function SettingsForm({
  initialTaxPercent,
  initialServiceChargePercent,
}: {
  initialTaxPercent: number;
  initialServiceChargePercent: number;
}) {
  const [state, formAction, pending] = useActionState(
    updateSettings,
    initialState
  );

  return (
    <form
      action={formAction}
      className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
    >
      <h1 className="mb-6 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        Pengaturan
      </h1>

      <label
        htmlFor="tax_percent"
        className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
      >
        PPN (%)
      </label>
      <input
        id="tax_percent"
        name="tax_percent"
        type="number"
        step="0.01"
        min="0"
        max="100"
        defaultValue={initialTaxPercent}
        className="mb-4 w-full rounded-lg border border-zinc-300 px-4 py-3 text-base focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
      />

      <label
        htmlFor="service_charge_percent"
        className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
      >
        Service Charge (%)
      </label>
      <input
        id="service_charge_percent"
        name="service_charge_percent"
        type="number"
        step="0.01"
        min="0"
        max="100"
        defaultValue={initialServiceChargePercent}
        className="mb-4 w-full rounded-lg border border-zinc-300 px-4 py-3 text-base focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
      />

      {state.error && (
        <p className="mb-4 text-sm text-red-600 dark:text-red-400">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="mb-4 text-sm text-green-600 dark:text-green-400">
          Pengaturan tersimpan
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-zinc-900 px-4 py-3 text-base font-medium text-white disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900"
      >
        {pending ? "Menyimpan..." : "Simpan"}
      </button>
    </form>
  );
}
