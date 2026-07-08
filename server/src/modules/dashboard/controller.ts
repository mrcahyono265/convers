import type { Context } from 'hono';
import { getMetrics, saveProgress } from './service';
import { ok, handleError } from '../../utils/response';

export async function handleMetrics(c: Context) {
  try {
    const userId = c.get('userId');
    const metrics = await getMetrics(userId);
    return ok(c, { data: metrics });
  } catch (err) {
    return handleError(c, err);
  }
}

export async function handleSaveProgress(c: Context) {
  try {
    const userId = c.get('userId');
    const body = await c.req.json();
    const minutes = Math.floor(body.minutes || 0);
    const confidence = body.averageConfidence || 0;
    const wpm = body.wpm || 0;

    await saveProgress(userId, minutes, confidence, wpm);
    return ok(c);
  } catch (err) {
    return handleError(c, err);
  }
}
