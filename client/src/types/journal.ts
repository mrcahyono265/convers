export interface Correction {
  original: string;
  corrected: string;
  explanation: string;
}

export interface NewVocabulary {
  word: string;
  meaning: string;
  example: string;
}

export interface JournalFeedback {
  generalFeedback: string;
  corrections: Correction[];
  nativeRewrite: string;
  newVocabulary: NewVocabulary[];
}

export interface JournalSubmitResponse {
  success: boolean;
  feedback: JournalFeedback;
  confidence: number;
}
