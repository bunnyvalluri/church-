const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://kcmchurch.vercel.app';
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const OUTPUT_FILE = path.join(PUBLIC_DIR, 'image-sitemap.xml');
const GALLERY_DATA_FILE = path.join(__dirname, '..', 'lib', 'galleryData.json');

// Helper to format captions cleanly with Kcm church branding
function formatTitle(filename, folderName = '') {
  let name = path.basename(filename, path.extname(filename));
  name = name.replace(/[_-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  if (folderName) {
    const cleanFolder = folderName.replace(/[_-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    return `Kcm church - ${cleanFolder} - ${name}`;
  }
  return `Kcm church - ${name}`;
}

function getImagesRecursively(dir, relativePath = '') {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir, { withFileTypes: true });

  for (const item of list) {
    const fullPath = path.join(dir, item.name);
    const rel = path.join(relativePath, item.name).replace(/\\/g, '/');

    if (item.isDirectory()) {
      results = results.concat(getImagesRecursively(fullPath, rel));
    } else if (/\.(jpg|jpeg|png|webp)$/i.test(item.name)) {
      results.push({
        url: `${BASE_URL}/${encodeURI(rel)}`,
        caption: formatTitle(item.name, path.basename(path.dirname(rel))),
        title: formatTitle(item.name),
        geo: 'Hyderabad, Telangana, India',
        pageUrl: rel.startsWith('KCM_NGO_SERVICES') ? `${BASE_URL}/ngo/gallery` : `${BASE_URL}/gallery`,
      });
    }
  }
  return results;
}

const grouped = {};

function addImage(page, imgObj) {
  if (!grouped[page]) {
    grouped[page] = [];
  }
  // Deduplicate by URL
  if (!grouped[page].some(existing => existing.url === imgObj.url)) {
    grouped[page].push(imgObj);
  }
}

// 1. Root featured brand images (high-priority for Google Image search)
const rootFeatured = [
  { file: 'logo.png', title: 'Kcm church Official Logo & Seal', caption: 'Kcm church Official Seal - Hyderabad', page: `${BASE_URL}/` },
  { file: 'pastor.png', title: 'Kcm church - Bishop Kurra Kristhu Raju Senior Pastor & Founder', caption: 'Senior Pastor Bishop Kurra Kristhu Raju ministering at Kcm church Hyderabad', page: `${BASE_URL}/about/leadership` },
  { file: 'kcm_society_ngo.jpg', title: 'Kcm church Society Humanitarian Outreach', caption: 'Kcm church Society Humanitarian Aid and Social Welfare', page: `${BASE_URL}/ngo` },
  { file: 'images/events/family-blessing-poster-1.jpg', title: 'Kcm church - కుటుంబ ఆశీర్వాద కూడిక Revival Poster', caption: 'Kcm church Subhash Nagar Branch Special Revival Festival Poster', page: `${BASE_URL}/gallery` },
  { file: 'images/events/family-blessing-poster-2.jpg', title: 'Kcm church - 2026 కుటుంబ ఆశీర్వాద ప్రార్థన పండుగ Poster', caption: 'Kcm church Subhash Nagar Prayer Gathering Poster', page: `${BASE_URL}/gallery` },
  { file: 'bethany_ashramam_care_image.png', title: 'Kcm church - Bethany Samrakshana Ashramam Care Mission', caption: 'Kcm church Bethany Ashramam Charitable Outreach', page: `${BASE_URL}/ngo/projects` },
  { file: 'gandhi_hospital_support_image.png', title: 'Kcm church - Gandhi Hospital Medical Outreach', caption: 'Kcm church Medical Support and Compassionate Care at Gandhi Hospital', page: `${BASE_URL}/ngo/projects` },
  { file: 'home_for_disabled_rehab_care.png', title: 'Kcm church - Home for Disabled Rehabilitation Care', caption: 'Kcm church Rehabilitation Care Drive', page: `${BASE_URL}/ngo/projects` },
  { file: 'missionaries_of_charity_bhoiguda_outreach.png', title: 'Kcm church - Missionaries of Charity Bhoiguda Outreach', caption: 'Kcm church Missionaries of Charity Community Outreach', page: `${BASE_URL}/ngo/projects` },
];

for (const item of rootFeatured) {
  addImage(item.page, {
    url: `${BASE_URL}/${item.file}`,
    title: item.title,
    caption: item.caption,
    geo: 'Hyderabad, Telangana, India',
  });
}

// 2. Curated Church Gallery Items with rich titles from galleryData.json
if (fs.existsSync(GALLERY_DATA_FILE)) {
  try {
    const rawData = JSON.parse(fs.readFileSync(GALLERY_DATA_FILE, 'utf8'));
    for (const item of rawData) {
      const cleanUrl = item.url.startsWith('/') ? item.url : `/${item.url}`;
      addImage(`${BASE_URL}/gallery`, {
        url: `${BASE_URL}${cleanUrl}`,
        title: `Kcm church - ${item.title}`,
        caption: `Kcm church ${item.branchName || 'Hyderabad'} — ${item.description || item.title}`,
        geo: `${item.branchName ? item.branchName + ', ' : ''}Hyderabad, Telangana, India`,
      });
    }
    console.log(`Loaded ${rawData.length} curated church gallery photos into image sitemap.`);
  } catch (err) {
    console.warn(`[IMAGE_SITEMAP] Could not parse galleryData.json:`, err.message);
  }
}

// 3. Recursive scan of public/gallery and public/KCM_NGO_SERVICES for any additional photos
const ngoDir = path.join(PUBLIC_DIR, 'KCM_NGO_SERVICES');
const galleryDir = path.join(PUBLIC_DIR, 'gallery');

const ngoImages = getImagesRecursively(ngoDir, 'KCM_NGO_SERVICES');
const galleryImages = getImagesRecursively(galleryDir, 'gallery');

for (const img of ngoImages) {
  addImage(`${BASE_URL}/ngo/gallery`, img);
}

for (const img of galleryImages) {
  addImage(`${BASE_URL}/gallery`, img);
}

// Build Google Image Sitemap XML
function escapeXml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
`;

let totalImagesCount = 0;

for (const [pageUrl, images] of Object.entries(grouped)) {
  xml += `  <url>\n    <loc>${pageUrl}</loc>\n`;
  for (const img of images) {
    totalImagesCount++;
    xml += `    <image:image>\n`;
    xml += `      <image:loc>${img.url}</image:loc>\n`;
    xml += `      <image:title>${escapeXml(img.title)}</image:title>\n`;
    xml += `      <image:caption>${escapeXml(img.caption)}</image:caption>\n`;
    if (img.geo) {
      xml += `      <image:geo_location>${escapeXml(img.geo)}</image:geo_location>\n`;
    }
    xml += `    </image:image>\n`;
  }
  xml += `  </url>\n`;
}

xml += `</urlset>\n`;

try {
  if (!fs.existsSync(PUBLIC_DIR)) {
    fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  }
  fs.writeFileSync(OUTPUT_FILE, xml, 'utf8');
  console.log(`Generated Google Image Sitemap with ${totalImagesCount} images at ${OUTPUT_FILE}`);
} catch (e) {
  console.warn(`[IMAGE_SITEMAP] Warning: Could not write image sitemap:`, e.message);
}
