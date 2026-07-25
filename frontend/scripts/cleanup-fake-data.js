const { PrismaClient } = require('../prisma/generated/client');
const prisma = new PrismaClient();

async function cleanFakeData() {
  console.log('Cleaning fake/seeded data from database...');

  // 1. Delete fake seed donations
  const deletedDonations = await prisma.donation.deleteMany({
    where: {
      OR: [
        { id: { startsWith: 'don_' } },
        { donorName: { in: ['Church Member', 'Emmanuel Reddy', 'Anonymous Donor', 'Mary Sunitha', 'John Babu', 'Grace Priya', 'Anonymous Giver'] } }
      ]
    }
  });
  console.log(`Deleted ${deletedDonations.count} fake donation records.`);

  // 2. Delete fake seed pledges
  const deletedPledges = await prisma.pledge.deleteMany({
    where: {
      OR: [
        { id: { startsWith: 'plg_' } },
        { donorName: { in: ['James Wilson', 'Sarah Johnson', 'Michael Brown'] } }
      ]
    }
  });
  console.log(`Deleted ${deletedPledges.count} fake pledge records.`);

  // 3. Delete fake seed transactions
  const deletedTransactions = await prisma.transaction.deleteMany({
    where: {
      id: { startsWith: 'tx_' }
    }
  });
  console.log(`Deleted ${deletedTransactions.count} fake transaction records.`);

  // 4. Delete fake attendance records
  const deletedAttendance = await prisma.attendanceRecord.deleteMany({
    where: {
      id: { startsWith: 'att_' }
    }
  });
  console.log(`Deleted ${deletedAttendance.count} fake attendance records.`);

  // 5. Delete fake accounts if seeded
  const deletedAccounts = await prisma.account.deleteMany({
    where: {
      id: { startsWith: 'acc_' }
    }
  });
  console.log(`Deleted ${deletedAccounts.count} fake account records.`);

  // 6. Delete fake notifications
  const deletedNotifs = await prisma.notification.deleteMany({
    where: {
      id: { startsWith: 'notif_' }
    }
  });
  console.log(`Deleted ${deletedNotifs.count} fake notification records.`);

  console.log('Cleaned all fake seed data successfully!');
}

cleanFakeData()
  .catch((e) => {
    console.error('Error cleaning fake data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
