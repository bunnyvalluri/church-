const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

const SUBHASH_NAGAR_BRANCH_ID = 'cmrgwqhc30001fsk8mysbmp50';
const SHAPUR_NAGAR_BRANCH_ID = 'cmskewevf0000lz9gnoh1n8ve';
const BAHADURPALLI_BRANCH_ID = 'cmrgwqhc30002fsk8ncn255w5';

async function main() {
  console.log('--- Syncing Branch Gallery ---');

  // Read the 54 authentic Subhash Nagar items from galleryData.json
  const rawData = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../lib/galleryData.json'), 'utf8')
  );

  // Filter the authentic 54 photos (subhash-family-blessing-1 through 54)
  const items54 = [];
  for (let i = 1; i <= 54; i++) {
    const id = `subhash-family-blessing-${i}`;
    let item = rawData.find((d) => d.id === id);
    if (!item) {
      // Create if missing
      item = {
        id,
        title: `Family Blessing Gathering #${i}`,
        description:
          'Special prayers of blessing, covenant grace, and spiritual breakthrough over families at Subhash Nagar Branch.',
        url: `/gallery/subhash-nagar-family-blessing/${i}.jpeg`,
        thumbnailUrl: `/gallery/subhash-nagar-family-blessing/${i}.jpeg`,
        category: 'Family Blessings',
        branchId: SUBHASH_NAGAR_BRANCH_ID,
        branchName: 'Subhash Nagar',
        eventName: 'Family Blessing Gathering',
        eventDate: 'July 15, 2026',
        type: 'image',
        tags: ['Subhash Nagar', 'Family Blessing', 'Bishop Kurra Kristhu Raju'],
        createdAt: new Date(Date.UTC(2026, 6, 15, 10, Math.floor(i / 60), i % 60)).toISOString(),
      };
    } else {
      // Ensure it is mapped strictly to Subhash Nagar
      item.branchId = SUBHASH_NAGAR_BRANCH_ID;
      item.branchName = 'Subhash Nagar';
      if (!item.tags) item.tags = [];
      if (!item.tags.includes('Subhash Nagar')) item.tags.unshift('Subhash Nagar');
      item.tags = item.tags.filter((t) => t !== 'Shapur Nagar' && t !== 'Bahadurpalli');
    }
    items54.push(item);
  }

  // Write the clean 54 items back to galleryData.json
  fs.writeFileSync(
    path.join(__dirname, '../lib/galleryData.json'),
    JSON.stringify(items54, null, 2),
    'utf8'
  );
  console.log(`Saved ${items54.length} authentic Subhash Nagar photos to galleryData.json`);

  // Update Database if connected
  try {
    // Delete any gallery items in DB currently assigned to Shapur or Bahadurpalli
    const cleared = await prisma.gallery.deleteMany({
      where: {
        branchId: {
          in: [SHAPUR_NAGAR_BRANCH_ID, BAHADURPALLI_BRANCH_ID],
        },
      },
    });
    console.log(`Cleared ${cleared.count} incorrectly mapped items from Shapur/Bahadur branches in DB`);

    // Ensure all 54 items are upserted into DB for Subhash Nagar
    for (const item of items54) {
      await prisma.gallery.upsert({
        where: { id: item.id },
        update: {
          title: item.title,
          description: item.description,
          imageUrl: item.url,
          thumbnailUrl: item.thumbnailUrl || item.url,
          category: item.category,
          branchId: SUBHASH_NAGAR_BRANCH_ID,
        },
        create: {
          id: item.id,
          title: item.title,
          description: item.description,
          imageUrl: item.url,
          thumbnailUrl: item.thumbnailUrl || item.url,
          category: item.category,
          branchId: SUBHASH_NAGAR_BRANCH_ID,
          createdAt: new Date(item.createdAt),
        },
      });
    }

    // Remove any items in DB with id not in items54
    const validIds = items54.map((i) => i.id);
    const removedExtra = await prisma.gallery.deleteMany({
      where: {
        id: { notIn: validIds },
      },
    });
    console.log(`Cleaned up ${removedExtra.count} obsolete gallery records from DB`);

    const finalCounts = await prisma.gallery.groupBy({
      by: ['branchId'],
      _count: { id: true },
    });
    console.log('Final DB Gallery Counts by branchId:', finalCounts);
  } catch (dbErr) {
    console.warn('DB sync warning (will rely on curated static data):', dbErr.message);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
