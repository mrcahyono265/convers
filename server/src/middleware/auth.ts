import { Context } from 'hono';
import type { Next } from 'hono';
import { db } from '../database';
import { users } from '../database/schema';
import { eq } from 'drizzle-orm';

export const authMiddleware = async (c: Context, next: Next) => {
    const userId = c.req.header('X-User-ID');
    
    if (!userId) {
        return c.json({ success: false, error: 'Unauthorized: X-User-ID header is required' }, 401);
    }

    try {
        // Check if user exists
        const existingUser = await db.select().from(users).where(eq(users.id, userId)).limit(1);
        
        if (existingUser.length === 0) {
            // Auto-create anonymous user for development/MVP
            await db.insert(users).values({
                id: userId,
                name: 'Anonymous Learner',
                email: `${userId}@anonymous.local`
            });
        }
        
        c.set('userId', userId);
        await next();
    } catch (e: any) {
        console.error("Auth Middleware Error:", e);
        return c.json({ success: false, error: 'Authentication failed' }, 500);
    }
};
