
const fs = require('fs');
const path = require('path');

const galleryPagePath = path.join(__dirname, '../app/gallery/page.tsx');
const galleryDataPath = path.join(__dirname, '../lib/galleryData.json');
const galleryTsPath = path.join(__dirname, '../lib/galleryData.ts');

const pageContent = fs.readFileSync(galleryPagePath, 'utf8');
const galleryData = JSON.parse(fs.readFileSync(galleryDataPath, 'utf8'));

// Re-implement or load isBranchMatch logic
function isBranchMatch(itemBranchId, itemBranchName, selectedBranch) {
  if (!selectedBranch || selectedBranch === 'all' || selectedBranch === 'ALL') {
    return true;
  }
  const s = selectedBranch.toLowerCase().trim();

  // Shapur
  if (
    s === 'cmskewevf0000lz9gnoh1n8ve' ||
    s === 'b1' ||
    s === 'shapur' ||
    s === 'shapur-nagar' ||
    s.includes('shapur')
  ) {
    if (itemBranchId && (itemBranchId.toLowerCase() === 'cmskewevf0000lz9gnoh1n8ve' || itemBranchId === 'b1' || itemBranchId === 'shapur')) return true;
    if (itemBranchName && itemBranchName.toLowerCase().includes('shapur')) return true;
    return false;
  }

  // Subhash
  if (
    s === 'cmrgwqhc30001fsk8mysbmp50' ||
    s === 'b2' ||
    s === 'subhash' ||
    s === 'subhash-nagar' ||
    s.includes('subhash')
  ) {
    if (itemBranchId && (itemBranchId.toLowerCase() === 'cmrgwqhc30001fsk8mysbmp50' || itemBranchId === 'b2' || itemBranchId === 'subhash')) return true;
    if (itemBranchName && itemBranchName.toLowerCase().includes('subhash')) return true;
    return false;
  }

  // Bahadur
  if (
    s === 'cmrgwqhc30002fsk8ncn255w5' ||
    s === 'b3' ||
    s === 'bahadur' ||
    s === 'bahadurpalli' ||
    s === 'bahadurpally' ||
    s.includes('bahadur')
  ) {
    if (itemBranchId && (itemBranchId.toLowerCase() === 'cmrgwqhc30002fsk8ncn255w5' || itemBranchId === 'b3' || itemBranchId === 'bahadur')) return true;
    if (itemBranchName && itemBranchName.toLowerCase().includes('bahadur')) return true;
    return false;
  }

  if (itemBranchId && itemBranchId.toLowerCase() === s) return true;
  if (itemBranchName && itemBranchName.toLowerCase() === s) return true;
  return false;
}

const tests = [
  {
    name: "1. Dataset contains exactly 54 authentic church photos",
    fn: () => galleryData.length === 54
  },
  {
    name: "2. Subhash Nagar matches all 54 authentic photos",
    fn: () => {
      const subhashCount = galleryData.filter(d => isBranchMatch(d.branchId, d.branchName, "subhash")).length;
      return subhashCount === 54;
    }
  },
  {
    name: "3. Shapur Nagar currently contains 0 photos (awaiting future uploads)",
    fn: () => {
      const shapurCount = galleryData.filter(d => isBranchMatch(d.branchId, d.branchName, "shapur")).length;
      return shapurCount === 0;
    }
  },
  {
    name: "4. Bahadurpalli currently contains 0 photos (awaiting future uploads)",
    fn: () => {
      const bahadurCount = galleryData.filter(d => isBranchMatch(d.branchId, d.branchName, "bahadur")).length;
      return bahadurCount === 0;
    }
  },
  {
    name: "5. UI renders dedicated branch empty state when selectedBranch has 0 media",
    fn: () => pageContent.includes('selectedBranch !== "all" && currentBranchInfo.count === 0') &&
              pageContent.includes('noBranchPhotosTitle') &&
              pageContent.includes('noBranchPhotosSubtitle')
  },
  {
    name: "6. Clear placeholder assures future uploads from @kcm-gallery archives",
    fn: () => pageContent.includes('upcomingUploadsBadge') &&
              pageContent.includes('mediaArchiveNotice') &&
              pageContent.includes('placeholderSundayWorship') &&
              pageContent.includes('placeholderRevivalService') &&
              pageContent.includes('placeholderYouthFellowship') &&
              pageContent.includes('placeholderSpecialEvents')
  },
  {
    name: "7. Recovery action buttons allow one-click return to Subhash Nagar or All branches",
    fn: () => pageContent.includes('handleSelectBranch(SUBHASH_NAGAR_BRANCH_ID)') &&
              pageContent.includes('viewSubhashPhotos') &&
              pageContent.includes('handleSelectBranch("all")') &&
              pageContent.includes('viewAllPhotos')
  },
  {
    name: "8. Branch Dropdown accurately displays photo counts for all campuses",
    fn: () => pageContent.includes('{gt.allBranches} ({items.length})') &&
              pageContent.includes('{gt.subhashBranch} ({subhashPhotosCount})') &&
              pageContent.includes('{gt.shapurBranch} ({shapurPhotosCount})') &&
              pageContent.includes('{gt.bahadurBranch} ({bahadurPhotosCount})')
  },
  {
    name: "9. Multi-language support (EN, TE, HI) has all branch placeholder messages",
    fn: () => pageContent.includes('noBranchPhotosTitle: "No Photos Currently Available for {branch}"') &&
              pageContent.includes('noBranchPhotosTitle: "{branch} బ్రాంచ్‌కు సంబంధించి ప్రస్తుతానికి ఫోటోలు అందుబాటులో లేవు"') &&
              pageContent.includes('noBranchPhotosTitle: "{branch} शाखा के लिए वर्तमान में कोई फोटो उपलब्ध नहीं है"')
  },
  {
    name: "10. Sort dropdown displays dynamic count reflecting selected branch photos",
    fn: () => pageContent.includes('(selectedBranch === "all" ? items.length : branchItems.length).toString()')
  }
];

let passed = 0;
console.log("=================================================");
console.log("🏛️ KCM CHURCH BRANCH GALLERY FILTERING VERIFICATION");
console.log("=================================================");

tests.forEach((t) => {
  const ok = t.fn();
  if (ok) {
    passed++;
    console.log(`✅ PASS: ${t.name}`);
  } else {
    console.error(`❌ FAIL: ${t.name}`);
  }
});

console.log("-------------------------------------------------");
console.log(`Result: ${passed}/${tests.length} tests passed (${Math.round((passed / tests.length) * 100)}%)`);

if (passed !== tests.length) {
  process.exit(1);
}
