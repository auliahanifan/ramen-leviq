"use client";

import { useActionState } from "react";
import { updateSettings, type SettingsState } from "./actions";
import { Card } from "../_components/card";
import { Button } from "../_components/button";
import { Label, inputClass, ErrorText, SuccessText } from "../_components/field";

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
    <Card accentEdge className="w-full max-w-sm">
      <form action={formAction}>
        <h1 className="mb-6 font-display text-2xl font-bold text-ink">
          Pengaturan
        </h1>

        <Label htmlFor="tax_percent">PPN (%)</Label>
        <input
          id="tax_percent"
          name="tax_percent"
          type="number"
          step="0.01"
          min="0"
          max="100"
          defaultValue={initialTaxPercent}
          className={`mb-4 ${inputClass()}`}
        />

        <Label htmlFor="service_charge_percent">Service Charge (%)</Label>
        <input
          id="service_charge_percent"
          name="service_charge_percent"
          type="number"
          step="0.01"
          min="0"
          max="100"
          defaultValue={initialServiceChargePercent}
          className={`mb-4 ${inputClass()}`}
        />

        {state.error && <ErrorText>{state.error}</ErrorText>}
        {state.success && <SuccessText>Pengaturan tersimpan</SuccessText>}

        <Button type="submit" fullWidth disabled={pending} className="mt-2">
          {pending ? "Menyimpan..." : "Simpan"}
        </Button>
      </form>
    </Card>
  );
}
