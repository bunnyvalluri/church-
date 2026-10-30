/**
 * src/modules/ngo/ngo.controller.ts
 * Controller for NGO initiatives and community service metrics.
 */

import { Request, Response } from 'express';
import { ngoService } from './ngo.service';
import { sendSuccess } from '../../api/responses/apiResponse';

export class NgoController {
  public listProjects(req: Request, res: Response): void {
    const projects = ngoService.getProjects();
    sendSuccess(res, projects, 'NGO projects retrieved.');
  }

  public getStats(req: Request, res: Response): void {
    const stats = ngoService.getStats();
    sendSuccess(res, stats, 'NGO community impact stats retrieved.');
  }
}

export const ngoController = new NgoController();

