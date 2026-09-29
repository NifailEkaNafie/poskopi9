# ☕ Kopi Sembilan - Point of Sale (POS) Web Application

Aplikasi kasir dan manajemen operasional kafe berbasis web (*Single Page Application*) yang dirancang khusus untuk **Toko Kopi Sembilan**. Aplikasi ini mengintegrasikan fungsi transaksi kasir cepat, analisis pendapatan real-time, manajemen katalog produk, pelaporan keuangan, serta pencatatan audit log keamanan menggunakan backend **Supabase**.

---

## 📌 Daftar Isi
- [Fitur Utama](#-fitur-utama)
  - [1. Modul Kasir / POS](#1-modul-kasir--pos)
  - [2. Dashboard & Analisis Bisnis (Admin)](#2-dashboard--analisis-bisnis-admin)
  - [3. Manajemen Inventaris Menu](#3-manajemen-inventaris-menu)
  - [4. Laporan Penjualan & Ekspor Excel](#4-laporan-penjualan--ekspor-excel)
  - [5. Manajemen Akun Pengguna](#5-manajemen-akun-pengguna)
  - [6. Pengaturan Toko & Printer Thermal](#6-pengaturan-toko--printer-thermal)
  - [7. Audit Trail / Log Aktivitas](#7-audit-trail--log-aktivitas)
- [Teknologi yang Digunakan](#-teknologi-yang-digunakan)
- [Panduan Instalasi & Menjalankan](#-panduan-instalasi--menjalankan)
- [Konfigurasi Supabase Database](#-konfigurasi-supabase-database)
- [Struktur Direktori](#-struktur-direktori)
- [Keamanan & Perlindungan Kredensial](#-keamanan--perlindungan-kredensial)

---

## ✨ Fitur Utama

### 1. Modul Kasir / POS
* **Katalog Menu Interaktif:** Filter kategori dinamis (*Specialty Coffee, Regular Coffee, Signature, Non-Coffee*) dan pencarian instan.
* **Kustomisasi Pesanan (Item Note):** Pilihan cepat modifikasi pesanan (*Less Sugar, No Ice, More Ice, dll.*) serta varian produk.
* **Metode Pembayaran Lengkap:** Mendukung Tunai (Cash), QRIS, Transfer Bank, dan Kartu Debit.
* **Kalkulator Kembalian & Pecahan Cepat:** Pilihan pecahan uang cepat serta fitur tambah pecahan uang kustom (*Custom Denomination*).
* **Integrasi Struk WhatsApp:** Pengiriman struk digital otomatis langsung ke nomor WhatsApp pelanggan dalam format teks maupun gambar (*render canvas*).
* **Dukungan Printer Thermal Bluetooth:** Mendukung cetak struk via Web Bluetooth API (ukuran 58mm & 80mm) dengan opsi auto-print saat transaksi berhasil.

### 2. Dashboard & Analisis Bisnis (Admin)
* **Ringkasan KPI Real-Time:** Total Pendapatan, Total Transaksi, dan Total Produk Terjual.
* **Filter Periode Fleksibel:** Hari Ini, 7 Hari Terakhir, Bulan Ini, dan Tahun Ini.
* **Grafik Pendapatan Interaktif:** Visualisasi tren penjualan harian/bulanan menggunakan Chart.js.
* **Mode Privasi (Sensor Data):** Tombol sensor untuk menyembunyikan nominal omzet saat layar kasir dilihat oleh umum.
* **Analisis & Ranking Penjualan Menu:** Modal mendalam untuk melihat menu terlaris (*Top Seller*), menu terendah (*Slow Moving*), omzet per menu, dan persentase kontribusi penjualan.

### 3. Manajemen Inventaris Menu
* Tambah, ubah harga, ganti kategori produk, dan perbarui katalog menu.
* **Proteksi Soft-Delete:** Produk yang dinonaktifkan/dihapus tidak akan hilang dari database agar histori transaksi masa lalu tetap utuh dan valid.

### 4. Laporan Penjualan & Ekspor Excel
* Riwayat transaksi lengkap dengan filter rentang tanggal (*Date Range Picker*), filter status pembayaran (*Lunas / Belum Bayar*), dan filter metode pembayaran.
* **Ekspor Berkas Excel (.xlsx):** Mengunduh rekapan transaksi berformat spreadsheet Excel profesional menggunakan ExcelJS (dilengkapi penomoran, pewarnaan kolom, dan pemformatan mata uang).
* **Koreksi & Pembatalan Transaksi (Void):** Hak akses khusus Admin untuk memperbaiki detail transaksi atau menghapus data transaksi keliru.

### 5. Manajemen Akun Pengguna
* Pengelolaan hak akses berbasis peran (*Role-Based Access Control*): **Administrator** dan **Kasir**.
* Tambah staf baru, nonaktifkan akun, dan reset password aman terenkripsi (Bcrypt.js).

### 6. Pengaturan Toko & Printer Thermal
* Personalisasi identitas toko (Nama Kafe, Alamat, Nomor WhatsApp Bisnis).
* Kustomisasi template pesan faktur/struk WhatsApp dengan placeholder otomatis.
* Konfigurasi koneksi printer thermal Bluetooth dan pengujian cetak (*Test Print*).

### 7. Audit Trail / Log Aktivitas
* Rekam jejak aktivitas sensitif secara kronologis (Waktu WIB, Pelaksana, Jenis Aksi, dan Detail Perubahan data sebelum/sesudah).
* Bersifat *immutable* (hanya-baca) dari antarmuka web untuk mencegah kecurangan internal (*fraud prevention*).

---

## 🛠 Teknologi yang Digunakan

* **Frontend:** HTML5, CSS3 (Modern Responsive Coffee-theme UI), Vanilla JavaScript (ES6+)
* **Database & Autentikasi:** [Supabase](https://supabase.com/) (PostgreSQL & Supabase Auth)
* **Visualisasi & Grafik:** [Chart.js](https://www.chartjs.org/)
* **Ekspor Spreadsheet:** [ExcelJS](https://github.com/exceljs/exceljs)
* **Datepicker:** [Flatpickr](https://flatpickr.js.org/)
* **Ikonografi:** [Lucide Icons](https://lucide.dev/)
* **Image Capture:** [html2canvas](https://html2canvas.hertzen.com/)
* **Enkripsi Kredensial:** [bcryptjs](https://github.com/dcodeIO/bcrypt.js)
* **Koneksi Perangkat Keras:** Web Bluetooth API

---

## 🚀 Panduan Instalasi & Menjalankan

### 1. Clone Repositori
```bash
git clone https://github.com/NifailEkaNafie/poskopi9.git
cd poskopi9
```

### 2. Konfigurasi Kredensial Supabase
Untuk menjaga keamanan, file konfigurasi API tidak disertakan dalam repositori publik.
1. Salin template konfigurasi:
   * Buat salinan dari `js/supabase-config.example.js` dan beri nama **`js/supabase-config.js`**.
2. Buka `js/supabase-config.js` dan masukkan URL serta Anon Key proyek Supabase Anda:
   ```javascript
   const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';
   const SUPABASE_KEY = 'YOUR_SUPABASE_ANON_PUBLIC_KEY';
   ```

### 3. Menjalankan Aplikasi
Aplikasi ini merupakan murni client-side web application (*static web*), sehingga Anda dapat menjalankannya langsung:
* **Cara 1:** Buka file `index.html` langsung menggunakan browser modern (Google Chrome atau Microsoft Edge direkomendasikan untuk mendukung fitur Web Bluetooth).
* **Cara 2 (Direkomendasikan):** Jalankan server lokal seperti ekstensi **Live Server** di VS Code atau menggunakan utilitas:
  ```bash
  npx serve .
  # atau
  python -m http.server 8000
  ```

---

## 🔒 Keamanan & Perlindungan Kredensial

* File kredensial asli `js/supabase-config.js` telah didaftarkan pada `.gitignore` sehingga **tidak akan pernah terunggah ke repositori GitHub**.
* Akses database diatur melalui kebijakan *Row Level Security* (RLS) pada tabel-tabel Supabase.
* Password pengguna dienkripsi menggunakan hashing *bcrypt* sebelum disimpan ke database.

---

## 📂 Struktur Direktori

```
poskopi9/
├── .gitignore                      # Mengabaikan file sensitif / API keys
├── README.md                       # Dokumentasi resmi proyek
├── index.html                      # Halaman utama aplikasi (SPA)
├── logo.jpg                        # Aset logo Toko Kopi Sembilan
├── css/
│   └── styles.css                  # Desain visual & antarmuka responsif
└── js/
    ├── scripts.js                  # Logika utama POS, Dashboard, Laporan, dsb.
    ├── supabase-config.example.js  # Template konfigurasi Supabase (publik/aman)
    └── supabase-config.js          # Konfigurasi aktif lokal (diabaikan oleh git)
```

---


