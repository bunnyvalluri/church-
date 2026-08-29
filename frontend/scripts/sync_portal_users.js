const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function syncTargetUsers() {
  console.log('Syncing target credentials & roles to database...');

  const users = [
    {
      email: 'kingofchristministries23@gmail.com',
      name: 'Super Admin',
      role: 'SUPER_ADMIN',
      phone: '+91 96409 43777',
      address: '15-201, Vivekananda Nagar, Jeedimetla, Hyderabad',
    },
    {
      email: 'admin@kcm-church.com',
      name: 'Admin Leader',
      role: 'ADMIN',
      phone: '+91 98765 43210',
      address: 'Jeedimetla, Hyderabad',
    },
    {
      email: 'pastor.david@kcm-church.com',
      name: 'Pastor David',
      role: 'PASTOR',
      phone: '+91 87654 32109',
      address: 'Kukatpally, Hyderabad',
    },
    {
      email: 'event-management@kcm-church.com',
      name: 'Event Manager',
      role: 'EVENT_MANAGER',
      phone: '+91 91111 22222',
      address: 'Jeedimetla, Hyderabad',
    }
  ];

  for (const u of users) {
    const existing = await prisma.user.findUnique({ where: { email: u.email } });
    if (existing) {
      const updated = await prisma.user.update({
        where: { email: u.email },
        data: {
          name: u.name,
          role: u.role,
          phone: u.phone,
          address: u.address,
        }
      });
      console.log(`✓ Updated ${updated.email} (${updated.role}) [ID: ${updated.id}]`);
    } else {
      const created = await prisma.user.create({
        data: {
          id: 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
          email: u.email,
          name: u.name,
          role: u.role,
          phone: u.phone,
          address: u.address,
          password: 'firebase-authenticated'
        }
      });
      console.log(`✓ Created ${created.email} (${created.role}) [ID: ${created.id}]`);
    }
  }

  const all = await prisma.user.findMany({
    where: {
      email: {
        in: users.map(u => u.email)
      }
    },
    select: { id: true, email: true, name: true, role: true }
  });

  console.log('\nVerified DB records:');
  console.table(all);

  await prisma.$disconnect();
}

syncTargetUsers().catch(err => {
  console.error(err);
  process.exit(1);
});
