/**
 * hooks/useDashboardCharts.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * SWR hooks for:
 *  - Donation chart data (daily / weekly / monthly / yearly)
 *  - Attendance chart data
 */
import useSWR from 'swr';
import { useAuth } from '@/components/providers/AuthProvider';

export type ChartPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface DonationChartPoint {
  label: string;
  amount: number;
  count: number;
}

export interface AttendanceChartData {
  period: string;
  serviceTypes: string[];
  byServiceType: Record<string, number>;
  byServiceTypeNewVisitors: Record<string, number>;
  recent: Array<{
    date: string;
    serviceType: string;
    headcount: number;
    newVisitors: number;
  }>;
  comparison: {
    thisMonth: number;
    lastMonth: number;
    changePct: number;
  };
}

// ── Shared fetcher factory ────────────────────────────────────────────────────
const createFetcher =
  (getToken: () => Promise<string | null>) =>
  async (url: string) => {
    const token = await getToken();
    const res = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    return res.json();
  };

// ── Donation Chart Hook ───────────────────────────────────────────────────────
export function useDonationChart(period: ChartPeriod = 'monthly') {
  const { getIdToken } = useAuth();
  const fetcher = createFetcher(getIdToken);

  const { data, error, isLoading } = useSWR<{ chartData: DonationChartPoint[]; period: string }>(
    `/api/dashboard/donations-chart?period=${period}`,
    fetcher,
    { refreshInterval: 60_000, dedupingInterval: 30_000 }
  );

  return {
    chartData: data?.chartData ?? [],
    period: data?.period ?? period,
    isLoading,
    error,
  };
}

// ── Attendance Chart Hook ─────────────────────────────────────────────────────
export function useAttendanceChart(period: 'weekly' | 'monthly' | 'yearly' = 'weekly') {
  const { getIdToken } = useAuth();
  const fetcher = createFetcher(getIdToken);

  const { data, error, isLoading } = useSWR<AttendanceChartData>(
    `/api/dashboard/attendance-chart?period=${period}`,
    (url) => fetcher(url).then((d) => d),
    { refreshInterval: 60_000, dedupingInterval: 30_000 }
  );

  return {
    chartData: data ?? null,
    isLoading,
    error,
  };
}
