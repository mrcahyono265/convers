import type { ChatResponse, PracticeEvaluation, JournalFeedback } from '../types';

export interface ChatOptions {
  modelId?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AiProvider {
  name: string;
  chat(messages: { role: string; content: string }[], options?: ChatOptions): Promise<ChatResponse>;
  evaluatePractice(word: string, sentence: string): Promise<PracticeEvaluation>;
  evaluateJournal(content: string, prompt: string): Promise<JournalFeedback>;
}
