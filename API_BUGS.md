# Catatan Bug-Bug pada API

## 🔴 CRITICAL BUGS

### 1. Database Schema - Tag Model ✅ FIXED

**Status:** ✅ **FIXED on February 10, 2026 at 11:26 AM**  
**Migration:** `20260210042432_remove_global_unique_constraint_on_tag_name`  
**Details:** See `CRITICAL_BUG_FIX_REPORT.md`

**File:** `prisma/schema.prisma`  
**Lokasi:** Line 42

**Bug:**

```prisma
name      String    @unique  // ❌ BUG: Global unique constraint
```

**Penjelasan:**

- Field `name` memiliki constraint `@unique` yang membuat nama tag harus unique secara GLOBAL
- Padahal di line 49 sudah ada `@@unique([userId, name])` yang benar
- Ini menyebabkan user tidak bisa membuat tag dengan nama yang sama meskipun tag tersebut milik user lain

**Impact:**

- ✅ User A bisa buat tag "Urgent"
- ❌ User B tidak bisa buat tag "Urgent" karena sudah ada (konflik dengan User A)
- ❌ Seharusnya: User B bisa buat tag "Urgent" karena berbeda user

**Error yang muncul:**

- `ConflictException: Tag with this name already exists for this user`
- Error message misleading karena sebenarnya tag tersebut milik user lain

**Fix yang diterapkan:**

```prisma
name      String    // ✅ Removed @unique constraint
```

**Affected Endpoints:**

- `POST /api/tags` - ✅ FIXED - Sekarang bisa membuat tag dengan nama yang sama dengan user lain
- `PATCH /api/tags/:id` - ✅ FIXED - Sekarang bisa update tag dengan nama yang sama dengan user lain

---

## 🟡 HIGH SEVERITY BUGS

### 2. Task Update - Missing Response Include

**File:** `src/tasks/tasks.service.ts`  
**Method:** `update()` - Line 64-67

**Bug:**

```typescript
return this.prisma.task.update({
  where: { id },
  data: updateTaskDto,
  // ❌ Missing: include: { tags: true }
});
```

**Penjelasan:**

- Endpoint `PATCH /api/tasks/:id` tidak return tags
- Sedangkan `GET /api/tasks/:id` return tags
- Inkonsistensi response structure

**Impact:**

- Response dari update task tidak include tags
- Frontend harus melakukan query tambahan untuk mendapatkan tags
- Inkonsistensi dengan endpoint GET

**Fix yang diperlukan:**

```typescript
return this.prisma.task.update({
  where: { id },
  data: updateTaskDto,
  include: { tags: true }, // ✅ Add this
});
```

---

### 3. Task Create - Missing Response Include

**File:** `src/tasks/tasks.service.ts`  
**Method:** `create()` - Line 15-20

**Bug:**

```typescript
return this.prisma.task.create({
  data: {
    ...createTaskDto,
    userId: userId,
  },
  // ❌ Missing: include: { tags: true }
});
```

**Penjelasan:**

- Endpoint `POST /api/tasks` tidak return tags (default empty array)
- Inkonsistensi dengan GET dan seharusnya PATCH

**Impact:**

- Response dari create task tidak include tags field
- Frontend mungkin error jika expect tags field

**Fix yang diperlukan:**

```typescript
return this.prisma.task.create({
  data: {
    ...createTaskDto,
    userId: userId,
  },
  include: { tags: true }, // ✅ Add this
});
```

---

## 🟠 MEDIUM SEVERITY BUGS

### 4. Duplicate Database Queries - Performance Issue

**File:** `src/tasks/tasks.service.ts`  
**Methods:** `update()` dan `remove()`

**Bug di update():** Line 50-67

```typescript
// First query
const task = await this.prisma.task.findUnique({
  where: { id },
});

// ... validation ...

// Second query (duplicate)
return this.prisma.task.update({
  where: { id }, // ❌ Same ID, queried twice
  data: updateTaskDto,
});
```

**Bug di remove():** Line 71-87

```typescript
// First query
const task = await this.prisma.task.findUnique({
  where: { id },
});

// ... validation ...

// Second query (duplicate)
await this.prisma.task.delete({
  where: { id }, // ❌ Same ID, queried twice
});
```

**Penjelasan:**

- Query database 2 kali untuk ID yang sama
- Query pertama untuk validasi ownership
- Query kedua untuk update/delete
- Tidak efficient, menambah database load

**Impact:**

- Performance overhead (2x database query)
- Potential race condition (data bisa berubah di antara 2 query)
- Tidak efficient terutama untuk high-traffic API

**Fix yang diperlukan:**
Gunakan transaction atau handle error dari Prisma:

```typescript
async update(userId: string, id: string, updateTaskDto: UpdateTaskDto) {
  try {
    return await this.prisma.task.update({
      where: { id, userId }, // ✅ Single query with userId filter
      data: updateTaskDto,
      include: { tags: true },
    });
  } catch (error) {
    if (error.code === 'P2025') { // Record not found
      throw new NotFoundException(`Task not found`);
    }
    throw error;
  }
}
```

**Sama berlaku untuk:** `tags.service.ts` methods `update()`, `remove()`, `attachToTask()`, `detachFromTask()`

---

### 5. Tag Update - Unnecessary Include in Validation Query

**File:** `src/tags/tags.service.ts`  
**Method:** `update()` - Line 58-60

**Bug:**

```typescript
const tag = await this.prisma.tag.findUnique({
  where: { id },
  include: { tasks: true }, // ❌ Unnecessary, only need to check existence
});
```

**Penjelasan:**

- Include tasks tidak diperlukan untuk validasi
- Hanya perlu check apakah tag exist dan userId match
- Fetch data tasks yang tidak terpakai (waste bandwidth & memory)

**Impact:**

- Unnecessary data fetching
- Slower response time
- Increased memory usage

**Fix:**

```typescript
const tag = await this.prisma.tag.findUnique({
  where: { id },
  // ✅ Remove include, hanya perlu id dan userId untuk validasi
});
```

---

### 6. Users Update - Missing Validation

**File:** `src/users/users.service.ts`  
**Method:** `update()` - Line 17-23

**Bug:**

```typescript
async update(userId: string, updateUserDto: UpdateUserDto) {
  const { password, ...user } = await this.prisma.user.update({
    where: { id: userId },
    data: updateUserDto,
  });

  return user;
}
```

**Penjelasan:**

- Tidak ada validasi apakah user exists sebelum update
- Jika userId tidak valid, akan throw Prisma error bukan custom error
- Error message tidak user-friendly

**Impact:**

- Error message tidak jelas untuk user
- Tidak consistent dengan error handling di endpoint lain

**Potential improvement:**

```typescript
async update(userId: string, updateUserDto: UpdateUserDto) {
  try {
    const { password, ...user } = await this.prisma.user.update({
      where: { id: userId },
      data: updateUserDto,
    });
    return user;
  } catch (error) {
    if (error.code === 'P2025') {
      throw new NotFoundException('User not found');
    }
    throw error;
  }
}
```

---

### 7. Users Remove - Missing Validation

**File:** `src/users/users.service.ts`  
**Method:** `remove()` - Line 26-28

**Bug:**

```typescript
async remove(userId: string) {
  await this.prisma.user.delete({ where: { id: userId } });
}
```

**Penjelasan:**

- Sama seperti update, tidak ada error handling
- Jika user sudah tidak exist, akan throw Prisma error

**Impact:**

- Error message tidak user-friendly
- Tidak consistent dengan endpoint lain

---

## 🟢 LOW SEVERITY / IMPROVEMENTS

### 8. Tag Attach/Detach - Potential Duplicate Connection

**File:** `src/tags/tags.service.ts`  
**Methods:** `attachToTask()` dan `detachFromTask()`

**Observation:**

```typescript
// attachToTask() - Line 136-140
return this.prisma.tag.update({
  where: { id: tagId, userId },
  data: { tasks: { connect: [{ id: taskId }] } },
  include: { tasks: true },
});
```

**Potensi Issue:**

- Jika tag sudah terhubung dengan task, connect lagi akan error atau diabaikan?
- Tidak ada pengecekan apakah tag-task relation sudah exists
- Prisma mungkin handle ini, tapi tidak explicit

**Potential improvement:**

- Add validation: Check if tag-task relation already exists
- Return appropriate error: "Tag already attached to this task"
- Or make it idempotent (ignore if already connected)

**Sama untuk detachFromTask:**

- Tidak ada validasi apakah relation exists sebelum disconnect
- Bisa disconnect relation yang tidak ada?

---

### 9. Error Message Consistency

**Multiple Files**

**Issue:**
Error messages tidak consistent:

- `Task not found`
- `Tag not found`
- `You are not authorized to access task with ID ${id}`
- `You are not authorized to connect tag with ID ${tagId}`

**Potential improvement:**
Standardize error messages:

```typescript
// Option 1: Simple
throw new NotFoundException('Resource not found');
throw new UnauthorizedException('Access denied');

// Option 2: Detailed
throw new NotFoundException(`Task with ID ${id} not found`);
throw new UnauthorizedException(`Unauthorized to access this resource`);
```

---

### 10. Missing Input Validation Edge Cases

**DTOs - Multiple Files**

**Potential Issues:**

**RegisterUserDto:**

- `birth` - Tidak ada validasi apakah tanggal di masa depan
- `birth` - Tidak ada validasi umur minimum (e.g., must be 13+)
- `name` - Tidak ada validasi panjang minimum/maksimum
- `email` - Tidak ada sanitization

**CreateTaskDto:**

- `title` - Tidak ada max length validation
- `description` - Tidak ada max length validation

**CreateTagDto:**

- `name` - Tidak ada max length validation
- `name` - Tidak ada validasi characters (allow special chars?)

---

## 📊 Summary

| Severity    | Count  | Description                                      |
| ----------- | ------ | ------------------------------------------------ |
| 🔴 Critical | 1      | Database schema bug (Tag name unique constraint) |
| 🟡 High     | 3      | Missing response includes, duplicate queries     |
| 🟠 Medium   | 4      | Performance issues, missing validations          |
| 🟢 Low      | 3      | Improvements, consistency issues                 |
| **Total**   | **11** | **Bugs & Issues found**                          |

---

## 🔧 Prioritas Perbaikan

### **Priority 1 - Must Fix:**

1. ✅ Fix Tag schema - Remove global unique constraint on name
2. ✅ Add include tags to task create and update responses

### **Priority 2 - Should Fix:**

3. Optimize duplicate queries (use single query with userId filter)
4. Add proper error handling to users service
5. Remove unnecessary includes in validation queries

### **Priority 3 - Nice to Have:**

6. Add validation for duplicate tag-task connections
7. Standardize error messages
8. Add more DTO validations

---

_Last updated: February 10, 2026_  
_Total issues found: 11_  
_Critical issues: 1_
