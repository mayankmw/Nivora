import {
  Catch,
  HttpException,
  HttpStatus,
  Logger,
  type ArgumentsHost,
  type ExceptionFilter,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AppException } from '../errors/app.exception.js';
import { ErrorCode } from '../errors/error-codes.js';
import type { ApiErrorBody, ApiErrorResponse } from '../http/api-response.js';

const UNEXPECTED_ERROR_MESSAGE = 'An unexpected error occurred. Please try again.';

interface ResolvedError {
  status: number;
  body: ApiErrorBody;
}

/**
 * Turns every error into the standard error response. Unexpected errors are
 * logged with their stack and reported without internal details.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();
    const { status, body } = resolveError(exception);

    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.path} failed [${request.requestId}]: ${describe(exception)}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    const payload: ApiErrorResponse = { error: body, requestId: request.requestId };
    response.status(status).json(payload);
  }
}

export function resolveError(exception: unknown): ResolvedError {
  if (exception instanceof AppException) {
    return {
      status: exception.getStatus(),
      body: {
        code: exception.code,
        message: exception.message,
        ...(exception.details ? { details: exception.details } : {}),
      },
    };
  }

  if (exception instanceof HttpException) {
    const status = exception.getStatus();
    return {
      status,
      body: { code: codeForStatus(status), message: messageOf(exception) },
    };
  }

  return {
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    body: { code: ErrorCode.InternalServerError, message: UNEXPECTED_ERROR_MESSAGE },
  };
}

/** 404 -> "NOT_FOUND", 409 -> "CONFLICT", and so on. */
function codeForStatus(status: number): string {
  return HttpStatus[status] ?? `HTTP_${status}`;
}

function messageOf(exception: HttpException): string {
  const response = exception.getResponse();
  if (typeof response === 'string') return response;

  const { message } = response as { message?: unknown };
  if (Array.isArray(message)) return message.join('; ');
  if (typeof message === 'string') return message;
  return exception.message;
}

function describe(exception: unknown): string {
  return exception instanceof Error ? exception.message : String(exception);
}
