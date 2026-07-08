import type { Context } from 'hono';
import { getRandomPrompt, submitJournal } from './service';
import { saveProgress } from '../dashboard/service';
import { ok, handleError } from '../../utils/response';
import { ValidationError } from '../../utils/errors';

export function handlePrompt(c: Context) {
  const prompt = getRandomPrompt();
  return ok(c, { data: { prompt } });
}

export async function handleSubmit(c: Context) {
  try {
    const userId = c.get('userId');
    const body = await c.req.json();

    if (!body.content || !body.prompt) {
      throw new ValidationError('Content and prompt are required');
    }

    const feedback = await submitJournal(userId, body.content, body.prompt);

    const wordCount = body.content.split(/\s+/).filter(Boolean).length;
    const correctionCount = feedback.corrections?.length || 0;
    const journalConfidence = wordCount > 0 ? Math.max(0, Math.round(100 - (correctionCount / wordCount) * 200)) : 0;
    saveProgress(userId, 5, journalConfidence, 0).catch(console.error);

    return ok(c, { feedback, confidence: journalConfidence });
  } catch (err) {
    return handleError(c, err);
  }
}
