// Auto-generated curated gallery dataset for Kingdom of Christ Ministries
// High-performance static registry with all Subhash Nagar, Shapur Nagar, and Bahadurpalli event photos + church media
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

export const SHAPUR_NAGAR_BRANCH_ID = 'cmskewevf0000lz9gnoh1n8ve';
export const SUBHASH_NAGAR_BRANCH_ID = 'cmrgwqhc30001fsk8mysbmp50';
export const BAHADURPALLI_BRANCH_ID = 'cmrgwqhc30002fsk8ncn255w5';

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
  'Sacraments & Baptism',
  'Special Events'
] as const;

/**
 * Robust branch matching helper that seamlessly matches:
 * - Database CUIDs (e.g. 'cmskewevf0000lz9gnoh1n8ve')
 * - Short keys (e.g. 'shapur', 'subhash', 'bahadur', 'b1', 'b2', 'b3')
 * - Slugs (e.g. 'shapur-nagar', 'subhash-nagar', 'bahadurpally')
 * - Display names (e.g. 'Shapur Nagar', 'Subhash Nagar Branch')
 */
export function isBranchMatch(
  itemBranchId: string | null | undefined,
  itemBranchName: string | null | undefined,
  selectedBranch: string | null | undefined
): boolean {
  if (!selectedBranch || selectedBranch === 'all' || selectedBranch === 'ALL') {
    return true;
  }

  const s = selectedBranch.toLowerCase().trim();

  // Shapur Nagar check
  if (
    s === SHAPUR_NAGAR_BRANCH_ID.toLowerCase() ||
    s === 'b1' ||
    s === 'shapur' ||
    s === 'shapur-nagar' ||
    s.includes('shapur')
  ) {
    if (itemBranchId && (itemBranchId.toLowerCase() === SHAPUR_NAGAR_BRANCH_ID.toLowerCase() || itemBranchId === 'b1' || itemBranchId === 'shapur')) {
      return true;
    }
    if (itemBranchName && itemBranchName.toLowerCase().includes('shapur')) {
      return true;
    }
    return false;
  }

  // Subhash Nagar check
  if (
    s === SUBHASH_NAGAR_BRANCH_ID.toLowerCase() ||
    s === 'b2' ||
    s === 'subhash' ||
    s === 'subhash-nagar' ||
    s.includes('subhash')
  ) {
    if (itemBranchId && (itemBranchId.toLowerCase() === SUBHASH_NAGAR_BRANCH_ID.toLowerCase() || itemBranchId === 'b2' || itemBranchId === 'subhash')) {
      return true;
    }
    if (itemBranchName && itemBranchName.toLowerCase().includes('subhash')) {
      return true;
    }
    return false;
  }

  // Bahadurpalli check
  if (
    s === BAHADURPALLI_BRANCH_ID.toLowerCase() ||
    s === 'b3' ||
    s === 'bahadur' ||
    s === 'bahadurpalli' ||
    s === 'bahadurpally' ||
    s.includes('bahadur')
  ) {
    if (itemBranchId && (itemBranchId.toLowerCase() === BAHADURPALLI_BRANCH_ID.toLowerCase() || itemBranchId === 'b3' || itemBranchId === 'bahadur')) {
      return true;
    }
    if (itemBranchName && itemBranchName.toLowerCase().includes('bahadur')) {
      return true;
    }
    return false;
  }

  // Exact fallback comparison
  if (itemBranchId && itemBranchId.toLowerCase() === s) return true;
  if (itemBranchName && itemBranchName.toLowerCase() === s) return true;

  return false;
}

export function getGalleryItemsByBranch(branchId?: string | null): GalleryItem[] {
  if (!branchId || branchId === 'all') {
    return CURATED_GALLERY_ITEMS;
  }
  return CURATED_GALLERY_ITEMS.filter((item) =>
    isBranchMatch(item.branchId, item.branchName, branchId)
  );
}

export function getGalleryItemsByCategory(category?: string, branchId?: string | null): GalleryItem[] {
  const items = getGalleryItemsByBranch(branchId);
  if (!category || category === 'All' || category === 'All Moments') {
    return items;
  }
  return items.filter((item) => item.category.toLowerCase() === category.toLowerCase());
}

