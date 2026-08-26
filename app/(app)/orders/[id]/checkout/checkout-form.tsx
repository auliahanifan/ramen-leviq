"use client";

import { useActionState, useMemo, useState } from "react";
import type { PayState } from "./actions";
import { Card } from "../../../_components/card";
import { Button } from "../../../_components/button";
import { Label, inputClass, ErrorText } from "../../../_components/field";
import { LineRow } from "../../../_components/line-row";

const initialState: PayState = {};

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
    <Card accentEdge className="w-full max-w-md">
      <form action={formAction}>
        <input type="hidden" name="discount_type" value={discountType} />
        <input type="hidden" name="discount_value" value={discountValue} />
        <input type="hidden" name="payment_method" value={paymentMethod} />
        {paymentMethod === "cash" && (
          <input type="hidden" name="cash_paid" value={cashPaid} />
        )}

        <div className="mb-6 space-y-3">
          <LineRow label="Subtotal" value={subtotal} />

          <div>
            <Label htmlFor="discount_value">Diskon</Label>
            <div className="flex gap-2">
              <select
                value={discountType}
                onChange={(e) =>
                  setDiscountType(e.target.value as "nominal" | "percent")
                }
                className={`${inputClass()} w-24`}
              >
                <option value="nominal">Rp</option>
                <option value="percent">%</option>
              </select>
              <input
                id="discount_value"
                type="number"
                min="0"
                step={discountType === "percent" ? "0.1" : "500"}
                value={discountValue}
                onChange={(e) => setDiscountValue(Number(e.target.value))}
                className={`${inputClass()} flex-1`}
              />
            </div>
          </div>

          <LineRow label="Diskon" value={calc.discountAmount} sign="-" />
          <LineRow
            label={`Service Charge (${serviceChargePercent}%)`}
            value={calc.serviceChargeAmount}
            sign="+"
          />
          <LineRow label={`PPN (${taxPercent}%)`} value={calc.taxAmount} sign="+" />
          <LineRow label="Total" value={calc.total} emphasis />
        </div>

        <div className="mb-6">
          <Label htmlFor="payment_method_select">Metode Pembayaran</Label>
          <select
            id="payment_method_select"
            value={paymentMethod}
            onChange={(e) =>
              setPaymentMethod(
                e.target.value as "cash" | "qris" | "card" | "transfer"
              )
            }
            className={inputClass()}
          >
            <option value="cash">Tunai</option>
            <option value="qris">QRIS</option>
            <option value="card">Kartu</option>
            <option value="transfer">Transfer</option>
          </select>
        </div>

        {paymentMethod === "cash" && (
          <div className="mb-6 space-y-3">
            <div>
              <Label htmlFor="cash_paid_input">Jumlah Dibayar</Label>
              <input
                id="cash_paid_input"
                type="number"
                min="0"
                step="1000"
                value={cashPaid}
                onChange={(e) => setCashPaid(Number(e.target.value))}
                className={inputClass({ error: cashInsufficient })}
              />
            </div>
            <LineRow label="Kembalian" value={Math.max(calc.change, 0)} />
            {cashInsufficient && (
              <ErrorText>Jumlah dibayar kurang dari total</ErrorText>
            )}
          </div>
        )}

        {state.error && <ErrorText>{state.error}</ErrorText>}

        <Button type="submit" fullWidth disabled={pending || cashInsufficient}>
          {pending ? "Memproses..." : "Bayar"}
        </Button>
      </form>
    </Card>
  );
}
