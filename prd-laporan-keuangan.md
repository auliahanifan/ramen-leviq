# PRD: Laporan Keuangan (Financial Report)

## Context

Ramen-leviq adalah aplikasi kasir (POS) untuk restoran ramen — memilih meja, membuat
order, checkout, dan mencetak struk digital. Setiap order sudah tersimpan lengkap di
Supabase (status, total, metode bayar, diskon/service/pajak, item per order), tapi
**saat ini tidak ada satu pun halaman laporan atau ringkasan** — pemilik/kasir tidak
punya cara untuk melihat total omzet, metode bayar mana yang paling sering dipakai,
atau menu apa yang paling laku, selain membuka order satu per satu.

Fitur ini menambahkan halaman "Laporan" pertama di aplikasi: ringkasan keuangan per
periode (hari ini / minggu ini / bulan ini) yang dihitung dari data order yang sudah
ada — tanpa perubahan skema database.

## Goals

1. Pemilik/kasir bisa melihat total omzet dan jumlah order dalam satu periode tanpa
   membuka order satu per satu.
2. Bisa melihat breakdown metode pembayaran (cash/QRIS/kartu/transfer) untuk
   rekonsiliasi kasir harian.
3. Bisa melihat menu paling laku (qty dan kontribusi omzet) untuk keputusan stok/menu.
4. Bisa melihat total diskon, service charge, dan pajak yang berjalan dalam periode.

## Non-Goals (v1)

- **Export** (CSV/PDF) — tidak termasuk di v1, lihat "Kemungkinan Lanjutan" di bawah.
- **Custom date range** — hanya preset (Hari ini/Minggu ini/Bulan ini), tidak ada
  date picker bebas.
- **Rekonsiliasi uang tunai** (uang diterima vs kembalian) — data ini tidak pernah
  disimpan di database (hanya lewat query string ke halaman struk), jadi di luar
  scope kecuali ada perubahan skema terpisah.
- **Role/akses khusus admin** — aplikasi ini memakai satu password bersama untuk
  semua pengguna (tidak ada pembedaan kasir vs pemilik); laporan memakai gerbang
  akses yang sama seperti halaman lain, tidak ada pembatasan baru.

## Requirements

### Filter periode
- Tiga preset: **Hari ini**, **Minggu ini** (mulai Senin), **Bulan ini** (kalender
  bulan berjalan) — bukan date range bebas.
- Default ke "Hari ini" saat halaman dibuka.
- Perhitungan boundary periode harus di zona waktu **WIB (UTC+7)**, bukan UTC —
  lihat catatan teknis di bawah, ini poin yang gampang salah kalau lupa.

### Data yang dihitung
Semua angka **hanya menghitung order dengan `status = 'paid'`**. Order berstatus
`open` atau `cancelled` dikecualikan total dari perhitungan (tidak ditampilkan sama
sekali, bahkan sebagai catatan terpisah). Boundary periode difilter berdasarkan
`paid_at`, bukan `created_at` — order yang dibuka larut malam tapi dibayar besok
paginya harus masuk hitungan hari pembayarannya, bukan hari order dibuka.

1. **Ringkasan omzet**: total omzet (sum `total`), jumlah order, rata-rata per
   order.
2. **Breakdown metode pembayaran**: total per cash/QRIS/kartu/transfer. Metode
   dengan 0 transaksi tetap ditampilkan sebagai Rp0, tidak disembunyikan —
   konsistensi tampilan lebih penting daripada meringkas baris kosong.
3. **Menu terlaris**: ranking menu berdasarkan qty terjual, dengan kontribusi
   omzet per menu. Urutan: qty desc → omzet desc (tie-breaker) → nama asc
   (tie-breaker final, supaya urutan tidak berubah-ubah antar render).
4. **Diskon/service/pajak**: total nominal diskon (sudah tersimpan sebagai angka
   rupiah final di kolom `orders.discount`, tidak perlu logika persen/nominal
   ulang di laporan), total service charge, total pajak dalam periode.

### Kondisi kosong
Jika tidak ada order `paid` dalam periode, semua kartu tetap tampil dengan
angka Rp0/0 (bukan disembunyikan) — supaya jelas laporan sudah jalan dan
periodenya memang sepi, bukan error.

## Technical Approach

- **Route baru**: `app/(app)/laporan/page.tsx` (Server Component, mengikuti pola
  `app/(app)/page.tsx` — `export const dynamic = "force-dynamic"`, query Supabase
  langsung di komponen). Filter periode lewat search param `?period=hari|minggu|bulan`
  (link-based, tanpa client state).
- Tambah entri nav baru "Laporan" di `app/(app)/_components/app-nav.tsx`, setelah
  "Menu" dan sebelum "Pengaturan".
- **Query data**: dua query Supabase, agregasi dilakukan in-memory di Server
  Component (pola yang sama seperti reduce di `app/(app)/orders/[id]/page.tsx` —
  tidak perlu RPC/SQL view untuk volume data sebesar ini):
  1. `orders` (status='paid', filter `paid_at` sesuai boundary periode) → dipakai
     untuk ringkasan omzet, breakdown metode bayar, dan total diskon/service/pajak.
  2. `order_items` join `menu_items(nama)`, difilter ke `order_id` hasil query 1 →
     dipakai untuk agregasi menu terlaris.
- **Gotcha zona waktu (penting)**: `paid_at` tersimpan sebagai UTC di database.
  WIB = UTC+7 tanpa DST, jadi boundary "hari ini" TIDAK BOLEH dihitung dari
  `new Date().toISOString()` langsung (itu hari UTC, yang bergeser 7 jam dari hari
  WIB). Pendekatan: geser waktu "now" +7 jam untuk dapat tanggal lokal WIB, hitung
  boundary hari/minggu/bulan dari situ, lalu geser balik -7 jam sebelum dipakai di
  query `.gte()/.lt()`. Sebaiknya taruh logika ini di satu helper kecil
  (misal `lib/wib-period.ts`) supaya tidak salah ketik ulang di tempat lain.
- **Reuse komponen**: `card.tsx` dan `line-row.tsx` untuk kartu ringkasan/metode
  bayar/diskon-pajak, `price.tsx` untuk semua angka rupiah (Geist Mono
  tabular-nums, sesuai `design.md`). Komponen baru yang perlu dibuat: tabel/daftar
  menu terlaris (pola desktop-table + mobile-card seperti `MenuItemRow`/
  `MenuItemCard` di halaman `/menu`).
- Mengikuti macrostructure **Catalogue/spec sheet** dari `design.md` — tidak ada
  elemen dekoratif baru, halaman ini murni fungsional seperti halaman lain
  (kecuali struk).

## Kemungkinan Lanjutan (di luar v1, dicatat untuk referensi)
- Export CSV/PDF untuk laporan ke pemilik/pembukuan eksternal.
- Custom date range di luar 3 preset.
- Rekonsiliasi kas (uang tunai diterima vs kembalian) — butuh kolom baru di
  `orders` untuk menyimpan `cash_received`.

## Verifikasi
- Buka `/laporan` di tiap preset periode, bandingkan angka dengan hitung manual
  dari beberapa order `paid` di Supabase (lewat MCP Supabase `execute_sql` atau
  dashboard) untuk memastikan sum dan filter `paid_at` benar.
- Uji dengan periode yang tidak punya order `paid` sama sekali → pastikan kartu
  tampil Rp0/0, bukan error atau halaman kosong.
- Uji boundary tengah malam WIB: buat/bayar order sekitar pukul 00:00–01:00 WIB,
  pastikan masuk hitungan hari yang benar (bukan tergeser ke hari sebelumnya
  karena bug UTC).
- Cek tampilan responsif (mobile card list vs desktop table) untuk seksi menu
  terlaris, dan pastikan tidak ada elemen visual baru yang melanggar `design.md`.
