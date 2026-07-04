/**
 * hooks/useSidebarCounts.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Lightweight wrapper around useDashboardStats that exposes only the sidebar
 * badge counts. Other components can import this without touching stats internals.
 */
import { useDashboardStats } from './useDashboardStats';

export interface SidebarCounts {
  members: number;
  prayersPending: number;
  donationsPending: number;
  eventsUpcoming: number;
  mediaTotal: number;
  volunteers: number;
  notificationsUnread: number;
}

const DEFAULT_COUNTS: SidebarCounts = {
  members: 0,
  prayersPending: 0,
  donationsPending: 0,
  eventsUpcoming: 0,
  mediaTotal: 0,
  volunteers: 0,
  notificationsUnread: 0,
};

export function useSidebarCounts(): { counts: SidebarCounts; isLoading: boolean } {
  const { stats, isLoading } = useDashboardStats();

  if (!stats) return { counts: DEFAULT_COUNTS, isLoading };

  const counts: SidebarCounts = {
    members: stats.sidebar.members,
    prayersPending: stats.sidebar.prayerRequestsUnread,
    donationsPending: stats.sidebar.donationsPending,
    eventsUpcoming: stats.sidebar.eventsUpcoming,
    mediaTotal: stats.sidebar.mediaTotal,
    volunteers: stats.sidebar.volunteers,
    notificationsUnread: 0, // comes from useNotifications hook directly
  };

  return { counts, isLoading };
}
