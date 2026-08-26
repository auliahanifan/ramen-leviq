import Link from "next/link";
import type { ComponentProps } from "react";

type Variant = "primary" | "secondary" | "destructive" | "muted";
type Size = "default" | "compact";

const base =
  "inline-flex items-center justify-center rounded-button text-center font-medium transition-[transform,background-color,opacity] duration-150 ease-out active:translate-y-px disabled:opacity-50 disabled:pointer-events-none disabled:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-paper";

const sizes: Record<Size, string> = {
  default: "min-h-14 px-4 text-base",
  compact: "min-h-10 px-3 text-sm",
};

const variants: Record<Variant, string> = {
  primary: "bg-accent text-accent-ink shadow-offset",
  secondary: "border-2 border-ink-2 text-ink-2 bg-transparent",
  destructive: "border-2 border-error text-error bg-transparent",
  muted: "bg-paper-3 text-muted",
};

type ButtonOwnProps = {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
};

export function Button({
  variant = "primary",
  size = "default",
  fullWidth,
  className = "",
  ...props
}: ButtonOwnProps & ComponentProps<"button">) {
  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${
        fullWidth ? "w-full" : ""
      } ${className}`}
      {...props}
    />
  );
}

export function ButtonLink({
  variant = "primary",
  size = "default",
  fullWidth,
  className = "",
  ...props
}: ButtonOwnProps & ComponentProps<typeof Link>) {
  return (
    <Link
      className={`${base} ${sizes[size]} ${variants[variant]} ${
        fullWidth ? "w-full" : ""
      } ${className}`}
      {...props}
    />
  );
}
