// Auto-generated curated gallery dataset for Kingdom of Christ Ministries
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
