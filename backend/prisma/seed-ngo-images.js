const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local if it exists, otherwise .env
const envLocalPath = path.join(__dirname, '../../.env.local');
const envPath = path.join(__dirname, '../../.env');

if (fs.existsSync(envLocalPath)) {
  console.log('Loading environment from .env.local...');
  const envConfig = fs.readFileSync(envLocalPath, 'utf8');
  for (const line of envConfig.split('\n')) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.substring(1, value.length - 1);
      } else if (value.startsWith("'") && value.endsWith("'")) {
        value = value.substring(1, value.length - 1);
      }
      process.env[key] = value;
    }
  }
} else if (fs.existsSync(envPath)) {
  console.log('Loading environment from .env...');
}

const prisma = new PrismaClient();

// Helper to format date strings nicely
function formatDateStr(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    const date = new Date(year, month, day);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    }
  }
  return dateStr;
}

// Helper to scan directory recursively
function getFilesRecursive(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      getFilesRecursive(filePath, fileList);
    } else {
      const ext = path.extname(file).toLowerCase();
      if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
        fileList.push(filePath);
      }
    }
  }
  return fileList;
}

async function main() {
  const targetDir = path.join(__dirname, '../../KCM_NGO_SERVICES');
  console.log(`Scanning directory: ${targetDir}`);
  
  if (!fs.existsSync(targetDir)) {
    console.error(`Error: Directory not found at ${targetDir}`);
    process.exit(1);
  }

  const files = getFilesRecursive(targetDir);
  console.log(`Found ${files.length} image files.`);

  // Clear existing local media entries to prevent duplicates
  console.log('Clearing existing local NGO media records...');
  const deleteResult = await prisma.ngoMedia.deleteMany({
    where: {
      url: {
        startsWith: '/KCM_NGO_SERVICES/'
      }
    }
  });
  console.log(`Cleared ${deleteResult.count} existing records.`);

  const mediaData = [];

  // Group by category to give sequential photo numbers in titles
  const categoryCounts = {};

  for (const filePath of files) {
    // Relative path from the root directory to make the URL
    // e.g. from C:\K.C.M-Portal\KCM_NGO_SERVICES\HOSPITALS\...
    // to /KCM_NGO_SERVICES/HOSPITALS/...
    const relativePath = path.relative(path.join(__dirname, '../..'), filePath);
    const url = '/' + relativePath.replace(/\\/g, '/');

    // Extract category & date
    let category = 'ALL';
    let dateStr = '';
    let locationName = '';

    if (filePath.includes('BETHANY_SAMRAKSHANA_ASHRAMAM')) {
      category = 'ASHRAMAM';
      locationName = 'Bethany Samrakshana Ashramam';
      // Extract date from subfolder, e.g. 15-05-2026(AASHRAMAM)
      const dateMatch = filePath.match(/(\d{2}-\d{2}-\d{4})/);
      if (dateMatch) dateStr = dateMatch[1];
    } else if (filePath.includes('HOME_FOR_THE_DISABLED_AASHRAMAM')) {
      category = 'DISABLED-AASHRAMAM';
      locationName = 'Home for the Disabled Ashramam';
      const dateMatch = filePath.match(/(\d{2}-\d{2}-\d{4})/);
      if (dateMatch) dateStr = dateMatch[1];
    } else if (filePath.includes('11-03-2026(NIMS-HOSPITAL)')) {
      category = 'NIMS-HOSPITAL';
      locationName = 'NIMS Hospital';
      dateStr = '11-03-2026';
    } else if (filePath.includes('23-02-2026(GOVT-HOSPITAL)')) {
      category = 'GOVT-HOSPITAL';
      locationName = 'Government Hospital';
      dateStr = '23-02-2026';
    } else if (filePath.includes('25-03-2026(GANDHI-HOSPITAL)')) {
      category = 'GANDHI-HOSPITAL';
      locationName = 'Gandhi General Hospital';
      dateStr = '25-03-2026';
    }

    if (!categoryCounts[category]) {
      categoryCounts[category] = 0;
    }
    categoryCounts[category]++;
    const photoNumber = categoryCounts[category];

    // Build nice Title
    const formattedDate = formatDateStr(dateStr);
    const dateLabel = formattedDate ? ` (${formattedDate})` : '';
    let title = '';
    let description = '';

    if (category === 'GANDHI-HOSPITAL') {
      title = `Gandhi Hospital Food Outreach${dateLabel} - Photo ${photoNumber}`;
      description = 'KCM volunteers distributing nutritious food packets, water, and fresh bread to patients and caregivers in the emergency wards.';
    } else if (category === 'NIMS-HOSPITAL') {
      title = `NIMS Hospital Care Campaign${dateLabel} - Photo ${photoNumber}`;
      description = 'Providing specialized patient kits containing required medicines, nutrition boxes, and hydration supplies to chronic care departments.';
    } else if (category === 'GOVT-HOSPITAL') {
      title = `Govt Hospital Support Drive${dateLabel} - Photo ${photoNumber}`;
      description = 'Volunteers distributing essential hygiene items, fruits, and financial support guides for patients at the government hospital.';
    } else if (category === 'ASHRAMAM') {
      title = `Bethany Ashramam Provisions${dateLabel} - Photo ${photoNumber}`;
      description = 'Delivering monthly groceries, rice bags, school supplies, and healthy food items to the children at Bethany Samrakshana Ashramam.';
    } else if (category === 'DISABLED-AASHRAMAM') {
      title = `Disabled Care Ashramam Visit - Photo ${photoNumber}`;
      description = 'Providing comfort kits, warm blankets, bedsheets, and moral support to the residents of the Home for the Disabled.';
    } else {
      title = `NGO Service Outreach - Photo ${photoNumber}`;
      description = 'KCM Social Service team in action, carrying out physical ministries to help the needy and underprivileged.';
    }

    mediaData.push({
      title,
      description,
      type: 'IMAGE',
      url,
      category,
    });
  }

  console.log(`Prepared ${mediaData.length} records. Inserting into database...`);

  // Insert in batches of 100 to prevent query parameter limits
  const batchSize = 100;
  let insertedCount = 0;
  for (let i = 0; i < mediaData.length; i += batchSize) {
    const batch = mediaData.slice(i, i + batchSize);
    await prisma.ngoMedia.createMany({
      data: batch
    });
    insertedCount += batch.length;
    console.log(`Inserted ${insertedCount}/${mediaData.length} records...`);
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
