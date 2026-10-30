/**
 * src/modules/media/media.service.ts
 * Church media management and Cloudinary signed upload generator.
 */

import { CloudinaryClient } from '../../infrastructure/cloudinary/client';
import { prisma } from '../../infrastructure/prisma/client';
import { env } from '../../config/env';
import { eventPublisher } from '../../application/services/eventPublisher';

export class MediaService {
  public generateUploadSignature(folder?: string) {
    return CloudinaryClient.generateUploadSignature(folder || 'kcm-church/media');
  }

  public async registerMedia(data: {
    title: string;
    url: string;
    publicId: string;
    eventId?: string;
    mediaType?: string;
    uploaderId?: string;
  }) {
    if (env.DB_OFFLINE || !data.eventId) {
      return { id: `med_${Date.now()}`, ...data };
    }

    const record = await prisma.eventMedia.create({
      data: {
        eventId: data.eventId,
        imageUrl: data.url,
        publicId: data.publicId,
        caption: data.title || 'Church Media',
        uploadedById: data.uploaderId || null,
      },
    });

    // Enqueue background optimization job via BullMQ
    await eventPublisher.enqueueMediaOptimization(record.id, data.url);

    return record;
  }
}

export const mediaService = new MediaService();
