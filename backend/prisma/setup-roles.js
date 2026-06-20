const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function setupRoles() {
  console.log('\n=== KCM Portal — Role Setup ===\n');

  // Show all current users and their roles
  const users = await p.user.findMany({
    select: { id: true, email: true, name: true, role: true }
  });

  console.log('Current users:');
  users.forEach(u => console.log(` [${u.role.padEnd(12)}] ${u.email} (${u.name || 'No name'})`));

  // Set roles based on email patterns
  const roleUpdates = [
    // Super Admin
    { email: 'kingofchristministries23@gmail.com', role: 'SUPER_ADMIN' },
    { email: 'admin@kcm-church.com', role: 'SUPER_ADMIN' },
    // Admins
    { email: 'accounts@kcm-church.com', role: 'ADMIN' },
    { email: 'secretary@kcm-church.com', role: 'ADMIN' },
    // Pastors
    { email: 'pastor.samuel@kcm-church.com', role: 'PASTOR' },
    { email: 'pastor.david@kcm-church.com', role: 'PASTOR' },
    { email: 'pastor@kcm-church.com', role: 'PASTOR' },
  ];

  let updated = 0;
  for (const update of roleUpdates) {
    const result = await p.user.updateMany({
      where: { email: update.email },
      data: { role: update.role }
    });
    if (result.count > 0) {
      console.log(`\n✓ Set ${update.email} → ${update.role}`);
      updated += result.count;
    }
  }

  // Final state
  const finalUsers = await p.user.findMany({
    select: { email: true, name: true, role: true }
  });

  console.log('\n=== Final User Roles ===');
  finalUsers.forEach(u => console.log(` [${u.role.padEnd(12)}] ${u.email}`));
  console.log(`\nUpdated ${updated} records.`);

  await p.$disconnect();
}

setupRoles().catch(e => {
  console.error(e.message);
  p.$disconnect();
});
