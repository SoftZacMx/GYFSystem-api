export interface SuccessMeta {
  timestamp: string;
}

export interface ListMeta extends SuccessMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ErrorPayload {
  message: string;
  code: string;
  details?: unknown;
}

export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'UNPROCESSABLE_ENTITY'
  | 'INTERNAL_ERROR'
  | 'SERVICE_UNAVAILABLE';
