"use client";

import { useTransition } from "react";

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
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="rounded-lg border border-red-300 px-4 py-3 text-base font-medium text-red-600 disabled:opacity-60 dark:border-red-800 dark:text-red-400"
    >
      {isPending ? "Membatalkan..." : "Batalkan Pesanan"}
    </button>
  );
}
