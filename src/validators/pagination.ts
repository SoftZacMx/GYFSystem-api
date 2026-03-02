import { z } from 'zod';

export const PAGINATION_DEFAULTS = {
  page: 1,
  limit: 20,
  maxLimit: 100,
} as const;

export const orderSchema = z.enum(['asc', 'desc']);

/**
 * Builds a Zod schema for pagination and sort query params.
 * sortBy is validated against the whitelist to avoid injection.
 *
 * @param allowedSortByFields - Non-empty list of field names allowed for sortBy (e.g. ['fullName', 'curp', 'createdAt'])
 */
export function createPaginationQuerySchema<T extends string>(allowedSortByFields: readonly [T, ...T[]]) {
  return z.object({
    page: z.coerce
      .number()
      .int()
      .min(1, 'page must be at least 1')
      .default(PAGINATION_DEFAULTS.page),
    limit: z.coerce
      .number()
      .int()
      .min(1, 'limit must be at least 1')
      .max(PAGINATION_DEFAULTS.maxLimit, `limit must be at most ${PAGINATION_DEFAULTS.maxLimit}`)
      .default(PAGINATION_DEFAULTS.limit),
    sortBy: z.enum(allowedSortByFields as [T, ...T[]]).optional(),
    order: orderSchema.default('asc'),
  });
}

export type PaginationQueryInput = {
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
};
