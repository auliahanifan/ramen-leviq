import { Price } from "../_components/price";

export type TopMenuItem = {
  nama: string;
  qty: number;
  omzet: number;
};

export default function TopMenuRow({ item }: { item: TopMenuItem }) {
  return (
    <tr className="border-b border-rule last:border-0">
      <td className="px-4 py-3 text-sm text-ink">{item.nama}</td>
      <td className="px-4 py-3 text-sm font-outlier text-ink-2">{item.qty}</td>
      <td className="px-4 py-3 text-right text-sm text-ink">
        <Price value={item.omzet} />
      </td>
    </tr>
  );
}
