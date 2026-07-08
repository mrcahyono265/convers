import { api } from './client';
import type { JournalSubmitResponse } from '../types/journal';

export function getPrompt() {
  return api<{ success: boolean; data: { prompt: string } }>('/api/journal/prompt');
}

export function submitJournal(content: string, prompt: string) {
  return api<JournalSubmitResponse>('/api/journal/submit', {
    method: 'POST',
    body: { content, prompt },
  });
}
