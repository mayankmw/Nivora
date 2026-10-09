import { HttpStatus, ValidationPipe, type ValidationError } from '@nestjs/common';
import { AppException } from '../errors/app.exception.js';
import { ErrorCode } from '../errors/error-codes.js';
import type { ApiErrorDetail } from '../http/api-response.js';

/**
 * Global validation for every DTO:
 * - unknown properties are rejected, so clients cannot smuggle in fields such
 *   as organizationId;
 * - payloads are converted to DTO class instances with their declared types.
 */
export function createValidationPipe(): ValidationPipe {
  return new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    exceptionFactory: (errors) =>
      new AppException(
        ErrorCode.ValidationFailed,
        'Request validation failed',
        HttpStatus.BAD_REQUEST,
        toErrorDetails(errors),
      ),
  });
}

/** Flattens class-validator's nested error tree into one entry per field. */
export function toErrorDetails(errors: ValidationError[], parentPath = ''): ApiErrorDetail[] {
  return errors.flatMap((error) => {
    const field = parentPath ? `${parentPath}.${error.property}` : error.property;
    const own = error.constraints ? [{ field, messages: Object.values(error.constraints) }] : [];
    return [...own, ...toErrorDetails(error.children ?? [], field)];
  });
}
