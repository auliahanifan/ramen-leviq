import type { ComponentProps } from "react";

type Padding = "default" | "compact" | "none";

const paddings: Record<Padding, string> = {
  default: "p-6 sm:p-8",
  compact: "p-4",
  none: "",
};

export function Card({
  padding = "default",
  accentEdge = false,
  className = "",
  ...props
}: {
  padding?: Padding;
  /** Solid top edge in --color-accent-2, for the Ticket Form macrostructure. */
  accentEdge?: boolean;
} & ComponentProps<"div">) {
  return (
    <div
      className={`overflow-hidden rounded-card border border-rule bg-paper-2 ${
        accentEdge ? "border-t-4 border-t-accent-2" : ""
      } ${paddings[padding]} ${className}`}
      {...props}
    />
  );
}
