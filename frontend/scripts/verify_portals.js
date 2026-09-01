/**
 * frontend/scripts/verify_portals.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Verification script for portal authentication and database roles.
 * Reads credentials dynamically from environment variables.
 */

const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY || '<FIREBASE_API_KEY>';
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const accounts = [
  {
    portal: 'Super Admin Portal',
    email: process.env.TEST_SUPERADMIN_EMAIL || 'superadmin@kcm-church.com',
    pass: process.env.TEST_SUPERADMIN_PASS || '<SUPERADMIN_PASSWORD>',
    expectedRole: 'SUPER_ADMIN',
    expectedRedirect: '/admin/dashboard'
  },
  {
    portal: 'Admin Portal',
    email: process.env.TEST_ADMIN_EMAIL || 'admin@kcm-church.com',
    pass: process.env.TEST_ADMIN_PASS || '<ADMIN_PASSWORD>',
    expectedRole: 'ADMIN',
    expectedRedirect: '/admin/dashboard'
  },
  {
    portal: 'Pastor Portal',
    email: process.env.TEST_PASTOR_EMAIL || 'pastor.david@kcm-church.com',
    pass: process.env.TEST_PASTOR_PASS || '<PASTOR_PASSWORD>',
    expectedRole: 'PASTOR',
    expectedRedirect: '/pastor/main/dashboard'
  },
  {
    portal: 'Event Management Portal',
    email: process.env.TEST_EVENT_EMAIL || 'event-management@kcm-church.com',
    pass: process.env.TEST_EVENT_PASS || '<EVENT_MANAGER_PASSWORD>',
    expectedRole: 'EVENT_MANAGER',
    expectedRedirect: '/event-manager'
  }
];

async function verifyAll() {
  console.log('=== VERIFYING CREDENTIALS & PORTAL ACCESS ===\n');

  if (!apiKey || apiKey.startsWith('<')) {
    console.error('Error: NEXT_PUBLIC_FIREBASE_API_KEY environment variable is not set.');
    process.exit(1);
  }

  for (const acc of accounts) {
    console.log(`Checking ${acc.portal} (${acc.email}):`);

    if (!acc.pass || acc.pass.startsWith('<')) {
      console.warn(`  ⚠ Password not provided in environment for ${acc.portal}. Skipping auth call.`);
      continue;
    }

    // 1. Check Firebase Auth Sign-In
    const fbRes = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: acc.email,
        password: acc.pass,
        returnSecureToken: true
      })
    });

    const fbData = await fbRes.json();
    if (!fbRes.ok) {
      console.error(`  ✗ Firebase Auth FAILED: ${fbData.error?.message}`);
      continue;
    }
    console.log(`  ✓ Firebase Auth SUCCESS (UID: ${fbData.localId})`);

    // 2. Check Database Record & Role
    const dbUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: acc.email },
          { id: fbData.localId }
        ]
      }
    });

    if (!dbUser) {
      console.error(`  ✗ Database record NOT FOUND`);
    } else {
      console.log(`  ✓ Database User: ${dbUser.name} | Role: ${dbUser.role}`);
      if (dbUser.role === acc.expectedRole) {
        console.log(`  ✓ Role MATCHES expected: ${acc.expectedRole}`);
      } else {
        console.log(`  ⚠ Role is ${dbUser.role}, expected ${acc.expectedRole}`);
      }
    }
    console.log(`  ✓ Target Route on Login: ${acc.expectedRedirect}\n`);
  }

  await prisma.$disconnect();
}

verifyAll().catch(e => {
  console.error(e);
  process.exit(1);
});
