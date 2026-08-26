/**
 * frontend/hooks/useSms.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * React Query + Socket.io real-time hooks for SMS management,
 * stats metrics, testing, and lifecycle actions.
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { io } from 'socket.io-client';

export interface SmsMessageItem {
  id: string;
  notificationId?: string | null;
  memberId?: string | null;
  member?: { id: string; name: string; email: string; phone?: string | null } | null;
  phoneNumber: string;
  normalizedPhoneNumber: string;
  message: string;
  provider: string;
  providerMessageId?: string | null;
  idempotencyKey?: string | null;
  status: 'QUEUED' | 'PROCESSING' | 'SENT' | 'DELIVERED' | 'FAILED' | 'RETRYING' | 'EXPIRED' | 'CANCELLED';
  attempts: number;
  maxAttempts: number;
  scheduledAt?: string | null;
  sentAt?: string | null;
  deliveredAt?: string | null;
  failedAt?: string | null;
  expiresAt?: string | null;
  failureReason?: string | null;
  errorCode?: string | null;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export interface SmsStats {
  total: number;
  queued: number;
  processing: number;
  sent: number;
  delivered: number;
  failed: number;
  retrying: number;
  expired: number;
  cancelled: number;
  deliveryRate: number;
  failureRate: number;
}

export interface SmsSettings {
  provider: string;
  isConfigured: boolean;
  fromNumber: string;
  defaultCountry: string;
  maxRetries: number;
  rateLimitPerMinute: number;
  queueMode: string;
}

// ── Hook: Fetch SMS Messages List ─────────────────────────────────────────────
export function useSmsMessages(params: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
} = {}) {
  const queryClient = useQueryClient();

  const query = useQuery<{
    success: boolean;
    items: SmsMessageItem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>({
    queryKey: ['sms-messages', params],
    queryFn: async () => {
      const q = new URLSearchParams();
      if (params.page) q.set('page', String(params.page));
      if (params.limit) q.set('limit', String(params.limit));
      if (params.status) q.set('status', params.status);
      if (params.search) q.set('search', params.search);
      if (params.startDate) q.set('startDate', params.startDate);
      if (params.endDate) q.set('endDate', params.endDate);

      const res = await fetch(`/api/admin/sms?${q.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch SMS messages');
      return res.json();
    },
    refetchInterval: 15000,
  });

  // Socket.io Realtime Listener
  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
    let socket: any = null;
    try {
      socket = io(socketUrl, { transports: ['websocket', 'polling'] });
      
      const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: ['sms-messages'] });
        queryClient.invalidateQueries({ queryKey: ['sms-stats'] });
      };

      socket.on('sms.updated', invalidate);
      socket.on('sms.sent', invalidate);
      socket.on('sms.delivered', invalidate);
      socket.on('sms.failed', invalidate);
      socket.on('sms.retrying', invalidate);
      socket.on('sms.processing', invalidate);
    } catch {}

    return () => {
      if (socket) socket.disconnect();
    };
  }, [queryClient]);

  return query;
}

// ── Hook: Fetch SMS Stats ─────────────────────────────────────────────────────
export function useSmsStats() {
  return useQuery<{ success: boolean; stats: SmsStats }>({
    queryKey: ['sms-stats'],
    queryFn: async () => {
      const res = await fetch('/api/admin/sms/stats');
      if (!res.ok) throw new Error('Failed to fetch SMS stats');
      return res.json();
    },
    refetchInterval: 10000,
  });
}

// ── Hook: Fetch SMS Settings ──────────────────────────────────────────────────
export function useSmsSettings() {
  return useQuery<{ success: boolean; settings: SmsSettings }>({
    queryKey: ['sms-settings'],
    queryFn: async () => {
      const res = await fetch('/api/admin/sms/settings');
      if (!res.ok) throw new Error('Failed to fetch SMS settings');
      return res.json();
    },
  });
}

// ── Hook: Send Test SMS Mutation ──────────────────────────────────────────────
export function useSendTestSms() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { phoneNumber: string; message: string; template?: string }) => {
      const res = await fetch('/api/admin/sms/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to dispatch test SMS');
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sms-messages'] });
      queryClient.invalidateQueries({ queryKey: ['sms-stats'] });
    },
  });
}

// ── Hook: Retry Failed SMS Mutation ───────────────────────────────────────────
export function useRetrySms() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/sms/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'retry' }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to retry SMS');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sms-messages'] });
      queryClient.invalidateQueries({ queryKey: ['sms-stats'] });
    },
  });
}

// ── Hook: Cancel Queued SMS Mutation ──────────────────────────────────────────
export function useCancelSms() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/sms/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel' }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to cancel SMS');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sms-messages'] });
      queryClient.invalidateQueries({ queryKey: ['sms-stats'] });
    },
  });
}
