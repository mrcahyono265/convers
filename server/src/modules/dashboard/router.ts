import { Hono } from 'hono';
import { z } from 'zod';
import type { Variables } from '../../types';
import { getMetrics, saveProgress } from './service';
import { ok, handleError } from '../../utils/response';
import { ValidationError } from '../../utils/errors';
import { saveProgressSchema } from './schemas';

const router = new Hono<{ Variables: Variables }>();

function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const message = result.error.issues.map(i => i.message).join('; ');
    throw new ValidationError(message);
  }
  return result.data;
}

router.get('/metrics', async (c) => {
  try {
    const userId = c.get('userId');
    const metrics = await getMetrics(userId);
    return ok(c, { data: metrics });
  } catch (err) {
    return handleError(c, err);
  }
});

router.post('/progress/minutes', async (c) => {
  try {
    const userId = c.get('userId');
    const body = await c.req.json();
    const { minutes, averageConfidence, wpm } = validate(saveProgressSchema, body);
    await saveProgress(userId, minutes, averageConfidence, wpm);
    return ok(c);
  } catch (err) {
    return handleError(c, err);
  }
});

export default router;
