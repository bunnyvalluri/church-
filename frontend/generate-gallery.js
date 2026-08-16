const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'public/gallery/subhash-nagar-family-blessing');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jpeg') || f.endsWith('.jpg') || f.endsWith('.png'));

// Integer files sorted 1..68
const integerFiles = files.filter(f => /^\d+\.(jpeg|jpg|png)$/.test(f));
integerFiles.sort((a, b) => parseInt(a) - parseInt(b));

// Decimal/other files (excluding 1.2.jpeg)
const targetLast = '1.2.jpeg';
const decimalFiles = files.filter(f => !/^\d+\.(jpeg|jpg|png)$/.test(f) && f !== targetLast);
decimalFiles.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

// Ordered list: integer photos 1..68, decimal photos, and 1.2.jpeg at the very end
const orderedFiles = [...integerFiles, ...decimalFiles, ...(files.includes(targetLast) ? [targetLast] : [])];

console.log('Total files ordered:', orderedFiles.length, '| Last file:', orderedFiles[orderedFiles.length - 1]);

const subhashItems = orderedFiles.map((file, idx) => {
  const num = idx + 1;
  let category = 'Family Blessings';
  let title = 'Family Blessing Gathering #' + num;
  let description = 'Special prayers of blessing, covenant grace, and spiritual breakthrough over families at Subhash Nagar Branch.';

  if (idx % 5 === 0) {
    category = 'Family Blessings';
    title = 'Family Dedication & Covenant Blessing #' + num;
    description = 'Pastoral hands laid in prayer over families seeking divine protection, health, and household prosperity.';
  } else if (idx % 5 === 1) {
    category = 'Worship & Praise';
    title = 'Joyful Praise & Heartfelt Worship #' + num;
    description = 'The congregation joined in vibrant praise and deep spiritual adoration, lifting holy hands to the Lord.';
  } else if (idx % 5 === 2) {
    category = 'Pastoral Ministry';
    title = 'Word of God & Ministry of Anointing #' + num;
    description = 'Bishop Kurra Kristhu Raju ministering the Word of Truth and inspiring unwavering faith across generations.';
  } else if (idx % 5 === 3) {
    category = 'Fellowship & Joy';
    title = 'Christian Fellowship & Radiant Smiles #' + num;
    description = 'Believers sharing joyful moments of encouragement, warm fellowship, and church unity.';
  } else {
    category = 'Youth & Children';
    title = 'Blessing the Next Generation #' + num;
    description = 'Dedicated blessing prayers for children, students, and young families for wisdom and divine purpose.';
  }

  const d = new Date(Date.UTC(2026, 6, 15, 10, Math.floor(idx / 60), idx % 60));

  return {
    id: 'subhash-family-blessing-' + file.replace('.jpeg', '').replace('.', '_'),
    title: title,
    description: description,
    url: '/gallery/subhash-nagar-family-blessing/' + file,
    thumbnailUrl: '/gallery/subhash-nagar-family-blessing/' + file,
    category: category,
    branchId: 'cmrgwqhc30001fsk8mysbmp50',
    branchName: 'Subhash Nagar',
    eventName: 'Family Blessing Gathering',
    eventDate: 'July 15, 2026',
    type: 'image',
    tags: ['Subhash Nagar', 'Family Blessing', 'Bishop Kurra Kristhu Raju', category],
    createdAt: d.toISOString()
  };
});

const bannerItem = {
  id: 'subhash-family-blessing-banner',
  title: 'Family Blessing Gathering Official Banner',
  description: 'Official promotional poster and theme banner for the Family Blessing Gathering at Subhash Nagar Sanctuary.',
  url: '/events/family-blessing-subhash-banner.png',
  thumbnailUrl: '/events/family-blessing-subhash-banner.png',
  category: 'Family Blessings',
  branchId: 'cmrgwqhc30001fsk8mysbmp50',
  branchName: 'Subhash Nagar',
  eventName: 'Family Blessing Gathering',
  eventDate: 'July 15, 2026',
  type: 'image',
  tags: ['Subhash Nagar', 'Family Blessing', 'Banner', 'Bishop Kurra Kristhu Raju'],
  createdAt: new Date('2026-07-15T09:00:00.000Z').toISOString()
};

const specialEventPoster1 = {
  id: 'subhash-family-blessing-poster-1',
  title: 'కుటుంబ ఆశీర్వాద కూడిక — Official Revival Poster',
  description: 'Special revival event poster with keynote speaker Rev. Dr. B. Shekhar Daniel Garu & Bishop Kurra Kristhu Raju Garu at Subhash Nagar.',
  url: '/images/events/family-blessing-poster-1.jpg',
  thumbnailUrl: '/images/events/family-blessing-poster-1.jpg',
  category: 'Special Events',
  branchId: 'cmrgwqhc30001fsk8mysbmp50',
  branchName: 'Subhash Nagar',
  eventName: 'Family Blessing Gathering',
  eventDate: 'August 15, 2026',
  type: 'image',
  tags: ['Subhash Nagar', 'Special Events', 'Family Blessing', 'Rev. Dr. B. Shekhar Daniel', 'Bishop Kurra Kristhu Raju'],
  createdAt: new Date('2026-08-15T09:00:00.000Z').toISOString()
};

const specialEventPoster2 = {
  id: 'subhash-family-blessing-poster-2',
  title: '2026 కుటుంబ ఆశీర్వాద ప్రార్థన పండుగ — Festival Poster',
  description: 'Official 2026 Family Blessing Prayer Festival poster welcoming families across Hyderabad for heavenly grace.',
  url: '/images/events/family-blessing-poster-2.jpg',
  thumbnailUrl: '/images/events/family-blessing-poster-2.jpg',
  category: 'Special Events',
  branchId: 'cmrgwqhc30001fsk8mysbmp50',
  branchName: 'Subhash Nagar',
  eventName: 'Family Blessing Prayer Festival',
  eventDate: 'August 15, 2026',
  type: 'image',
  tags: ['Subhash Nagar', 'Special Events', 'Prayer Festival', 'Bishop Kurra Kristhu Raju'],
  createdAt: new Date('2026-08-15T09:01:00.000Z').toISOString()
};

// Only authentic, verified church media and photos
const allGalleryItems = [bannerItem, specialEventPoster1, specialEventPoster2, ...subhashItems];

// Write JSON
fs.writeFileSync(path.join(__dirname, 'lib/galleryData.json'), JSON.stringify(allGalleryItems, null, 2), 'utf8');

// Write TypeScript
const tsContent = `// Auto-generated curated gallery dataset for Kingdom of Christ Ministries
// High-performance static registry with all 78+ Subhash Nagar Event photos + church media
import rawData from './galleryData.json';

export interface GalleryItem {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnailUrl?: string;
  category: string;
  branchId?: string | null;
  branchName?: string;
  eventName?: string;
  eventDate?: string;
  type: 'image' | 'video';
  videoId?: string;
  tags?: string[];
  createdAt: string;
}

export const SUBHASH_NAGAR_BRANCH_ID = 'cmrgwqhc30001fsk8mysbmp50';

export const CURATED_GALLERY_ITEMS: GalleryItem[] = rawData as GalleryItem[];

export const GALLERY_CATEGORIES = [
  'All Moments',
  'Family Blessings',
  'Worship & Praise',
  'Pastoral Ministry',
  'Fellowship & Joy',
  'Youth & Children',
  'Congregational Prayer',
  'Outreach & Missions',
  'Sacraments & Baptism'
] as const;

export function getGalleryItemsByBranch(branchId?: string | null): GalleryItem[] {
  if (!branchId || branchId === 'all') {
    return CURATED_GALLERY_ITEMS;
  }
  return CURATED_GALLERY_ITEMS.filter(
    (item) => item.branchId === branchId || !item.branchId
  );
}

export function getGalleryItemsByCategory(category?: string, branchId?: string | null): GalleryItem[] {
  const items = getGalleryItemsByBranch(branchId);
  if (!category || category === 'All' || category === 'All Moments') {
    return items;
  }
  return items.filter((item) => item.category.toLowerCase() === category.toLowerCase());
}
`;

fs.writeFileSync(path.join(__dirname, 'lib/galleryData.ts'), tsContent, 'utf8');
console.log('Successfully wrote frontend/lib/galleryData.json & galleryData.ts with', allGalleryItems.length, 'items!');
