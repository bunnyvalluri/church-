const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Fetching all donations...');
  const donations = await prisma.donation.findMany({
    orderBy: { createdAt: 'desc' }
  });
  
  console.log('=== CURRENT DONATIONS ===');
  let sum = 0;
  donations.forEach((d, i) => {
    console.log(`[${i}] ID: ${d.id} | Donor: ${d.donorName} (${d.donorEmail}) | Amount: ${d.amount} | Purpose: ${d.purpose} | Created: ${d.createdAt}`);
    sum += d.amount;
  });
  console.log('=========================');
  console.log(`Total Donations Count: ${donations.length}`);
  console.log(`Sum of Amounts: ${sum}`);
  
  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
  prisma.$disconnect();
});
