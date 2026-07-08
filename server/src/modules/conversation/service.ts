import type { NewVocabulary } from '../ai/types';
import { generateChatResponse } from '../ai/service';
import { createSession, saveMessage, findVocabularyByWord, insertVocabulary } from './repository';

export async function processMessage(userId: string, content: string, sessionId: string | null, history: { role: string; content: string }[], modelId: string | undefined) {
  let currentSessionId = sessionId;

  if (!currentSessionId) {
    const session = await createSession(userId);
    currentSessionId = session.id;
  }

  await saveMessage(currentSessionId, 'user', content);

  const aiResponse = await generateChatResponse(content, history, modelId);

  await saveMessage(currentSessionId, 'assistant', aiResponse.response, aiResponse.metadata.grammarMistakes || null);

  if (aiResponse.metadata.newVocabulary && Array.isArray(aiResponse.metadata.newVocabulary)) {
    for (const item of aiResponse.metadata.newVocabulary) {
      if (typeof item === 'object' && item.word && typeof item.word === 'string' && item.word.trim() !== '') {
        const wordStr = item.word.trim();
        const existing = await findVocabularyByWord(userId, wordStr);
        if (!existing) {
          await insertVocabulary(userId, wordStr, item.meaning, item.example);
        }
      }
    }
  }

  return {
    sessionId: currentSessionId,
    response: aiResponse.response,
    metadata: aiResponse.metadata,
  };
}
