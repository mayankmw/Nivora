import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

export const REQUEST_ID_HEADER = 'x-request-id';

// Only accept caller-supplied IDs that are safe to write to logs and headers.
const SAFE_REQUEST_ID = /^[A-Za-z0-9._-]{1,128}$/;

declare global {
  namespace Express {
    interface Request {
      /** Unique ID of this request; set by requestIdMiddleware. */
      requestId: string;
    }
  }
}

/**
 * Gives every request an ID, reusing the caller's x-request-id when present,
 * and returns it in the response header so a failure can be traced in the logs.
 */
export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const incoming = req.header(REQUEST_ID_HEADER);
  const requestId = incoming && SAFE_REQUEST_ID.test(incoming) ? incoming : randomUUID();

  req.requestId = requestId;
  res.setHeader(REQUEST_ID_HEADER, requestId);
  next();
}
