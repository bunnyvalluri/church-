import { prisma } from '@/lib/prisma';

export interface NotificationItem {
  id: string;
  type: 'NEW_MEMBER' | 'PRAYER_REQUEST' | 'DONATION' | 'CONTACT_MESSAGE' | 'EVENT_REGISTRATION';
  title: string;
  content: string;
  isRead: boolean;
  link?: string | null;
  createdAt: string;
}

export async function getNotifications(): Promise<NotificationItem[]> {
  const dbNotifs = await prisma.notification.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return dbNotifs.map(n => ({
    id: n.id,
    type: n.type as NotificationItem['type'],
    title: n.title,
    content: n.content,
    isRead: n.isRead,
    link: n.link,
    createdAt: n.createdAt.toISOString(),
  }));
}

export async function createNotification(data: {
  type: NotificationItem['type'];
  title: string;
  content: string;
  link?: string;
}): Promise<NotificationItem> {
  const newNotif = {
    type: data.type,
    title: data.title,
    content: data.content,
    isRead: false,
    link: data.link || null,
  };

  const record = await prisma.notification.create({ data: newNotif });
  return {
    id: record.id,
    type: record.type as NotificationItem['type'],
    title: record.title,
    content: record.content,
    isRead: record.isRead,
    link: record.link,
    createdAt: record.createdAt.toISOString(),
  };
}

export async function markNotificationsAsRead(ids?: string[]): Promise<boolean> {
  if (ids && ids.length > 0) {
    await prisma.notification.updateMany({
      where: { id: { in: ids } },
      data: { isRead: true },
    });
  } else {
    await prisma.notification.updateMany({
      where: { isRead: false },
      data: { isRead: true },
    });
  }
  return true;
}

export async function deleteNotification(id: string): Promise<boolean> {
  await prisma.notification.delete({ where: { id } });
  return true;
}

export async function clearAllNotifications(): Promise<boolean> {
  await prisma.notification.deleteMany();
  return true;
}
