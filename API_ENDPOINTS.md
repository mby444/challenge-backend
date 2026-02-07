# URL Endpoint API

## Base URL

Base URL untuk API adalah `http://localhost:3000/api`.

## Endpoint Autentikasi (`/api/auth`)

| Metode HTTP | Path                 | Deskripsi                                       | Autentikasi Diperlukan |
| :---------- | :------------------- | :---------------------------------------------- | :--------------------- |
| `POST`      | `/api/auth/register` | Mendaftarkan pengguna baru.                     | Tidak                  |
| `POST`      | `/api/auth/login`    | Mengautentikasi pengguna dan mengembalikan JWT. | Tidak                  |

## Endpoint Pengguna (`/api/users`)

| Metode HTTP | Path            | Deskripsi                                    | Autentikasi Diperlukan |
| :---------- | :-------------- | :------------------------------------------- | :--------------------- |
| `GET`       | `/api/users/me` | Mengambil profil pengguna yang sedang login. | Ya                     |
| `PATCH`     | `/api/users/me` | Memperbarui nama dan tanggal lahir pengguna yang sedang login. | Ya                     |
| `DELETE`    | `/api/users/me` | Menghapus akun pengguna yang sedang login.   | Ya                     |

## Endpoint Tugas (`/api/tasks`)

| Metode HTTP | Path             | Deskripsi                                                                   | Autentikasi Diperlukan |
| :---------- | :--------------- | :-------------------------------------------------------------------------- | :--------------------- |
| `POST`      | `/api/tasks`     | Membuat tugas baru untuk pengguna yang login.                               | Ya                     |
| `GET`       | `/api/tasks`     | Mengambil daftar semua tugas milik pengguna yang login.                     | Ya                     |
| `GET`       | `/api/tasks/:id` | Mengambil detail tugas tertentu berdasarkan ID (milik pengguna yang login). | Ya                     |
| `PATCH`     | `/api/tasks/:id` | Memperbarui tugas tertentu berdasarkan ID (milik pengguna yang login).      | Ya                     |
| `DELETE`    | `/api/tasks/:id` | Menghapus tugas tertentu berdasarkan ID (milik pengguna yang login).        | Ya                     |

## Endpoint Tag (`/api/tags`)

| Metode HTTP | Path                    | Deskripsi                                                | Autentikasi Diperlukan |
| :---------- | :---------------------- | :------------------------------------------------------- | :--------------------- |
| `POST`      | `/api/tags`             | Membuat tag baru untuk pengguna yang login.              | Ya                     |
| `GET`       | `/api/tags`             | Mengambil semua tag milik pengguna yang login.           | Ya                     |
| `GET`       | `/api/tags/:id`         | Mengambil detail tag tertentu berdasarkan ID.            | Ya                     |
| `PATCH`     | `/api/tags/:id`         | Memperbarui tag tertentu berdasarkan ID.                 | Ya                     |
| `DELETE`    | `/api/tags/:id`         | Menghapus tag tertentu berdasarkan ID.                   | Ya                     |
| `POST`      | `/api/tags/:tagId/tasks/:taskId` | Mengaitkan tag dengan tugas.                         | Ya                     |
| `DELETE`    | `/api/tags/:tagId/tasks/:taskId` | Melepaskan tag dari tugas.                         | Ya                     |

## Catatan Penting:

- **RESTful:** Endpoint didesain untuk merepresentasikan sumber daya dan operasi standar HTTP (CRUD).
- **Prefiks Versi:** Saat ini tidak menggunakan prefiks versi di URL.
- **Autentikasi:** Endpoint yang memerlukan autentikasi akan membutuhkan JWT yang valid di header `Authorization` (misalnya, `Bearer YOUR_JWT_TOKEN`).
- **Validasi:** Setiap endpoint akan memiliki validasi input yang sesuai melalui DTOs dan NestJS Pipes.
- **Idempotensi:** Operasi `PUT` dan `DELETE` harus idempoten (mengulangi permintaan yang sama berkali-kali memiliki efek yang sama dengan satu kali permintaan).
