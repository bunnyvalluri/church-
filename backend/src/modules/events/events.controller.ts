/**
 * src/modules/events/events.controller.ts
 * Controller for church event management and RSVP actions.
 */

import { Request, Response, NextFunction } from 'express';
import { eventsService } from './events.service';
import { sendSuccess, sendPaginated } from '../../api/responses/apiResponse';

export class EventsController {
  public async listEvents(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await eventsService.listEvents(req.query);
      sendPaginated(res, result, 'Events retrieved.');
    } catch (err) {
      next(err);
    }
  }

  public async createEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const event = await eventsService.createEvent(req.body, req.user?.id || 'sys');
      sendSuccess(res, event, 'Event scheduled successfully.', 201);
    } catch (err) {
      next(err);
    }
  }
}

export const eventsController = new EventsController();

