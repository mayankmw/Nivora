import { HttpException, HttpStatus } from '@nestjs/common';
import type { ApiErrorDetail } from '../http/api-response.js';

/**
 * An error with a stable code that clients can branch on.
 *
 *   throw new AppException('BED_ALREADY_OCCUPIED', 'This bed is already occupied', HttpStatus.CONFLICT);
 */
export class AppException extends HttpException {
  constructor(
    public readonly code: string,
    message: string,
    status: HttpStatus,
    public readonly details?: ApiErrorDetail[],
  ) {
    super(message, status);
  }
}
