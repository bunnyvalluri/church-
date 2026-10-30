/**
 * src/modules/prayers/prayers.service.ts
 * Prayer request submission, prayer wall, and pastoral care management.
 */

import { prisma } from '../../infrastructure/prisma/client';
import { env } from '../../config/env';
import { CreatePrayerDto } from '../../application/dtos';
import { BadRequestError } from '../../shared/errors';
import { getPaginationParams, createPaginatedResponse } from '../../shared/utils';

export class PrayersService {
  public async submitPrayer(dto: CreatePrayerDto, userId?: string | null) {
    if (!dto.title || !dto.description) {
      throw new BadRequestError('Prayer title and description are required.');
    }

    if (env.DB_OFFLINE) {
      return { id: `pray_${Date.now()}`, ...dto, status: 'PENDING', prayerCount: 0 };
    }

    const createData: any = {
      title: dto.title,
      description: dto.description,
      isAnonymous: dto.isAnonymous || false,
      status: 'PENDING',
    };
    if (userId) {
      createData.user = { connect: { id: userId } };
    }

    return prisma.prayerRequest.create({
      data: createData,
    });
  }

  public async listPrayers(query: any, userRole?: string) {
    const { page, limit, skip } = getPaginationParams(query);

    if (env.DB_OFFLINE) {
      return createPaginatedResponse<any>(
        [
          {
            id: 'pray_1',
            title: 'Healing for Family',
            description: 'Please pray for my mother recovery.',
            isAnonymous: true,
            status: 'PENDING',
          },
        ],
        1,
        page,
        limit
      );
    }

    const [items, total] = await Promise.all([
      prisma.prayerRequest.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.prayerRequest.count(),
    ]);

    return createPaginatedResponse<any>(items, total, page, limit);
  }
}

export const prayersService = new PrayersService();
