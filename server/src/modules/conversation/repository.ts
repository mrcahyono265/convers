import { db } from '../../database';
import { conversationSessions, messages, vocabularies } from '../../database/schema';
import { eq, desc, sql } from 'drizzle-orm';

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

export async function findVocabularyByWord(userId: string, word: string) {
  const [existing] = await db.select()
    .from(vocabularies)
    .where(
      sql`${vocabularies.userId} = ${userId} AND lower(${vocabularies.word}) = lower(${word})`
    )
    .limit(1);
  return existing;
}

export async function insertVocabulary(userId: string, word: string, meaning: string, example: string) {
  await db.insert(vocabularies).values({
    userId,
    word,
    meaning: meaning || 'No meaning provided',
    example: example || 'No example provided',
    status: 'learning',
  });
}
