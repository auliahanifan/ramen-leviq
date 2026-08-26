"use client";

import { useTransition } from "react";
import { Button } from "../../_components/button";

export default function CancelOrderButton({
  action,
}: {
  action: () => Promise<void>;
}) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!window.confirm("Batalkan pesanan ini? Meja akan kembali kosong.")) {
      return;
    }
    startTransition(() => {
      action();
    });
  }

  return (
    <Button
      type="button"
      variant="destructive"
      onClick={handleClick}
      disabled={isPending}
    >
      {isPending ? "Membatalkan..." : "Batalkan Pesanan"}
    </Button>
  );
}
