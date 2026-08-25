# Task List: Implementasi Kasir Warung Ramen (v1)

Diturunkan dari [PRD.md](./PRD.md). Dikerjakan berurutan per fase — setiap fase bergantung pada fase sebelumnya. Setiap task punya kriteria verifikasi eksplisit.

Stack: Next.js (App Router) + Supabase (DB/Auth backend) + Vercel (hosting).

---

## Fase 0 — Project Setup

- [ ] **0.1** Init project Next.js (TypeScript, App Router, Tailwind) di root repo.
  - Verify: `npm run dev` jalan tanpa error, halaman default ter-render.
- [ ] **0.2** Setup koneksi Supabase (`@supabase/supabase-js`), simpan `NEXT_PUBLIC_SUPABASE_URL` & `NEXT_PUBLIC_SUPABASE_ANON_KEY` di `.env.local`, tambahkan `.env.local` ke `.gitignore`.
  - Verify: client Supabase berhasil connect (test query sederhana tidak error).
- [ ] **0.3** Setup deployment ke Vercel, hubungkan ke repo GitHub.
  - Verify: preview deployment berhasil diakses via URL Vercel.

## Fase 1 — Skema Database (Supabase)

- [ ] **1.1** Buat migration untuk tabel `menu_items` (id, nama, harga, kategori, is_available, timestamps).
- [ ] **1.2** Buat migration untuk tabel `tables` (id, nomor, status `empty`/`occupied`), seed 1–10 baris sesuai jumlah meja awal.
- [ ] **1.3** Buat migration untuk tabel `orders` (id, table_id FK, status `open`/`paid`/`cancelled`, subtotal, discount, service_charge, tax, total, payment_method, created_at, paid_at).
- [ ] **1.4** Buat migration untuk tabel `order_items` (id, order_id FK, menu_item_id FK, qty, price_at_order).
- [ ] **1.5** Buat migration untuk tabel `settings` (single row: password, tax_percent, service_charge_percent), seed 1 baris default (`password`, tax 0, service charge 0 atau nilai awal yang disepakati).
  - Verify: semua tabel muncul di Supabase dashboard, relasi FK benar, seed data ada.

## Fase 2 — Autentikasi

- [ ] **2.1** Buat halaman login (`/login`) dengan input password, cocokkan ke `settings.password`.
- [ ] **2.2** Simpan session setelah login berhasil (cookie/session token sederhana), redirect ke halaman utama.
- [ ] **2.3** Proteksi semua route selain `/login` — redirect ke `/login` jika belum autentikasi.
  - Verify: akses route terproteksi tanpa login → redirect; login dengan password benar/salah → behave sesuai; setelah login, refresh page tetap login.

## Fase 3 — Settings (Pajak & Service Charge)

- [ ] **3.1** Buat halaman settings sederhana untuk set `tax_percent` dan `service_charge_percent`.
  - Verify: ubah nilai → tersimpan ke tabel `settings` → dipakai di kalkulasi checkout (Fase 7).

## Fase 4 — Kelola Menu (Admin)

- [ ] **4.1** Halaman list menu, tampilkan nama, harga, kategori, status tersedia/habis.
- [ ] **4.2** Form tambah menu baru (nama, harga, kategori).
- [ ] **4.3** Form edit menu (nama, harga, kategori).
- [ ] **4.4** Hapus menu.
- [ ] **4.5** Toggle status tersedia/habis per menu.
  - Verify: CRUD lengkap berfungsi lewat UI; menu berstatus "habis" tidak muncul di daftar pilih menu saat buat pesanan (Fase 6).

## Fase 5 — Meja

- [ ] **5.1** Halaman/komponen daftar meja menampilkan status masing-masing (kosong/terisi).
- [ ] **5.2** Logic update status meja: `occupied` saat order dibuat, `empty` saat order dibayar/dibatalkan.
  - Verify: buat order baru di suatu meja → status meja berubah jadi terisi; setelah bayar/cancel → kembali kosong.

## Fase 6 — Buat Pesanan (Dine-in)

- [ ] **6.1** Dari meja kosong, buka form buat pesanan baru (status order = `open`).
- [ ] **6.2** UI tambah item: pilih menu (hanya yang `is_available`), input qty, tambahkan ke order (snapshot `price_at_order`).
- [ ] **6.3** Tampilkan ringkasan item dalam order yang sedang dibuat.
- [ ] **6.4** Tombol "Batalkan Pesanan" — set order jadi `cancelled`, kosongkan meja. Tidak ada fitur edit/hapus item individual.
  - Verify: dari meja kosong bisa buat order, tambah beberapa item, order tersimpan status `open`; batalkan order → meja kosong lagi, order tidak bisa diakses lagi untuk ditambah item.

## Fase 7 — Checkout & Pembayaran

- [ ] **7.1** Halaman checkout menampilkan ringkasan: subtotal, input diskon (nominal/persen), service charge (dari settings), PPN (dari settings), total akhir — sesuai urutan hitung: `subtotal → (- diskon) → (+ service charge) → (+ PPN) → total`.
- [ ] **7.2** Pilihan metode pembayaran: Tunai (input jumlah dibayar + hitung kembalian), QRIS, Kartu, Transfer (3 terakhir langsung dicatat lunas).
- [ ] **7.3** Submit pembayaran: update order jadi `status = paid`, `paid_at`, `payment_method`, kosongkan meja terkait.
- [ ] **7.4** Tampilkan struk digital on-screen setelah pembayaran sukses (ringkasan item + total + kembalian jika tunai).
  - Verify: hitung manual sample order (subtotal, diskon, service charge, PPN, total, kembalian tunai) cocok dengan angka di layar; setelah bayar, meja kembali kosong dan order tidak muncul lagi sebagai `open`.

## Fase 8 — Responsif & Polish

- [ ] **8.1** Review seluruh halaman di viewport HP dan tablet — pastikan layout, tombol, dan form nyaman dipakai satu tangan/touch.
  - Verify: manual test di browser dev tools (mobile + tablet breakpoint) untuk tiap halaman: login, daftar meja, buat pesanan, checkout, kelola menu, settings.

## Fase 9 — Deploy

- [ ] **9.1** Deploy final ke Vercel production, hubungkan ke Supabase production project.
- [ ] **9.2** Jalankan smoke test end-to-end di production: login → pilih meja → buat pesanan → checkout → bayar → meja kosong lagi.
  - Verify: seluruh alur kriteria sukses PRD (§9) berjalan mulus di URL production.

---

## Catatan

- Item non-tujuan (§3 PRD) **jangan** diimplementasikan: tidak ada edit/hapus item order, tidak ada laporan/riwayat UI, tidak ada split bill, tidak ada cetak/kirim struk, tidak ada multi-outlet/role, tidak ada integrasi payment gateway.
- Asumsi urutan hitung diskon → service charge → PPN (PRD §8.1) dipakai sebagai default — konfirmasi ke owner sebelum Fase 7 kalau berbeda.
