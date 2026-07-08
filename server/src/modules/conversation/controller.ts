import type { Context } from 'hono';
import { processMessage } from './service';
import { ok, handleError } from '../../utils/response';
import { ValidationError } from '../../utils/errors';

export async function handleMessage(c: Context) {
  try {
    const userId = c.get('userId');
    const body = await c.req.json();
    const { sessionId, content, history = [], modelId } = body;

    if (!content) {
      throw new ValidationError('Content is required');
    }

    const result = await processMessage(userId, content, sessionId, history, modelId);
    return ok(c, {
      sessionId: result.sessionId,
      response: result.response,
      metadata: result.metadata,
    });
  } catch (err) {
    return handleError(c, err);
  }
}
