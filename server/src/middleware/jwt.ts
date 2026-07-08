import type { Context, Next } from 'hono';
import { jwt } from 'hono/jwt';
import { env } from '../config/env';

const verifyMiddleware = jwt({
  secret: env.JWT_SECRET!,
  alg: 'HS256',
});

export async function jwtMiddleware(c: Context, next: Next) {
  if (c.req.path.startsWith('/api/auth')) {
    return next();
  }
  return verifyMiddleware(c, async () => {
    const payload = c.get('jwtPayload') as { sub: string; isGuest: boolean } | undefined;
    if (payload?.sub) {
      c.set('userId', payload.sub);
    }
    await next();
  });
}
