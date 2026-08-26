import type { ReactNode } from "react";

type Tone = "available" | "unavailable" | "info";

const tones: Record<Tone, string> = {
  available: "bg-status-go text-status-go-ink",
  unavailable: "bg-paper-3 text-muted",
  info: "bg-paper-3 text-ink-2",
};

export function Badge({
  tone,
  children,
}: {
  tone: Tone;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-pill px-3 py-1 text-xs font-semibold tracking-wide uppercase ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
