import { db } from '../../database';
import { journals } from '../../database/schema';

export async function insertJournal(userId: string, prompt: string, content: string, aiFeedback: unknown) {
  await db.insert(journals).values({ userId, prompt, content, aiFeedback });
}
