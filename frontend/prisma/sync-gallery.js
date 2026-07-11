const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  const filePath = path.join(__dirname, '../app/ngo/gallery/page.tsx');
  const fileContent = fs.readFileSync(filePath, 'utf8');

  const categories = [
    { key: 'NIMS_HOSPITAL_IMAGES', category: 'NIMS-HOSPITAL', label: 'NIMS Hospital' },
    { key: 'GOVT_HOSPITAL_IMAGES', category: 'GOVT-HOSPITAL', label: 'Govt Hospital' },
    { key: 'GANDHI_HOSPITAL_IMAGES', category: 'GANDHI-HOSPITAL', label: 'Gandhi Hospital' },
    { key: 'ASHRAMAM_IMAGES', category: 'ASHRAMAM', label: 'Bethany Ashramam' },
    { key: 'DISABLED_AASHRAMAM_IMAGES', category: 'DISABLED-AASHRAMAM', label: 'Home for Disabled' }
  ];

  let totalSeeded = 0;
  for (const cat of categories) {
    const regex = new RegExp(`const ${cat.key}\\s*:\\s*string\\[\\]\\s*=\\s*\\[([\\s\\S]*?)\\];`);
    const match = fileContent.match(regex);
    if (!match) {
      console.warn(`Could not find array for ${cat.key}`);
      continue;
    }
    
    const itemsText = match[1];
    const urls = itemsText
      .split(',')
      .map(item => item.trim().replace(/['"]/g, ''))
      .filter(item => item.startsWith('/'));

    console.log(`Parsed ${urls.length} images for ${cat.category}`);

    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      const id = `${cat.category}-${i}`;
      
      let title = `${cat.label} Outreach Photo #${i + 1}`;
      let description = `KCM Social Service team in action, carrying out physical ministries to help the needy and underprivileged.`;
      
      await prisma.gallery.upsert({
        where: { id },
        update: {
          imageUrl: url,
          thumbnailUrl: url,
          category: cat.category,
        },
        create: {
          id,
          title,
          description,
          imageUrl: url,
          thumbnailUrl: url,
          category: cat.category,
        }
      });
      totalSeeded++;
    }
  }

  console.log(`Successfully synced ${totalSeeded} images to the database.`);
  await prisma.$disconnect();
}

main().catch(err => {
  console.error("Error syncing gallery:", err);
  process.exit(1);
});
