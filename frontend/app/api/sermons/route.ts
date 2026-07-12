import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireEventManagerOrDev } from '@/lib/authMiddleware';
import { uploadBufferToCloudinary } from '@/lib/cloudinary';
import { validateFileSecurity } from '@/lib/uploadSecurity';
import { sendPushNotification } from '@/lib/firebaseAdmin';

export const dynamic = 'force-dynamic';

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

// ── GET: Fetch sermons with search, filters, sorting and pagination ──
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const language = searchParams.get('language') || '';
    const speaker = searchParams.get('speaker') || '';
    const branch = searchParams.get('branch') || '';
    const book = searchParams.get('book') || '';
    const status = searchParams.get('status') || ''; // DRAFT, PUBLISHED, ARCHIVED
    const visibility = searchParams.get('visibility') || ''; // PUBLIC, MEMBERS_ONLY, PRIVATE
    const featured = searchParams.get('featured') === 'true';
    const recommended = searchParams.get('recommended') === 'true';

    const sortBy = searchParams.get('sortBy') || 'newest'; // newest, oldest, most_viewed, most_liked, alphabetical
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const cursor = searchParams.get('cursor') || '';

    const where: any = {
      isDeleted: false,
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { speaker: { contains: search, mode: 'insensitive' } },
        { bibleVerse: { contains: search, mode: 'insensitive' } },
        { book: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } },
      ];
    }

    if (category && category !== 'ALL' && category !== 'all') {
      where.category = { equals: category, mode: 'insensitive' };
    }
    if (language && language !== 'all') {
      where.language = { equals: language, mode: 'insensitive' };
    }
    if (speaker) {
      where.speaker = { contains: speaker, mode: 'insensitive' };
    }
    if (branch && branch !== 'all') {
      where.branch = { equals: branch, mode: 'insensitive' };
    }
    if (book) {
      where.book = { equals: book, mode: 'insensitive' };
    }
    if (status) {
      where.status = status;
    } else {
      // Default to PUBLISHED for normal requests unless specified otherwise
      where.status = 'PUBLISHED';
    }
    if (visibility) {
      where.visibility = visibility;
    }
    if (featured) {
      where.featured = true;
    }
    if (recommended) {
      where.recommended = true;
    }

    // Build Sorting options
    let orderBy: any = { date: 'desc' };
    if (sortBy === 'oldest') {
      orderBy = { date: 'asc' };
    } else if (sortBy === 'most_viewed') {
      orderBy = { viewsRelation: { _count: 'desc' } };
    } else if (sortBy === 'most_liked') {
      orderBy = { likes: { _count: 'desc' } };
    } else if (sortBy === 'alphabetical') {
      orderBy = { title: 'asc' };
    } else if (sortBy === 'newest') {
      orderBy = { date: 'desc' };
    }

    const queryOptions: any = {
      where,
      take: limit + 1,
      orderBy,
      include: {
        likes: true,
        bookmarks: true,
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
    };

    if (cursor) {
      queryOptions.cursor = { id: cursor };
      queryOptions.skip = 1;
    }

    const sermons = await prisma.sermon.findMany(queryOptions);

    let nextCursor: string | undefined = undefined;
    if (sermons.length > limit) {
      const nextPageItem = sermons.pop();
      nextCursor = nextPageItem?.id;
    }

    return NextResponse.json({
      success: true,
      sermons,
      nextCursor,
    });
  } catch (err: any) {
    console.error('[API/SERMONS/GET] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Database error occurred while fetching sermons' },
      { status: 500 }
    );
  }
}

// ── POST: Create a new sermon and upload media files to Cloudinary ──
export async function POST(req: Request) {
  const auth = await requireEventManagerOrDev(req);
  if (auth instanceof NextResponse) return auth;

  try {
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
    const language = (formData.get('language') as string) || 'English';
    const datePreachedStr = (formData.get('datePreached') as string) || (formData.get('sermonDate') as string) || '';
    const duration = (formData.get('duration') as string) || '';
    const tagsStr = (formData.get('tags') as string) || '';
    const keywordsStr = (formData.get('keywords') as string) || '';
    
    const featured = formData.get('featured') === 'true';
    const recommended = formData.get('recommended') === 'true';
    const visibility = (formData.get('visibility') as any) || 'PUBLIC';
    const status = (formData.get('status') as any) || 'DRAFT';
    const seoTitle = (formData.get('seoTitle') as string) || '';
    const seoDescription = (formData.get('seoDescription') as string) || '';

    // Files
    const thumbnailFile = formData.get('thumbnailFile') as File | null;
    const bannerFile = formData.get('bannerFile') as File | null;
    const videoFile = formData.get('videoFile') as File | null;
    const audioFile = formData.get('audioFile') as File | null;
    const pdfFile = formData.get('pdfFile') as File | null;
    const presentationFile = formData.get('presentationFile') as File | null;

    if (!title || !speaker || !category) {
      return NextResponse.json({ error: 'Title, speaker, and category are required' }, { status: 400 });
    }

    // Generate unique SEO slug
    let slug = generateSlug(title);
    const existingSlug = await prisma.sermon.findFirst({ where: { slug } });
    if (existingSlug) {
      slug = `${slug}-${Math.random().toString(36).substring(2, 6)}`;
    }

    // 1. Upload Thumbnail to Cloudinary
    let thumbnail = '/sermons/default.jpg';
    let thumbnailPublicId = null;
    if (thumbnailFile && thumbnailFile.size > 0) {
      const buffer = Buffer.from(await thumbnailFile.arrayBuffer());
      const security = validateFileSecurity(buffer, thumbnailFile.name, thumbnailFile.type);
      if (!security.isValid) {
        return NextResponse.json({ error: `Thumbnail validation: ${security.error}` }, { status: 422 });
      }
      const uploadResult = await uploadBufferToCloudinary(buffer, 'sermons', 'image');
      thumbnail = uploadResult.secure_url;
      thumbnailPublicId = uploadResult.public_id;
    }

    // 2. Upload Banner Image to Cloudinary
    let banner = null;
    let bannerPublicId = null;
    if (bannerFile && bannerFile.size > 0) {
      const buffer = Buffer.from(await bannerFile.arrayBuffer());
      const security = validateFileSecurity(buffer, bannerFile.name, bannerFile.type);
      if (!security.isValid) {
        return NextResponse.json({ error: `Banner image validation: ${security.error}` }, { status: 422 });
      }
      const uploadResult = await uploadBufferToCloudinary(buffer, 'sermons', 'image');
      banner = uploadResult.secure_url;
      bannerPublicId = uploadResult.public_id;
    }

    // 3. Upload Video to Cloudinary
    let videoUrl = null;
    let videoPublicId = null;
    if (videoFile && videoFile.size > 0) {
      const buffer = Buffer.from(await videoFile.arrayBuffer());
      const security = validateFileSecurity(buffer, videoFile.name, videoFile.type);
      if (!security.isValid) {
        return NextResponse.json({ error: `Video validation: ${security.error}` }, { status: 422 });
      }
      const uploadResult = await uploadBufferToCloudinary(buffer, 'sermons', 'video');
      videoUrl = uploadResult.secure_url;
      videoPublicId = uploadResult.public_id;
    }

    // 4. Upload Audio to Cloudinary
    let audioUrl = null;
    let audioPublicId = null;
    if (audioFile && audioFile.size > 0) {
      const buffer = Buffer.from(await audioFile.arrayBuffer());
      const security = validateFileSecurity(buffer, audioFile.name, audioFile.type);
      if (!security.isValid) {
        return NextResponse.json({ error: `Audio validation: ${security.error}` }, { status: 422 });
      }
      const uploadResult = await uploadBufferToCloudinary(buffer, 'sermons', 'video');
      audioUrl = uploadResult.secure_url;
      audioPublicId = uploadResult.public_id;
    }

    // 5. Upload PDF Notes to Cloudinary
    let pdfUrl = null;
    let pdfPublicId = null;
    if (pdfFile && pdfFile.size > 0) {
      const buffer = Buffer.from(await pdfFile.arrayBuffer());
      const security = validateFileSecurity(buffer, pdfFile.name, pdfFile.type);
      if (!security.isValid) {
        return NextResponse.json({ error: `PDF Notes validation: ${security.error}` }, { status: 422 });
      }
      const uploadResult = await uploadBufferToCloudinary(buffer, 'sermons', 'raw');
      pdfUrl = uploadResult.secure_url;
      pdfPublicId = uploadResult.public_id;
    }

    // 6. Upload Presentation Slides to Cloudinary
    let presentationUrl = null;
    let presentationPublicId = null;
    if (presentationFile && presentationFile.size > 0) {
      const buffer = Buffer.from(await presentationFile.arrayBuffer());
      const security = validateFileSecurity(buffer, presentationFile.name, presentationFile.type);
      if (!security.isValid) {
        return NextResponse.json({ error: `Presentation validation: ${security.error}` }, { status: 422 });
      }
      const uploadResult = await uploadBufferToCloudinary(buffer, 'sermons', 'raw');
      presentationUrl = uploadResult.secure_url;
      presentationPublicId = uploadResult.public_id;
    }

    const tags = tagsStr ? tagsStr.split(',').map((t) => t.trim()).filter(Boolean) : [];
    const keywords = keywordsStr ? keywordsStr.split(',').map((k) => k.trim()).filter(Boolean) : [];
    const date = datePreachedStr ? new Date(datePreachedStr) : new Date();

    const createdSermon = await prisma.sermon.create({
      data: {
        title,
        slug,
        subtitle,
        shortDescription,
        description,
        bibleVerse,
        book,
        chapter,
        verses,
        speaker,
        pastor: pastor || null,
        guestSpeaker: guestSpeaker || null,
        branch: branch || null,
        category,
        language,
        date,
        duration: duration || null,
        tags,
        keywords,
        thumbnail,
        thumbnailPublicId,
        banner,
        bannerPublicId,
        videoUrl,
        videoPublicId,
        audioUrl,
        audioPublicId,
        pdfUrl,
        pdfPublicId,
        presentationUrl,
        presentationPublicId,
        featured,
        recommended,
        visibility,
        status,
        seoTitle: seoTitle || title,
        seoDescription: seoDescription || shortDescription || description.slice(0, 150),
        createdById: auth.uid || null,
      },
    });

    // 7. Real-time broadcast triggers via backend companion
    const companionUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
    try {
      await fetch(`${companionUrl}/api/trigger-event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'sermon.created',
          payload: {
            id: createdSermon.id,
            title: createdSermon.title,
            slug: createdSermon.slug,
            speaker: createdSermon.speaker,
            category: createdSermon.category,
            thumbnail: createdSermon.thumbnail,
            status: createdSermon.status,
            date: createdSermon.date,
          },
        }),
      });

      if (createdSermon.status === 'PUBLISHED') {
        await fetch(`${companionUrl}/api/trigger-event`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'notification:popup',
            payload: {
              title: '📖 New Sermon Published',
              description: `"${createdSermon.title}" by ${createdSermon.speaker}`,
              popupType: 'sermon-uploaded',
              link: `/sermons/${createdSermon.slug}`,
              icon: 'play',
              timestamp: new Date(),
            },
          }),
        });
      }
    } catch (socketErr) {
      console.warn('[API/SERMONS/POST] Real-time socket sync failed:', socketErr);
    }

    // 8. FCM Push Notification (if published)
    if (createdSermon.status === 'PUBLISHED') {
      try {
        const deviceRecords = await prisma.deviceToken.findMany({ select: { token: true }, take: 250 });
        const tokens = deviceRecords.map((d) => d.token);
        if (tokens.length > 0) {
          await sendPushNotification(
            tokens,
            '📖 New Sermon Available',
            `"${createdSermon.title}" by ${createdSermon.speaker}`,
            { link: `/sermons/${createdSermon.slug}` }
          );
        }
      } catch (pushErr) {
        console.warn('[API/SERMONS/POST] FCM Push notification failed:', pushErr);
      }
    }

    // 9. Audit Logging
    try {
      await prisma.auditLog.create({
        data: {
          userId: auth.uid || null,
          action: 'SERMON_CREATE',
          details: `Created sermon "${createdSermon.title}" (ID: ${createdSermon.id}, Status: ${createdSermon.status})`,
        },
      });
    } catch (auditErr) {
      console.warn('[API/SERMONS/POST] Audit logging failed:', auditErr);
    }

    return NextResponse.json({ success: true, sermon: createdSermon });
  } catch (err: any) {
    console.error('[API/SERMONS/POST] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Database error occurred while uploading sermon' },
      { status: 500 }
    );
  }
}
