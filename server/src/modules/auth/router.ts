import { Hono } from 'hono';
import { createGuestUser, registerUser, loginUser } from './service';
import { ok, handleError } from '../../utils/response';
import { ValidationError } from '../../utils/errors';

const router = new Hono();

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
    const { email, password, name } = body;

    if (!email || !password || !name) {
      throw new ValidationError('Email, password, and name are required');
    }

    if (typeof email !== 'string' || !email.includes('@')) {
      throw new ValidationError('Invalid email format');
    }

    if (typeof password !== 'string' || password.length < 6) {
      throw new ValidationError('Password must be at least 6 characters');
    }

    if (typeof name !== 'string' || name.trim().length === 0) {
      throw new ValidationError('Name is required');
    }

    const { id, token } = await registerUser(email, password, name.trim());
    return ok(c, { data: { token, user: { id, name: name.trim(), email, isGuest: false } } }, 201);
  } catch (err) {
    return handleError(c, err);
  }
});

router.post('/login', async (c) => {
  try {
    const body = await c.req.json();
    const { email, password } = body;

    if (!email || !password) {
      throw new ValidationError('Email and password are required');
    }

    const { id, token, name } = await loginUser(email, password);
    return ok(c, { data: { token, user: { id, name, email, isGuest: false } } });
  } catch (err) {
    return handleError(c, err);
  }
});

export default router;
