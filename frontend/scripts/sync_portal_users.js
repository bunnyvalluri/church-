const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function syncTargetUsers() {
  console.log('Syncing target credentials & roles to database...');

  const users = [
    {
      uid: 'JC8QamdQhhgOu44Yv57Z4iCuhyp2',
      email: 'kingofchristministries23@gmail.com',
      name: 'Super Admin',
      role: 'SUPER_ADMIN',
      phone: '+91 96409 43777',
      address: '15-201, Vivekananda Nagar, Jeedimetla, Hyderabad',
    },
    {
      uid: '2vuJ6l55qngQ0aowsmv1hJE2Yam1',
      email: 'admin@kcm-church.com',
      name: 'Admin Leader',
      role: 'ADMIN',
      phone: '+91 98765 43210',
      address: 'Jeedimetla, Hyderabad',
    },
    {
      uid: 's7uquVrAvXMHTBLpCHXE5ZW701q2',
      email: 'pastor.kristhuraju@kcm-church.com',
      name: 'Pastor Kristhuraju',
      role: 'PASTOR',
      phone: '+91 87654 32109',
      address: 'Kukatpally, Hyderabad',
    },
    {
      uid: 's2redV8jDHaEfqXemyK3KO6lcOG3',
      email: 'eventmanager@kcm-church.com',
      name: 'Event Manager',
      role: 'EVENT_MANAGER',
      phone: '+91 91111 22222',
      address: 'Jeedimetla, Hyderabad',
    }
  ];

  for (const u of users) {
    const existing = await prisma.user.findUnique({ where: { email: u.email } });
    if (existing) {
      if (existing.id !== u.uid) {
        // Migrate ID to match Firebase UID
        await prisma.user.update({
          where: { email: u.email },
          data: { email: `${u.email}_temp_${Date.now()}` }
        });
        const created = await prisma.user.upsert({
          where: { id: u.uid },
          update: {
            email: u.email,
            name: u.name,
            role: u.role,
            phone: u.phone,
            address: u.address,
          },
          create: {
            id: u.uid,
            email: u.email,
            name: u.name,
            role: u.role,
            phone: u.phone,
            address: u.address,
            password: 'firebase-authenticated'
          }
        });
        await prisma.user.deleteMany({ where: { id: existing.id } });
        console.log(`✓ Re-keyed ${created.email} (${created.role}) [UID: ${created.id}]`);
      } else {
        const updated = await prisma.user.update({
          where: { id: u.uid },
          data: {
            name: u.name,
            role: u.role,
            phone: u.phone,
            address: u.address,
          }
        });
        console.log(`✓ Updated ${updated.email} (${updated.role}) [ID: ${updated.id}]`);
      }
    } else {
      const created = await prisma.user.create({
        data: {
          id: u.uid,
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
