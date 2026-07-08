export interface NewVocabulary {
  word: string;
  meaning: string;
  example: string;
}

export interface ChatMetadata {
  confidenceScore: number;
  conversationTopic: string;
  grammarMistakes: string[];
  contextScore: number;
  newVocabulary: NewVocabulary[];
  memoryCandidate: string | null;
}

export interface ChatResponse {
  success: boolean;
  sessionId: string;
  response: string;
  metadata: ChatMetadata;
}

export interface MessageMetrics {
  reactionTime: number;
  wordCount: number;
  wpm: number;
  confidence?: number;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  metrics?: MessageMetrics;
}
