const apiKey = 'AIzaSyBaNc9dgk4StKQsY2L73d2H4Hk_QnwAzN0';
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const accounts = [
  {
    portal: 'Super Admin Portal',
    email: 'kingofchristministries23@gmail.com',
    pass: 'rahul@0423',
    expectedRole: 'SUPER_ADMIN',
    expectedRedirect: '/admin/dashboard'
  },
  {
    portal: 'Admin Portal',
    email: 'admin@kcm-church.com',
    pass: 'rahul@0423',
    expectedRole: 'ADMIN',
    expectedRedirect: '/admin/dashboard'
  },
  {
    portal: 'Pastor Portal',
    email: 'pastor.david@kcm-church.com',
    pass: 'pastor@2026',
    expectedRole: 'PASTOR',
    expectedRedirect: '/pastor/main/dashboard'
  },
  {
    portal: 'Event Management Portal',
    email: 'event-management@kcm-church.com',
    pass: 'event-handle-2026',
    expectedRole: 'EVENT_MANAGER',
    expectedRedirect: '/event-manager'
  }
];

async function verifyAll() {
  console.log('=== VERIFYING CREDENTIALS & PORTAL ACCESS ===\n');

  for (const acc of accounts) {
    console.log(`Checking ${acc.portal} (${acc.email}):`);

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
