import type { JwtVariables } from 'hono/jwt';

export type Variables = {
  userId: string;
} & JwtVariables;
