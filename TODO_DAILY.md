# Tugas Harian

## 6 Februari 2026

- Menambah tabel Tag
- Menambah CRUD tag

## 7 Februari 2026

- Menambahkan endpoint:
  1. Memperbarui informasi akun pengguna sendiri yang sudah terautentikasi.
  2. Menghapus akun pengguna sendiri yang sudah terautentikasi
  3. (done, namun masih menerima field isCompleted) Memperbarui detail tugas yang ada berdasarkan ID, yang dimiliki oleh pengguna yang terautentikasi.

  Detail implementasi:
  Endpoint Pengguna (/api/users)
  - PATCH /api/users/me - Memperbarui nama dan tanggal lahir pengguna.
  - DELETE /api/users/me - Menghapus akun pengguna.

- Melakukan API testing
