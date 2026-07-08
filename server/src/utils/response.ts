import type { Context } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import { HTTPException } from 'hono/http-exception';
import { AppError } from './errors';

export function ok(c: Context, payload?: Record<string, unknown>, status: ContentfulStatusCode = 200) {
  return c.json({ success: true, ...payload }, status);
}

export function fail(c: Context, error: AppError) {
  return c.json({
    success: false,
    error: { code: error.code, message: error.message }
  }, error.statusCode as ContentfulStatusCode);
}

export function handleError(c: Context, err: unknown) {
  if (err instanceof AppError) {
    return fail(c, err);
  }

  if (err instanceof HTTPException) {
    return c.json({
      success: false,
      error: { code: 'HTTP_ERROR', message: err.message }
    }, err.status);
  }

  console.error('[Unhandled Error]', err);
  return c.json({
    success: false,
    error: { code: 'INTERNAL_ERROR', message: 'Internal Server Error' }
  }, 500);
}
