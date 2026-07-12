import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireEventManagerOrDev } from '@/lib/authMiddleware';
import { uploadBufferToCloudinary, deleteCloudinaryAsset } from '@/lib/cloudinary';
import { validateFileSecurity } from '@/lib/uploadSecurity';

export const dynamic = 'force-dynamic';

// ── GET: Fetch single sermon by ID or Slug ──
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const identifier = params.id;

    if (!identifier) {
      return NextResponse.json({ error: 'Sermon identifier (ID or Slug) is required' }, { status: 400 });
    }

    const sermon = await prisma.sermon.findFirst({
      where: {
        OR: [
          { id: identifier },
          { slug: identifier }
        ],
        isDeleted: false,
      },
      include: {
        likes: true,
        bookmarks: true,
        comments: {
          where: { isDeleted: false },
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              }
            }
          }
        },
        _count: {
          select: {
            likes: true,
            comments: true,
            bookmarks: true,
            downloads: true,
            viewsRelation: true,
          },
        },
      },
    });

    if (!sermon) {
      return NextResponse.json({ error: 'Sermon not found' }, { status: 404 });
    }

    // Fetch up to 4 recommended sermons in the same category, excluding the current one
    const recommendations = await prisma.sermon.findMany({
      where: {
        category: sermon.category,
        id: { not: sermon.id },
        isDeleted: false,
        status: 'PUBLISHED',
      },
      take: 4,
      orderBy: { date: 'desc' },
    });

    return NextResponse.json({ success: true, sermon, recommendations });
  } catch (err: any) {
    console.error('[API/SERMONS/[ID]/GET] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Database error occurred while fetching sermon details' },
      { status: 500 }
    );
  }
}

// ── PUT: Complete sermon update ──
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireEventManagerOrDev(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const sermonId = params.id;
    if (!sermonId) {
      return NextResponse.json({ error: 'Sermon ID is required' }, { status: 400 });
    }

    const existingSermon = await prisma.sermon.findUnique({
      where: { id: sermonId },
    });

    if (!existingSermon) {
      return NextResponse.json({ error: 'Sermon not found' }, { status: 404 });
    }

    const formData = await req.formData();
    const title = (formData.get('title') as string) || '';
    const description = (formData.get('description') as string) || '';
    const subtitle = (formData.get('subtitle') as string) || '';
    const shortDescription = (formData.get('shortDescription') as string) || '';
    const bibleVerse = (formData.get('bibleVerse') as string) || '';
    const book = (formData.get('book') as string) || '';
    const chapter = (formData.get('chapter') as string) || '';
    const verses = (formData.get('verses') as string) || '';
    const speaker = (formData.get('speaker') as string) || '';
    const pastor = (formData.get('pastor') as string) || '';
    const guestSpeaker = (formData.get('guestSpeaker') as string) || '';
    const branch = (formData.get('branch') as string) || '';
    const category = (formData.get('category') as string) || '';
    const language = (formData.get('language') as string) || '';
    const datePreachedStr = (formData.get('datePreached') as string) || (formData.get('sermonDate') as string) || '';
    const duration = (formData.get('duration') as string) || '';
    const tagsStr = (formData.get('tags') as string) || '';
    const keywordsStr = (formData.get('keywords') as string) || '';
    
    const featured = formData.get('featured') !== null ? formData.get('featured') === 'true' : undefined;
    const recommended = formData.get('recommended') !== null ? formData.get('recommended') === 'true' : undefined;
    const visibility = formData.get('visibility') as any;
    const status = formData.get('status') as any;
    const seoTitle = formData.get('seoTitle') as string;
    const seoDescription = formData.get('seoDescription') as string;

    // Files
    const thumbnailFile = formData.get('thumbnailFile') as File | null;
    const bannerFile = formData.get('bannerFile') as File | null;
    const videoFile = formData.get('videoFile') as File | null;
    const audioFile = formData.get('audioFile') as File | null;
    const pdfFile = formData.get('pdfFile') as File | null;
    const presentationFile = formData.get('presentationFile') as File | null;

    const updateData: any = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (subtitle !== undefined) updateData.subtitle = subtitle;
    if (shortDescription !== undefined) updateData.shortDescription = shortDescription;
    if (bibleVerse !== undefined) updateData.bibleVerse = bibleVerse;
    if (book !== undefined) updateData.book = book;
    if (chapter !== undefined) updateData.chapter = chapter;
    if (verses !== undefined) updateData.verses = verses;
    if (speaker) updateData.speaker = speaker;
    if (pastor !== undefined) updateData.pastor = pastor || null;
    if (guestSpeaker !== undefined) updateData.guestSpeaker = guestSpeaker || null;
    if (branch !== undefined) updateData.branch = branch || null;
    if (category) updateData.category = category;
    if (language) updateData.language = language;
    if (datePreachedStr) updateData.date = new Date(datePreachedStr);
    if (duration !== undefined) updateData.duration = duration;
    if (tagsStr !== undefined) {
      updateData.tags = tagsStr ? tagsStr.split(',').map((t) => t.trim()).filter(Boolean) : [];
    }
    if (keywordsStr !== undefined) {
      updateData.keywords = keywordsStr ? keywordsStr.split(',').map((k) => k.trim()).filter(Boolean) : [];
    }
    if (featured !== undefined) updateData.featured = featured;
    if (recommended !== undefined) updateData.recommended = recommended;
    if (visibility) updateData.visibility = visibility;
    if (status) updateData.status = status;
    if (seoTitle !== undefined) updateData.seoTitle = seoTitle || title;
    if (seoDescription !== undefined) updateData.seoDescription = seoDescription || shortDescription || description.slice(0, 150);

    // 1. Upload Thumbnail (overwrite/delete old)
    if (thumbnailFile && thumbnailFile.size > 0) {
      const buffer = Buffer.from(await thumbnailFile.arrayBuffer());
      const security = validateFileSecurity(buffer, thumbnailFile.name, thumbnailFile.type);
      if (!security.isValid) {
        return NextResponse.json({ error: `Thumbnail validation: ${security.error}` }, { status: 422 });
      }
      if (existingSermon.thumbnailPublicId) {
        await deleteCloudinaryAsset(existingSermon.thumbnailPublicId, 'image').catch(() => {});
      }
      const uploadResult = await uploadBufferToCloudinary(buffer, 'sermons', 'image');
      updateData.thumbnail = uploadResult.secure_url;
      updateData.thumbnailPublicId = uploadResult.public_id;
    }

    // 2. Upload Banner Image
    if (bannerFile && bannerFile.size > 0) {
      const buffer = Buffer.from(await bannerFile.arrayBuffer());
      const security = validateFileSecurity(buffer, bannerFile.name, bannerFile.type);
      if (!security.isValid) {
        return NextResponse.json({ error: `Banner image validation: ${security.error}` }, { status: 422 });
      }
      if (existingSermon.bannerPublicId) {
        await deleteCloudinaryAsset(existingSermon.bannerPublicId, 'image').catch(() => {});
      }
      const uploadResult = await uploadBufferToCloudinary(buffer, 'sermons', 'image');
      updateData.banner = uploadResult.secure_url;
      updateData.bannerPublicId = uploadResult.public_id;
    }

    // 3. Upload Video
    if (videoFile && videoFile.size > 0) {
      const buffer = Buffer.from(await videoFile.arrayBuffer());
      const security = validateFileSecurity(buffer, videoFile.name, videoFile.type);
      if (!security.isValid) {
        return NextResponse.json({ error: `Video validation: ${security.error}` }, { status: 422 });
      }
      if (existingSermon.videoPublicId) {
        await deleteCloudinaryAsset(existingSermon.videoPublicId, 'video').catch(() => {});
      }
      const uploadResult = await uploadBufferToCloudinary(buffer, 'sermons', 'video');
      updateData.videoUrl = uploadResult.secure_url;
      updateData.videoPublicId = uploadResult.public_id;
    }

    // 4. Upload Audio
    if (audioFile && audioFile.size > 0) {
      const buffer = Buffer.from(await audioFile.arrayBuffer());
      const security = validateFileSecurity(buffer, audioFile.name, audioFile.type);
      if (!security.isValid) {
        return NextResponse.json({ error: `Audio validation: ${security.error}` }, { status: 422 });
      }
      if (existingSermon.audioPublicId) {
        await deleteCloudinaryAsset(existingSermon.audioPublicId, 'video').catch(() => {});
      }
      const uploadResult = await uploadBufferToCloudinary(buffer, 'sermons', 'video');
      updateData.audioUrl = uploadResult.secure_url;
      updateData.audioPublicId = uploadResult.public_id;
    }

    // 5. Upload PDF Notes
    if (pdfFile && pdfFile.size > 0) {
      const buffer = Buffer.from(await pdfFile.arrayBuffer());
      const security = validateFileSecurity(buffer, pdfFile.name, pdfFile.type);
      if (!security.isValid) {
        return NextResponse.json({ error: `PDF Notes validation: ${security.error}` }, { status: 422 });
      }
      if (existingSermon.pdfPublicId) {
        await deleteCloudinaryAsset(existingSermon.pdfPublicId, 'raw').catch(() => {});
      }
      const uploadResult = await uploadBufferToCloudinary(buffer, 'sermons', 'raw');
      updateData.pdfUrl = uploadResult.secure_url;
      updateData.pdfPublicId = uploadResult.public_id;
    }

    // 6. Upload Presentation Slides
    if (presentationFile && presentationFile.size > 0) {
      const buffer = Buffer.from(await presentationFile.arrayBuffer());
      const security = validateFileSecurity(buffer, presentationFile.name, presentationFile.type);
      if (!security.isValid) {
        return NextResponse.json({ error: `Presentation validation: ${security.error}` }, { status: 422 });
      }
      if (existingSermon.presentationPublicId) {
        await deleteCloudinaryAsset(existingSermon.presentationPublicId, 'raw').catch(() => {});
      }
      const uploadResult = await uploadBufferToCloudinary(buffer, 'sermons', 'raw');
      updateData.presentationUrl = uploadResult.secure_url;
      updateData.presentationPublicId = uploadResult.public_id;
    }

    const updatedSermon = await prisma.sermon.update({
      where: { id: sermonId },
      data: updateData,
    });

    // Real-time broadcast
    const companionUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
    try {
      await fetch(`${companionUrl}/api/trigger-event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'sermon.updated',
          payload: { id: updatedSermon.id, title: updatedSermon.title, status: updatedSermon.status },
        }),
      });
    } catch (socketErr) {
      console.warn('[API/SERMONS/[ID]/PUT] Socket companion broadcast failed:', socketErr);
    }

    // Log audit
    try {
      await prisma.auditLog.create({
        data: {
          userId: auth.uid || null,
          action: 'SERMON_UPDATE',
          details: `Updated sermon "${updatedSermon.title}" (ID: ${updatedSermon.id})`,
        },
      });
    } catch (auditErr) {
      console.warn('[API/SERMONS/[ID]/PUT] Audit logging failed:', auditErr);
    }

    return NextResponse.json({ success: true, sermon: updatedSermon });
  } catch (err: any) {
    console.error('[API/SERMONS/[ID]/PUT] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Database error occurred while updating sermon' },
      { status: 500 }
    );
  }
}

// ── PATCH: Partial status, visibility, or featured toggle ──
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireEventManagerOrDev(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const sermonId = params.id;
    if (!sermonId) {
      return NextResponse.json({ error: 'Sermon ID is required' }, { status: 400 });
    }

    const body = await req.json();
    const { status, visibility, featured, recommended, displayOrder } = body;

    const existingSermon = await prisma.sermon.findUnique({
      where: { id: sermonId },
    });

    if (!existingSermon) {
      return NextResponse.json({ error: 'Sermon not found' }, { status: 404 });
    }

    const data: any = {};
    if (status !== undefined) data.status = status;
    if (visibility !== undefined) data.visibility = visibility;
    if (featured !== undefined) data.featured = featured;
    if (recommended !== undefined) data.recommended = recommended;
    if (displayOrder !== undefined) data.displayOrder = displayOrder;

    const updatedSermon = await prisma.sermon.update({
      where: { id: sermonId },
      data,
    });

    // Real-time broadcast
    const companionUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
    try {
      let eventType = 'sermon.updated';
      if (status === 'PUBLISHED' && existingSermon.status !== 'PUBLISHED') {
        eventType = 'sermon.published';
      } else if (status === 'DRAFT' && existingSermon.status === 'PUBLISHED') {
        eventType = 'sermon.unpublished';
      } else if (status === 'ARCHIVED' && existingSermon.status !== 'ARCHIVED') {
        eventType = 'sermon.archived';
      }

      await fetch(`${companionUrl}/api/trigger-event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: eventType,
          payload: { id: updatedSermon.id, title: updatedSermon.title, status: updatedSermon.status },
        }),
      });
    } catch (socketErr) {
      console.warn('[API/SERMONS/[ID]/PATCH] Socket companion broadcast failed:', socketErr);
    }

    return NextResponse.json({ success: true, sermon: updatedSermon });
  } catch (err: any) {
    console.error('[API/SERMONS/[ID]/PATCH] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Database error occurred while updating sermon status' },
      { status: 500 }
    );
  }
}

// ── DELETE: Soft delete a sermon ──
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireEventManagerOrDev(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const sermonId = params.id;
    if (!sermonId) {
      return NextResponse.json({ error: 'Sermon ID is required' }, { status: 400 });
    }

    const sermon = await prisma.sermon.findUnique({
      where: { id: sermonId },
    });

    if (!sermon) {
      return NextResponse.json({ error: 'Sermon not found' }, { status: 404 });
    }

    // Perform soft delete
    const deletedSermon = await prisma.sermon.update({
      where: { id: sermonId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    // Real-time broadcast
    const companionUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
    try {
      await fetch(`${companionUrl}/api/trigger-event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'sermon.deleted',
          payload: { id: deletedSermon.id, title: deletedSermon.title },
        }),
      });
    } catch (socketErr) {
      console.warn('[API/SERMONS/[ID]/DELETE] Socket companion broadcast failed:', socketErr);
    }

    // Log Audit
    try {
      await prisma.auditLog.create({
        data: {
          userId: auth.uid || null,
          action: 'SERMON_DELETE',
          details: `Soft deleted sermon "${deletedSermon.title}" (ID: ${deletedSermon.id})`,
        },
      });
    } catch (auditErr) {
      console.warn('[API/SERMONS/[ID]/DELETE] Audit logging failed:', auditErr);
    }

    return NextResponse.json({ success: true, message: 'Sermon deleted successfully' });
  } catch (err: any) {
    console.error('[API/SERMONS/[ID]/DELETE] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Database error occurred while deleting sermon' },
      { status: 500 }
    );
  }
}
