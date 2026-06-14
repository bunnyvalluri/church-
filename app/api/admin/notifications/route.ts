import { NextResponse } from 'next/server';
import { requireAdminOrDev } from '@/lib/authMiddleware';
import { 
  getNotifications, 
  createNotification, 
  markNotificationsAsRead, 
  deleteNotification 
} from '@/lib/notification';

export async function GET(req: Request) {
  const auth = await requireAdminOrDev(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const notifications = await getNotifications();
    return NextResponse.json({ success: true, notifications });
  } catch (err: any) {
    console.error('[API/NOTIFICATIONS/GET] Error:', err);
    return NextResponse.json({ error: err?.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const auth = await requireAdminOrDev(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const { type, title, content, link } = body;

    if (!type || !title || !content) {
      return NextResponse.json({ error: 'Missing required fields: type, title, content' }, { status: 400 });
    }

    const notification = await createNotification({ type, title, content, link });
    return NextResponse.json({ success: true, notification }, { status: 201 });
  } catch (err: any) {

    console.error('[API/NOTIFICATIONS/POST] Error:', err);
    return NextResponse.json({ error: err?.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const auth = await requireAdminOrDev(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const { ids } = body; // Array of notification IDs to mark as read. If empty/null, marks all as read.

    const success = await markNotificationsAsRead(ids);
    return NextResponse.json({ success });
  } catch (err: any) {
    console.error('[API/NOTIFICATIONS/PUT] Error:', err);
    return NextResponse.json({ error: err?.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const auth = await requireAdminOrDev(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Notification ID is required' }, { status: 400 });
    }

    const success = await deleteNotification(id);
    return NextResponse.json({ success });
  } catch (err: any) {
    console.error('[API/NOTIFICATIONS/DELETE] Error:', err);
    return NextResponse.json({ error: err?.message || 'Internal Server Error' }, { status: 500 });
  }
}
