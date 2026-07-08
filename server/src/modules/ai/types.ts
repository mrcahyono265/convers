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
  response: string;
  metadata: ChatMetadata;
}

export interface PracticeEvaluation {
  isCorrect: boolean;
  feedback: string;
  improvedSentence: string;
}

export interface Correction {
  original: string;
  corrected: string;
  explanation: string;
}

export interface JournalFeedback {
  generalFeedback: string;
  corrections: Correction[];
  nativeRewrite: string;
  newVocabulary: NewVocabulary[];
}
