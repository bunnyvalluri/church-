import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminOrDev, requireEventManagerOrDev } from '@/lib/authMiddleware';
import { uploadBufferToCloudinary } from '@/lib/cloudinary';
import { validateFileSecurity } from '@/lib/uploadSecurity';
import { sendPushNotification } from '@/lib/firebaseAdmin';

export const dynamic = 'force-dynamic';



export async function GET(req: Request) {
  try {
    const dbSermons = await prisma.sermon.findMany({
      orderBy: { date: 'desc' },
    });

    return NextResponse.json({ success: true, sermons: dbSermons });
  } catch (err: any) {
    console.error('[PASTOR/SERMON/GET] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Database error occurred while fetching sermons' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  // Protect route using requireEventManagerOrDev (allows PASTOR, EVENT_MANAGER, ADMIN, SUPER_ADMIN)
  const auth = await requireEventManagerOrDev(req);
  if (auth instanceof NextResponse) return auth;

  try {
    let title = "";
    let pastor = "";
    let scripture = "";
    let category = "";
    let description = "";
    let dateStr = "";
    let videoUrl = "";
    let thumbnailFile: File | null = null;
    let videoFile: File | null = null;

    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      title = (formData.get("title") as string) || "";
      pastor = (formData.get("pastor") as string) || "";
      scripture = (formData.get("scripture") as string) || "";
      category = (formData.get("category") as string) || "";
      description = (formData.get("description") as string) || "";
      dateStr = (formData.get("date") as string) || (formData.get("sermonDate") as string) || "";
      videoUrl = (formData.get("videoUrl") as string) || "";

      thumbnailFile = formData.get("thumbnailFile") as File | null;
      videoFile = formData.get("videoFile") as File | null;
    } else {
      const body = await req.json();
      title = body.title || "";
      pastor = body.pastor || "";
      scripture = body.scripture || "";
      category = body.category || "";
      description = body.description || "";
      dateStr = body.date || body.sermonDate || "";
      videoUrl = body.videoUrl || "";
    }

    if (!title || !pastor || !category) {
      return NextResponse.json({ error: 'Title, pastor name and category are required' }, { status: 400 });
    }

    let thumbnail = "/sermons/default.jpg";
    let thumbnailPublicId: string | null = null;
    let videoUrlFinal = videoUrl || null;
    let videoPublicId: string | null = null;

    // 1. Handle Cloudinary Upload for Thumbnail
    if (thumbnailFile && thumbnailFile.size > 0) {
      const buffer = Buffer.from(await thumbnailFile.arrayBuffer());
      const validation = validateFileSecurity(buffer, thumbnailFile.name, thumbnailFile.type);
      if (!validation.isValid) {
        return NextResponse.json({ error: `Thumbnail validation failed: ${validation.error}` }, { status: 422 });
      }
      const uploadResult = await uploadBufferToCloudinary(buffer, "sermons", "image");
      thumbnail = uploadResult.secure_url;
      thumbnailPublicId = uploadResult.public_id;
    }

    // 2. Handle Cloudinary Upload for Video
    if (videoFile && videoFile.size > 0) {
      const buffer = Buffer.from(await videoFile.arrayBuffer());
      const validation = validateFileSecurity(buffer, videoFile.name, videoFile.type);
      if (!validation.isValid) {
        return NextResponse.json({ error: `Video validation failed: ${validation.error}` }, { status: 422 });
      }
      const uploadResult = await uploadBufferToCloudinary(buffer, "sermons", "video");
      videoUrlFinal = uploadResult.secure_url;
      videoPublicId = uploadResult.public_id;
    }

    const tags = scripture ? [scripture] : [];
    const date = dateStr ? new Date(dateStr) : new Date();

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();
    const sermonData = {
      title,
      slug,
      speaker: pastor,
      description: description || `Sermon by ${pastor} — ${scripture || category}`,
      pastor,
      date,
      videoUrl: videoUrlFinal,
      videoPublicId,
      thumbnail,
      thumbnailPublicId,
      category,
      tags,
    };

    const newSermon = await prisma.sermon.create({
      data: sermonData,
    });

    // 3. Trigger Socket.io real-time broadcast via companion server
    const companionUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";
    try {
      // Emit sermon:uploaded for landing page auto refresh
      await fetch(`${companionUrl}/api/trigger-event`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "sermon:uploaded",
          payload: {
            id: newSermon.id,
            title: newSermon.title,
            pastor: newSermon.pastor,
            category: newSermon.category,
            description: newSermon.description,
            videoUrl: newSermon.videoUrl,
            thumbnail: newSermon.thumbnail,
            date: newSermon.date,
            views: newSermon.views,
            popupType: "sermon-uploaded",
            timestamp: new Date(),
          },
        }),
      });

      // Emit notification:popup for live website header alerts
      await fetch(`${companionUrl}/api/trigger-event`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "notification:popup",
          payload: {
            title: "📖 New Sermon Uploaded",
            description: `"${newSermon.title}" by ${newSermon.pastor}`,
            popupType: "sermon-uploaded",
            link: "/pastor",
            icon: "play",
            timestamp: new Date(),
          },
        }),
      });
    } catch (socketErr) {
      console.warn("[API/PASTOR/SERMONS] Socket companion broadcast skipped/failed:", socketErr);
    }

    // 4. Trigger FCM Push Notification
    try {
      const deviceTokenModel = (prisma as any).deviceToken;
      const deviceRecords = deviceTokenModel
        ? await deviceTokenModel.findMany({ select: { token: true }, take: 500 })
        : [];
      const tokens = deviceRecords.map((d: any) => d.token);

      if (tokens.length > 0) {
        await sendPushNotification(
          tokens,
          "📖 New Sermon Available",
          `"${newSermon.title}" by ${newSermon.pastor}`,
          { link: "/pastor" }
        );
      }
    } catch (pushErr) {
      console.warn("[API/PASTOR/SERMONS] FCM Push notifications skipped/failed:", pushErr);
    }

    // 5. Create Audit Log / Database Notification Entry
    try {
      await prisma.notification.create({
        data: {
          type: "sermon-uploaded",
          title: "New Sermon Uploaded",
          content: `"${newSermon.title}" by ${newSermon.pastor}`,
          link: "/pastor",
        },
      });
    } catch (dbNotifErr) {
      console.warn("[API/PASTOR/SERMONS] Notification log creation failed:", dbNotifErr);
    }

    return NextResponse.json({ success: true, sermon: newSermon });
  } catch (err: any) {
    console.error('[PASTOR/SERMON/POST] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Database error occurred while creating sermon' },
      { status: 500 }
    );
  }
}


export async function PATCH(req: Request) {
  const auth = await requireEventManagerOrDev(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(req.url);
    const sermonId = searchParams.get('id');

    if (!sermonId) {
      return NextResponse.json({ error: 'Sermon ID is required' }, { status: 400 });
    }

    const existingSermon = await prisma.sermon.findUnique({
      where: { id: sermonId },
    });

    if (!existingSermon) {
      return NextResponse.json({ error: 'Sermon not found' }, { status: 404 });
    }

    let title = "";
    let pastor = "";
    let scripture = "";
    let category = "";
    let description = "";
    let dateStr = "";
    let videoUrl = "";
    let thumbnailFile: File | null = null;
    let videoFile: File | null = null;

    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      title = (formData.get("title") as string) || "";
      pastor = (formData.get("pastor") as string) || "";
      scripture = (formData.get("scripture") as string) || "";
      category = (formData.get("category") as string) || "";
      description = (formData.get("description") as string) || "";
      dateStr = (formData.get("date") as string) || (formData.get("sermonDate") as string) || "";
      videoUrl = (formData.get("videoUrl") as string) || "";

      thumbnailFile = formData.get("thumbnailFile") as File | null;
      videoFile = formData.get("videoFile") as File | null;
    } else {
      const body = await req.json();
      title = body.title || "";
      pastor = body.pastor || "";
      scripture = body.scripture || "";
      category = body.category || "";
      description = body.description || "";
      dateStr = body.date || body.sermonDate || "";
      videoUrl = body.videoUrl || "";
    }

    const updateData: any = {};
    if (title) updateData.title = title;
    if (pastor) updateData.pastor = pastor;
    if (category) updateData.category = category;
    if (description) updateData.description = description;
    if (dateStr) updateData.date = new Date(dateStr);
    
    if (scripture !== undefined) {
      updateData.tags = scripture ? [scripture] : [];
    }

    if (thumbnailFile && thumbnailFile.size > 0) {
      const buffer = Buffer.from(await thumbnailFile.arrayBuffer());
      const validation = validateFileSecurity(buffer, thumbnailFile.name, thumbnailFile.type);
      if (!validation.isValid) {
        return NextResponse.json({ error: `Thumbnail validation failed: ${validation.error}` }, { status: 422 });
      }
      const uploadResult = await uploadBufferToCloudinary(buffer, "sermons", "image");
      updateData.thumbnail = uploadResult.secure_url;
      updateData.thumbnailPublicId = uploadResult.public_id;
    }

    if (videoFile && videoFile.size > 0) {
      const buffer = Buffer.from(await videoFile.arrayBuffer());
      const validation = validateFileSecurity(buffer, videoFile.name, videoFile.type);
      if (!validation.isValid) {
        return NextResponse.json({ error: `Video validation failed: ${validation.error}` }, { status: 422 });
      }
      const uploadResult = await uploadBufferToCloudinary(buffer, "sermons", "video");
      updateData.videoUrl = uploadResult.secure_url;
      updateData.videoPublicId = uploadResult.public_id;
    } else if (videoUrl !== undefined) {
      updateData.videoUrl = videoUrl || null;
    }

    const updatedSermon = await prisma.sermon.update({
      where: { id: sermonId },
      data: updateData,
    });

    const companionUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";
    try {
      await fetch(`${companionUrl}/api/trigger-event`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "sermon:uploaded",
          payload: {
            id: updatedSermon.id,
            title: updatedSermon.title,
            pastor: updatedSermon.pastor,
            category: updatedSermon.category,
            description: updatedSermon.description,
            videoUrl: updatedSermon.videoUrl,
            thumbnail: updatedSermon.thumbnail,
            date: updatedSermon.date,
            views: updatedSermon.views,
            action: "updated",
            timestamp: new Date(),
          },
        }),
      });
    } catch (socketErr) {
      console.warn("[API/PASTOR/SERMONS/PATCH] Socket companion broadcast failed:", socketErr);
    }

    return NextResponse.json({ success: true, sermon: updatedSermon });
  } catch (err: any) {
    console.error('[PASTOR/SERMON/PATCH] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Database error occurred while updating sermon' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  // Protect route using requireEventManagerOrDev (allows PASTOR, EVENT_MANAGER, ADMIN, SUPER_ADMIN)
  const auth = await requireEventManagerOrDev(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(req.url);
    const sermonId = searchParams.get('id');

    if (!sermonId) {
      return NextResponse.json({ error: 'Sermon ID is required' }, { status: 400 });
    }

    const deletedSermon = await prisma.sermon.delete({
      where: { id: sermonId },
    });

    // Broadcast Socket.io companion update so landing page updates instantly
    const companionUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";
    try {
      await fetch(`${companionUrl}/api/trigger-event`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "sermon:uploaded", // Auto-refreshes landing page list
          payload: { id: deletedSermon.id, action: "deleted" },
        }),
      });
    } catch (socketErr) {
      console.warn("[API/PASTOR/SERMONS] Socket companion broadcast skipped/failed on delete:", socketErr);
    }

    return NextResponse.json({ success: true, message: 'Sermon deleted successfully' });
  } catch (err: any) {
    console.error('[PASTOR/SERMON/DELETE] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Database error occurred while deleting sermon' },
      { status: 500 }
    );
  }
}


