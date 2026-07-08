import { Hono } from 'hono';
import { z } from 'zod';
import type { Variables } from '../../types';
import { getRandomPrompt, submitJournal } from './service';
import { ok, handleError } from '../../utils/response';
import { ValidationError } from '../../utils/errors';
import { submitSchema } from './schemas';

const router = new Hono<{ Variables: Variables }>();

function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const message = result.error.issues.map(i => i.message).join('; ');
    throw new ValidationError(message);
  }
  return result.data;
}

router.get('/prompt', (c) => {
  const prompt = getRandomPrompt();
  return ok(c, { data: { prompt } });
});

router.post('/submit', async (c) => {
  try {
    const userId = c.get('userId');
    const body = await c.req.json();
    const { content, prompt } = validate(submitSchema, body);
    const result = await submitJournal(userId, content, prompt);
    return ok(c, result);
  } catch (err) {
    return handleError(c, err);
  }
});

export default router;
