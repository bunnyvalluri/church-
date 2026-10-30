import { api, ApiResponse } from '../../services/apiClient';

export interface MediaAsset {
  id: string;
  url: string;
  thumbnailUrl?: string;
  caption: string;
  category: 'WORSHIP' | 'CAMPUS' | 'NGO' | 'EVENT';
  uploadedAt: string;
}

export class MediaService {
  static async getSignedUploadParams(): Promise<
    ApiResponse<{
      signature: string;
      timestamp: number;
      apiKey: string;
      cloudName: string;
      folder: string;
    }>
  > {
    return api.post('/api/media/sign-upload');
  }

  static async getGallery(params?: { category?: string }): Promise<ApiResponse<MediaAsset[]>> {
    return api.get('/api/media/gallery', { params });
  }
}

