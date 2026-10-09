/**
 * Error codes that are not simply the name of an HTTP status. Codes for plain
 * HTTP errors (NOT_FOUND, FORBIDDEN, ...) are derived from the status itself.
 * Domain codes such as BED_ALREADY_OCCUPIED are added here as modules need them.
 */
export const ErrorCode = {
  ValidationFailed: 'VALIDATION_FAILED',
  InternalServerError: 'INTERNAL_SERVER_ERROR',
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];
