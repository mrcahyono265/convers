import { Hono } from 'hono';
import { z } from 'zod';
import type { Variables } from '../../types';
import { processMessage } from './service';
import { ok, handleError } from '../../utils/response';
import { ValidationError } from '../../utils/errors';
import { messageSchema } from './schemas';

const router = new Hono<{ Variables: Variables }>();

function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const message = result.error.issues.map(i => i.message).join('; ');
    throw new ValidationError(message);
  }
  return result.data;
}

router.post('/message', async (c) => {
  try {
    const userId = c.get('userId');
    const body = await c.req.json();
    const { sessionId, content, history, modelId } = validate(messageSchema, body);
    const result = await processMessage(userId, content, sessionId, history, modelId);
    return ok(c, {
      sessionId: result.sessionId,
      response: result.response,
      metadata: result.metadata,
    });
  } catch (err) {
    return handleError(c, err);
  }
});

export default router;
