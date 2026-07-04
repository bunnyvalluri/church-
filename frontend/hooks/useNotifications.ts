/**
 * hooks/useNotifications.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * SWR hook for the admin notification center.
 * Provides: list, unread count, markRead, markAllRead, deleteNotification.
 */
import useSWR, { mutate as globalMutate } from 'swr';
import { useAuth } from '@/components/providers/AuthProvider';

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  content: string;
  isRead: boolean;
  link: string | null;
  createdAt: string;
}

const NOTIF_KEY = '/api/admin/notifications';

const createFetcher =
  (getToken: () => Promise<string | null>) =>
  async (url: string): Promise<AppNotification[]> => {
    const token = await getToken();
    const res = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const d = await res.json();
    return d.notifications ?? [];
  };

export function useNotifications() {
  const { getIdToken } = useAuth();
  const fetcher = createFetcher(getIdToken);

  const { data, error, isLoading, mutate } = useSWR<AppNotification[]>(
    NOTIF_KEY,
    fetcher,
    { refreshInterval: 15_000, dedupingInterval: 5_000 }
  );

  const notifications = data ?? [];
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // ── Mark individual notification as read ────────────────────────────────────
  const markRead = async (id: string) => {
    // Optimistic update
    mutate(
      notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      false
    );
    try {
      const token = await getIdToken();
      await fetch(NOTIF_KEY, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ ids: [id] }),
      });
    } finally {
      mutate();
    }
  };

  // ── Mark all as read ────────────────────────────────────────────────────────
  const markAllRead = async () => {
    mutate(notifications.map((n) => ({ ...n, isRead: true })), false);
    try {
      const token = await getIdToken();
      await fetch(NOTIF_KEY, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ ids: null }),
      });
    } finally {
      mutate();
    }
  };

  // ── Delete a notification ───────────────────────────────────────────────────
  const deleteNotification = async (id: string) => {
    mutate(notifications.filter((n) => n.id !== id), false);
    try {
      const token = await getIdToken();
      await fetch(`${NOTIF_KEY}?id=${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } finally {
      mutate();
    }
  };

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    mutate,
    markRead,
    markAllRead,
    deleteNotification,
  };
}
