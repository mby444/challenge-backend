Berikut adalah penjelasan mengapa validasi berfungsi di Postman tetapi gagal dalam tes E2E:

**Penyebab Masalah: `ValidationPipe` Tidak Diaktifkan dalam Lingkungan Tes E2E**

Setelah meninjau kode `src/main.ts` dan beberapa file tes e2e (`test/users.e2e-spec.ts` dan `test/auth.e2e-spec.ts`), saya menemukan alasan utama di balik perbedaan perilaku validasi:

1.  **Aplikasi Normal (`src/main.ts`):**
    *   Di `src/main.ts`, Anda secara eksplisit mengaktifkan `ValidationPipe` secara global dengan baris kode:
        ```typescript
        app.useGlobalPipes(new ValidationPipe());
        ```
    *   Ini memastikan bahwa setiap kali aplikasi dijalankan secara normal (misalnya, untuk pengembangan atau produksi), semua permintaan masuk akan melewati `ValidationPipe`. Pipa ini secara otomatis memvalidasi data berdasarkan decorator `class-validator` yang Anda tempatkan di DTO Anda (misalnya, `@IsString()`, `@IsEmail()`, `@MinLength()`). Jika validasi gagal, pipa akan menginterupsi permintaan dan mengembalikan `400 Bad Request` secara otomatis.
    *   Ketika Anda menguji dengan Postman, Anda berinteraksi dengan instance aplikasi yang dijalankan oleh `src/main.ts`, sehingga `ValidationPipe` aktif dan validasi berfungsi sebagaimana mestinya.

2.  **Lingkungan Tes E2E (`*.e2e-spec.ts`):**
    *   Dalam file tes e2e Anda (misalnya, `test/users.e2e-spec.ts`, `test/auth.e2e-spec.ts`), Anda membuat instance aplikasi terpisah untuk tujuan pengujian:
        ```typescript
        const moduleFixture: TestingModule = await Test.createTestingModule({
          imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
        ```
    *   Meskipun `AppModule` diimpor, pemanggilan `moduleFixture.createNestApplication()` membuat instance `INestApplication` yang **baru dan terpisah**. Instance ini *tidak secara otomatis mewarisi* konfigurasi pipa global yang telah Anda tetapkan di `src/main.ts`.
    *   Oleh karena itu, baris `app.useGlobalPipes(new ValidationPipe());` **tidak dijalankan** pada instance `app` yang digunakan oleh tes e2e Anda. Akibatnya, `ValidationPipe` tidak aktif di lingkungan tes.

**Bagaimana Ini Menjelaskan Kegagalan Tes:**

*   **`UsersModule` (`name: 123`):** Karena `ValidationPipe` tidak aktif, data `invalidUpdateUserDto = { name: 123 }` tidak divalidasi di tingkat awal. Ini memungkinkan `123` (sebagai angka) diteruskan ke `UsersService` dan akhirnya ke Prisma, yang kemudian gagal karena Prisma mengharapkan `String` untuk kolom `name`. Ini menghasilkan `PrismaClientValidationError` dan `500 Internal Server Error`, bukan `400 Bad Request` yang diharapkan dari `ValidationPipe`.
*   **`AuthModule` (Pendaftaran dengan data tidak valid):** Demikian pula, data seperti `email: 'invalid-email'` dan `password: 'short'` melewati validasi DTO karena `ValidationPipe` tidak aktif. Aplikasi kemudian mungkin mencoba memproses data ini lebih lanjut, dan jika tidak ada validasi lain di lapisan servis, bisa saja menghasilkan `201 Created` atau gagal dengan cara yang tidak terduga. Tes mengharapkan `400 Bad Request` dari `ValidationPipe`, tetapi karena pipa tidak ada, ekspektasi tersebut tidak terpenuhi.
*   **`TagsModule` (Duplikasi nama tag):** Jika `ValidationPipe` tidak aktif, validasi kustom untuk memastikan tag unik per pengguna (jika ada) mungkin juga tidak terpicu. Ini menyebabkan permintaan mencapai database, dan pelanggaran batasan unik (`Unique constraint failed on the fields: (userId, name)`) ditangkap oleh Prisma sebagai `PrismaClientKnownRequestError` dengan kode `P2002`, menghasilkan `500 Internal Server Error` alih-alih `409 Conflict` dari logika aplikasi Anda.

**Solusi:**

Untuk mengatasi masalah ini, Anda perlu secara eksplisit mengaktifkan `ValidationPipe` pada instance aplikasi yang Anda buat dalam tes e2e Anda. Anda dapat melakukannya dengan menambahkan baris berikut di dalam blok `beforeEach` Anda, setelah `app = moduleFixture.createNestApplication();` dan sebelum `await app.init();`:

```typescript
app.useGlobalPipes(new ValidationPipe());
```

Ini akan menyelaraskan perilaku validasi di lingkungan tes e2e Anda dengan perilaku aplikasi yang sebenarnya.