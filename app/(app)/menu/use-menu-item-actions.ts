"use client";

import { useState, useTransition } from "react";
import { deleteMenuItem, toggleAvailability } from "./actions";
import type { Tables } from "@/lib/database.types";

export function useMenuItemActions(item: Tables<"menu_items">) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleToggle() {
    setError(null);
    startTransition(async () => {
      const result = await toggleAvailability(item.id, item.is_available);
      if (result.error) setError(result.error);
    });
  }

  function handleDelete() {
    if (!window.confirm(`Hapus menu "${item.nama}"?`)) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteMenuItem(item.id);
      if (result.error) setError(result.error);
    });
  }

  return { isPending, error, handleToggle, handleDelete };
}
