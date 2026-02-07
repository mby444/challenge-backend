# TUGAS

## Tantangan Backend TypeScript

1. Buatlah aplikasi REST API sederhana dengan NestJS TypeScript dengan kriteria sebagai berikut:
   a. (done) Terdiri dari minimal 2 operasi CRUD yang saling berkaitan. (Pengguna, Tugas, Tag)
   b. (done) Menyimpan data menggunakan database SQL (PostgreSQL, Prisma ORM)
   c. (done) Autentikasi API menggunakan token JWT.
   d. (in progress) Buatkan fitur pengujian E2E untuk menguji token API-nya.
   e. (done) Pilih pola proyek yang sering Anda gunakan. (Struktur berbasis modul)
   f. Jelaskan mengapa menggunakan pola tersebut di README GitHub.
   g. Untuk dokumentasi API bisa pakai Postman atau sejenisnya.

2. Buat video demo aplikasi dengan spesifikasi:
   a. Demokan aplikasi di seluruh halaman.
   b. Penjelasan hasil pengerjaan dari setiap poin pada soal nomor 1.
   c. Presentasi dengan kamera terbuka.
   d. Gunakan aplikasi www.loom.com sebagai alat perekam (recording).
   e. Bagikan LINK hasil rekaman pada isian yang sudah disediakan (pastikan link bisa diakses).

## Rincian Tugas Terperinci

### Fase 1: Penyiapan Proyek dan Modul Inti

1.  **Inisialisasi Proyek NestJS:**
    - Buat proyek NestJS baru jika belum ada.
    - Instal dependensi yang diperlukan (`prisma`, `@prisma/client`, `pg`, `@nestjs/jwt`, `@nestjs/passport`, `passport-jwt`).

2.  **Konfigurasi Basis Data:**
    - Konfigurasi koneksi PostgreSQL dan integrasikan Prisma Client di `app.module.ts` atau modul basis data khusus.
    - Definisikan skema Prisma untuk `User` dan `Task` dengan properti dan relasi masing-masing.

3.  **Modul Pengguna (`AuthModule` dan `UsersModule`):**
    - **Entitas Pengguna:** Buat entitas `User` dengan bidang seperti `id`, `email`, `password`, `created_at`, `updated_at`.
    - **Modul Otentikasi:**
      - Implementasikan endpoint pendaftaran pengguna (`signup`).
      - Implementasikan endpoint login pengguna (`signin`), mengembalikan JWT setelah autentikasi berhasil.
      - Buat `AuthService` untuk menangani logika autentikasi pengguna (hashing kata sandi, pembuatan JWT).
      - Implementasikan strategi JWT untuk Passport.
    - **Modul Pengguna:**
      - Buat `UsersController` dan `UsersService`.
      - Implementasikan endpoint untuk mendapatkan profil pengguna yang terautentikasi.
      - Lindungi endpoint ini dengan JWT guards.

### Fase 2: Modul Tugas

1.  **Entitas Tugas:**
    - Buat entitas `Task` dengan bidang seperti `id`, `title`, `description`, `is_completed`, `userId`, `created_at`, `updated_at`.
    - Bangun relasi one-to-many antara entitas `User` dan `Task`.

2.  **Modul Tugas:**
    - Buat `TasksController` dan `TasksService`.
    - Implementasikan operasi CRUD untuk tugas:
      - `POST /tasks`: Buat tugas baru (pengguna terautentikasi).
      - `GET /tasks`: Dapatkan semua tugas untuk pengguna yang terautentikasi.
      - `GET /tasks/:id`: Dapatkan tugas tertentu untuk pengguna yang terautentikasi.
      - `PATCH /tasks/:id`: Perbarui tugas tertentu untuk pengguna yang terautentikasi.
      - `DELETE /tasks/:id`: Hapus tugas tertentu untuk pengguna yang terautentikasi.
    - Lindungi semua endpoint tugas dengan JWT guards, memastikan pengguna hanya dapat memanipulasi tugas mereka sendiri.

### Fase 2.5: Modul Tag

1.  **Entitas Tag:**
    - Buat entitas `Tag` dengan bidang seperti `id`, `name`, `userId`, `createdAt`, `updatedAt`.
    - Bangun relasi many-to-many antara entitas `Task` dan `Tag`.

2.  **Modul Tag:**
    - Buat `TagsController` dan `TagsService`.
    - Implementasikan operasi CRUD untuk tag (buat, dapatkan semua untuk pengguna, dapatkan berdasarkan ID, perbarui, hapus).
    - Lindungi semua endpoint tag dengan JWT guards, memastikan pengguna hanya dapat memanipulasi tag mereka sendiri.

### Fase 3: Pengujian

1.  **Penyiapan Pengujian E2E:**
    - Pastikan utilitas pengujian NestJS sudah terkonfigurasi.
    - Gunakan Supertest untuk melakukan permintaan HTTP dalam pengujian.

2.  **Implementasikan Pengujian E2E:**
    - **Pengujian Autentikasi:**
      - Uji pendaftaran pengguna.
      - Uji login pengguna dan pembuatan JWT.
      - Uji akses ke rute yang dilindungi dengan dan tanpa JWT yang valid.
    - **Pengujian CRUD Tugas:**
      - Uji pembuatan tugas sebagai pengguna terautentikasi.
      - Uji pengambilan tugas untuk pengguna terautentikasi.
      - Uji pembaruan tugas untuk pengguna terautentikasi.
      - Uji penghapusan tugas untuk pengguna terautentikasi.
      - Uji kasus ekstrem (misalnya, akses tidak sah, mengakses tugas pengguna lain).

### Fase 4: Dokumentasi dan Persiapan Penyebaran

1.  **Dokumentasi API (Postman):**
    - Buat koleksi Postman yang mendokumentasikan semua endpoint API, termasuk contoh permintaan dan respons.
    - Sertakan instruksi untuk mendapatkan dan menggunakan token JWT.

2.  **Pembaruan README.md:**
    - Jelaskan pola proyek yang dipilih (struktur berbasis modul) dan alasannya.
    - Berikan instruksi yang jelas tentang cara menyiapkan, menjalankan, dan menguji aplikasi.

3.  **Persiapan Demo Video:**
    - Siapkan skrip atau kerangka untuk demo video yang mencakup semua persyaratan (tunjukkan aplikasi, jelaskan poin-poin, kamera terbuka).

### Rekomendasi:

- **Basis Data:** Gunakan `Prisma ORM` dengan `PostgreSQL`. Pastikan skema Prisma dan migrasi basis data ditangani untuk perubahan skema.
- **Hashing Kata Sandi:** Gunakan `bcrypt` untuk hashing kata sandi yang aman.
- **Validasi:** Gunakan NestJS pipes (misalnya, `ValidationPipe`) dan DTO (`class-validator`, `class-transformer`) untuk validasi input.
- **Penanganan Error:** Implementasikan penanganan error yang konsisten dan exception khusus untuk respons API yang lebih baik.
- **Konfigurasi:** Gunakan `@nestjs/config` untuk mengelola environtment variable.
