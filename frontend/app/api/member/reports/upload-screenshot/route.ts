export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/authMiddleware';
import { validateFileSecurity } from '@/lib/uploadSecurity';
import { uploadBufferToCloudinary } from '@/lib/cloudinary';

const MAX_SCREENSHOT_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * POST /api/member/reports/upload-screenshot
 * Securely uploads a screenshot image for an issue report.
 * Validates MIME type, magic bytes, file size. Stores in Cloudinary.
 */
export async function POST(req: Request) {
  try {
    const auth = await requireAuth(req);
    if (auth instanceof NextResponse) return auth;

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
    }

    // Size check
    if (file.size > MAX_SCREENSHOT_SIZE) {
      return NextResponse.json(
        { error: 'Screenshot file is too large. Maximum allowed size is 5MB.' },
        { status: 413 }
      );
    }

    // Content-Type check
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedMimes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Only JPEG, PNG, and WebP image files are allowed for screenshots.' },
        { status: 422 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Magic byte & security validation
    const validation = validateFileSecurity(buffer, file.name, file.type);
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 422 });
    }

    // Upload to Cloudinary under issue-reports/ folder
    const uploadResult = await uploadBufferToCloudinary(buffer, 'issue-reports', 'image');

    return NextResponse.json({
      success: true,
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
    });
  } catch (err: any) {
    console.error('[API/MEMBER/REPORTS/SCREENSHOT] Error:', err);
    return NextResponse.json(
      { error: 'Screenshot upload failed. Please try again.' },
      { status: 500 }
    );
  }
}
