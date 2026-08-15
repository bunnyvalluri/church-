const fs = require('fs');
const path = require('path');

const srcPath = 'C:\\Users\\vallu\\.gemini\\antigravity-ide\\brain\\d0059472-2377-4fad-b241-4ea8d0133ac6\\.user_uploaded\\media_1786800936801.png';
const destGallery = path.join(__dirname, '../public/gallery/subhash-nagar-family-blessing/68.jpeg');
const destRaw = path.join(__dirname, '../../kcm-gallery/Subhash Nagar Events/Family Blessing Gathering-Photos/68.jpeg');

console.log('Copying user uploaded image...');
fs.copyFileSync(srcPath, destGallery);
console.log('Copied to:', destGallery);

try {
  fs.copyFileSync(srcPath, destRaw);
  console.log('Copied to archive:', destRaw);
} catch (err) {
  console.warn('Archive copy warning:', err.message);
}

console.log('Image added successfully.');
