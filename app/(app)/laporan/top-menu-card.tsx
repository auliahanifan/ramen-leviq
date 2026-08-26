import { Price } from "../_components/price";
import type { TopMenuItem } from "./top-menu-row";

export default function TopMenuCard({ item }: { item: TopMenuItem }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-rule p-4 last:border-0">
      <div>
        <p className="text-base font-medium text-ink">{item.nama}</p>
        <p className="text-sm text-muted">{item.qty} terjual</p>
      </div>
      <Price value={item.omzet} className="text-ink" />
    </div>
  );
}
