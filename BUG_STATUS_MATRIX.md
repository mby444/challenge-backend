# API Endpoints - Bug Status Matrix

## 📊 Complete Bug Matrix

| Endpoint                         | Method | Auth | Bug Status  | Issues Found                   | Severity    |
| -------------------------------- | ------ | ---- | ----------- | ------------------------------ | ----------- |
| `/api/auth/register`             | POST   | ❌   | ✅ CLEAN    | None                           | -           |
| `/api/auth/login`                | POST   | ❌   | ✅ CLEAN    | None                           | -           |
| `/api/users/me`                  | GET    | ✅   | ✅ CLEAN    | None                           | -           |
| `/api/users/me`                  | PATCH  | ✅   | ⚠️ ISSUE    | Missing error handling         | 🟠 Medium   |
| `/api/users/me`                  | DELETE | ✅   | ⚠️ ISSUE    | Missing error handling         | 🟠 Medium   |
| `/api/tasks`                     | POST   | ✅   | ⚠️ ISSUE    | Missing tags in response       | 🟡 High     |
| `/api/tasks`                     | GET    | ✅   | ✅ CLEAN    | None                           | -           |
| `/api/tasks/:id`                 | GET    | ✅   | ✅ CLEAN    | None                           | -           |
| `/api/tasks/:id`                 | PATCH  | ✅   | ⚠️ ISSUE    | Missing tags + Duplicate query | 🟡 High     |
| `/api/tasks/:id`                 | DELETE | ✅   | ⚠️ ISSUE    | Duplicate query                | 🟠 Medium   |
| `/api/tags`                      | POST   | ✅   | 🔴 CRITICAL | Schema bug - Global unique     | 🔴 Critical |
| `/api/tags`                      | GET    | ✅   | ✅ CLEAN    | None                           | -           |
| `/api/tags/:id`                  | GET    | ✅   | ✅ CLEAN    | None                           | -           |
| `/api/tags/:id`                  | PATCH  | ✅   | 🔴 CRITICAL | Schema + Duplicate + Wasteful  | 🔴 Critical |
| `/api/tags/:id`                  | DELETE | ✅   | ⚠️ ISSUE    | Duplicate query                | 🟠 Medium   |
| `/api/tags/:tagId/tasks/:taskId` | POST   | ✅   | ⚠️ ISSUE    | No dup check + Duplicate query | 🟠 Medium   |
| `/api/tags/:tagId/tasks/:taskId` | DELETE | ✅   | ⚠️ ISSUE    | No exist check + Duplicate     | 🟠 Medium   |

**Total Endpoints:** 17  
**Clean Endpoints:** 7 (41%)  
**Endpoints with Issues:** 10 (59%)  
**Critical Issues:** 2 endpoints

---

## 🎯 Bug Distribution by Resource

| Resource  | Total Endpoints | Clean | With Issues | Critical |
| --------- | --------------- | ----- | ----------- | -------- |
| **Auth**  | 2               | 2 ✅  | 0           | 0        |
| **Users** | 3               | 1     | 2 ⚠️        | 0        |
| **Tasks** | 5               | 2     | 3 ⚠️        | 0        |
| **Tags**  | 7               | 2     | 5 ⚠️        | 2 🔴     |
| **TOTAL** | **17**          | **7** | **10**      | **2**    |

---

## 📈 Bug Types Distribution

| Bug Type                  | Count | Affected Endpoints         |
| ------------------------- | ----- | -------------------------- |
| 🔴 Database Schema Issue  | 1     | POST/PATCH /api/tags       |
| 🟡 Missing Response Data  | 2     | POST/PATCH /api/tasks      |
| 🟠 Duplicate Queries      | 6     | PATCH/DELETE tasks/tags    |
| 🟠 Missing Error Handling | 2     | PATCH/DELETE /api/users/me |
| 🟠 Wasteful Data Fetching | 1     | PATCH /api/tags/:id        |
| 🟢 Missing Validations    | 2     | Attach/detach tag-task     |

---

## 🔍 Detailed Issues by Category

### 🔴 CRITICAL (Must Fix Immediately)

#### Database Schema - Tag Name Constraint

**Root Cause:** `prisma/schema.prisma` line 42

```prisma
name String @unique  // ❌ Global unique - WRONG!
```

**Impact:**

- Multiple users cannot create tags with same name
- E.g., User A creates "Urgent" → User B CANNOT create "Urgent"
- Business logic broken

**Affected Endpoints:**

1. `POST /api/tags` - Returns 409 Conflict incorrectly
2. `PATCH /api/tags/:id` - Returns 409 Conflict incorrectly

**Fix:** Remove `@unique` constraint (keep `@@unique([userId, name])`)

---

### 🟡 HIGH PRIORITY (Fix ASAP)

#### Missing Tags in Task Response

**Root Cause:** `src/tasks/tasks.service.ts`

**Affected Endpoints:**

1. `POST /api/tasks` - Response missing `tags: []`
2. `PATCH /api/tasks/:id` - Response missing `tags: [...]`

**Impact:**

- Inconsistent response structure
- `GET` returns tags, but `POST/PATCH` don't
- Frontend must make extra requests

**Fix:** Add `include: { tags: true }` to create and update

---

### 🟠 MEDIUM PRIORITY (Fix Soon)

#### Duplicate Database Queries

**Root Cause:** Validate → Then Update/Delete pattern

**Affected Endpoints:**

1. `PATCH /api/tasks/:id` - 2 queries instead of 1
2. `DELETE /api/tasks/:id` - 2 queries instead of 1
3. `PATCH /api/tags/:id` - 2 queries instead of 1
4. `DELETE /api/tags/:id` - 2 queries instead of 1
5. `POST /api/tags/:tagId/tasks/:taskId` - 4 queries instead of 2
6. `DELETE /api/tags/:tagId/tasks/:taskId` - 4 queries instead of 2

**Impact:**

- 2x database load
- Slower response time
- Potential race conditions
- Not scalable

**Fix:** Use compound where clause: `where: { id, userId }`

---

#### Missing Error Handling

**Root Cause:** `src/users/users.service.ts`

**Affected Endpoints:**

1. `PATCH /api/users/me` - No catch for P2025 error
2. `DELETE /api/users/me` - No catch for P2025 error

**Impact:**

- Generic Prisma errors exposed to client
- Not user-friendly error messages
- Inconsistent with other endpoints

**Fix:** Add try-catch with P2025 handling

---

#### Wasteful Data Fetching

**Root Cause:** `src/tags/tags.service.ts` line 60

**Affected Endpoints:**

1. `PATCH /api/tags/:id` - Fetches tasks unnecessarily

**Impact:**

- Slower query performance
- Wasted bandwidth
- Unnecessary memory usage

**Fix:** Remove `include: { tasks: true }` from validation query

---

### 🟢 LOW PRIORITY (Improvements)

#### No Duplicate Connection Check

**Affected Endpoints:**

1. `POST /api/tags/:tagId/tasks/:taskId` - Can attach twice?
2. `DELETE /api/tags/:tagId/tasks/:taskId` - Can detach non-existent?

**Impact:**

- Unclear behavior on duplicate operations
- Possible confusing errors

---

## 📋 Fix Priority Roadmap

### Phase 1: CRITICAL (Do First) ⏱️ ~15 min

- [ ] Fix Tag schema unique constraint
- [ ] Generate and run migration
- [ ] Test with multiple users

### Phase 2: HIGH PRIORITY ⏱️ ~30 min

- [ ] Add tags to task create response
- [ ] Add tags to task update response
- [ ] Test response structure

### Phase 3: MEDIUM PRIORITY ⏱️ ~1 hour

- [ ] Optimize all duplicate queries (6 endpoints)
- [ ] Add error handling to users endpoints (2 endpoints)
- [ ] Remove wasteful include from tag update
- [ ] Test performance improvements

### Phase 4: LOW PRIORITY ⏱️ ~30 min

- [ ] Add duplicate connection validation
- [ ] Standardize error messages
- [ ] Add DTO edge case validations

**Total Estimated Time:** ~2.5 hours

---

## ✅ Testing Checklist

After fixes, test each endpoint:

### Critical Fixes

- [ ] Two different users can create tags with same name
- [ ] Tag update doesn't conflict with other users' tags

### High Priority Fixes

- [ ] Task create returns tags field
- [ ] Task update returns tags field with data

### Medium Priority Fixes

- [ ] Check database query logs - should see fewer queries
- [ ] Measure response times - should be faster
- [ ] Test user update/delete with invalid ID
- [ ] Tag update shouldn't fetch tasks in validation

### Low Priority Fixes

- [ ] Test duplicate tag-task attachment
- [ ] Test detaching non-existent tag-task relation

---

## 📊 Before/After Metrics

| Metric                 | Before       | After Fix    | Improvement |
| ---------------------- | ------------ | ------------ | ----------- |
| Clean Endpoints        | 7/17 (41%)   | 17/17 (100%) | +59% ✅     |
| Avg Queries per Update | 2            | 1            | -50% ⚡     |
| Avg Queries per Delete | 2            | 1            | -50% ⚡     |
| Critical Bugs          | 1            | 0            | -100% 🎉    |
| Schema Issues          | 1            | 0            | Fixed ✅    |
| Error Handling         | Inconsistent | Consistent   | Improved ✅ |

---

_Status Matrix Last Updated: February 10, 2026_  
_Next Review: After all fixes completed_
