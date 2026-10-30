/**
 * src/modules/attendance/attendance.controller.ts
 * Controller for member attendance check-in.
 */

import { Request, Response, NextFunction } from 'express';
import { attendanceService } from './attendance.service';
import { sendSuccess } from '../../api/responses/apiResponse';

export class AttendanceController {
  public async checkIn(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { eventId } = req.body;
      const userId = req.user?.id || req.body.userId;
      const record = await attendanceService.checkIn(eventId, userId);
      sendSuccess(res, record, 'Attendance checked in successfully.');
    } catch (err) {
      next(err);
    }
  }

  public async getAttendance(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const records = await attendanceService.getEventAttendance(req.params.eventId as string);
      sendSuccess(res, records, 'Event attendance list retrieved.');
    } catch (err) {
      next(err);
    }
  }
}

export const attendanceController = new AttendanceController();
