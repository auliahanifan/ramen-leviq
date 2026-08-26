import Link from "next/link";

const tileBase =
  "flex aspect-square w-full flex-col items-center justify-center gap-1 rounded-tile transition-transform duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-paper";

export function OccupiedTableTile({
  nomor,
  orderId,
}: {
  nomor: number;
  orderId: string;
}) {
  return (
    <Link
      href={`/orders/${orderId}`}
      className={`${tileBase} bg-status-stop text-status-stop-ink shadow-offset`}
    >
      <span className="font-display text-stat font-bold">{nomor}</span>
      <span className="text-xs font-semibold tracking-wide uppercase">
        Terisi
      </span>
    </Link>
  );
}

export function EmptyTableTile({
  nomor,
  action,
}: {
  nomor: number;
  action: () => void;
}) {
  return (
    <form action={action}>
      <button type="submit" className={`${tileBase} bg-status-go text-status-go-ink`}>
        <span className="font-display text-stat font-bold">{nomor}</span>
        <span className="text-xs font-semibold tracking-wide uppercase">
          Kosong
        </span>
      </button>
    </form>
  );
}
