# Struktur Proyek

Proyek ini akan mengikuti pola arsitektur berbasis modul (module-based architecture) yang direkomendasikan oleh NestJS. Pola ini mempromosikan separation of concerns yang kuat, membuat kode lebih terorganisir, mudah dipelihara, dan skalabel. Setiap fitur utama aplikasi (seperti autentikasi, pengguna, dan tugas) akan memiliki modulnya sendiri.

## Struktur Direktori Utama

```
src/
├── app.module.ts           # Modul aplikasi root
├── main.ts                 # Titik masuk aplikasi
├── auth/                   # Modul Autentikasi
│   ├── auth.controller.ts
│   ├── auth.module.ts
│   ├── auth.service.ts
│   ├── jwt.strategy.ts     # Strategi Passport-JWT
│   └── dto/                # Data Transfer Objects untuk Auth
│       ├── login-user.dto.ts
│       └── register-user.dto.ts
├── common/                 # Modul atau utilitas umum
│   └── filters/            # Filter Exception Global
│       └── http-exception.filter.ts
├── prisma/                 # Konfigurasi Prisma ORM
│   ├── prisma.service.ts   # Service untuk mengintegrasikan Prisma Client ke NestJS
│   └── schema.prisma       # Skema database Prisma
├── tasks/                  # Modul Tugas
│   ├── tasks.controller.ts
│   ├── tasks.module.ts
│   ├── tasks.service.ts
│   └── dto/                # Data Transfer Objects untuk Tasks
│       ├── create-task.dto.ts
│       └── update-task.dto.ts
├── users/                  # Modul Pengguna
│   ├── users.controller.ts
│   ├── users.module.ts
│   ├── users.service.ts
│   └── dto/                # Data Transfer Objects untuk Users
│       └── update-user.dto.ts
├── tags/                   # Modul Tag
│   ├── tags.controller.ts
│   ├── tags.module.ts
│   ├── tags.service.ts
│   └── dto/                # Data Transfer Objects untuk Tags
│       ├── create-tag.dto.ts
│       └── update-tag.dto.ts
└── ...                     # Modul fitur lainnya
```

## Penjelasan Struktur

### `src/`

Direktori utama untuk kode sumber aplikasi.

### `app.module.ts`

Modul utama aplikasi yang mengimpor semua modul fitur lainnya dan mengatur konfigurasi global.

### `main.ts`

File bootstrap aplikasi, tempat instance NestFactory dibuat dan aplikasi dimulai.

### `auth/`

Modul yang bertanggung jawab untuk semua logika autentikasi, termasuk pendaftaran, login, dan validasi token.

- `auth.controller.ts`: Menangani permintaan HTTP terkait autentikasi.
- `auth.module.ts`: Mengatur modul autentikasi, mengimpor dependensi yang diperlukan seperti `JwtModule` dan `PassportModule`.
- `auth.service.ts`: Berisi logika bisnis untuk operasi autentikasi (hashing kata sandi, pembuatan JWT).
- `jwt.strategy.ts`: Mengimplementasikan strategi `JwtStrategy` dari `passport-jwt` untuk memvalidasi token JWT yang masuk.
- `dto/`: Berisi `Data Transfer Objects` (DTOs) untuk validasi input seperti `LoginUserDto` dan `RegisterUserDto`.

### `common/`

Berisi modul, interceptor, filter, atau pipe yang dapat digunakan kembali di seluruh aplikasi.

- `filters/http-exception.filter.ts`: Sebuah filter pengecualian kustom untuk menangani `HttpException` secara global, menyediakan respons kesalahan yang konsisten.

### `prisma/`

Direktori yang didedikasikan untuk konfigurasi dan integrasi Prisma ORM.

- `prisma.service.ts`: Sebuah service NestJS yang mengelola instance PrismaClient, memastikan koneksi database dibuka dan ditutup dengan benar.
- `schema.prisma`: File skema Prisma, mendefinisikan model data aplikasi, koneksi database, dan generator.

### `tasks/`

Modul yang menangani semua operasi terkait tugas (CRUD).

- `tasks.controller.ts`: Menangani permintaan HTTP untuk membuat, membaca, memperbarui, dan menghapus tugas.
- `tasks.module.ts`: Mengatur modul tugas.
- `tasks.service.ts`: Berisi logika bisnis untuk operasi tugas, berinteraksi dengan `PrismaClient` untuk persistensi data.
- `dto/`: Berisi DTOs untuk validasi input seperti `CreateTaskDto` dan `UpdateTaskDto`.

### `users/`

Modul yang mengelola informasi pengguna. Ini akan menjadi modul yang relatif tipis karena sebagian besar interaksi pengguna (login/register) ditangani oleh modul `auth`.

- `users.controller.ts`: Menangani permintaan HTTP terkait pengguna (misalnya, mengambil profil pengguna).
- `users.module.ts`: Mengatur modul pengguna.
- `users.service.ts`: Berisi logika bisnis untuk operasi pengguna, berinteraksi dengan `PrismaClient`.
- `dto/`: Berisi DTOs untuk validasi input seperti `UpdateUserDto`.

### `tags/`
Modul yang menangani semua operasi terkait tag (CRUD) serta mengelola relasi tag dengan tugas.
*   `tags.controller.ts`: Menangani permintaan HTTP untuk membuat, membaca, memperbarui, dan menghapus tag.
*   `tags.module.ts`: Mengatur modul tag.
*   `tags.service.ts`: Berisi logika bisnis untuk operasi tag, berinteraksi dengan `PrismaClient` untuk persistensi data. Juga menangani pengaitan dan pelepasan tag dengan tugas.
*   `dto/`: Berisi DTOs untuk validasi input seperti `CreateTagDto` dan `UpdateTagDto`.

## Manfaat Pola Ini

- **Modularitas:** Setiap fitur terisolasi dalam modulnya sendiri, mengurangi dependensi antar bagian kode yang berbeda.
- **Keterbacaan:** Struktur yang jelas memudahkan navigasi dan pemahaman kode, terutama bagi pengembang baru.
- **Skalabilitas:** Memungkinkan penambahan fitur baru dengan dampak minimal pada kode yang sudah ada.
- **Kemudahan Pemeliharaan:** Perubahan pada satu fitur cenderung tidak mempengaruhi fitur lainnya, menyederhanakan proses debug dan pemeliharaan.

Struktur ini akan memberikan fondasi yang kuat dan terorganisir untuk pengembangan backend aplikasi Anda.
