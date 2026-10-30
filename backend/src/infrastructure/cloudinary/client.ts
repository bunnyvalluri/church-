/**
 * src/infrastructure/cloudinary/client.ts
 * Cloudinary asset management and secure server-signed upload signature generator.
 */

import crypto from 'crypto';
import { servicesConfig } from '../../config/services';
import { BadRequestError } from '../../shared/errors';

export interface CloudinarySignedParams {
  timestamp: number;
  signature: string;
  apiKey: string;
  cloudName: string;
  folder: string;
}

export class CloudinaryClient {
  public static generateUploadSignature(folder = 'kcm-church/media'): CloudinarySignedParams {
    const { cloudName, apiKey, apiSecret } = servicesConfig.cloudinary;
    if (!apiKey || !apiSecret || !cloudName) {
      throw new BadRequestError('Cloudinary credentials are not configured on this server.');
    }

    const timestamp = Math.round(Date.now() / 1000);
    // Cloudinary signature params must be sorted alphabetically
    const paramsToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash('sha1').update(paramsToSign).digest('hex');

    return {
      timestamp,
      signature,
      apiKey,
      cloudName,
      folder,
    };
  }

  public static verifyWebhookSignature(body: string, timestamp: string, signature: string): boolean {
    const { apiSecret } = servicesConfig.cloudinary;
    if (!apiSecret) return false;
    const expected = crypto
      .createHash('sha1')
      .update(body + timestamp + apiSecret)
      .digest('hex');
    return expected === signature;
  }
}

