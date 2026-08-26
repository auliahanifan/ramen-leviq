"use client";

import { useActionState } from "react";
import type { MenuFormState } from "./actions";
import { Card } from "../_components/card";
import { Button, ButtonLink } from "../_components/button";
import { Label, inputClass, ErrorText } from "../_components/field";

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
    <div className="flex flex-1 items-center justify-center bg-paper px-4 py-12">
      <Card accentEdge className="w-full max-w-sm">
        <form action={formAction}>
          <h1 className="mb-6 font-display text-2xl font-bold text-ink">
            {title}
          </h1>

          <Label htmlFor="nama">Nama</Label>
          <input
            id="nama"
            name="nama"
            type="text"
            defaultValue={initialValues?.nama}
            autoFocus
            className={`mb-4 ${inputClass()}`}
          />

          <Label htmlFor="harga">Harga (Rp)</Label>
          <input
            id="harga"
            name="harga"
            type="number"
            min="0"
            step="500"
            defaultValue={initialValues?.harga}
            className={`mb-4 ${inputClass()}`}
          />

          <Label htmlFor="kategori">Kategori</Label>
          <input
            id="kategori"
            name="kategori"
            type="text"
            defaultValue={initialValues?.kategori}
            className={`mb-4 ${inputClass()}`}
          />

          {state.error && <ErrorText>{state.error}</ErrorText>}

          <div className="mt-2 flex gap-3">
            <ButtonLink href="/menu" variant="secondary" fullWidth>
              Batal
            </ButtonLink>
            <Button type="submit" fullWidth disabled={pending}>
              {pending ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
