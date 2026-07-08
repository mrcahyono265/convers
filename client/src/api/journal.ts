import { api } from './client';

export function getPrompt() {
  return api<{ success: boolean; data: { prompt: string } }>('/api/journal/prompt');
}

export function submitJournal(content: string, prompt: string) {
  return api<{ success: boolean; data: { feedback: any } }>('/api/journal/submit', {
    method: 'POST',
    body: { content, prompt },
  });
}
