import type { Context } from 'hono';
import { getVocabulary, practiceWord, reciteWord } from './service';
import { ok, handleError } from '../../utils/response';
import { ValidationError } from '../../utils/errors';

export async function handleList(c: Context) {
  try {
    const userId = c.get('userId');
    const data = await getVocabulary(userId);
    return ok(c, { data });
  } catch (err) {
    return handleError(c, err);
  }
}

export async function handlePractice(c: Context) {
  try {
    const userId = c.get('userId');
    const id = c.req.param('id')!;
    const { sentence } = await c.req.json();

    if (!sentence) {
      throw new ValidationError('Sentence is required');
    }

    const evaluation = await practiceWord(userId, id, sentence);
    return ok(c, { evaluation });
  } catch (err) {
    return handleError(c, err);
  }
}

export async function handleRecite(c: Context) {
  try {
    const userId = c.get('userId');
    const id = c.req.param('id')!;
    await reciteWord(userId, id);
    return ok(c);
  } catch (err) {
    return handleError(c, err);
  }
}
