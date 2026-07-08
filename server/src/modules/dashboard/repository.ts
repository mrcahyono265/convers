import { db } from '../../database';
import { vocabularies, journals, dailyProgress } from '../../database/schema';
import { eq, sql, desc } from 'drizzle-orm';

export function countMasteredWords(userId: string) {
  return db.select({ count: sql<number>`count(*)` })
    .from(vocabularies)
    .where(sql`${vocabularies.userId} = ${userId} AND ${vocabularies.status} = 'mastered'`);
}

export function countJournals(userId: string) {
  return db.select({ count: sql<number>`count(*)` })
    .from(journals)
    .where(eq(journals.userId, userId));
}

export function getProgress(userId: string) {
  return db.select()
    .from(dailyProgress)
    .where(eq(dailyProgress.userId, userId))
    .orderBy(desc(dailyProgress.date));
}

export function getTodayProgress(userId: string, todayStr: string) {
  return db.select().from(dailyProgress).where(eq(dailyProgress.userId, userId));
}

export async function updateProgress(id: string, minutes: number, confidence: number, wpm: number, existingMinutes: number) {
  await db.update(dailyProgress)
    .set({
      conversationMinutes: existingMinutes + minutes,
      averageConfidence: confidence,
      averageWpm: wpm,
    })
    .where(eq(dailyProgress.id, id));
}

export async function insertProgress(userId: string, date: Date, minutes: number, confidence: number, wpm: number) {
  await db.insert(dailyProgress).values({
    userId,
    date,
    conversationMinutes: minutes,
    averageConfidence: confidence,
    averageWpm: wpm,
  });
}
