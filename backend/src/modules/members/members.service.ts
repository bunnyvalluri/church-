/**
 * src/modules/members/members.service.ts
 * Church Member directory service with search and branch filtering.
 */

import { prisma } from '../../infrastructure/prisma/client';
import { env } from '../../config/env';
import { getPaginationParams, createPaginatedResponse } from '../../shared/utils';
import { QueryPaginationOptions } from '../../types/common.types';

export class MembersService {
  public async listMembers(query: QueryPaginationOptions & { branchId?: string }) {
    const { page, limit, skip } = getPaginationParams(query);

    if (env.DB_OFFLINE) {
      return createPaginatedResponse(
        [
          { id: 'mem_1', name: 'John Doe', email: 'john@kcmchurch.org', role: 'MEMBER' },
          { id: 'mem_2', name: 'Sarah Smith', email: 'sarah@kcmchurch.org', role: 'MEMBER' },
        ],
        2,
        page,
        limit
      );
    }

    const where: any = {};
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return createPaginatedResponse(items, total, page, limit);
  }
}

export const membersService = new MembersService();

