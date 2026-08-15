const { PrismaClient } = require('./generated/client');
const prisma = new PrismaClient();
const items = require('../lib/galleryData.json');

async function main() {
  console.log(`Starting gallery synchronization for ${items.length} items...`);

  // Ensure Subhash Nagar branch exists
  let subhashBranch = await prisma.branch.findFirst({
    where: { name: { contains: "Subhash Nagar", mode: "insensitive" } },
  });

  if (!subhashBranch) {
    subhashBranch = await prisma.branch.create({
      data: {
        name: "Subhash Nagar",
        address: "Subhash Nagar, Jeedimetla, Hyderabad, Telangana",
      },
    });
    console.log("Created Subhash Nagar branch:", subhashBranch.id);
  }

  let count = 0;
  for (const item of items) {
    const branchId = item.branchName === 'Subhash Nagar' ? subhashBranch.id : item.branchId;

    await prisma.gallery.upsert({
      where: { id: item.id },
      update: {
        title: item.title,
        description: item.description,
        imageUrl: item.url,
        thumbnailUrl: item.thumbnailUrl || item.url,
        category: item.category,
        branchId: branchId || null,
      },
      create: {
        id: item.id,
        title: item.title,
        description: item.description,
        imageUrl: item.url,
        thumbnailUrl: item.thumbnailUrl || item.url,
        category: item.category,
        branchId: branchId || null,
        createdAt: new Date(item.createdAt),
      },
    });
    count++;
  }

  console.log(`Successfully synced ${count} gallery photos to PostgreSQL DB!`);
}

main()
  .catch((e) => {
    console.error("Error syncing gallery:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
