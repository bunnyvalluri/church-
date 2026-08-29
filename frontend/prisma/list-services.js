const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const services = await prisma.churchService.findMany({
    where: { isDeleted: false },
    orderBy: { displayOrder: 'asc' },
    include: { branch: true },
  });
  console.log(JSON.stringify(services, null, 2));
}

main().finally(() => prisma.$disconnect());
