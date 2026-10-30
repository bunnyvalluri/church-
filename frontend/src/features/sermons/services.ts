import { z } from 'zod';
import { api, ApiResponse } from '../../services/apiClient';

export interface SermonItem {
  id: string;
  title: string;
  speaker: string;
  series?: string;
  date: string;
  biblePassage?: string;
  videoUrl?: string;
  audioUrl?: string;
  thumbnailUrl?: string;
  notesUrl?: string;
  durationMinutes: number;
  viewCount: number;
  language: 'en' | 'te' | 'hi';
}

export class SermonsService {
  static async getSermons(params?: {
    page?: number;
    limit?: number;
    speaker?: string;
    series?: string;
    language?: string;
  }): Promise<ApiResponse<{ sermons: SermonItem[]; total: number }>> {
    return api.get('/api/sermons', { params });
  }

  static async getSermonById(id: string): Promise<ApiResponse<SermonItem>> {
    return api.get(`/api/sermons/${id}`);
  }

  static async logSermonView(id: string): Promise<ApiResponse<{ viewCount: number }>> {
    return api.post(`/api/sermons/${id}/view`);
  }
}

