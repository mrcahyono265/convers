import { evaluateVocabularyPractice } from '../ai/service';
import { findAllByUser, findById, updatePractice, updateRecite } from './repository';
import { NotFoundError } from '../../utils/errors';

export function getVocabulary(userId: string) {
  return findAllByUser(userId);
}

export async function practiceWord(userId: string, id: string, sentence: string) {
  const [vocab] = await findById(id);
  if (!vocab || vocab.userId !== userId) {
    throw new NotFoundError('Vocabulary not found');
  }

  const evaluation = await evaluateVocabularyPractice(vocab.word, sentence);
  await updatePractice(id, vocab.practiceAttempts || 0, vocab.reviewCount || 0);

  return evaluation;
}

export async function reciteWord(userId: string, id: string) {
  const [vocab] = await findById(id);
  if (!vocab || vocab.userId !== userId) {
    throw new NotFoundError('Vocabulary not found');
  }

  await updateRecite(id, vocab.reviewCount || 0);
}
