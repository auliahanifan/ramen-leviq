"use client";

import Link from "next/link";
import { useMenuItemActions } from "./use-menu-item-actions";
import type { Tables } from "@/lib/database.types";
import { Badge } from "../_components/badge";
import { Price } from "../_components/price";
import { ErrorText } from "../_components/field";

export default function MenuItemRow({
  item,
}: {
  item: Tables<"menu_items">;
}) {
  const { isPending, error, handleToggle, handleDelete } =
    useMenuItemActions(item);

  return (
    <tr className="border-b border-rule">
      <td className="px-4 py-3 text-sm text-ink">{item.nama}</td>
      <td className="px-4 py-3 text-sm text-ink-2">{item.kategori}</td>
      <td className="px-4 py-3 text-sm text-ink">
        <Price value={item.harga} />
      </td>
      <td className="px-4 py-3">
        <button type="button" onClick={handleToggle} disabled={isPending} className="disabled:opacity-60">
          <Badge tone={item.is_available ? "available" : "unavailable"}>
            {item.is_available ? "Tersedia" : "Habis"}
          </Badge>
        </button>
        {error && <ErrorText>{error}</ErrorText>}
      </td>
      <td className="px-4 py-3 text-right text-sm">
        <Link
          href={`/menu/${item.id}/edit`}
          className="mr-3 font-medium text-ink-2 hover:underline"
        >
          Edit
        </Link>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          className="font-medium text-error hover:underline disabled:opacity-60"
        >
          Hapus
        </button>
      </td>
    </tr>
  );
}
