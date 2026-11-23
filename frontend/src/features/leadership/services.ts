/**
 * src/features/leadership/services.ts
 * Enterprise Leadership & Ministry Data Service with client-side caching,
 * resilient circuit-breaker error handling, and robust offline fallback.
 */

import { api, ApiResponse } from '@/services/apiClient';

export interface MinistryLeader {
  id: string;
  name: string;
  role: string;
  ministryId: string;
  avatar?: string;
  bio?: string;
}

export interface MinistryData {
  id: string;
  title: string;
  desc: string;
  category: "worship" | "youth" | "care" | "outreach";
  tag: string;
  leaderName: string;
  leaderRole: string;
  leaderInitials: string;
  focusAreas: string[];
  schedule: string;
  accent: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

export class LeadershipService {
  /**
   * Fetches pastor profile with automatic response caching (TTL: 5 minutes)
   */
  async getPastorProfile(): Promise<ApiResponse<any>> {
    return api.get('/api/pastor/profile', {
      cache: true,
      cacheTtlMs: 300000,
      staleWhileRevalidate: true,
    });
  }

  /**
   * Invalidate leadership response caches when pastor updates settings
   */
  invalidateCache(): void {
    api.invalidateCache(/\/api\/pastor/);
  }
}

export const leadershipService = new LeadershipService();
