/**
 * src/modules/events/events.service.ts
 * Events service managing church event schedules, seat reservation, and real-time updates.
 */

import { prisma } from '../../infrastructure/prisma/client';
import { env } from '../../config/env';
import { eventPublisher } from '../../application/services/eventPublisher';
import { getPaginationParams, createPaginatedResponse } from '../../shared/utils';
import { BadRequestError, NotFoundError } from '../../shared/errors';
import { CreateEventDto } from '../../application/dtos';

export class EventsService {
  public async listEvents(query: any) {
    const { page, limit, skip } = getPaginationParams(query);

    if (env.DB_OFFLINE) {
      return createPaginatedResponse<any>(
        [
          {
            id: 'evt_1',
            title: 'Sunday Worship Service',
            slug: 'sunday-worship-service',
            date: new Date().toISOString(),
            time: '10:00 AM',
            location: 'Kukatpally Main Campus',
            remainingSeats: 250,
          },
        ],
        1,
        page,
        limit
      );
    }

    const [items, total] = await Promise.all([
      prisma.event.findMany({
        skip,
        take: limit,
        orderBy: { date: 'asc' },
      }),
      prisma.event.count(),
    ]);

    return createPaginatedResponse<any>(items, total, page, limit);
  }

  public async createEvent(dto: CreateEventDto, userId: string) {
    if (!dto.title) throw new BadRequestError('Event title is required.');

    const slug = dto.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();

    if (env.DB_OFFLINE) {
      const mock = { id: `evt_mock_${Date.now()}`, ...dto, slug };
      await eventPublisher.publishRealtime('event:created', mock, 'events');
      return mock;
    }

    const event = await prisma.event.create({
      data: {
        title: dto.title,
        slug,
        description: dto.description || '',
        date: new Date(dto.date),
        time: dto.time || '10:00 AM',
        location: dto.location || 'Main Auditorium',
        registrationRequired: dto.registrationRequired || false,
        registrationLimit: dto.registrationLimit || null,
        remainingSeats: dto.registrationLimit || null,
        category: 'Service',
      },
    });

    await eventPublisher.publishRealtime('event:created', event, 'events');
    return event;
  }
}

export const eventsService = new EventsService();
