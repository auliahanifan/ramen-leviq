# PRD: Order Mandiri dari Meja (Self-Order via QR)

## Context

Ramen-leviq saat ini adalah aplikasi kasir (POS) yang seluruhnya dioperasikan staff:
staff login, pilih meja, buat order (`startOrder`), tambah item satu-satu
(`addOrderItem`), lalu checkout di kasir (`payOrder`). Tidak ada jalur bagi
pelanggan untuk memesan sendiri — semua interaksi lewat staff.

Fitur ini menambahkan halaman publik baru **`/order`** yang bisa diakses pelanggan
lewat QR code di meja masing-masing, tanpa login. Pelanggan bisa lihat menu (dengan
foto), susun pesanan, lalu kirim — pesanan itu masuk ke **order yang sama persis**
yang sudah dipakai staff (`orders`/`order_items`/`tables`), jadi begitu terkirim,
langsung terlihat di layar staff seperti order manapun. Pembayaran **tetap di kasir**
seperti sekarang — fitur ini tidak menyentuh alur checkout.

## Goals

1. Pelanggan scan QR di mejanya → langsung lihat menu dan bisa pesan sendiri, tanpa
   menunggu staff dan tanpa login.
2. Pesanan pelanggan masuk sebagai "running tab" — satu order terbuka per meja yang
   bisa terus ditambah, sama seperti perilaku order yang sudah ada sekarang.
3. Staff bisa generate & cetak QR per meja dari halaman staff, cukup sekali setup.
4. Menu customer menampilkan foto (fitur baru — saat ini `menu_items` belum punya
   field foto sama sekali).
5. Semua alur staff yang sudah ada (tambah item, checkout, struk, laporan) tetap
   berjalan tanpa perubahan — order dari pelanggan hanya "data masuk lebih banyak
   cara", bukan sistem paralel.

## Non-Goals (v1)

- **Tanpa pembayaran online** — pelanggan tetap bayar di kasir seperti sekarang,
  `/order` tidak menyentuh `payOrder`/checkout sama sekali.
- **Tanpa login/verifikasi pelanggan** — hanya minta nama depan (sekali per
  device/meja), tidak ada nomor HP, OTP, atau akun.
- **Cart tidak realtime antar device** — kalau dua orang di satu meja buka `/order`
  di HP masing-masing, cart yang belum dikirim bersifat lokal per device. Yang sudah
  terkirim (running order) sama-sama terlihat, tapi cart yang sedang disusun tidak
  disinkronkan live.
- **Pelanggan tidak bisa hapus/edit item yang sudah terkirim** — kalau salah pesan,
  minta staff. Catatan jujur: staff saat ini juga **belum punya** tombol hapus/edit
  per item (hanya bisa batalkan seluruh order via `cancelOrder`) — jadi ini bukan
  regresi, tapi juga bukan solusi lengkap. Kalau ini jadi masalah nyata di lapangan,
  perlu PRD terpisah untuk edit/hapus item per baris (staff & customer).
- **Tanpa notifikasi realtime ke staff** — order dari pelanggan tampil di layar
  staff yang sudah ada (`/`, `/orders/[id]`) seperti order lain, staff lihat lewat
  refresh/navigasi normal, tidak ada suara/badge baru.
- **Tanpa rate-limiting/anti-spam** di endpoint publik — risiko dianggap rendah
  (QR fisik hanya bisa dijangkau orang yang benar-benar duduk di meja itu).

## Requirements

### QR per meja (sisi staff)
- Halaman staff baru yang menampilkan tiap meja beserta QR code yang mengarah ke
  `/order?table=<table_id>`.
- Tampilan print-friendly (staff cetak, gunting, tempel di meja) — tidak perlu
  export PDF terpisah, cukup print langsung dari browser.

### Halaman pelanggan `/order`
- Route publik, **tanpa** auth dan **tanpa** nav shell staff (Menu/Laporan/
  Pengaturan tidak boleh bocor ke halaman ini).
- Baca `table_id` dari query param `?table=`. Kalau param kosong/tidak valid →
  tampilkan pesan error yang jelas, bukan crash.
- Minta nama depan pelanggan sekali (disimpan di localStorage device tsb.) sebelum
  order pertama kali dikirim dari device itu.
- Tampilkan menu tersedia (`is_available = true`) dikelompokkan per kategori,
  dengan foto (kalau ada), nama, harga — mengikuti macrostructure
  **Catalogue/spec sheet** dari `design.md`.
- **Cart lokal**: pelanggan tambah item + qty ke cart, bisa ubah qty/hapus item
  *sebelum* dikirim. Satu tombol "Kirim Pesanan" mengirim seluruh isi cart sekaligus.
- Saat kirim:
  - Kalau meja belum punya order `open`, buat otomatis (perilaku sama seperti
    `startOrder`, tanpa langkah/tombol terpisah yang terlihat pelanggan) dan set
    status meja jadi `occupied`.
  - Semua item cart di-insert sebagai `order_items` dengan `customer_name` = nama
    yang tersimpan.
- Setelah kirim, tampilkan order yang sedang berjalan (item yang sudah terkirim +
  subtotal) — pelanggan bisa terus buka menu dan menambah lagi (running tab), sama
  seperti tampilan yang staff lihat di `/orders/[id]` hari ini.
- Kalau order untuk meja itu ternyata sudah `paid`/`cancelled` (mis. QR discan
  setelah sesi makan sebelumnya selesai tapi status meja belum di-reset) →
  tampilkan pesan ramah ("meja ini sudah checkout, panggil staff"), bukan error.

### Perubahan skema data
- `order_items`: tambah kolom `customer_name` (text, nullable — null untuk item
  yang ditambahkan staff lewat form yang sudah ada).
- `menu_items`: tambah kolom `image_url` (text, nullable).
- Storage bucket baru di Supabase (public read) untuk foto menu.
- Tidak ada tabel baru — semua reuse `tables`/`orders`/`order_items` yang sudah ada.

### Sentuhan di sisi staff
- `/orders/[id]`: tampilkan `customer_name` di samping item yang punya nilai
  (item tanpa nama berarti ditambahkan staff, tampil seperti sekarang).
- Form menu (`/menu/new`, `/menu/[id]`): tambah field upload foto → simpan ke
  Storage bucket, isi `image_url`.

## Technical Approach

- Route baru **di luar** grup `(app)` (yang saat ini jadi gerbang auth), mis.
  `app/order/page.tsx`, karena harus publik. Halaman ini perlu state interaktif
  (cart) jadi kombinasi Server Component (fetch data awal) + Client Component
  untuk cart, mengikuti pola `add-item-form.tsx` yang sudah ada tapi dengan state
  cart di client sebelum submit (bukan langsung insert per tap).
- Server actions baru:
  - Varian dari `startOrder` yang **return state, bukan selalu redirect** (halaman
    customer perlu tahu status order untuk render kondisional, beda kebutuhan dari
    tombol staff yang selalu redirect ke `/orders/[id]`).
  - `submitCartItems(orderId, customerName, items[])` — insert banyak baris
    `order_items` sekaligus (satu pemanggilan `.insert([...])`, atomic per
    statement Postgres), validasi `status='open'` dan `is_available` sama seperti
    `addOrderItem` yang sudah ada.
- Reuse komponen dari `_components` (`Card`, `Button`, `Price`, `Label`) untuk
  bagian yang cocok dengan macrostructure **Catalogue/spec sheet** (daftar menu)
  dan **Ticket form** (ringkasan cart sebelum kirim). Halaman tetap fungsional
  murni sesuai `design.md` ("Per-page allowances" — tidak ada enrichment baru).
- Upload foto: input file di `menu-form.tsx` → upload ke Storage bucket → simpan
  public URL ke `menu_items.image_url`.
- QR: generate di server/client pakai library QR ringan (mis. `qrcode`), render
  SVG per meja di halaman staff baru, print lewat CSS print biasa.
- **Catatan RLS (perlu diverifikasi sebelum deploy, bukan keputusan produk)**:
  `/order` akan memanggil Supabase pakai `NEXT_PUBLIC_SUPABASE_ANON_KEY` yang sama
  seperti seluruh app hari ini (lihat `lib/supabase.ts`). Karena selama ini semua
  write hanya pernah dipicu dari halaman yang di-gate login di level aplikasi
  (bukan RLS), perlu dicek apakah policy RLS di Supabase memang mengizinkan insert
  anonim ke `orders`/`order_items`/`tables`, supaya `/order` benar-benar bisa
  menulis dari luar sesi staff.

## Kemungkinan Lanjutan (di luar v1, dicatat untuk referensi)

- Notifikasi realtime ke staff (Supabase Realtime) saat order masuk dari pelanggan.
- Cart live yang tersinkron antar device di meja yang sama.
- Pelanggan bisa hapus/edit item yang baru dikirim sebelum diproses staff (butuh
  status baru per item: pending/confirmed).
- Pembayaran online (QRIS dinamis, e-wallet) supaya pelanggan bisa checkout sendiri.
- Rate-limiting/anti-spam di endpoint publik.
- Tombol "Panggil Staff" / "Minta Bill" di halaman pelanggan.
- Verifikasi nomor HP pelanggan untuk loyalitas atau notifikasi pesanan siap.

## Verifikasi

- Scan QR (atau buka URL manual) untuk meja tanpa order aktif → menu tampil, isi
  cart, kirim → order baru otomatis terbuat, status meja jadi `occupied`, cek
  muncul benar di `/` dan `/orders/[id]` staff.
- Kirim lagi ke meja yang sama (order masih `open`) → item baru masuk ke order yang
  sama (running tab), bukan bikin order duplikat (unique index tetap terjaga).
- Buka `/order` dengan `table` yang order-nya sudah `paid`/`cancelled` → pesan
  ramah, bukan error/crash.
- Buka `/order` tanpa param `table` atau `table_id` tidak valid → error state jelas.
- Tambah foto lewat form staff → tampil di halaman pelanggan; menu tanpa foto tetap
  rapi (bukan broken image).
- `customer_name` yang dikirim pelanggan muncul di `/orders/[id]` pada item yang
  relevan; item lama/dari staff tetap tampil normal tanpa nama.
- Generate & cetak QR dari halaman staff baru, scan pakai HP sungguhan → mendarat
  di `/order?table=<id>` yang benar.
- Cek tampilan mobile (target utama — pelanggan selalu dari HP) dan pastikan tidak
  ada elemen nav staff yang bocor ke halaman publik.
- Cek RLS Supabase: pastikan anon key bisa insert ke `order_items`/`orders`/
  `tables` tanpa cookie login staff, sebelum deploy ke production.
