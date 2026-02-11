# Database Seeding Guide

## ✅ Seeding Successfully Configured!

**Date:** February 11, 2026  
**Time:** 2:10 PM

---

## 📋 Overview

Database seeding script telah berhasil dibuat untuk mengisi database dengan data dummy yang realistic menggunakan **@faker-js/faker**.

---

## 🌱 Seed Data Summary

### Data yang Di-seed:

| Type         | Count  | Description                                 |
| ------------ | ------ | ------------------------------------------- |
| 👥 **Users** | 5      | Users dengan email dan password valid       |
| 🏷️ **Tags**  | ~25-35 | Tags random per user (3-7 tags/user)        |
| 📝 **Tasks** | ~40-60 | Tasks dengan descriptions (5-12 tasks/user) |

### Data Relationships:

- ✅ Setiap user memiliki tags sendiri
- ✅ Setiap task belongs to 1 user
- ✅ Tasks dapat memiliki multiple tags (70% probability)
- ✅ Tag-task relationships realistic (1-3 tags per task)

---

## 🔑 Login Credentials

**All seeded users share the same password:**

```
Password: Password123!
```

**Sample User Emails:**

```
vicky.balistreri-mcglynn8@yahoo.com
ron.kulas68@yahoo.com
stewart_kertzmann@yahoo.com
carl.swaniawski40@yahoo.com
zetta_hahn@hotmail.com
```

**Note:** Email addresses are randomly generated each time you run seeding.

---

## 🚀 How to Run Seeding

### Method 1: Using Prisma Command (Recommended)

```bash
npx prisma db seed
```

### Method 2: Direct Execution

```bash
npx ts-node prisma/seed.ts
```

### Reset Database and Re-seed

```bash
# Reset database (delete all data)
npx prisma migrate reset

# Seed will run automatically after reset
# Or manually:
npx prisma db seed
```

---

## 📁 Files Modified/Created

### 1. `prisma/seed.ts` ✅

**Comprehensive seeding script with:**

- User creation with faker data
- Tag creation (15 predefined tag names)
- Task creation with realistic data
- Tag-task associations
- Progress logging
- Summary output

**Key Features:**

- ✅ Type-safe TypeScript
- ✅ Uses Prisma adapter for better-sqlite3
- ✅ Faker for realistic data
- ✅ Proper error handling
- ✅ Clean existing data before seeding
- ✅ Detailed console output

### 2. `prisma.config.ts` ✅

**Added seed command:**

```typescript
migrations: {
  path: "prisma/migrations",
  seed: "ts-node prisma/seed.ts",
}
```

### 3. `package.json` ✅

**Dependencies added:**

- `tsx` - TypeScript executor
- `@faker-js/faker` - Already present

---

## 📊 Seeding Output Example

```
🌱 Starting database seeding...

🧹 Cleaning existing data...
✅ Database cleaned

👥 Creating users...
  ✓ Created user: Vicky Balistreri-McGlynn (vicky.balistreri-mcglynn8@yahoo.com)
  ✓ Created user: Ron Kulas (ron.kulas68@yahoo.com)
  ✓ Created user: Stewart Kertzmann (stewart_kertzmann@yahoo.com)
  ✓ Created user: Carl Swaniawski (carl.swaniawski40@yahoo.com)
  ✓ Created user: Zetta Hahn (zetta_hahn@hotmail.com)
✅ Created 5 users

🏷️  Creating tags...
  ✓ Created 4 tags for Vicky Balistreri-McGlynn
  ✓ Created 7 tags for Ron Kulas
  ✓ Created 5 tags for Stewart Kertzmann
  ✓ Created 7 tags for Carl Swaniawski
  ✓ Created 6 tags for Zetta Hahn
✅ Created 29 tags total

📝 Creating tasks...
  ✓ Created 11 tasks for Vicky Balistreri-McGlynn
  ✓ Created 5 tasks for Ron Kulas
  ✓ Created 8 tasks for Stewart Kertzmann
  ✓ Created 5 tasks for Carl Swaniawski
  ✓ Created 6 tasks for Zetta Hahn
✅ Created 35 tasks total

📊 Seeding Summary:
═══════════════════════════════════════
👥 Users:  5
🏷️  Tags:   29
📝 Tasks:  35
═══════════════════════════════════════

📋 Sample Data:

👤 Vicky Balistreri-McGlynn (vicky.balistreri-mcglynn8@yahoo.com)
   Tasks:
   ⏳ Sleek Metal Keyboard
      Tags: Home, Urgent
   ✅ shoot legislature
      Tags: Family
   ⏳ task baritone
      Tags: Urgent, Family, Home


🎉 Database seeding completed successfully!
💡 You can now start the application and login with any seeded user.
🔑 Default password for all users: "Password123!" (hashed)
```

---

## 🎯 Seed Data Details

### Users

- **Count:** 5 users
- **Fields:**
  - ✅ Email: Random realistic emails
  - ✅ Password: Bcrypt hash of "Password123!"
  - ✅ Name: Random first + last names
  - ✅ Birth: Random dates (18-65 years old)

### Tags

- **Predefined Names:** Personal, Work, Urgent, Important, Low Priority, Health, Finance, Shopping, Learning, Family, Projects, Ideas, Goals, Travel, Home
- **Per User:** 3-7 random tags
- **Uniqueness:** Each user can have duplicate tag names (fixed critical bug!)

### Tasks

- **Title Sources:**
  - Hacker phrases (e.g., "bypass the optical firewall")
  - Commerce products (e.g., "Sleek Metal Keyboard")
  - Random verb + noun combinations
  - Company catch phrases
- **Description:** 60% chance of having description (5-15 word sentence)
- **isCompleted:** 30% chance of being completed
- **Tags:** 70% chance of having 1-3 tags

---

## 🔧 Configuration

### Prisma Adapter Setup

The seed script uses the same adapter as the main application:

```typescript
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || 'file:./prisma/data.db',
});
const prisma = new PrismaClient({ adapter });
```

This ensures compatibility with Prisma v7 and SQLite.

---

## 📝 Customization

### Change Number of Users

Edit line 20 in `prisma/seed.ts`:

```typescript
for (let i = 0; i < 5; i++) {  // Change 5 to desired number
```

### Change Tags Per User

Edit line 45 in `prisma/seed.ts`:

```typescript
const numTags = faker.number.int({ min: 3, max: 7 }); // Adjust min/max
```

### Change Tasks Per User

Edit line 73 in `prisma/seed.ts`:

```typescript
const numTasks = faker.number.int({ min: 5, max: 12 }); // Adjust min/max
```

### Add Custom Tag Names

Edit line 38-41 in `prisma/seed.ts`:

```typescript
const tagNames = [
  'Personal',
  'Work',
  'Urgent', // Add your custom tags here
];
```

---

## ✅ Verification

### Check Seeded Data

**Using Prisma Studio:**

```bash
npx prisma studio
```

Then browse to http://localhost:5555 to see all seeded data.

**Using Database Queries:**

```bash
# Count users
npx prisma db execute --stdin <<< "SELECT COUNT(*) FROM User;"

# Count tags
npx prisma db execute --stdin <<< "SELECT COUNT(*) FROM Tag;"

# Count tasks
npx prisma db execute --stdin <<< "SELECT COUNT(*) FROM Task;"
```

---

## 🧪 Testing with Seeded Data

### Login with Seeded User

1. Start the server:

   ```bash
   npm run start:dev
   ```

2. Login via API or Swagger:

   ```bash
   POST /api/auth/login
   {
     "email": "vicky.balistreri-mcglynn8@yahoo.com",
     "password": "Password123!"
   }
   ```

3. Get tasks:
   ```bash
   GET /api/tasks
   Authorization: Bearer <token>
   ```

---

## 🎉 Benefits

✅ **Quick Development Testing**

- No need to manually create users/tasks
- Realistic test data instantly available
- Testing multi-user scenarios easy

✅ **Demo Ready**

- Professional looking data
- Multiple users for demonstrations
- Realistic task descriptions

✅ **E2E Testing**

- Consistent test data
- Reset and reseed easily
- Isolated test environments

---

## 🚨 Important Notes

### Production Warning

⚠️ **DO NOT run seeding in production!**

The seed command:

- Deletes ALL existing data
- Is meant for development only
- Should be excluded from production deployments

### Data Persistence

- Seeding deletes existing data first
- Each run generates new random data
- Email addresses change each time
- Password remains "Password123!" always

---

## 📚 Related Commands

```bash
# View database schema
npx prisma db push

# Open Prisma Studio
npx prisma studio

# Generate Prisma Client
npx prisma generate

# Reset database (includes seeding)
npx prisma migrate reset

# Apply pending migrations
npx prisma migrate deploy

# Create new migration
npx prisma migrate dev --name description
```

---

## 🎓 What Was Learned

### Prisma v7 Requirements

- Requires adapter for SQLite (PrismaBetterSqlite3)
- Need explicit adapter in PrismaClient constructor
- ts-node works better than tsx for Prisma scripts

### Faker.js Best Practices

- Use specific faker methods for realistic data
- faker.person for names
- faker.internet for emails
- faker.number.int for random counts
- faker.helpers.arrayElement for selections

### Seeding Patterns

- Always clean data first
- Create dependencies in order (users → tags → tasks)
- Use Map to track relationships
- Provide progress feedback
- Show summary at end

---

**Seeding Configured:** ✅ COMPLETE  
**Ready for Development:** ✅ YES  
**Test Data Available:** ✅ 5 users, ~29 tags, ~35 tasks

---

_Database Seeding Guide_  
_Last Updated: February 11, 2026, 2:10 PM_  
_All seeding features working perfectly! 🎉_
