"use client";

import { useActionState, useMemo, useState } from "react";
import type { PayState } from "./actions";

const initialState: PayState = {};

function formatRupiah(n: number) {
  return `Rp${Math.round(n).toLocaleString("id-ID")}`;
}

export default function CheckoutForm({
  action,
  subtotal,
  taxPercent,
  serviceChargePercent,
}: {
  action: (prevState: PayState, formData: FormData) => Promise<PayState>;
  subtotal: number;
  taxPercent: number;
  serviceChargePercent: number;
}) {
  const [discountType, setDiscountType] = useState<"nominal" | "percent">(
    "nominal"
  );
  const [discountValue, setDiscountValue] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<
    "cash" | "qris" | "card" | "transfer"
  >("cash");
  const [cashPaid, setCashPaid] = useState(0);

  const [state, formAction, pending] = useActionState(action, initialState);

  const calc = useMemo(() => {
    let discountAmount =
      discountType === "percent"
        ? subtotal * (discountValue / 100)
        : discountValue;
    discountAmount = Math.round(
      Math.min(Math.max(discountAmount, 0), subtotal)
    );
    const afterDiscount = subtotal - discountAmount;
    const serviceChargeAmount = Math.round(
      afterDiscount * (serviceChargePercent / 100)
    );
    const afterServiceCharge = afterDiscount + serviceChargeAmount;
    const taxAmount = Math.round(afterServiceCharge * (taxPercent / 100));
    const total = afterServiceCharge + taxAmount;
    const change = cashPaid - total;
    return { discountAmount, serviceChargeAmount, taxAmount, total, change };
  }, [subtotal, discountType, discountValue, serviceChargePercent, taxPercent, cashPaid]);

  const cashInsufficient = paymentMethod === "cash" && calc.change < 0;

  return (
    <form
      action={formAction}
      className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
    >
      <input type="hidden" name="discount_type" value={discountType} />
      <input type="hidden" name="discount_value" value={discountValue} />
      <input type="hidden" name="payment_method" value={paymentMethod} />
      {paymentMethod === "cash" && (
        <input type="hidden" name="cash_paid" value={cashPaid} />
      )}

      <div className="mb-4 space-y-2 text-sm">
        <div className="flex justify-between text-zinc-700 dark:text-zinc-300">
          <span>Subtotal</span>
          <span>{formatRupiah(subtotal)}</span>
        </div>

        <div>
          <label className="mb-1 block font-medium text-zinc-700 dark:text-zinc-300">
            Diskon
          </label>
          <div className="flex gap-2">
            <select
              value={discountType}
              onChange={(e) =>
                setDiscountType(e.target.value as "nominal" | "percent")
              }
              className="rounded-lg border border-zinc-300 px-2 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            >
              <option value="nominal">Rp</option>
              <option value="percent">%</option>
            </select>
            <input
              type="number"
              min="0"
              step={discountType === "percent" ? "0.1" : "500"}
              value={discountValue}
              onChange={(e) => setDiscountValue(Number(e.target.value))}
              className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>
        </div>

        <div className="flex justify-between text-zinc-700 dark:text-zinc-300">
          <span>Diskon</span>
          <span>-{formatRupiah(calc.discountAmount)}</span>
        </div>
        <div className="flex justify-between text-zinc-700 dark:text-zinc-300">
          <span>Service Charge ({serviceChargePercent}%)</span>
          <span>+{formatRupiah(calc.serviceChargeAmount)}</span>
        </div>
        <div className="flex justify-between text-zinc-700 dark:text-zinc-300">
          <span>PPN ({taxPercent}%)</span>
          <span>+{formatRupiah(calc.taxAmount)}</span>
        </div>
        <div className="flex justify-between border-t border-zinc-200 pt-2 text-base font-semibold text-zinc-900 dark:border-zinc-800 dark:text-zinc-50">
          <span>Total</span>
          <span>{formatRupiah(calc.total)}</span>
        </div>
      </div>

      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Metode Pembayaran
        </label>
        <select
          value={paymentMethod}
          onChange={(e) =>
            setPaymentMethod(
              e.target.value as "cash" | "qris" | "card" | "transfer"
            )
          }
          className="w-full rounded-lg border border-zinc-300 px-3 py-3 text-base dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
        >
          <option value="cash">Tunai</option>
          <option value="qris">QRIS</option>
          <option value="card">Kartu</option>
          <option value="transfer">Transfer</option>
        </select>
      </div>

      {paymentMethod === "cash" && (
        <div className="mb-4 space-y-2 text-sm">
          <label className="mb-1 block font-medium text-zinc-700 dark:text-zinc-300">
            Jumlah Dibayar
          </label>
          <input
            type="number"
            min="0"
            step="1000"
            value={cashPaid}
            onChange={(e) => setCashPaid(Number(e.target.value))}
            className="w-full rounded-lg border border-zinc-300 px-3 py-3 text-base dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
          <div className="flex justify-between text-zinc-700 dark:text-zinc-300">
            <span>Kembalian</span>
            <span>{formatRupiah(Math.max(calc.change, 0))}</span>
          </div>
          {cashInsufficient && (
            <p className="text-red-600 dark:text-red-400">
              Jumlah dibayar kurang dari total
            </p>
          )}
        </div>
      )}

      {state.error && (
        <p className="mb-4 text-sm text-red-600 dark:text-red-400">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending || cashInsufficient}
        className="w-full rounded-lg bg-zinc-900 px-4 py-3 text-base font-medium text-white disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900"
      >
        {pending ? "Memproses..." : "Bayar"}
      </button>
    </form>
  );
}
