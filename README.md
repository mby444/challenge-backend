# 🚀 Task Manager API - Backend

RESTful API yang dibangun dengan NestJS, TypeScript, Prisma ORM, dan PostgreSQL untuk mengelola tugas, tag, dan autentikasi pengguna.

---

## 📋 Daftar Isi

- [Pola Arsitektur](#pola-arsitektur)
- [Mengapa Pola Ini](#mengapa-pola-ini)
- [Struktur Proyek](#struktur-proyek)
- [Teknologi yang Digunakan](#teknologi-yang-digunakan)
- [Fitur](#fitur)
- [Pengaturan & Instalasi](#pengaturan--instalasi)
- [Dokumentasi API](#dokumentasi-api)
- [Pengujian](#pengujian)
- [Skema Database](#skema-database)

---

## 🏗️ Pola Arsitektur

Proyek ini mengikuti **Arsitektur Berbasis Modul NestJS** (juga dikenal sebagai pola **Modular Monolith**), yang merupakan cara yang disarankan dan idiomatis untuk menyusun aplikasi NestJS.

### Gambaran Pola

```
┌─────────────────────────────────────────────┐
│           Titik Masuk Aplikasi               │
│                  (main.ts)                   │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│              App Module                      │
│         (app.module.ts)                      │
│  - Imports semua modul fitur                 │
│  - Konfigurasi global                        │
│  - Pengaturan Middleware                     │
└─────────────────┬───────────────────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
┌───────▼────────┐  ┌──────▼───────┐
│  Auth Module   │  │ Users Module │
│                │  │              │
│ - Controller   │  │ - Controller │
│ - Service      │  │ - Service    │
│ - DTOs         │  │ - DTOs       │
│ - Guards       │  │ - Decorators │
│ - Strategy     │  │              │
└────────────────┘  └──────────────┘
        │                   │
┌───────▼────────┐  ┌──────▼───────┐
│  Tasks Module  │  │  Tags Module │
│                │  │              │
│ - Controller   │  │ - Controller │
│ - Service      │  │ - Service    │
│ - DTOs         │  │ - DTOs       │
│ - Entities     │  │ - Entities   │
└────────────────┘  └──────────────┘
        │                   │
        └─────────┬─────────┘
                  │
        ┌─────────▼─────────┐
        │   Prisma Module   │
        │                   │
        │  - Database ORM   │
        │  - Migrasi        │
        │  - Skema          │
        └───────────────────┘
```

### Komponen Arsitektur Utama

1. **Modules** - Mengatur kode berdasarkan fitur/domain
2. **Controllers** - Menangani permintaan dan respons HTTP
3. **Services** - Berisi logika bisnis
4. **DTOs** - Data Transfer Objects untuk validasi
5. **Guards** - Autentikasi dan otorisasi
6. **Prisma** - ORM untuk operasi database

---

## 🎯 Mengapa Pola Ini?

### 1. **Pemisahan Kepentingan (Separation of Concerns)** ✅

Setiap modul bertanggung jawab untuk fitur tertentu (auth, users, tasks, tags), membuat basis kode lebih mudah dipahami dan dikelola.

**Contoh:**

```typescript
// Auth Module hanya menangani autentikasi
- auth.controller.ts    → Endpoint Login, Register
- auth.service.ts       → Penandatanganan JWT, hashing password
- jwt.strategy.ts       → Validasi JWT

// Tasks Module hanya menangani operasi tugas
- tasks.controller.ts   → Endpoint CRUD
- tasks.service.ts      → Logika bisnis
```

### 2. **Skalabilitas** 📈

Fitur baru dapat ditambahkan sebagai modul baru tanpa mempengaruhi kode yang sudah ada.

**Menambahkan fitur baru:**

```bash
# Generate modul baru dengan semua boilerplate
nest g module comments
nest g controller comments
nest g service comments
```

### 3. **Dependency Injection** 💉

NestJS menyediakan DI container bawaan, membuat kode menjadi:

- **Dapat Diuji (Testable)** - Mudah untuk memock dependensi
- **Dapat Dipelihara (Maintainable)** - Grafik dependensi yang jelas
- **Fleksibel** - Menukar implementasi dengan mudah

**Contoh:**

```typescript
@Injectable()
export class TasksService {
  constructor(
    private prisma: PrismaService, // Diinject secara otomatis
  ) {}
}
```

### 4. **Penggunaan Kembali Kode (Code Reusability)** ♻️

Fungsionalitas bersama diekstrak ke dalam modul umum:

```typescript
// Modul Prisma diekspor dan digunakan kembali di mana saja
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // ← Modul lain dapat menggunakan ini
})
export class PrismaModule {}
```

### 5. **Keamanan Tipe (Type Safety)** 🔒

100% TypeScript dengan:

- DTO untuk validasi permintaan
- Tipe yang dihasilkan Prisma
- Pemeriksaan kesalahan saat kompilasi

**Contoh:**

```typescript
// DTO dengan validasi
export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;
}
```

### 6. **Pengujian Mudah** ✅

Setiap modul dapat diuji secara terisolasi:

```typescript
// Unit test dengan dependensi yang dimock
const module: TestingModule = await Test.createTestingModule({
  providers: [
    TasksService,
    {
      provide: PrismaService,
      useValue: mockPrismaService, // Mock!
    },
  ],
}).compile();
```

### 7. **Titik Masuk yang Jelas** 🚪

Setiap fitur memiliki satu controller = struktur API yang jelas:

```
POST   /api/auth/login       → AuthController
POST   /api/auth/register    → AuthController
GET    /api/users/me         → UsersController
POST   /api/tasks            → TasksController
GET    /api/tasks            → TasksController
POST   /api/tags             → TagsController
```

---

## 📁 Struktur Proyek

```
challenge-backend/
├── src/
│   ├── auth/                      # Modul Autentikasi
│   │   ├── dto/
│   │   │   ├── login.dto.ts       # Validasi permintaan login
│   │   │   └── register.dto.ts    # Validasi permintaan register
│   │   ├── guards/
│   │   │   └── jwt-auth.guard.ts  # Guard proteksi JWT
│   │   ├── strategies/
│   │   │   └── jwt.strategy.ts    # Strategi JWT Passport
│   │   ├── auth.controller.ts     # Endpoint Login/Register
│   │   ├── auth.service.ts        # Logika bisnis Auth
│   │   └── auth.module.ts         # Definisi modul Auth
│   │
│   ├── users/                     # Modul Pengguna
│   │   ├── dto/
│   │   │   └── update-user.dto.ts # DTO update profil
│   │   ├── decorators/
│   │   │   └── current-user.decorator.ts  # Ambil pengguna saat ini
│   │   ├── users.controller.ts    # Endpoint User
│   │   ├── users.service.ts       # Logika bisnis User
│   │   └── users.module.ts        # Definisi modul Users
│   │
│   ├── tasks/                     # Modul Tugas
│   │   ├── dto/
│   │   │   ├── create-task.dto.ts # Validasi pembuatan tugas
│   │   │   └── update-task.dto.ts # Validasi pembaruan tugas
│   │   ├── tasks.controller.ts    # Endpoint CRUD
│   │   ├── tasks.service.ts       # Logika bisnis Task
│   │   └── tasks.module.ts        # Definisi modul Tasks
│   │
│   ├── tags/                      # Modul Tag
│   │   ├── dto/
│   │   │   ├── create-tag.dto.ts  # Validasi pembuatan tag
│   │   │   └── update-tag.dto.ts  # Validasi pembaruan tag
│   │   ├── tags.controller.ts     # Endpoint CRUD
│   │   ├── tags.service.ts        # Logika bisnis Tag
│   │   └── tags.module.ts         # Definisi modul Tags
│   │
│   ├── prisma/                    # Modul Prisma (Database)
│   │   ├── prisma.service.ts      # Wrapper client Prisma
│   │   └── prisma.module.ts       # Definisi modul Prisma
│   │
│   ├── common/                    # Utilitas bersama
│   │   ├── filters/               # Exception filters
│   │   └── interceptors/          # Response interceptors
│   │
│   ├── app.module.ts              # Modul root aplikasi
│   └── main.ts                    # Titik masuk aplikasi
│
├── prisma/
│   ├── schema.prisma              # Skema Database
│   └── migrations/                # Migrasi Database
│
├── test/                          # Pengujian E2E
│   ├── auth.e2e-spec.ts          # Pengujian endpoint Auth
│   ├── tasks.e2e-spec.ts         # Pengujian endpoint Tasks
│   └── app.e2e-spec.ts           # Pengujian umum
│
├── .env                           # Environment variables
├── .env.example                   # Template Environment
├── tsconfig.json                  # Konfigurasi TypeScript
└── package.json                   # Dependensi
```

### Pola Struktur Modul

Setiap modul fitur mengikuti struktur konsisten ini:

```
<feature>/
├── dto/                  # Data Transfer Objects (validasi)
├── decorators/           # Decorator kustom (opsional)
├── guards/               # Route guards (opsional)
├── strategies/           # Strategi Passport (hanya auth)
├── <feature>.controller.ts   # HTTP handlers
├── <feature>.service.ts      # Logika bisnis
└── <feature>.module.ts       # Definisi modul
```

**Manfaat:**

- ✅ Struktur yang dapat diprediksi
- ✅ Mudah dinavigasi
- ✅ Cepat untuk onboarding pengembang baru
- ✅ Batasan tanggung jawab yang jelas

---

## 🛠️ Teknologi yang Digunakan

| Teknologi           | Tujuan    | Mengapa Dipilih                                           |
| ------------------- | --------- | --------------------------------------------------------- |
| **NestJS**          | Framework | Kelas enterprise, mengutamakan TypeScript, modular        |
| **TypeScript**      | Bahasa    | Keamanan tipe, DX lebih baik, lebih sedikit error runtime |
| **Prisma ORM**      | Database  | Query aman tipe, migrasi otomatis, DX hebat               |
| **PostgreSQL**      | Database  | Kepatuhan ACID, relasi, siap produksi                     |
| **Passport JWT**    | Auth      | Standar industri, teruji                                  |
| **class-validator** | Validasi  | Berbasis dekorator, terintegrasi dengan NestJS            |
| **bcrypt**          | Hashing   | Hashing password yang aman                                |
| **Jest**            | Pengujian | Dukungan pengujian bawaan NestJS                          |

---

## ✨ Fitur

### 🔐 Autentikasi

- [x] Registrasi pengguna dengan validasi
- [x] Login dengan pembuatan token JWT
- [x] Hashing password dengan bcrypt
- [x] Autentikasi berbasis JWT
- [x] Rute yang dilindungi dengan guards

### 👤 Manajemen Pengguna

- [x] Dapatkan profil pengguna saat ini
- [x] Perbarui profil pengguna
- [x] Ubah password
- [x] Hapus akun

### ✅ Manajemen Tugas

- [x] Buat tugas
- [x] Dapatkan semua tugas (berdasarkan pengguna)
- [x] Dapatkan tugas berdasarkan ID
- [x] Perbarui tugas
- [x] Hapus tugas
- [x] Toggle penyelesaian tugas
- [x] Lampirkan/lepaskan tag

### 🏷️ Manajemen Tag

- [x] Buat tag
- [x] Dapatkan semua tag (berdasarkan pengguna)
- [x] Perbarui tag
- [x] Hapus tag
- [x] Lampirkan tag ke tugas
- [x] Lepaskan tag dari tugas

### 🔒 Keamanan

- [x] Autentikasi JWT
- [x] Enkripsi password
- [x] Data terbatas pengguna (pengguna tidak dapat mengakses data orang lain)
- [x] Konfigurasi CORS
- [x] Validasi input
- [x] Pencegahan injeksi SQL (Prisma)

---

## 🚀 Pengaturan & Instalasi

### Prasyarat

- Node.js 18+
- npm atau yarn
- PostgreSQL (atau SQLite untuk pengembangan)

### Langkah Instalasi

1. **Clone repositori**

```bash
cd challenge-backend
```

2. **Install dependensi**

```bash
npm install
```

3. **Konfigurasi environment**

```bash
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/taskdb"
JWT_SECRET="kunci-jwt-super-rahasia-anda"
ALLOWED_ORIGIN="http://localhost:3001"
```

4. **Siapkan database**

```bash
# Generate Prisma Client
npx prisma generate

# Jalankan migrasi
npx prisma migrate dev

# (Opsional) Seed database
npx prisma db seed
```

5. **Jalankan server pengembangan**

```bash
npm run start:dev
```

Server berjalan di: `http://localhost:3000`

---

## 📡 Dokumentasi API

### Endpoint Autentikasi

#### Register User

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe",
  "birth": "1990-01-01T00:00:00.000Z"
}

Response: 201 Created
{
  "access_token": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

#### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

Response: 200 OK
{
  "access_token": "eyJhbGc...",
  "user": { ... }
}
```

### Endpoint User (Dilindungi)

#### Dapatkan User Saat Ini

```http
GET /api/users/me
Authorization: Bearer {token}

Response: 200 OK
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "birth": "1990-01-01T00:00:00.000Z",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

#### Update Profil

```http
PATCH /api/users/me
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "John Updated",
  "birth": "1990-06-15T00:00:00.000Z"
}

Response: 200 OK
```

#### Ubah Password

```http
PATCH /api/users/me/password
Authorization: Bearer {token}
Content-Type: application/json

{
  "oldPassword": "OldPass123!",
  "newPassword": "NewPass123!"
}

Response: 200 OK
```

### Endpoint Task (Dilindungi)

#### Buat Task

```http
POST /api/tasks
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Complete project",
  "description": "Finish the backend API"
}

Response: 201 Created
```

#### Dapatkan Semua Task

```http
GET /api/tasks
Authorization: Bearer {token}

Response: 200 OK
[
  {
    "id": "uuid",
    "title": "Complete project",
    "description": "Finish the backend API",
    "isCompleted": false,
    "tags": [],
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

#### Update Task

```http
PATCH /api/tasks/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Updated title",
  "isCompleted": true
}

Response: 200 OK
```

#### Hapus Task

```http
DELETE /api/tasks/:id
Authorization: Bearer {token}

Response: 200 OK
```

### Endpoint Tag (Dilindungi)

#### Buat Tag

```http
POST /api/tags
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Work"
}

Response: 201 Created
```

#### Dapatkan Semua Tag

```http
GET /api/tags
Authorization: Bearer {token}

Response: 200 OK
[
  {
    "id": "uuid",
    "name": "Work",
    "tasks": []
  }
]
```

#### Lampirkan Tag ke Task

```http
POST /api/tags/:tagId/attach
Authorization: Bearer {token}
Content-Type: application/json

{
  "taskId": "task-uuid"
}

Response: 200 OK
```

---

## 🧪 Pengujian

### Jalankan Test

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

### Struktur Test E2E

```typescript
// test/auth.e2e-spec.ts
describe('Auth (e2e)', () => {
  it('/auth/register (POST)', () => {
    return request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ email, password, name, birth })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('access_token');
      });
  });

  it('/auth/login (POST)', () => {
    return request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email, password })
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('access_token');
      });
  });
});
```

### Cakupan Test

Cakupan saat ini:

- ✅ Alur autentikasi
- ✅ Validasi token JWT
- ✅ Operasi CRUD tugas
- ✅ Operasi CRUD tag
- ✅ Operasi pengguna
- ✅ Pemeriksaan otorisasi
- ✅ Kesalahan validasi

---

## 🗄️ Skema Database

### Skema Prisma

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  name      String
  birth     DateTime
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  tasks     Task[]
  tags      Tag[]
}

model Task {
  id          String   @id @default(uuid())
  title       String
  description String?
  isCompleted Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  tags        Tag[]
}

model Tag {
  id        String   @id @default(uuid())
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  tasks     Task[]

  @@unique([userId, name])
}
```

### Relasi

```
User (1) ──< (N) Task
User (1) ──< (N) Tag
Task (N) ──< >── (N) Tag  (Many-to-Many)
```

---

## 🔄 Alur Permintaan

Contoh: Membuat tugas

```
1. Permintaan Klien
   ↓
   POST /api/tasks
   Headers: { Authorization: Bearer <token> }
   Body: { title, description }

2. Layer Controller (tasks.controller.ts)
   ↓
   @Post()
   @UseGuards(JwtAuthGuard)  ← Validasi JWT
   create(@CurrentUser() user, @Body() dto)

3. Layer Guard (jwt-auth.guard.ts)
   ↓
   - Memvalidasi token JWT
   - Mengambil user dari token
   - Menginject user ke dalam request

4. Validasi DTO (create-task.dto.ts)
   ↓
   - Memvalidasi title (wajib, string)
   - Memvalidasi description (opsional, string)
   - class-validator memvalidasi secara otomatis

5. Layer Service (tasks.service.ts)
   ↓
   - Logika bisnis
   - Transformasi data
   - Memanggil Prisma

6. Layer Prisma (prisma.service.ts)
   ↓
   - Query aman tipe
   - Operasi database
   - Mengembalikan hasil

7. Respons
   ↓
   201 Created
   { id, title, description, ... }
```

---

## 📊 Pola Desain yang Digunakan

### 1. **Pola Dependency Injection**

```typescript
@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}
  // PrismaService diinject secara otomatis
}
```

### 2. **Pola Repository** (melalui Prisma)

```typescript
// Prisma bertindak sebagai repository
this.prisma.task.findMany();
this.prisma.task.create();
```

### 3. **Pola DTO**

```typescript
// Validasi dan transformasi data
export class CreateTaskDto {
  @IsString() title: string;
  @IsOptional() description?: string;
}
```

### 4. **Pola Guard**

```typescript
// Proteksi Rute
@UseGuards(JwtAuthGuard)
@Get('me')
getProfile() { }
```

### 5. **Pola Decorator**

```typescript
// Decorator kustom untuk kode yang lebih bersih
@CurrentUser() user: User
```

---

## 🎯 Praktik Terbaik yang Diterapkan

- ✅ **Arsitektur Modular** - Modul berbasis fitur
- ✅ **Dependency Injection** - Penggabungan longgar (Loose coupling)
- ✅ **DTO dengan validasi** - Input aman tipe
- ✅ **Guards untuk auth** - Keamanan terpusat
- ✅ **Layer Service** - Pemisahan logika bisnis
- ✅ **Prisma ORM** - Query database aman tipe
- ✅ **Environment variables** - Manajemen konfigurasi
- ✅ **Penanganan Error** - Respons konsisten
- ✅ **Pengujian E2E** - Cakupan tes komprehensif
- ✅ **TypeScript strict mode** - Keamanan tipe maksimum

---

## 📚 Sumber Daya

- [Dokumentasi NestJS](https://docs.nestjs.com)
- [Dokumentasi Prisma](https://www.prisma.io/docs)
- [Strategi Passport JWT](http://www.passportjs.org/packages/passport-jwt/)
- [class-validator](https://github.com/typestack/class-validator)

---

## 👥 Penulis

Mohamad Bima Yudha

---

**Dibuat dengan ❤️ menggunakan NestJS dan TypeScript**
