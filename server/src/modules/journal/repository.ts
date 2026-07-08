import { db } from '../../database';
import { journals, vocabularies } from '../../database/schema';
import { sql } from 'drizzle-orm';

export async function insertJournal(userId: string, prompt: string, content: string, aiFeedback: unknown) {
  await db.insert(journals).values({ userId, prompt, content, aiFeedback });
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
  await db.insert(vocabularies).values({ userId, word, meaning, example, status: 'learning' });
}
