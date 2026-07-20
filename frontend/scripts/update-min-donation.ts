import { PrismaClient } from '../prisma/generated/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.churchSettings.upsert({
    where: { id: 'settings' },
    update: { minDonationAmount: 1 },
    create: {
      id: 'settings',
      churchName: 'Kingdom of Christ Ministries',
      tagline: 'A Place of Love',
      primaryEmail: 'kingofchristministries23@gmail.com',
      contactPhone: '+91 97040 90069',
      address: 'Hyderabad',
      worshipServices: 'Sunday 10:00 AM',
      minDonationAmount: 1,
    },
  });
  console.log('✅ minDonationAmount set to ₹1 in database!');
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
