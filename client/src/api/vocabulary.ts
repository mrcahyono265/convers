import { api } from './client';
import type { VocabularyWord, PracticeEvaluation } from '../types/vocabulary';

export function getVocabulary() {
  return api<{ success: boolean; data: VocabularyWord[] }>('/api/vocabulary');
}

export function practiceWord(id: string, sentence: string) {
  return api<{ success: boolean; data: { evaluation: PracticeEvaluation } }>(`/api/vocabulary/${id}/practice`, {
    method: 'POST',
    body: { sentence },
  });
}

export function reciteWord(id: string) {
  return api<{ success: boolean }>(`/api/vocabulary/${id}/recite`, { method: 'POST' });
}
