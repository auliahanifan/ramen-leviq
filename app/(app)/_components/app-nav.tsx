"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Meja" },
  { href: "/menu", label: "Menu" },
  { href: "/settings", label: "Pengaturan" },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav className="border-b-4 border-double border-accent-2 bg-paper-2 px-4 py-3">
      <div className="mx-auto flex w-full max-w-3xl items-center gap-6">
        <span className="font-display text-lg font-black tracking-tight text-ink">
          Kasir Ramen
        </span>
        <div className="flex items-center gap-5">
          {LINKS.map((link) => {
            const isActive =
              link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors duration-150 ease-out ${
                  isActive
                    ? "text-accent underline decoration-2 underline-offset-4"
                    : "text-ink-2 hover:text-ink"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
