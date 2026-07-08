import { evaluateJournalEntry } from '../ai/service';
import { insertJournal, findVocabularyByWord, insertVocabulary } from './repository';

export const JOURNAL_PROMPTS = [
  'What is a memorable experience you had recently, and why did it stand out?',
  'If you could instantly become an expert in one subject, what would it be and why?',
  'Describe a challenge you faced this week and how you overcame it.',
  'What is your favorite way to relax after a stressful day?',
  'If you had to move to another country tomorrow, where would you go and what would you do there?',
  'Write about a person who has had a major influence on your life.',
  'What is a goal you are currently working towards, and what steps are you taking to achieve it?',
  'Describe your perfect weekend.',
  'What is a piece of advice you would give to your younger self?',
  'Write about a movie, book, or song that deeply moved you recently.',
];

export function getRandomPrompt(): string {
  return JOURNAL_PROMPTS[Math.floor(Math.random() * JOURNAL_PROMPTS.length)]!;
}

export async function submitJournal(userId: string, content: string, prompt: string) {
  const aiEvaluation = await evaluateJournalEntry(content, prompt);

  if (aiEvaluation.newVocabulary && Array.isArray(aiEvaluation.newVocabulary)) {
    for (const vocab of aiEvaluation.newVocabulary) {
      if (vocab.word && vocab.meaning && vocab.example) {
        const wordStr = String(vocab.word).trim();
        const existing = await findVocabularyByWord(userId, wordStr);
        if (!existing) {
          await insertVocabulary(userId, wordStr, vocab.meaning, vocab.example);
        }
      }
    }
  }

  await insertJournal(userId, prompt, content, aiEvaluation);

  return aiEvaluation;
}
