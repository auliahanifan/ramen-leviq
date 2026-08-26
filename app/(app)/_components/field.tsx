import type { ComponentProps, ReactNode } from "react";

export function Label(props: ComponentProps<"label">) {
  return (
    <label
      {...props}
      className={`mb-2 block text-sm font-medium text-ink-2 ${
        props.className ?? ""
      }`}
    />
  );
}

const base =
  "w-full rounded-input border-2 bg-paper px-4 py-3 text-base text-ink transition-colors duration-150 ease-out placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:opacity-50 disabled:pointer-events-none";

export function inputClass({ error = false }: { error?: boolean } = {}) {
  return `${base} ${error ? "border-error" : "border-rule hover:border-ink-2"}`;
}

export function ErrorText({ children }: { children: ReactNode }) {
  return <p className="mt-2 text-sm text-error">{children}</p>;
}

export function SuccessText({ children }: { children: ReactNode }) {
  return <p className="mt-2 text-sm text-status-go-ink">{children}</p>;
}

export function HelperText({ children }: { children: ReactNode }) {
  return <p className="mt-2 text-sm text-muted">{children}</p>;
}
