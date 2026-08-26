"use client";

import { useActionState } from "react";
import type { AddItemState } from "./actions";
import { Card } from "../../_components/card";
import { Button } from "../../_components/button";
import { Label, inputClass, ErrorText } from "../../_components/field";
import { formatRupiah } from "../../_components/price";

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
    <Card padding="compact">
      <form action={formAction} className="flex flex-wrap items-end gap-3">
        <div className="min-w-[180px] flex-1">
          <Label htmlFor="menu_item_id">Menu</Label>
          <select
            id="menu_item_id"
            name="menu_item_id"
            required
            defaultValue=""
            className={inputClass()}
          >
            <option value="" disabled>
              Pilih menu
            </option>
            {menuItems.map((item) => (
              <option key={item.id} value={item.id}>
                {item.nama} — {formatRupiah(item.harga)}
              </option>
            ))}
          </select>
        </div>

        <div className="w-24">
          <Label htmlFor="qty">Qty</Label>
          <input
            id="qty"
            name="qty"
            type="number"
            min="1"
            step="1"
            defaultValue={1}
            required
            className={inputClass()}
          />
        </div>

        <Button type="submit" disabled={pending}>
          {pending ? "Menambahkan..." : "Tambah"}
        </Button>

        {state.error && <ErrorText>{state.error}</ErrorText>}
      </form>
    </Card>
  );
}
