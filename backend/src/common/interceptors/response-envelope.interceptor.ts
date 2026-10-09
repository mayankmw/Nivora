import {
  Injectable,
  StreamableFile,
  type CallHandler,
  type ExecutionContext,
  type NestInterceptor,
} from '@nestjs/common';
import { map, type Observable } from 'rxjs';
import { PaginatedResult, type ApiSuccessResponse } from '../http/api-response.js';

/** Wraps whatever a controller returns in the standard success envelope. */
@Injectable()
export class ResponseEnvelopeInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(map((result: unknown) => toEnvelope(result)));
  }
}

export function toEnvelope(result: unknown): unknown {
  // No body (204) and file downloads are sent as they are.
  if (result === undefined || result instanceof StreamableFile) {
    return result;
  }

  if (result instanceof PaginatedResult) {
    return { data: result.items, meta: result.meta } satisfies ApiSuccessResponse<unknown[]>;
  }

  return { data: result } satisfies ApiSuccessResponse<unknown>;
}
