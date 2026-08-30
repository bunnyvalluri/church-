const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://kcmchurch.vercel.app';
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const OUTPUT_FILE = path.join(PUBLIC_DIR, 'image-sitemap.xml');

// Helper to format captions cleanly
function formatTitle(filename, folderName = '') {
  let name = path.basename(filename, path.extname(filename));
  name = name.replace(/[_-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  if (folderName) {
    const cleanFolder = folderName.replace(/[_-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    return `Kingdom of Christ Ministries - ${cleanFolder} - ${name}`;
  }
  return `Kingdom of Christ Ministries - ${name}`;
}

function getImagesRecursively(dir, relativePath = '') {
  let results = [];
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
        pageUrl: rel.startsWith('KCM_NGO_SERVICES') ? `${BASE_URL}/ngo/gallery` : `${BASE_URL}/gallery`,
      });
    }
  }
  return results;
}

// Group images by page URL
const ngoDir = path.join(PUBLIC_DIR, 'KCM_NGO_SERVICES');
const galleryDir = path.join(PUBLIC_DIR, 'gallery');

const ngoImages = fs.existsSync(ngoDir) ? getImagesRecursively(ngoDir, 'KCM_NGO_SERVICES') : [];
const galleryImages = fs.existsSync(galleryDir) ? getImagesRecursively(galleryDir, 'gallery') : [];

// Root showcase images
const rootFeatured = [
  { file: 'pastor.png', title: 'Bishop Kurra Kristhu Raju - Senior Pastor & Founder', page: `${BASE_URL}/about/leadership` },
  { file: 'logo.png', title: 'Kingdom of Christ Ministries Official Seal', page: `${BASE_URL}/` },
  { file: 'kcm_society_ngo.jpg', title: 'KCM Society Humanitarian Outreach and Community Welfare', page: `${BASE_URL}/ngo` },
  { file: 'bethany_ashramam_care_image.png', title: 'Bethany Samrakshana Ashramam Care Mission', page: `${BASE_URL}/ngo/projects` },
  { file: 'gandhi_hospital_support_image.png', title: 'Gandhi Hospital Support and Medical Outreach', page: `${BASE_URL}/ngo/projects` },
  { file: 'home_for_disabled_rehab_care.png', title: 'Home for the Disabled Rehabilitation Care Drive', page: `${BASE_URL}/ngo/projects` },
  { file: 'missionaries_of_charity_bhoiguda_outreach.png', title: 'Missionaries of Charity Bhoiguda Outreach Initiative', page: `${BASE_URL}/ngo/projects` },
];

const grouped = {};

function addImage(page, imgObj) {
  if (!grouped[page]) {
    grouped[page] = [];
  }
  grouped[page].push(imgObj);
}

// Add root featured
for (const item of rootFeatured) {
  addImage(item.page, {
    url: `${BASE_URL}/${item.file}`,
    title: item.title,
    caption: item.title,
  });
}

// Add NGO images
for (const img of ngoImages) {
  addImage(`${BASE_URL}/ngo/gallery`, img);
}

// Add Gallery images
for (const img of galleryImages) {
  addImage(`${BASE_URL}/gallery`, img);
}

let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
`;

for (const [pageUrl, images] of Object.entries(grouped)) {
  xml += `  <url>\n    <loc>${pageUrl}</loc>\n`;
  for (const img of images) {
    const safeTitle = img.title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const safeCaption = img.caption.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    xml += `    <image:image>\n      <image:loc>${img.url}</image:loc>\n      <image:title>${safeTitle}</image:title>\n      <image:caption>${safeCaption}</image:caption>\n    </image:image>\n`;
  }
  xml += `  </url>\n`;
}

xml += `</urlset>\n`;

fs.writeFileSync(OUTPUT_FILE, xml, 'utf8');
console.log(`Generated Google Image Sitemap with ${ngoImages.length + galleryImages.length + rootFeatured.length} images at ${OUTPUT_FILE}`);
