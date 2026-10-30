/**
 * src/modules/users/users.service.ts
 * User and Profile management service.
 */

import { prisma } from '../../infrastructure/prisma/client';
import { env } from '../../config/env';
import { NotFoundError, BadRequestError } from '../../shared/errors';
import { UserRole } from '../../types/auth.types';

export class UsersService {
  public async getUserById(id: string) {
    if (env.DB_OFFLINE) {
      return { id, name: 'Church Member', email: `${id}@kcmchurch.org`, role: 'MEMBER' };
    }
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, role: true, phone: true, image: true, createdAt: true },
    });
    if (!user) throw new NotFoundError('User');
    return user;
  }

  public async updateUserProfile(id: string, data: { name?: string; phone?: string; address?: string }) {
    if (env.DB_OFFLINE) {
      return { id, ...data };
    }
    return prisma.user.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true, phone: true, role: true },
    });
  }

  public async updateUserRole(id: string, role: UserRole) {
    if (env.DB_OFFLINE) {
      return { id, role };
    }
    return prisma.user.update({
      where: { id },
      data: { role: role as any },
      select: { id: true, name: true, email: true, role: true },
    });
  }
}

export const usersService = new UsersService();

