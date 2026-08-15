const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'public/gallery/subhash-nagar-family-blessing');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jpeg') || f.endsWith('.jpg') || f.endsWith('.png'));

// Sort logically: 1.jpeg, 1.0.jpeg, 1.2.jpeg ... 2.jpeg ... 67.jpeg
files.sort((a, b) => {
  const cleanA = a.replace('.jpeg', '').replace('.jpg', '').replace('.png', '');
  const cleanB = b.replace('.jpeg', '').replace('.jpg', '').replace('.png', '');
  const numA = parseFloat(cleanA);
  const numB = parseFloat(cleanB);
  if (numA !== numB) return numA - numB;
  return a.localeCompare(b);
});

console.log('Found total Subhash Nagar files:', files.length);

const subhashItems = files.map((file, idx) => {
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

const otherChurchItems = [
  {
    id: 'gal_001',
    title: 'Sunday Worship Celebration',
    description: 'Beautiful moments of bilingual Telugu and English worship in the presence of the Lord.',
    url: '/images/gallery/worship-june-2024.jpg',
    thumbnailUrl: '/images/gallery/worship-june-2024.jpg',
    category: 'Worship & Praise',
    branchId: 'cmskewevf0000lz9gnoh1n8ve',
    branchName: 'Shapur Nagar',
    eventName: 'Sunday Service',
    eventDate: 'June 2024',
    type: 'image',
    tags: ['Shapur Nagar', 'Sunday Worship', 'Praise'],
    createdAt: new Date('2026-06-15T10:00:00.000Z').toISOString()
  },
  {
    id: 'gal_002',
    title: 'Youth Camp & Leadership Summit',
    description: 'Empowering the next generation with faith, character, discipleship, and spiritual fire.',
    url: '/images/gallery/youth-camp-2023.jpg',
    thumbnailUrl: '/images/gallery/youth-camp-2023.jpg',
    category: 'Youth & Children',
    branchId: 'cmrgwqhc30002fsk8ncn255w5',
    branchName: 'Bahadurpally',
    eventName: 'Youth Camp',
    eventDate: 'May 2024',
    type: 'image',
    tags: ['Bahadurpally', 'Youth Camp', 'Discipleship'],
    createdAt: new Date('2026-05-20T10:00:00.000Z').toISOString()
  },
  {
    id: 'gal_004',
    title: 'Community Outreach & Care Drive',
    description: 'Serving underprivileged families with food provisions, medical assistance, and love of Christ.',
    url: '/images/gallery/outreach-slum.jpg',
    thumbnailUrl: '/images/gallery/outreach-slum.jpg',
    category: 'Outreach & Missions',
    branchId: null,
    branchName: 'All Branches',
    eventName: 'Slum Outreach Ministry',
    eventDate: 'April 2024',
    type: 'image',
    tags: ['Outreach', 'Charity', 'Food Drive'],
    createdAt: new Date('2026-04-10T10:00:00.000Z').toISOString()
  },
  {
    id: 'gal_006',
    title: 'Water Baptism Service',
    description: 'Rejoicing with new believers as they make their public confession of faith through biblical baptism.',
    url: '/images/gallery/baptism-april-2024.jpg',
    thumbnailUrl: '/images/gallery/baptism-april-2024.jpg',
    category: 'Sacraments & Baptism',
    branchId: 'cmrgwqhc30001fsk8mysbmp50',
    branchName: 'Subhash Nagar',
    eventName: 'Baptism Sunday',
    eventDate: 'April 2024',
    type: 'image',
    tags: ['Baptism', 'Salvation', 'New Life'],
    createdAt: new Date('2026-04-05T10:00:00.000Z').toISOString()
  }
];

const allGalleryItems = [bannerItem, ...subhashItems, ...otherChurchItems];

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
