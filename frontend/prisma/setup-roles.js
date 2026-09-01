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
    // Admin
    { email: 'admin@kcm-church.com', role: 'ADMIN', name: 'Admin Leader' },
    { email: 'accounts@kcm-church.com', role: 'ADMIN' },
    { email: 'secretary@kcm-church.com', role: 'ADMIN' },
    // Pastors
    { email: 'pastor.kristhuraju@kcm-church.com', role: 'PASTOR', name: 'Pastor Kristhuraju' },
    { email: 'pastor.david@kcm-church.com', role: 'PASTOR', name: 'Pastor David' },
    { email: 'pastor.samuel@kcm-church.com', role: 'PASTOR' },
    { email: 'pastor@kcm-church.com', role: 'PASTOR' },
    // Event Management
    { email: 'eventmanager@kcm-church.com', role: 'EVENT_MANAGER', name: 'Event Manager' },
    { email: 'event-management@kcm-church.com', role: 'EVENT_MANAGER', name: 'Event Manager' },
  ];

  let updated = 0;
  for (const update of roleUpdates) {
    const data = { role: update.role };
    if (update.name) data.name = update.name;
    const result = await p.user.updateMany({
      where: { email: update.email },
      data
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
