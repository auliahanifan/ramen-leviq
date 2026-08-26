# Design — Kasir Ramen

A locked design system for this app. Every page redesign reads this file before
emitting code. Do not regenerate per page — extend or amend this file when the
system needs to grow.

## Genre
Editorial (Hallmark default — no SaaS/atmospheric/playful signal fires for an
operational POS tool).

## Macrostructure family

This app has no marketing pages; Hallmark's 21 macrostructures are landing-page
shapes and none apply directly. Four custom, app-specific structures instead,
all built from the typography/color/spacing/motion rules below:

- **Index tiles** (home `/`): a grid of stateful, fully color-blocked tiles.
  One tile = one table. Color IS the information (see accent-usage note below).
- **Catalogue / spec sheet** (`/menu`, order line-items): card list on mobile,
  hairline-ruled table on desktop. Numbers always in `--font-outlier`.
- **Ticket form** (checkout, settings, login, menu new/edit): single centered
  card, `--radius-card`, a solid top edge in `--color-accent-2`, labels-above-
  inputs, full-width primary CTA at the bottom.
- **Receipt** (`/orders/[id]/receipt`): a Ticket Form variant that reads as a
  closing document rather than an interactive screen — the one place a small
  enrichment (a rotated "LUNAS" stamp) is allowed.
- **App shell**: persistent top bar — bold display wordmark, double rule
  beneath in `--color-accent-2`, active route underlined in `--color-accent`.
  Exception: `/order` (public self-order, no staff login) renders without
  this shell — it's reached by customers scanning a table QR, so the
  staff nav (Menu/Laporan/Pengaturan) must not appear. It composes
  Catalogue/spec sheet (menu) and Ticket form (cart summary) directly,
  same tokens/components as every other page.

## Theme

Catalog theme **Carnival**, palette **Diner Sign** (food/hospitality/street-
market routing) — tuned for app use. Kept: the duo-tone accent system and the
hard-offset-shadow CTA signature. Dropped: the purely decorative marketing
moves (ornaments, halftone fill, marquee scroll) — this is an operational
tool, function carries every screen except the receipt.

- `--color-paper`         oklch(95% 0.035 90)   bright cream
- `--color-paper-2`       oklch(91% 0.042 88)
- `--color-paper-3`       oklch(86% 0.050 85)
- `--color-ink`           oklch(18% 0.045 30)   black-brown
- `--color-ink-2`         oklch(30% 0.050 30)
- `--color-muted`         oklch(46% 0.035 35)
- `--color-rule`          oklch(78% 0.030 85)
- `--color-accent`        oklch(60% 0.220 25)   cherry red — primary CTA, "occupied"
- `--color-accent-2`      oklch(32% 0.140 250)  navy — secondary CTA, nav rule, "paid"
- `--color-accent-ink`    oklch(97% 0.020 90)   cream text on accent fill
- `--color-focus`         oklch(55% 0.190 250)  navy — distinct hue so the ring never
                                                  disappears on a red button
- `--color-status-go`     oklch(90% 0.070 150)  pale mint — "Kosong" tile fill
- `--color-status-stop`   = `--color-accent`    cherry — "Terisi" tile fill
- `--color-error`         oklch(50% 0.190 20)

Dark mode mirrors via `prefers-color-scheme`: paper inverts to near-black warm
browns, ink inverts to warm cream, accent lightens / desaturates slightly per
standard dark-mode OKLCH adjustment (+L, −C) so it doesn't glare.

**Accent-usage note (explicit tension, resolved):** Hallmark's general color
rule caps decorative accent at ≤5% of viewport. Status color (table tile
fill, availability badge) is exempt — it is *signal*, not decoration: the
color is the fact the owner is scanning for, so it may cover a full tile.
Everywhere else (backgrounds, dividers, non-status buttons, nav), the ≤5%
discipline holds. Status color is also never the only signal — every status
tile/badge carries the status word as text too.

## Typography

Three families (Hallmark's ceiling):

- **Display** — Big Shoulders (Google's "Display" cut was merged into this
  variable family; loaded at weight 800/900 via `next/font/google`), 800 for
  headings/table numbers/section titles, 900 for the wordmark. Condensed
  industrial poster grotesk — the street-signage register the brief asked
  for.
- **Body** — Geist, weight 400/500. Already loaded via `next/font`; this
  redesign is what finally wires it to `<body>`.
- **Outlier** — Geist Mono, one consistent role app-wide: every price / qty /
  total figure, `font-variant-numeric: tabular-nums`.

Type scale (1.25 ratio, 16px base): `--text-xs 0.75rem`, `--text-sm 0.875rem`,
`--text-base 1rem`, `--text-md 1.25rem`, `--text-lg 1.5625rem`,
`--text-xl 1.9531rem`, `--text-2xl 2.4414rem`, `--text-3xl 3.0518rem`,
`--text-display clamp(2.25rem, 4vw + 1rem, 3.5rem)` (section titles, "Meja N"),
`--text-stat clamp(2rem, 6vw, 3rem)` (checkout/receipt totals, table tile
numbers — short content, allowed to grow).

Headings and CTAs are roman, never italic. ALL CAPS is reserved for status
tags only (`KOSONG` / `TERISI` / `TERSEDIA` / `HABIS` / `LUNAS`) — everywhere
else, sentence case, because a zero-training user reads sentence case faster
than poster caps.

## Spacing

Tailwind's default numeric scale (`--spacing: 0.25rem` base unit — already a
4-pt scale), used directly (`p-4`, `gap-6`, `py-8`, …). Named `sm`/`md`/`lg`/
`xl`/`2xl`/`3xl` spacing tokens were tried and dropped: Tailwind v4 resolves
`max-w-{name}` / `w-{name}` / `h-{name}` against the same named-suffix space
as the spacing scale, so a custom `--spacing-sm` silently shadows the built-in
`max-w-sm` (24rem) breakpoint-style value. Stick to the numeric scale for any
new spacing token to avoid this collision.

## Radius

`--radius-input` / `--radius-button` 0.75rem · `--radius-card` 1.25rem ·
`--radius-tile` 1.5rem (table/menu tap tiles — chunkiest, they're the primary
touch target) · `--radius-pill` 999px (status badges).

## Motion

- Easings: `--ease-out: cubic-bezier(0.16, 1, 0.3, 1)`,
  `--ease-in: cubic-bezier(0.7, 0, 0.84, 0)`.
- Durations: micro 120ms (button press) · short 220ms (hover/focus) ·
  long 420ms (route transition).
- **No scroll-reveal, no page-load stagger anywhere in this app.** Deliberate
  carve-out from Hallmark's usual reveal patterns — the owner needs speed,
  not spectacle. Motion budget is spent entirely on state feedback: button
  press (`translateY(1px)` + darken), instant focus ring (never animated),
  loading/disabled states, and a single fade on checkout → receipt.
- `prefers-reduced-motion: reduce` collapses everything to opacity-only,
  ≤150ms.

## Microinteractions stance

- Silent success everywhere — no celebratory toasts. A new order-item row
  appearing, or a table tile changing color, IS the feedback.
- Hover delay irrelevant (touch-first device); focus states are instant.
- Destructive actions (cancel order, delete menu item) keep a native
  `confirm()` — no custom modal needed for a single-user tool.

## CTA voice

- **Primary**: filled `--color-accent` (or `--color-accent-2` where a screen
  already uses accent for status), `--radius-button`, offset shadow
  `2px 2px 0 var(--color-ink)`, `--color-accent-ink` text, sentence-case
  short imperative Indonesian verb, min-height 56px.
- **Secondary/outline**: transparent fill, `2px solid var(--color-ink-2)`
  border, same shape/height, no shadow.
- **Destructive**: outline variant with `--color-error` border/text.

## Per-page allowances

- App pages (everything except the receipt) MUST NOT use enrichment —
  function carries the page.
- The receipt MAY use one small enrichment (rotated "LUNAS" stamp) — it
  behaves like a generated document, not an interactive screen.

## What pages MUST share

The wordmark, the accent/status color system, the display+body+mono font
trio, the CTA voice (shape/radius/shadow/padding), the nav shell.

## What pages MAY differ on

Which of the four macrostructure families they use, and — receipt only —
the one enrichment allowance above.

## Exports

### tokens.css
See `app/globals.css` — the token block is defined there directly (single-app
project, no separate `tokens.css` needed since there's exactly one consumer).
