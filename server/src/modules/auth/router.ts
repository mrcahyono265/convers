import { Hono } from 'hono';
import { z } from 'zod';
import { createGuestUser, registerUser, loginUser } from './service';
import { ok, handleError } from '../../utils/response';
import { ValidationError } from '../../utils/errors';
import { guestSchema, registerSchema, loginSchema } from './schemas';

const router = new Hono();

function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const message = result.error.issues.map(i => i.message).join('; ');
    throw new ValidationError(message);
  }
  return result.data;
}

router.post('/guest', async (c) => {
  try {
    const { id, token } = await createGuestUser();
    return ok(c, { data: { token, user: { id, name: 'Guest', isGuest: true } } }, 201);
  } catch (err) {
    return handleError(c, err);
  }
});

router.post('/register', async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, name } = validate(registerSchema, body);
    const { id, token } = await registerUser(email, password, name);
    return ok(c, { data: { token, user: { id, name, email, isGuest: false } } }, 201);
  } catch (err) {
    return handleError(c, err);
  }
});

router.post('/login', async (c) => {
  try {
    const body = await c.req.json();
    const { email, password } = validate(loginSchema, body);
    const { id, token, name } = await loginUser(email, password);
    return ok(c, { data: { token, user: { id, name, email, isGuest: false } } });
  } catch (err) {
    return handleError(c, err);
  }
});

export default router;
