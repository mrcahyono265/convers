import { api } from './client';
import type { ChatResponse } from '../types/chat';

export function sendMessage(sessionId: string | null, content: string, history: { role: string; content: string }[], modelId: string) {
  return api<ChatResponse>('/api/chat/message', {
    method: 'POST',
    body: { sessionId, content, history, modelId },
  });
}
