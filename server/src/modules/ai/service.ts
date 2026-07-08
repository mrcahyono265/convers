import { getProvider } from './providers/registry';

const provider = getProvider('nvidia');

export async function generateChatResponse(userMessage: string, history: { role: string; content: string }[], modelId?: string) {
  return provider.chat([...history, { role: 'user', content: userMessage }], { modelId });
}

export async function evaluateVocabularyPractice(word: string, sentence: string) {
  return provider.evaluatePractice(word, sentence);
}

export async function evaluateJournalEntry(content: string, prompt: string) {
  return provider.evaluateJournal(content, prompt);
}
