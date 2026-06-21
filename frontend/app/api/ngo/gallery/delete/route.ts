import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const getRootDir = () => {
  const cwd = process.cwd();
  if (fs.existsSync(path.join(cwd, 'frontend'))) {
    return path.join(cwd, 'frontend');
  }
  return cwd;
};

export async function POST(req: Request) {
  try {
    const { imageUrl } = await req.json();
    if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.startsWith('/KCM_NGO_SERVICES/')) {
      return NextResponse.json({ error: 'Invalid image URL' }, { status: 400 });
    }

    const rootDir = getRootDir();

    // 1. Delete the physical file if running locally
    // Normalize path for the current OS
    const normalizedImageUrl = imageUrl.split('/').join(path.sep);
    const publicPath = path.join(rootDir, 'public', normalizedImageUrl);
    
    let physicalDeleted = false;
    try {
      if (fs.existsSync(publicPath)) {
        fs.unlinkSync(publicPath);
        physicalDeleted = true;
      }
    } catch (fsErr: any) {
      console.warn('[Gallery Delete API] Could not delete physical file:', fsErr?.message || fsErr);
    }

    // Helper function to remove a line with the image path from a file
    const removeRefFromFile = (filePath: string): boolean => {
      try {
        if (fs.existsSync(filePath)) {
          const fileContent = fs.readFileSync(filePath, 'utf8');
          const lines = fileContent.split(/\r?\n/);
          const filteredLines = lines.filter(line => !line.includes(imageUrl));
          if (lines.length !== filteredLines.length) {
            fs.writeFileSync(filePath, filteredLines.join('\n'), 'utf8');
            return true;
          }
        }
      } catch (err: any) {
        console.warn(`[Gallery Delete API] Failed to update ${filePath}:`, err?.message || err);
      }
      return false;
    };

    // 2. Remove references from gallery/page.tsx
    const galleryPagePath = path.join(rootDir, 'app', 'ngo', 'gallery', 'page.tsx');
    const pageModified = removeRefFromFile(galleryPagePath);

    // 3. Remove references from lib/ngoImages.ts
    const ngoImagesPath = path.join(rootDir, 'lib', 'ngoImages.ts');
    const libModified = removeRefFromFile(ngoImagesPath);

    // 4. Remove references from public/ngo_image_paths.txt
    const ngoImagePathsTxtPath = path.join(rootDir, 'public', 'ngo_image_paths.txt');
    const txtModified = removeRefFromFile(ngoImagePathsTxtPath);

    return NextResponse.json({
      success: true,
      physicalDeleted,
      codebaseUpdated: pageModified || libModified || txtModified,
      message: physicalDeleted
        ? 'Image file deleted and codebase references removed.'
        : 'Image hidden client-side. Physical file deletion is only supported when running locally.'
    });
  } catch (err: any) {
    console.error('[Gallery Delete API] Error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
