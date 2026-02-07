# Rencana Pengujian End-to-End (E2E)

## 1. Tujuan

Tujuan dari rencana pengujian E2E ini adalah untuk memverifikasi fungsionalitas lengkap dari setiap endpoint API yang didefinisikan dalam `API_ENDPOINTS.md`. Tujuannya adalah untuk mencapai cakupan (coverage) 100% dari semua skenario penggunaan yang diharapkan, termasuk _happy path_ (kasus sukses) dan _sad path_ (kasus kegagalan/error), untuk memastikan keandalan dan stabilitas API.

## 2. Persiapan Lingkungan Pengujian (Setup)

- **Database Terisolasi:** Pengujian E2E harus berjalan pada database pengujian yang terpisah untuk menghindari konflik dengan data pengembangan atau produksi.
- **Inisialisasi & Pembersihan:** Sebelum setiap rangkaian pengujian (test suite) dijalankan, database harus dibersihkan (misalnya, dengan menghapus semua data dari tabel) untuk memastikan setiap pengujian berjalan secara independen.
- **Klien HTTP:** Pengujian akan menggunakan pustaka seperti `supertest` untuk membuat permintaan HTTP ke aplikasi NestJS yang sedang berjalan.
- **Variabel Global:** Variabel seperti `access_token` untuk pengguna A dan pengguna B akan disimpan secara global dalam suite pengujian untuk digunakan kembali.

---

## 3. Rangkaian Pengujian (Test Suites)

### 3.1. Suite Pengujian: Autentikasi (`/api/auth`)

| Endpoint                    | Skenario Pengujian                                                                        | Ekspektasi                                                           |
| :-------------------------- | :---------------------------------------------------------------------------------------- | :------------------------------------------------------------------- |
| **POST /api/auth/register** | **[Sukses]** Mendaftar dengan email dan password yang valid.                              | `201 CREATED`. Mengembalikan data pengguna (tanpa password).         |
|                             | **[Gagal]** Mendaftar dengan email yang sudah ada.                                        | `409 CONFLICT`. Mengembalikan pesan error "Email already exists".    |
|                             | **[Gagal]** Mendaftar dengan data yang tidak valid (email salah format, password pendek). | `400 BAD REQUEST`. Mengembalikan pesan error validasi.               |
| **POST /api/auth/login**    | **[Sukses]** Login dengan email dan password yang benar.                                  | `200 OK`. Mengembalikan `access_token` (JWT).                        |
|                             | **[Gagal]** Login dengan email yang salah.                                                | `401 UNAUTHORIZED`. Mengembalikan pesan error "Invalid credentials". |
|                             | **[Gagal]** Login dengan password yang salah.                                             | `401 UNAUTHORIZED`. Mengembalikan pesan error "Invalid credentials". |

### 3.2. Suite Pengujian: Pengguna (`/api/users`)

| Endpoint                 | Skenario Pengujian                                                                  | Ekspektasi                                                   |
| :----------------------- | :---------------------------------------------------------------------------------- | :----------------------------------------------------------- |
| **GET /api/users/me**    | **[Sukses]** Mengambil profil dengan token yang valid.                              | `200 OK`. Mengembalikan data pengguna yang sedang login.     |
|                          | **[Gagal]** Mengakses tanpa token atau dengan token yang tidak valid.               | `401 UNAUTHORIZED`.                                          |
| **PATCH /api/users/me**  | **[Sukses]** Memperbarui nama dan tanggal lahir dengan data yang valid.             | `200 OK`. Mengembalikan data pengguna yang telah diperbarui. |
|                          | **[Gagal]** Mengakses tanpa token atau dengan token yang tidak valid.               | `401 UNAUTHORIZED`.                                          |
|                          | **[Gagal]** Memperbarui dengan data yang tidak valid (misalnya, nama bukan string). | `400 BAD REQUEST`.                                           |
| **DELETE /api/users/me** | **[Sukses]** Menghapus akun sendiri dengan token yang valid.                        | `204 NO CONTENT`.                                            |
|                          | **[Gagal]** Mencoba login kembali setelah akun dihapus.                             | `401 UNAUTHORIZED`.                                          |
|                          | **[Gagal]** Mengakses tanpa token atau dengan token yang tidak valid.               | `401 UNAUTHORIZED`.                                          |

### 3.3. Suite Pengujian: Tugas (`/api/tasks`)

> _Setup: Login sebagai Pengguna A dan Pengguna B, simpan token masing-masing._

| Endpoint                  | Skenario Pengujian                                                               | Ekspektasi                                                |
| :------------------------ | :------------------------------------------------------------------------------- | :-------------------------------------------------------- |
| **POST /api/tasks**       | **[Sukses]** Pengguna A membuat tugas baru dengan data yang valid.               | `201 CREATED`. Mengembalikan data tugas yang baru dibuat. |
|                           | **[Gagal]** Membuat tugas dengan data yang tidak valid (misalnya, judul kosong). | `400 BAD REQUEST`.                                        |
| **GET /api/tasks**        | **[Sukses]** Pengguna A mengambil daftar tugasnya.                               | `200 OK`. Mengembalikan array tugas milik Pengguna A.     |
|                           | **[Sukses]** Pengguna yang belum punya tugas mengambil daftar tugasnya.          | `200 OK`. Mengembalikan array kosong `[]`.                |
| **GET /api/tasks/:id**    | **[Sukses]** Pengguna A mengambil detail tugas miliknya.                         | `200 OK`. Mengembalikan data tugas.                       |
|                           | **[Gagal]** Pengguna A mengambil detail tugas yang tidak ada (ID salah).         | `404 NOT FOUND`.                                          |
|                           | **[Gagal]** Pengguna B mencoba mengambil detail tugas milik Pengguna A.          | `401 UNAUTHORIZED`.                                       |
| **PATCH /api/tasks/:id**  | **[Sukses]** Pengguna A memperbarui tugas miliknya.                              | `200 OK`. Mengembalikan data tugas yang diperbarui.       |
|                           | **[Gagal]** Pengguna B mencoba memperbarui tugas milik Pengguna A.               | `401 UNAUTHORIZED`.                                       |
|                           | **[Gagal]** Pengguna A memperbarui tugas yang tidak ada (ID salah).              | `404 NOT FOUND`.                                          |
| **DELETE /api/tasks/:id** | **[Sukses]** Pengguna A menghapus tugas miliknya.                                | `204 NO CONTENT`.                                         |
|                           | **[Gagal]** Pengguna B mencoba menghapus tugas milik Pengguna A.                 | `401 UNAUTHORIZED`.                                       |
|                           | **[Gagal]** Pengguna A menghapus tugas yang tidak ada (ID salah).                | `404 NOT FOUND`.                                          |

### 3.4. Suite Pengujian: Tag (`/api/tags`)

> _Setup: Login sebagai Pengguna A._

| Endpoint                 | Skenario Pengujian                                                          | Ekspektasi                                              |
| :----------------------- | :-------------------------------------------------------------------------- | :------------------------------------------------------ |
| **POST /api/tags**       | **[Sukses]** Pengguna A membuat tag baru dengan data yang valid.            | `201 CREATED`. Mengembalikan data tag yang baru dibuat. |
|                          | **[Gagal]** Membuat tag dengan nama yang duplikat untuk pengguna yang sama. | `409 CONFLICT`.                                         |
| **GET /api/tags**        | **[Sukses]** Pengguna A mengambil daftar tag-nya.                           | `200 OK`. Mengembalikan array tag milik Pengguna A.     |
| **GET /api/tags/:id**    | **[Sukses]** Pengguna A mengambil detail tag miliknya.                      | `200 OK`. Mengembalikan data tag.                       |
|                          | **[Gagal]** Pengguna B mencoba mengambil detail tag milik Pengguna A.       | `401 UNAUTHORIZED`.                                     |
| **PATCH /api/tags/:id**  | **[Sukses]** Pengguna A memperbarui tag miliknya.                           | `200 OK`. Mengembalikan data tag yang diperbarui.       |
| **DELETE /api/tags/:id** | **[Sukses]** Pengguna A menghapus tag miliknya.                             | `204 NO CONTENT`.                                       |

### 3.5. Suite Pengujian: Asosiasi Tugas-Tag (`/api/tags/.../tasks/...`)

> _Setup: Login sebagai Pengguna A, buat 1 Tugas dan 1 Tag._

| Endpoint                                  | Skenario Pengujian                                                            | Ekspektasi          |
| :---------------------------------------- | :---------------------------------------------------------------------------- | :------------------ |
| **POST /api/tags/:tagId/tasks/:taskId**   | **[Sukses]** Mengaitkan tag milik Pengguna A dengan tugas milik Pengguna A.   | `201 CREATED`.      |
|                                           | **[Gagal]** Mengaitkan dengan ID tugas atau ID tag yang tidak valid.          | `404 NOT FOUND`.    |
|                                           | **[Gagal]** Mengaitkan tag milik Pengguna A dengan tugas milik Pengguna B.    | `401 UNAUTHORIZED`. |
| **DELETE /api/tags/:tagId/tasks/:taskId** | **[Sukses]** Melepaskan asosiasi tag dari tugas.                              | `204 NO CONTENT`.   |
|                                           | **[Gagal]** Melepaskan asosiasi dengan ID tugas atau ID tag yang tidak valid. | `404 NOT FOUND`.    |
