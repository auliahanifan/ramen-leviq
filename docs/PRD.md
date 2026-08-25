# PRD: Aplikasi Kasir Warung Ramen (v1)

## 1. Latar Belakang

Owner mengelola 1 warung ramen dengan 1 outlet, dioperasikan sendiri (tanpa karyawan). Saat ini belum ada sistem kasir digital. Tujuan v1 adalah aplikasi kasir web sederhana untuk mencatat transaksi dine-in secara cepat dari HP/tablet, menggantikan pencatatan manual.

## 2. Tujuan (Goals)

- Owner bisa membuat pesanan per meja dan menyelesaikan pembayaran dalam waktu singkat, tanpa training.
- Mendukung diskon, PPN, dan service charge dalam perhitungan total.
- Mendukung banyak metode pembayaran yang umum dipakai warung kecil di Indonesia.
- Menu bisa dikelola sendiri oleh owner tanpa bantuan developer.

## 3. Non-Tujuan (Out of Scope v1)

Fitur berikut **sengaja tidak dibangun di v1** (kandidat v2+ jika dibutuhkan nanti):

- Tracking stok/inventory bahan baku
- Laporan penjualan/analitik (omzet, menu terlaris, rekap metode bayar)
- Halaman riwayat transaksi (data tetap tersimpan di database, tapi tidak ada UI untuk melihatnya)
- Edit/tambah/kurang item dalam pesanan yang sudah dibuat — kalau salah input, batalkan pesanan lalu buat ulang
- Split bill (pisah bayar dalam satu meja)
- Cetak struk fisik atau kirim struk digital ke pelanggan (WhatsApp/email)
- Multi-outlet / multi-cabang
- Banyak akun staff dengan role berbeda (v1 hanya 1 PIN untuk owner)
- Integrasi payment gateway (QRIS/kartu/transfer dicatat manual sebagai "lunas", bukan diproses via API)
- Takeaway/delivery (v1 hanya dine-in)
- Customisasi menu (topping, level pedas, ukuran porsi) dan paket/bundling

## 4. Target Pengguna

- **Owner (single user)**: satu-satunya pengguna aplikasi. Berperan sebagai kasir sekaligus admin menu.

## 5. Ruang Lingkup Fungsional (v1)

### 5.1 Autentikasi
- Login dengan password statis (`password`, hardcoded untuk v1, tidak ada UI ganti password).
- Tidak ada multi-akun/role.

### 5.2 Kelola Menu (Admin)
- CRUD menu: nama, harga, kategori.
- Toggle status tersedia/habis per menu (agar tidak muncul saat buat pesanan, tanpa perlu hapus).
- Tidak ada varian/topping — 1 menu = 1 harga tetap.

### 5.3 Meja
- Daftar meja tetap, 1–10 meja (nomor meja bisa dikonfigurasi di setup awal).
- Status meja: **kosong** / **terisi** (ada pesanan belum lunas).
- Meja otomatis kembali **kosong** setelah pesanan dibayar atau dibatalkan.

### 5.4 Buat Pesanan (Dine-in)
- Pilih meja kosong → tambah menu + jumlah (qty) ke pesanan.
- Pesanan tersimpan dengan status **open** sampai dibayar atau dibatalkan.
- Tidak bisa edit item pesanan yang sudah dibuat — hanya bisa **batalkan seluruh pesanan** dan mulai ulang.

### 5.5 Checkout & Pembayaran
- Ringkasan: subtotal, diskon, service charge, PPN, total akhir.
- **Diskon**: manual per transaksi, nominal atau persen.
- **Service charge**: persentase, dihitung dari subtotal setelah diskon.
- **PPN**: persentase, dihitung setelah service charge ditambahkan.
  - *(Asumsi urutan hitung — lihat §8. Perlu dikonfirmasi kalau owner ingin urutan berbeda.)*
- Persentase PPN & service charge diset sekali di halaman settings sederhana (bukan per transaksi).
- **Metode pembayaran** (pilih salah satu per transaksi):
  - Tunai — input jumlah dibayar, sistem hitung kembalian otomatis.
  - QRIS — dicatat manual sebagai lunas (tidak ada scan/generate QR dinamis, asumsikan QRIS statis di meja kasir).
  - Kartu debit/kredit — dicatat manual sebagai lunas (proses gesek di mesin EDC terpisah).
  - Transfer bank/e-wallet — dicatat manual sebagai lunas.
- Setelah bayar: pesanan berstatus **paid**, meja jadi kosong lagi, muncul ringkasan struk digital di layar (on-screen saja, tidak ada cetak/kirim).

## 6. Kebutuhan Non-Fungsional

- **Platform**: web app, responsif untuk HP dan tablet (browser).
- **Konektivitas**: asumsi online-first (butuh koneksi internet aktif ke database). Tidak dibangun mode offline di v1 karena owner belum yakin kondisi jaringan — jika nanti sering putus, ini jadi kandidat v2.
- **Stack yang diinginkan owner**: Supabase (database/backend), Vercel (hosting/deploy), GitHub (source control). Framework frontend akan direkomendasikan saat masuk tahap implementasi (mis. Next.js) — bukan bagian dari keputusan PRD ini.
- **Keamanan**: password statis cukup untuk v1 karena hanya 1 pengguna di 1 perangkat; tidak ada data sensitif pelanggan yang disimpan.

## 7. Model Data (Tingkat Tinggi)

- **MenuItem**: id, nama, harga, kategori, is_available
- **Table**: id, nomor, status (`empty` / `occupied`)
- **Order**: id, table_id, status (`open` / `paid` / `cancelled`), subtotal, discount, service_charge, tax, total, payment_method, created_at, paid_at
- **OrderItem**: id, order_id, menu_item_id, qty, price_at_order (snapshot harga saat order dibuat)
- **Settings**: password, tax_percent, service_charge_percent

## 8. Asumsi & Hal yang Perlu Dikonfirmasi

1. Urutan perhitungan total: `subtotal → (- diskon) → (+ service charge) → (+ PPN) → total`. Kalau warung biasa pakai urutan lain (misal PPN dihitung dari subtotal asli, bukan setelah service charge), perlu dikoreksi sebelum implementasi.
2. QRIS/kartu/transfer dianggap **tidak** terintegrasi payment gateway — murni pencatatan status lunas oleh kasir. Kalau ternyata owner ingin integrasi (misal QRIS dinamis via Midtrans/Xendit), ini scope tambahan besar di luar v1.
3. Data tetap tersimpan di database meski tidak ada UI riwayat/laporan di v1 — jadi laporan/riwayat bisa ditambahkan di v2 tanpa migrasi data.
4. Nomor meja bersifat tetap (1–10), bukan dinamis/bisa ditambah dari UI — cukup diset di awal.

## 9. Kriteria Sukses (v1)

- Owner bisa: login → pilih meja kosong → tambah pesanan → checkout dengan diskon/pajak/service charge → pilih metode bayar → selesai, dalam alur yang jelas tanpa training tambahan.
- Total di layar checkout sesuai dengan perhitungan manual owner (subtotal, diskon, service charge, PPN, total, kembalian untuk tunai).
- Aplikasi bisa diakses dan dipakai dengan nyaman dari HP maupun tablet.

## 10. Kandidat v2+ (Tidak Dikerjakan Sekarang)

- Riwayat & laporan transaksi (harian/bulanan, menu terlaris, rekap metode bayar)
- Inventory/stok bahan baku dengan pengurangan otomatis
- Edit/void item dalam pesanan yang sudah dibuat
- Split bill
- Cetak struk thermal / kirim struk digital ke pelanggan
- Multi-outlet & multi-role staff
- Integrasi payment gateway
- Takeaway/delivery, kustomisasi menu (topping/level pedas), paket bundling
