import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

export interface NotificationItem {
  id: string;
  type: 'NEW_MEMBER' | 'PRAYER_REQUEST' | 'DONATION' | 'CONTACT_MESSAGE' | 'EVENT_REGISTRATION';
  title: string;
  content: string;
  isRead: boolean;
  link?: string | null;
  createdAt: string;
}

function getFallbackFilePath(): string {
  if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
    return path.join('/tmp', 'fallback_notifications.json');
  }
  return path.join(process.cwd(), 'prisma', 'fallback_notifications.json');
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
  } catch {
    // Fallback: write to local JSON file
    const fallbackFile = getFallbackFilePath();
    let notifs: NotificationItem[] = [];
    if (fs.existsSync(fallbackFile)) {
      try { notifs = JSON.parse(fs.readFileSync(fallbackFile, 'utf-8')); } catch {}
    }
    const simItem: NotificationItem = {
      id: `notif_sim_${Date.now()}_${Math.floor(Math.random() * 9999)}`,
      ...newItem,
      link: newItem.link || null,
      createdAt: new Date().toISOString(),
    };
    notifs.unshift(simItem);
    // Keep list to max 50 to avoid unbounded growth
    if (notifs.length > 50) notifs = notifs.slice(0, 50);
    try { fs.writeFileSync(fallbackFile, JSON.stringify(notifs, null, 2), 'utf-8'); } catch {}
    return simItem;
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

// ─── Initial Dummy Notifications (seed data) ─────────────────────────────────
const DUMMY_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_dummy_1',
    type: 'DONATION',
    title: 'New Donation Received',
    content: 'Valuri Rahul donated ₹1,000.00 for Tithe.',
    isRead: false,
    link: 'donations',
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif_dummy_2',
    type: 'PRAYER_REQUEST',
    title: 'New Prayer Request',
    content: 'Anonymous requested prayers: "Speedy recovery for my mother".',
    isRead: false,
    link: 'prayers',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif_dummy_3',
    type: 'NEW_MEMBER',
    title: 'New Member Registered',
    content: 'Sarah Johnson registered as a Pastor candidate.',
    isRead: true,
    link: 'members',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif_dummy_4',
    type: 'CONTACT_MESSAGE',
    title: 'New Contact Message',
    content: 'David Raju sent a message: "Summer youth fellowship inquiry".',
    isRead: true,
    link: 'messages',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export async function getNotifications(): Promise<NotificationItem[]> {
  let notifs: NotificationItem[] = [];
  let fromDb = false;

  try {
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
    fromDb = true;
  } catch {
    console.warn('[NOTIFICATIONS/GET] Database offline. Using local JSON fallback.');
    try {
      const fallbackFile = getFallbackFilePath();
      if (!fs.existsSync(fallbackFile)) {
        const dir = path.dirname(fallbackFile);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(fallbackFile, JSON.stringify(DUMMY_NOTIFICATIONS, null, 2), 'utf-8');
        notifs = [...DUMMY_NOTIFICATIONS];
      } else {
        const raw = fs.readFileSync(fallbackFile, 'utf-8');
        notifs = JSON.parse(raw).sort(
          (a: NotificationItem, b: NotificationItem) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }
    } catch (fsErr) {
      console.error('[NOTIFICATIONS/GET] Local fallback failed:', fsErr);
      return DUMMY_NOTIFICATIONS;
    }
  }

  // 24/7 simulation: inject a new realistic notification if stale
  if (shouldSimulate(notifs)) {
    const simulated = await triggerSimulatedNotification();
    if (simulated) {
      notifs = [simulated, ...notifs];
      // If we read from DB, we already persisted above. If fallback, it was written in triggerSimulatedNotification.
      // Re-sort to be safe
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

  try {
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
  } catch {
    console.warn('[NOTIFICATIONS/CREATE] Database offline. Writing to local JSON fallback.');
    const fallbackFile = getFallbackFilePath();
    let notifs: NotificationItem[] = [];
    if (fs.existsSync(fallbackFile)) {
      try { notifs = JSON.parse(fs.readFileSync(fallbackFile, 'utf-8')); } catch {}
    } else {
      notifs = [...DUMMY_NOTIFICATIONS];
    }
    const createdItem: NotificationItem = {
      id: `notif_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      type: data.type,
      title: data.title,
      content: data.content,
      isRead: false,
      link: data.link || null,
      createdAt: new Date().toISOString(),
    };
    notifs.unshift(createdItem);
    if (notifs.length > 50) notifs = notifs.slice(0, 50);
    fs.writeFileSync(fallbackFile, JSON.stringify(notifs, null, 2), 'utf-8');
    return createdItem;
  }
}

export async function markNotificationsAsRead(ids?: string[]): Promise<boolean> {
  try {
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
  } catch {
    console.warn('[NOTIFICATIONS/READ] Database offline. Updating local JSON fallback.');
    const fallbackFile = getFallbackFilePath();
    if (!fs.existsSync(fallbackFile)) return false;
    let notifs: NotificationItem[] = JSON.parse(fs.readFileSync(fallbackFile, 'utf-8'));
    notifs = notifs.map(n => {
      if (!ids || ids.includes(n.id)) return { ...n, isRead: true };
      return n;
    });
    fs.writeFileSync(fallbackFile, JSON.stringify(notifs, null, 2), 'utf-8');
    return true;
  }
}

export async function deleteNotification(id: string): Promise<boolean> {
  try {
    await prisma.notification.delete({ where: { id } });
    return true;
  } catch {
    console.warn('[NOTIFICATIONS/DELETE] Database offline. Deleting from local JSON fallback.');
    const fallbackFile = getFallbackFilePath();
    if (!fs.existsSync(fallbackFile)) return false;
    let notifs: NotificationItem[] = JSON.parse(fs.readFileSync(fallbackFile, 'utf-8'));
    notifs = notifs.filter(n => n.id !== id);
    fs.writeFileSync(fallbackFile, JSON.stringify(notifs, null, 2), 'utf-8');
    return true;
  }
}
