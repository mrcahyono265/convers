export interface VocabularyWord {
  id: string;
  userId: string;
  word: string;
  meaning: string | null;
  example: string | null;
  status: 'learning' | 'review' | 'mastered';
  reviewCount: number;
  practiceAttempts: number;
  lastReviewedAt: string | null;
  createdAt: string | null;
}

export interface PracticeEvaluation {
  isCorrect: boolean;
  feedback: string;
  improvedSentence: string;
}
