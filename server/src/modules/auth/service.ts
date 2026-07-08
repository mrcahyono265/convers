import { db } from '../../database';
import { users } from '../../database/schema';
import { eq } from 'drizzle-orm';
import { createToken } from './auth.utils';
import { ConflictError, UnauthorizedError, ValidationError } from '../../utils/errors';

export async function createGuestUser(): Promise<{ id: string; token: string }> {
  const [user] = await db.insert(users).values({
    name: 'Guest',
    email: `${crypto.randomUUID()}@guest.local`,
    isGuest: true,
  }).returning({ id: users.id });

  const token = await createToken(user!.id, true);
  return { id: user!.id, token };
}

export async function registerUser(email: string, password: string, name: string): Promise<{ id: string; token: string }> {
  const [existing] = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
  if (existing) {
    throw new ConflictError('Email already registered');
  }

  const passwordHash = await Bun.password.hash(password, {
    algorithm: 'bcrypt',
    cost: 10,
  });

  const [user] = await db.insert(users).values({
    name,
    email: email.toLowerCase(),
    passwordHash,
    isGuest: false,
  }).returning({ id: users.id });

  const token = await createToken(user!.id, false);
  return { id: user!.id, token };
}

export async function loginUser(email: string, password: string): Promise<{ id: string; token: string; name: string }> {
  const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
  if (!user) {
    throw new UnauthorizedError('Invalid email or password');
  }

  if (!user.passwordHash) {
    throw new ValidationError('This account uses guest login. Please register with email and password.');
  }

  const valid = await Bun.password.verify(password, user.passwordHash);
  if (!valid) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const token = await createToken(user.id, false);
  return { id: user.id, token, name: user.name };
}
