import { db } from '../../database';
import { conversationSessions, messages } from '../../database/schema';
import { eq, desc } from 'drizzle-orm';

export async function createSession(userId: string) {
  const [session] = await db.insert(conversationSessions).values({
    userId,
    topic: 'General Conversation',
  }).returning({ id: conversationSessions.id });
  return session!;
}

export async function saveMessage(sessionId: string, role: string, content: string, grammarMistakes?: unknown) {
  await db.insert(messages).values({
    sessionId,
    role,
    content,
    grammarMistakes: grammarMistakes || null,
  });
}
