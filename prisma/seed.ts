/* eslint-disable @typescript-eslint/no-unused-vars */
import { PrismaClient } from '../src/generated/prisma/client/client';
import {
  Role,
  TenantStatus,
  SubmissionStatus,
  ContentType,
  SubmissionType,
  ResourceType,
} from '../src/generated/prisma/client/enums';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { hashPassword } from 'better-auth/crypto';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Every seed user logs in with this password. Real users never get one assigned this
// way — they land here through the checkout/invite flows built in Phases 4–5, which
// send a set-password link instead.
const DEFAULT_PASSWORD = 'Password123!';

// Matches better-auth's local-account issuer format for the "credential" (email/password)
// provider — see createLocalAccountIssuer() in @better-auth/core/db/schema/account.ts.
const CREDENTIAL_ISSUER = 'local:credential';

/**
 * Creates a User plus the credential Account better-auth actually authenticates
 * against (Account.password, not User.passwordHash — the latter is unused by
 * better-auth and left null here).
 */
async function createUserWithPassword(data: {
  name: string;
  email: string;
  role: Role;
  tenantId?: string;
}) {
  const user = await prisma.user.create({ data: { ...data, emailVerified: true } });
  await prisma.account.create({
    data: {
      userId: user.id,
      providerId: 'credential',
      issuer: CREDENTIAL_ISSUER,
      accountId: user.id,
      password: await hashPassword(DEFAULT_PASSWORD),
    },
  });
  return user;
}

async function main() {
  console.log('Seeding database...');

  // Clear existing data in correct order
  await prisma.progressRecord.deleteMany();
  await prisma.grade.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.moduleCohortPublication.deleteMany();
  await prisma.module.deleteMany();
  await prisma.cohortMember.deleteMany();
  await prisma.cohort.deleteMany();
  await prisma.instructorTenantAssignment.deleteMany();
  await prisma.resourceItem.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();
  await prisma.tenant.deleteMany();

  // 1. Create Super Admin (Global)
  const superAdmin = await createUserWithPassword({
    name: 'Global Super Admin',
    email: 'admin@kelas.ai',
    role: Role.SuperAdmin,
  });

  // 2. Create Tenants
  const tenantA = await prisma.tenant.create({
    data: { name: 'Acme Corp', status: TenantStatus.Active },
  });

  const tenantB = await prisma.tenant.create({
    data: { name: 'Stark Industries', status: TenantStatus.Active },
  });

  // 3. Create Users for Tenant A
  const adminA = await createUserWithPassword({
    name: 'Alice Admin',
    email: 'alice@acme.com',
    role: Role.CompanyAdmin,
    tenantId: tenantA.id,
  });
  const empA1 = await createUserWithPassword({
    name: 'Bob Employee',
    email: 'bob@acme.com',
    role: Role.Employee,
    tenantId: tenantA.id,
  });

  // 4. Create Users for Tenant B
  const adminB = await createUserWithPassword({
    name: 'Tony Stark',
    email: 'tony@stark.com',
    role: Role.CompanyAdmin,
    tenantId: tenantB.id,
  });
  const empB1 = await createUserWithPassword({
    name: 'Peter Parker',
    email: 'peter@stark.com',
    role: Role.Employee,
    tenantId: tenantB.id,
  });

  // 5. Create Instructors (Platform side, no tenantId natively but assigned)
  const instructor1 = await createUserWithPassword({
    name: 'Charlie Instructor',
    email: 'charlie@kelas.ai',
    role: Role.Instructor,
  });

  // Assign Instructor to Tenant A and B
  await prisma.instructorTenantAssignment.createMany({
    data: [
      { instructorId: instructor1.id, tenantId: tenantA.id },
      { instructorId: instructor1.id, tenantId: tenantB.id },
    ],
  });

  // 6. Create Cohort for Tenant A
  const cohortA = await prisma.cohort.create({
    data: {
      name: 'Acme Q1 AI Onsite',
      tenantId: tenantA.id,
      onsiteDate: new Date('2026-10-01'),
      instructorId: instructor1.id,
    },
  });

  await prisma.cohortMember.create({ data: { cohortId: cohortA.id, userId: empA1.id } });

  // 7. Create Module & Content (By Instructor)
  const module1 = await prisma.module.create({
    data: {
      title: 'Prompt Engineering 101',
      description: 'Basics of ChatGPT prompting',
      createdByInstructorId: instructor1.id,
      isGlobalTemplate: true,
      lessons: {
        create: [
          {
            title: 'Introduction',
            contentType: ContentType.Text,
            content: 'Welcome to Prompting.',
            order: 1,
          },
          {
            title: 'Zero-Shot vs Few-Shot',
            contentType: ContentType.Video,
            content: 'https://youtube.com/...',
            order: 2,
          },
        ],
      },
      assignments: {
        create: [{ instructions: 'Write a few-shot prompt.', submissionType: SubmissionType.Text }],
      },
    },
    include: { assignments: true },
  });

  // 8. Publish Module to Cohort A
  await prisma.moduleCohortPublication.create({
    data: { moduleId: module1.id, cohortId: cohortA.id },
  });

  // 9. Resource Items
  await prisma.resourceItem.create({
    data: {
      type: ResourceType.Tip,
      title: 'Use delimiters for clarity',
      content: 'Always use """ around your context.',
      tags: ['prompting', 'basics'],
      isGlobal: true,
    },
  });

  console.log('Database seeded successfully!');
  console.log(`\nAll seeded users share the password: ${DEFAULT_PASSWORD}`);
  console.log('  admin@kelas.ai      -> Super Admin');
  console.log('  alice@acme.com      -> Company Admin (Acme Corp)');
  console.log('  bob@acme.com        -> Employee (Acme Corp)');
  console.log('  tony@stark.com      -> Company Admin (Stark Industries)');
  console.log('  peter@stark.com     -> Employee (Stark Industries)');
  console.log('  charlie@kelas.ai    -> Instructor (Acme Corp, Stark Industries)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
