const { PrismaClient } = require('../prisma/generated/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Cleaning seeded prayer requests from database...");
  const deletedPrayers = await prisma.prayerRequest.deleteMany({
    where: {
      id: {
        in: ['pr_001', 'pr_002', 'pr_003', 'pr_004', 'pr_005', 'pr_006']
      }
    }
  });
  console.log(`Deleted ${deletedPrayers.count} seeded prayer requests.`);

  const deletedMemberReqs = await prisma.memberRequest.deleteMany({
    where: {
      id: {
        in: ['mr_001', 'mr_002', 'mr_003', 'mr_004', 'mr_005']
      }
    }
  });
  console.log(`Deleted ${deletedMemberReqs.count} seeded member requests.`);
}

main()
  .catch((e) => {
    console.error("Error cleaning seeded data:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
