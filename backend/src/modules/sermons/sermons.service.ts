/**
 * src/modules/sermons/sermons.service.ts
 * Sermon catalog, media links, and interaction tracking.
 */

import { prisma } from '../../infrastructure/prisma/client';
import { env } from '../../config/env';
import { getPaginationParams, createPaginatedResponse } from '../../shared/utils';
import { NotFoundError } from '../../shared/errors';

export class SermonsService {
  public async listSermons(query: any) {
    const { page, limit, skip } = getPaginationParams(query);

    if (env.DB_OFFLINE) {
      return createPaginatedResponse<any>(
        [
          {
            id: 'sermon_1',
            title: 'Faith to Overcome the World',
            preacher: 'Senior Pastor',
            scripture: '1 John 5:4',
            date: new Date().toISOString(),
            videoUrl: 'https://youtube.com/watch?v=sample',
          },
        ],
        1,
        page,
        limit
      );
    }

    const [items, total] = await Promise.all([
      prisma.sermon.findMany({
        skip,
        take: limit,
        orderBy: { date: 'desc' },
      }),
      prisma.sermon.count(),
    ]);

    return createPaginatedResponse<any>(items, total, page, limit);
  }

  public async getSermonById(id: string) {
    if (env.DB_OFFLINE) {
      return { id, title: 'Sample Sermon', preacher: 'Pastor', scripture: 'Romans 8:28' };
    }
    const sermon = await prisma.sermon.findUnique({ where: { id } });
    if (!sermon) throw new NotFoundError('Sermon');
    return sermon;
  }
}

export const sermonsService = new SermonsService();
