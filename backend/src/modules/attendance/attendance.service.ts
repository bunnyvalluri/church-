/**
 * src/modules/attendance/attendance.service.ts
 * Church attendance check-in and tracking service.
 */

import { prisma } from '../../infrastructure/prisma/client';
import { env } from '../../config/env';
import { BadRequestError } from '../../shared/errors';

export class AttendanceService {
  public async checkIn(eventId: string, userId: string, method = 'QR_CODE') {
    if (!eventId || !userId) throw new BadRequestError('eventId and userId are required.');

    if (env.DB_OFFLINE) {
      return { id: `att_mock_${Date.now()}`, eventId, userId, checkInTime: new Date() };
    }

    return prisma.eventAttendance.create({
      data: {
        eventId,
        memberId: userId,
        name: 'Member',
        attendedAt: new Date(),
      },
    });
  }

  public async getEventAttendance(eventId: string) {
    if (env.DB_OFFLINE) {
      return [{ id: 'att_1', eventId, userId: 'usr_1', status: 'PRESENT' }];
    }
    return prisma.eventAttendance.findMany({
      where: { eventId },
      include: { member: { select: { id: true, name: true, email: true } } },
    });
  }
}

export const attendanceService = new AttendanceService();
