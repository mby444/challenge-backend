import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const main = async () => {
  console.log('🌱 Starting database seeding...\n');

  // Clean existing data
  console.log('🧹 Cleaning existing data...');
  await prisma.task.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.user.deleteMany();
  console.log('✅ Database cleaned\n');

  // Create users
  console.log('👥 Creating users...');
  const users: Array<{ id: string; name: string; email: string }> = [];

  for (let i = 0; i < 5; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const user = await prisma.user.create({
      data: {
        email: faker.internet.email({ firstName, lastName }).toLowerCase(),
        password:
          '$2b$10$1nNsPXuCd8yzKLpaVOZNF.fAuxPOboW0h44PORKIN7m/zkyXLw3hW', // bcrypt hash for "Password123!"
        name: `${firstName} ${lastName}`,
        birth: faker.date.birthdate({ min: 18, max: 65, mode: 'age' }),
      },
    });
    users.push(user);
    console.log(`  ✓ Created user: ${user.name} (${user.email})`);
  }
  console.log(`✅ Created ${users.length} users\n`);

  // Create tags for each user
  console.log('🏷️  Creating tags...');
  const tagNames = [
    'Personal',
    'Work',
    'Urgent',
    'Important',
    'Low Priority',
    'Health',
    'Finance',
    'Shopping',
    'Learning',
    'Family',
    'Projects',
    'Ideas',
    'Goals',
    'Travel',
    'Home',
  ];

  const userTags = new Map<string, Array<{ id: string; name: string }>>();
  let totalTags = 0;

  for (const user of users) {
    const numTags = faker.number.int({ min: 3, max: 7 });
    const selectedTags = faker.helpers.arrayElements(tagNames, numTags);
    const tags: Array<{ id: string; name: string }> = [];

    for (const tagName of selectedTags) {
      const tag = await prisma.tag.create({
        data: {
          name: tagName,
          userId: user.id,
        },
      });
      tags.push(tag);
      totalTags++;
    }

    userTags.set(user.id, tags);
    console.log(`  ✓ Created ${tags.length} tags for ${user.name}`);
  }
  console.log(`✅ Created ${totalTags} tags total\n`);

  // Create tasks for each user with tag associations
  console.log('📝 Creating tasks...');
  // Note: Task model doesn't have status field, only isCompleted
  let totalTasks = 0;

  for (const user of users) {
    const numTasks = faker.number.int({ min: 5, max: 12 });
    const tags = userTags.get(user.id) || [];

    for (let i = 0; i < numTasks; i++) {
      // Determine if task should have tags
      const shouldHaveTags = faker.datatype.boolean({ probability: 0.7 }); // 70% chance
      const numTagsToAssign =
        shouldHaveTags && tags.length > 0
          ? faker.number.int({ min: 1, max: Math.min(3, tags.length) })
          : 0;

      const selectedTags =
        numTagsToAssign > 0
          ? faker.helpers.arrayElements(tags, numTagsToAssign)
          : [];

      const task = await prisma.task.create({
        data: {
          title: faker.helpers.arrayElement([
            faker.hacker.phrase(),
            faker.commerce.productName(),
            `${faker.word.verb()} ${faker.word.noun()}`,
            faker.company.catchPhrase(),
          ]),
          description: faker.datatype.boolean({ probability: 0.6 })
            ? faker.lorem.sentence({ min: 5, max: 15 })
            : null,
          isCompleted: faker.datatype.boolean({ probability: 0.3 }),
          userId: user.id,
          tags: {
            connect: selectedTags.map((tag) => ({ id: tag.id })),
          },
        },
      });
      totalTasks++;
    }

    console.log(`  ✓ Created ${numTasks} tasks for ${user.name}`);
  }
  console.log(`✅ Created ${totalTasks} tasks total\n`);

  // Print summary
  console.log('📊 Seeding Summary:');
  console.log('═══════════════════════════════════════');
  console.log(`👥 Users:  ${users.length}`);
  console.log(`🏷️  Tags:   ${totalTags}`);
  console.log(`📝 Tasks:  ${totalTasks}`);
  console.log('═══════════════════════════════════════');

  // Print sample data for each user
  console.log('\n📋 Sample Data:\n');

  for (const user of users.slice(0, 2)) {
    // Show first 2 users
    const userTasks = await prisma.task.findMany({
      where: { userId: user.id },
      include: { tags: true },
      take: 3,
    });

    console.log(`\n👤 ${user.name} (${user.email})`);
    console.log('   Tasks:');
    for (const task of userTasks) {
      const tagNames = task.tags.map((t) => t.name).join(', ');
      const statusIcon = task.isCompleted ? '✅' : '⏳';
      console.log(`   ${statusIcon} ${task.title}`);
      if (tagNames) console.log(`      Tags: ${tagNames}`);
    }
  }

  console.log('\n\n🎉 Database seeding completed successfully!');
  console.log(
    '💡 You can now start the application and login with any seeded user.',
  );
  console.log('🔑 Default password for all users: "Password123!" (hashed)\n');
};

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
