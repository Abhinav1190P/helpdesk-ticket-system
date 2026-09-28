import type { Request, Response, NextFunction } from 'express';
import { z, ZodType } from 'zod';
import { ApiError } from '../utils/ApiError';

interface Schemas {
  body?: ZodType;
  query?: ZodType;
  params?: ZodType;
}

const formatIssues = (error: z.ZodError) =>
  error.issues.map((i) => ({ field: i.path.join('.'), message: i.message }));

/**
 * Validates and sanitizes request input with Zod.
 * - body   -> replaced with the parsed (typed, stripped) value
 * - query  -> parsed value stored on res.locals.query (req.query is read-only in Express 5)
 * - params -> validated only
 */
export const validate =
  (schemas: Schemas) => (req: Request, res: Response, next: NextFunction) => {
    for (const key of ['params', 'query', 'body'] as const) {
      const schema = schemas[key];
      if (!schema) continue;
      const result = schema.safeParse(req[key] ?? {});
      if (!result.success) throw ApiError.badRequest('Validation failed', formatIssues(result.error));
      if (key === 'body') req.body = result.data;
      if (key === 'query') res.locals.query = result.data;
    }
    next();
  };
