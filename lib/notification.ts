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

// ─── 24/7 Church Activity Simulator ──────────────────────────────────────────
// These templates represent realistic, randomized church activity events that
// fire automatically when there's been no new notification in > 2 minutes.
const SIMULATION_TEMPLATES: Omit<NotificationItem, 'id' | 'createdAt' | 'isRead'>[] = [
  {
    type: 'DONATION',
    title: 'New Tithe Received',
    content: 'Rajesh Kumar donated ₹2,500.00 towards Tithe & Offering.',
    link: 'donations',
  },
  {
    type: 'PRAYER_REQUEST',
    title: 'Urgent Prayer Request',
    content: 'Sister Anitha requested urgent prayers for her father\'s surgery.',
    link: 'prayers',
  },
  {
    type: 'NEW_MEMBER',
    title: 'New Member Registration',
    content: 'David Prasad has completed new membership registration.',
    link: 'members',
  },
  {
    type: 'CONTACT_MESSAGE',
    title: 'New Contact Inquiry',
    content: 'Samuel Raju sent a message: "Interested in joining the Sunday choir."',
    link: 'messages',
  },
  {
    type: 'EVENT_REGISTRATION',
    title: 'Youth Camp Registration',
    content: '12 youth members registered for the Summer Youth Camp 2026.',
    link: 'events',
  },
  {
    type: 'DONATION',
    title: 'Building Fund Donation',
    content: 'Anonymous donor contributed ₹10,000.00 to the Building Fund.',
    link: 'donations',
  },
  {
    type: 'PRAYER_REQUEST',
    title: 'Thanksgiving Prayer',
    content: 'Brother Thomas submitted a thanksgiving prayer: "God answered my job prayers!"',
    link: 'prayers',
  },
  {
    type: 'NEW_MEMBER',
    title: 'Baptism Request Submitted',
    content: 'Mary Joseph has submitted a baptism request for review.',
    link: 'members',
  },
  {
    type: 'CONTACT_MESSAGE',
    title: 'Outreach Program Inquiry',
    content: 'Pastor Suresh from Secunderabad: "Can we partner for the monsoon relief drive?"',
    link: 'messages',
  },
  {
    type: 'EVENT_REGISTRATION',
    title: 'Sunday Service Registration',
    content: '3 first-time visitors registered for this Sunday\'s 10:00 AM service.',
    link: 'events',
  },
  {
    type: 'DONATION',
    title: 'Missions Support Received',
    content: 'Priya Devi donated ₹5,000.00 for the Overseas Missions Fund.',
    link: 'donations',
  },
  {
    type: 'PRAYER_REQUEST',
    title: 'New Prayer Chain Request',
    content: 'Anonymous: "Please pray for reconciliation in our family. We need God\'s peace."',
    link: 'prayers',
  },
];

// Generates a simulated notification and persists it
async function triggerSimulatedNotification(): Promise<NotificationItem | null> {
  const template = SIMULATION_TEMPLATES[Math.floor(Math.random() * SIMULATION_TEMPLATES.length)];
  const newItem: Omit<NotificationItem, 'id' | 'createdAt'> = {
    ...template,
    isRead: false,
  };

  try {
    const record = await prisma.notification.create({
      data: {
        type: newItem.type,
        title: newItem.title,
        content: newItem.content,
        isRead: false,
        link: newItem.link || null,
      },
    });
    return {
      id: record.id,
      type: record.type as NotificationItem['type'],
      title: record.title,
      content: record.content,
      isRead: record.isRead,
      link: record.link,
      createdAt: record.createdAt.toISOString(),
    };
  } catch (err) {
    console.error('[NOTIFICATIONS/SIMULATE] Failed to persist simulated notification:', err);
    return null;
  }
}

// Check if a new simulated notification should be injected
function shouldSimulate(notifs: NotificationItem[]): boolean {
  if (notifs.length === 0) return true;
  const latest = notifs.reduce((a, b) =>
    new Date(a.createdAt).getTime() > new Date(b.createdAt).getTime() ? a : b
  );
  const ageMs = Date.now() - new Date(latest.createdAt).getTime();
  // Trigger simulation if the newest notification is older than 2 minutes
  return ageMs > 2 * 60 * 1000;
}

export async function getNotifications(): Promise<NotificationItem[]> {
  let notifs: NotificationItem[] = [];

  const dbNotifs = await prisma.notification.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  
  notifs = dbNotifs.map(n => ({
    id: n.id,
    type: n.type as NotificationItem['type'],
    title: n.title,
    content: n.content,
    isRead: n.isRead,
    link: n.link,
    createdAt: n.createdAt.toISOString(),
  }));

  // 24/7 simulation: inject a new realistic notification if stale
  if (shouldSimulate(notifs)) {
    const simulated = await triggerSimulatedNotification();
    if (simulated) {
      notifs = [simulated, ...notifs];
      notifs.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
  }

  return notifs.slice(0, 50);
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
