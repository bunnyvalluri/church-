/**
 * hooks/useDashboardStats.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * SWR hook wrapping GET /api/dashboard/stats.
 * Auto-refreshes every 30 seconds for near-realtime dashboard updates.
 *
 * Usage:
 *   const { stats, isLoading, error, mutate } = useDashboardStats();
 */
import useSWR from 'swr';
import { useAuth } from '@/components/providers/AuthProvider';

// ── Types ─────────────────────────────────────────────────────────────────────
export interface DashboardStats {
  members: {
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
    lastMonth: number;
    growthPct: number | null;
  };
  donations: {
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
    thisYear: number;
    count: number;
    avg: number;
    byCategory: Record<string, number>;
    byMethod: Record<string, number>;
    growthPct?: number | null;
  };
  attendance: {
    total: number;
    totalNewVisitors: number;
    avgPerRecord: number;
    recordCount: number;
    latestHeadcount: number;
    byServiceType: Record<string, number>;
    growthPct?: number | null;
  };
  events: {
    total: number;
    draft: number;
    published: number;
    completed: number;
    cancelled: number;
    upcoming: number;
    past: number;
  };
  content: {
    sermons: number;
  };
  sidebar: {
    members: number;
    prayerRequestsUnread: number;
    donationsPending: number;
    eventsUpcoming: number;
    mediaTotal: number;
    volunteers: number;
  };
  recentMembers: Array<{
    id: string;
    name: string;
    email: string;
    phone: string | null;
    role: string;
    image: string | null;
    createdAt: string;
    emailVerified: string | null;
  }>;
}

// ── Fetcher ───────────────────────────────────────────────────────────────────
const createFetcher = (getToken: () => Promise<string | null>) =>
  async (url: string): Promise<DashboardStats> => {
    const token = await getToken();
    const res = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    const data = await res.json();
    return data.stats as DashboardStats;
  };

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useDashboardStats(startDate?: string, endDate?: string) {
  const { getIdToken } = useAuth();
  const fetcher = createFetcher(getIdToken);

  const queryParams = new URLSearchParams();
  if (startDate) queryParams.set('startDate', startDate);
  if (endDate) queryParams.set('endDate', endDate);
  const key = `/api/dashboard/stats${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

  const { data, error, isLoading, mutate } = useSWR<DashboardStats>(
    key,
    fetcher,
    {
      refreshInterval: 30_000,       // Auto-refresh every 30 s
      revalidateOnFocus: true,
      dedupingInterval: 10_000,
      shouldRetryOnError: true,
      errorRetryCount: 3,
    }
  );

  return { stats: data, isLoading, error, mutate };
}
