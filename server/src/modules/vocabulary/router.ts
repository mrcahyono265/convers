import { Hono } from 'hono';
import { z } from 'zod';
import type { Variables } from '../../types';
import { getVocabulary, practiceWord, reciteWord } from './service';
import { ok, handleError } from '../../utils/response';
import { ValidationError } from '../../utils/errors';
import { practiceSchema } from './schemas';

const router = new Hono<{ Variables: Variables }>();

function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const message = result.error.issues.map(i => i.message).join('; ');
    throw new ValidationError(message);
  }
  return result.data;
}

router.get('/', async (c) => {
  try {
    const userId = c.get('userId');
    const data = await getVocabulary(userId);
    return ok(c, { data });
  } catch (err) {
    return handleError(c, err);
  }
});

router.post('/:id/practice', async (c) => {
  try {
    const userId = c.get('userId');
    const id = c.req.param('id')!;
    const body = await c.req.json();
    const { sentence } = validate(practiceSchema, body);
    const evaluation = await practiceWord(userId, id, sentence);
    return ok(c, { evaluation });
  } catch (err) {
    return handleError(c, err);
  }
});

router.post('/:id/recite', async (c) => {
  try {
    const userId = c.get('userId');
    const id = c.req.param('id')!;
    await reciteWord(userId, id);
    return ok(c);
  } catch (err) {
    return handleError(c, err);
  }
});

export default router;
