"use client";

import Link from "next/link";
import { useMenuItemActions } from "./use-menu-item-actions";
import type { Tables } from "@/lib/database.types";
import { Badge } from "../_components/badge";
import { Price } from "../_components/price";
import { ErrorText } from "../_components/field";

export default function MenuItemCard({
  item,
}: {
  item: Tables<"menu_items">;
}) {
  const { isPending, error, handleToggle, handleDelete } =
    useMenuItemActions(item);

  return (
    <div className="border-b border-rule p-4 last:border-0">
      <div className="mb-2 flex items-start justify-between gap-3">
        <div>
          <p className="text-base font-medium text-ink">{item.nama}</p>
          <p className="text-sm text-muted">
            {item.kategori} &middot; <Price value={item.harga} />
          </p>
        </div>
        <button
          type="button"
          onClick={handleToggle}
          disabled={isPending}
          className="shrink-0 disabled:opacity-60"
        >
          <Badge tone={item.is_available ? "available" : "unavailable"}>
            {item.is_available ? "Tersedia" : "Habis"}
          </Badge>
        </button>
      </div>

      {error && <ErrorText>{error}</ErrorText>}

      <div className="flex gap-4 text-sm">
        <Link href={`/menu/${item.id}/edit`} className="font-medium text-ink-2">
          Edit
        </Link>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          className="font-medium text-error disabled:opacity-60"
        >
          Hapus
        </button>
      </div>
    </div>
  );
}
