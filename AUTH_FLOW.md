# 🔐 Alur Autentikasi & Otorisasi Backend

Dokumen ini menjelaskan bagaimana sistem keamanan (Authentication & Authorization) bekerja pada aplikasi ini menggunakan **NestJS**, **Passport-JWT**, dan **Prisma**.

---

## 🟢 Tahap 1: Autentikasi (Proses Login)

Proses ini terjadi saat pengguna pertama kali masuk untuk mendapatkan "kunci akses" (Token).

### 1. Pintu Masuk (`AuthController`)

Controller menerima permintaan HTTP POST dari client berisi kredensial (email & password).

```typescript
// src/auth/auth.controller.ts
@Post('login')
async login(@Body() loginDto: LoginDto) {
  // Menerima data, lalu serahkan ke AuthService untuk diproses
  return this.authService.login(loginDto);
}
```

### 2. Validasi & Pembuatan Token (`AuthService`)

Service melakukan logika bisnis utama:

1.  **Validasi User**: Memeriksa apakah user ada di database.
2.  **Validasi Password**: Membandingkan password input dengan hash di database (`bcrypt`).
3.  **Generate Token**: Jika valid, membuat JWT Token yang ditandatangani dengan `JWT_SECRET`.

```typescript
// src/auth/auth.service.ts
async login(user: any) {
  const payload = { sub: user.id, email: user.email };

  return {
    access_token: this.jwtService.sign(payload), // <--- Token dibuat di sini
    user: { ... }
  };
}
```

---

## 🔴 Tahap 2: Otorisasi (Mengakses Data Terlindung)

Proses ini terjadi setiap kali pengguna mengakses endpoint yang dilindungi (misal: `/tasks`, `/profile`).

### 1. Penjaga Pintu (`JwtAuthGuard`)

Guard adalah lapisan keamanan pertama yang mencegat request sebelum sampai ke Controller tujuan.

```typescript
// src/tasks/tasks.controller.ts
@UseGuards(JwtAuthGuard) // <--- Request dicegat di sini
@Controller('tasks')
export class TasksController { ... }
```

### 2. Pemeriksaan Token & Strategi (`JwtStrategy`)

Ini adalah "otak" dari sistem keamanan kita. Kelas ini mewarisi `PassportStrategy` dan berjalan otomatis saat Guard diaktifkan.

Tugas utamanya:

1.  **Ekstrak Token**: Mengambil token dari header `Authorization: Bearer <token>`.
2.  **Verifikasi Signature**: Memastikan token dibuat oleh server ini menggunakan `JWT_SECRET` yang valid (dari `.env` via `ConfigService`).
3.  **Validasi Payload**: Membaca isi token (`sub` / userId).

```typescript
// src/auth/jwt.strategy.ts
constructor(
    private configService: ConfigService, // Inject ConfigService
) {
    super({
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        ignoreExpiration: false,
        secretOrKey: configService.get<string>('JWT_SECRET'), // Kunci Rahasia
    });
}
```

### 3. Validasi User Terakhir (`validate` method)

Setelah token dipastikan asli secara kriptografi, kita melakukan pemeriksaan logis ke database.

```typescript
// src/auth/jwt.strategy.ts
async validate(payload: { sub: string }) {
    // Cari user di database berdasarkan ID di dalam token
    const user = await this.prisma.user.findUnique({
        where: { id: payload.sub }
    });

    // Jika user sudah dihapus dari DB (walau token masih valid), tolak akses
    if (!user) {
        throw new UnauthorizedException();
    }

    // PENTING: Object yang direturn di sini akan ditempel ke `request.user`
    return user;
}
```

### 4. Akses Diberikan & Penggunaan (`Controller`)

Jika semua lolos, request diteruskan ke handler di Controller. Kita bisa mengakses data user yang sedang login lewat decorator `@CurrentUser()` atau `req.user`.

```typescript
// src/tasks/tasks.controller.ts
@Post()
create(
    @CurrentUser() user: User, // <--- Data user dari JwtStrategy tadi
    @Body() createTaskDto: CreateTaskDto
) {
    // Kita tahu task ini milik siapa
    return this.tasksService.create(createTaskDto, user.id);
}
```

---

## 🔑 Komponen Kunci

| Komponen          | Peran           | Analogi                                            |
| :---------------- | :-------------- | :------------------------------------------------- |
| **AuthService**   | Logic Login     | Petugas Loket (Pengecekan KTP & Pemberian Tiket)   |
| **JWT Token**     | Kredensial      | Gelang Tiket Masuk                                 |
| **JwtAuthGuard**  | Middleware      | Pagar Pembatas Wahana                              |
| **JwtStrategy**   | Token Validator | Penjaga Pintu Wahana (Cek Gelang & Orangnya)       |
| **ConfigService** | Konfigurasi     | Buku Panduan Kode Rahasia (Menyimpan `JWT_SECRET`) |

---

## ⚠️ Troubleeshooting 401 Unauthorized

Jika Anda mendapatkan error `401 Unauthorized` padahal sudah login:

1.  **Cek `JWT_SECRET`**: Pastikan secret key di `.env` sama persis saat token dibuat (login) dan saat token divalidasi.
2.  **Restart Server**: Perubahan `.env` memerlukan restart server.
3.  **Header Authorization**: Pastikan frontend mengirim header: `Authorization: Bearer <token_anda>`.
