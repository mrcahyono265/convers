import { db } from '../../database';
import { vocabularies } from '../../database/schema';
import { eq, desc, sql } from 'drizzle-orm';

export function findAllByUser(userId: string) {
  return db.select()
    .from(vocabularies)
    .where(eq(vocabularies.userId, userId))
    .orderBy(desc(vocabularies.createdAt));
}

export function findById(id: string) {
  return db.select().from(vocabularies).where(eq(vocabularies.id, id)).limit(1);
}

export async function updatePractice(id: string, attempts: number, reviews: number) {
  await db.update(vocabularies)
    .set({
      practiceAttempts: attempts + 1,
      reviewCount: reviews + 1,
      lastReviewedAt: new Date(),
    })
    .where(eq(vocabularies.id, id));
}

export async function updateRecite(id: string, reviews: number) {
  await db.update(vocabularies)
    .set({
      reviewCount: reviews + 1,
      lastReviewedAt: new Date(),
    })
    .where(eq(vocabularies.id, id));
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
