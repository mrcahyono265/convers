import { sign, verify } from 'hono/jwt';
import { env } from '../../config/env';

export interface JwtPayload {
  sub: string;
  isGuest: boolean;
  exp: number;
}

export function createToken(userId: string, isGuest: boolean): Promise<string> {
  return sign(
    {
      sub: userId,
      isGuest,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30,
    },
    env.JWT_SECRET!,
    'HS256'
  );
}

export async function verifyToken(token: string): Promise<JwtPayload> {
  return verify(token, env.JWT_SECRET!, 'HS256') as unknown as Promise<JwtPayload>;
}
