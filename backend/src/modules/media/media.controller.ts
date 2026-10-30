/**
 * src/modules/media/media.controller.ts
 * Controller for signed media upload signatures and asset tracking.
 */

import { Request, Response, NextFunction } from 'express';
import { mediaService } from './media.service';
import { sendSuccess } from '../../api/responses/apiResponse';

export class MediaController {
  public signUpload(req: Request, res: Response, next: NextFunction): void {
    try {
      const { folder } = req.body;
      const signatureParams = mediaService.generateUploadSignature(folder);
      sendSuccess(res, signatureParams, 'Cloudinary signed upload parameters generated.');
    } catch (err) {
      next(err);
    }
  }

  public async registerMedia(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const record = await mediaService.registerMedia({
        ...req.body,
        uploaderId: req.user?.id,
      });
      sendSuccess(res, record, 'Media record saved successfully.', 201);
    } catch (err) {
      next(err);
    }
  }
}

export const mediaController = new MediaController();

