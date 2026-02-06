# Daftar Fitur

## Fungsionalitas Inti

### Manajemen Pengguna

- Pendaftaran pengguna (signup) dengan email unik.
- Login pengguna (signin) untuk mendapatkan JWT.
- Mengambil informasi profil pengguna yang terautentikasi.
- Memperbarui informasi akun pengguna sendiri yang sudah terautentikasi.
- Menghapus akun pengguna sendiri yang sudah terautentikasi.

### Manajemen Tugas

- Membuat tugas baru yang terkait dengan pengguna yang terautentikasi.
- Mengambil daftar semua tugas milik pengguna yang terautentikasi.
- Mengambil detail tugas tertentu berdasarkan ID, yang dimiliki oleh pengguna yang terautentikasi.
- Memperbarui status tugas yang ada berdasarkan ID, yang dimiliki oleh pengguna yang terautentikasi.
- Memperbarui detail tugas yang ada berdasarkan ID, yang dimiliki oleh pengguna yang terautentikasi.
- Menghapus tugas berdasarkan ID, yang dimiliki oleh pengguna yang terautentikasi.

### Manajemen Tag

- Membuat tag baru untuk pengguna yang terautentikasi.
- Mengambil daftar semua tag milik pengguna yang terautentikasi.
- Mengambil detail tag tertentu berdasarkan ID, yang dimiliki oleh pengguna yang terautentikasi.
- Memperbarui tag tertentu berdasarkan ID, yang dimiliki oleh pengguna yang terautentikasi.
- Menghapus tag tertentu berdasarkan ID, yang dimiliki oleh pengguna yang terautentikasi.
- Mengaitkan tag dengan tugas.
- Melepaskan tag dari tugas.

## Spesifikasi Teknis

### Autentikasi

- Autentikasi berbasis JSON Web Token (JWT) untuk mengamankan rute API.
- Hashing kata sandi untuk kredensial pengguna.

### Basis Data

- Integrasi basis data SQL (misalnya, PostgreSQL).
- Memanfaatkan Object-Relational Mapper (ORM) seperti Prisma ORM untuk persistensi data.

### Pengujian

- Pengujian End-to-End (E2E) komprehensif yang mencakup alur autentikasi pengguna (pendaftaran, login) dan operasi CRUD tugas.

### Dokumentasi API

- Titik akhir API didokumentasikan melalui koleksi Postman untuk konsumsi dan pengujian yang mudah.

## Struktur Proyek

- Struktur proyek berbasis modul mengikuti praktik terbaik NestJS (misalnya, `AuthModule`, `UsersModule`, `TasksModule`).
