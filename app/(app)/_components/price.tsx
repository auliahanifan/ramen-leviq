export function formatRupiah(n: number) {
  return `Rp${Math.round(n).toLocaleString("id-ID")}`;
}

export function Price({
  value,
  className = "",
}: {
  value: number;
  className?: string;
}) {
  return (
    <span className={`font-outlier tabular-nums ${className}`}>
      {formatRupiah(value)}
    </span>
  );
}
