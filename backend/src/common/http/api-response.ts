/**
 * The response contract of the API.
 *
 * Success: { "data": ..., "meta": { ... } }   (meta only on paginated lists)
 * Failure: { "error": { "code", "message", "details" }, "requestId" }
 */

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
}

export interface ApiSuccessResponse<T> {
  data: T;
  meta?: PaginationMeta;
}

export interface ApiErrorDetail {
  /** Dot path of the offending field, for example "guardian.phone". */
  field: string;
  messages: string[];
}

export interface ApiErrorBody {
  /** Stable, machine-readable code such as VALIDATION_FAILED or NOT_FOUND. */
  code: string;
  /** Human-readable summary, safe to show to users. */
  message: string;
  details?: ApiErrorDetail[];
}

export interface ApiErrorResponse {
  error: ApiErrorBody;
  /** Also sent as the x-request-id header; quote it when reporting a problem. */
  requestId: string;
}

/**
 * Return this from a controller to produce a paginated response. The envelope
 * interceptor turns it into { data: items, meta }.
 */
export class PaginatedResult<T> {
  constructor(
    public readonly items: T[],
    public readonly meta: PaginationMeta,
  ) {}
}
