/**
 * src/api/responses/apiResponse.ts
 * Standard HTTP response envelopes for the KCM Church Backend.
 */

import { Response } from 'express';
import { ApiResponse, PaginatedResult } from '../../types/common.types';
import { HTTP_STATUS } from '../../shared/constants';

export function sendSuccess<T>(
  res: Response,
  data?: T,
  message = 'Operation successful',
  statusCode: number = HTTP_STATUS.OK,
  meta?: Record<string, any>
): Response {
  const envelope: ApiResponse<T> = {
    success: true,
    message,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      requestId: (res.req as any)?.id || (res.req as any)?.correlationId,
      ...meta,
    },
  };
  return res.status(statusCode).json(envelope);
}

export function sendPaginated<T>(
  res: Response,
  paginated: PaginatedResult<T>,
  message = 'Data retrieved successfully'
): Response {
  const envelope: ApiResponse<T[]> = {
    success: true,
    message,
    data: paginated.items,
    meta: {
      page: paginated.page,
      limit: paginated.limit,
      total: paginated.total,
      totalPages: paginated.totalPages,
      timestamp: new Date().toISOString(),
      requestId: (res.req as any)?.id,
    },
  };
  return res.status(HTTP_STATUS.OK).json(envelope);
}

export function sendError(
  res: Response,
  message: string,
  statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
  code = 'INTERNAL_ERROR',
  details?: any
): Response {
  const envelope: ApiResponse = {
    success: false,
    error: {
      code,
      message,
      details,
    },
    meta: {
      timestamp: new Date().toISOString(),
      requestId: (res.req as any)?.id,
    },
  };
  return res.status(statusCode).json(envelope);
}
