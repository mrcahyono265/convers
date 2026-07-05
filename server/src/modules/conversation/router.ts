import { Hono } from 'hono';
import { generateChatResponse } from '../ai/service';
import { db } from '../../database';
import { conversationSessions, messages, vocabularies } from '../../database/schema';
import { desc, eq, sql } from 'drizzle-orm';

type Variables = { userId: string };
const router = new Hono<{ Variables: Variables }>();

router.post('/message', async (c) => {
    try {
        const userId = c.get('userId' as never) as string;
        const body = await c.req.json();
        const { sessionId, content, history = [], modelId } = body;
        
        if (!content) {
            return c.json({ success: false, error: "Content is required" }, 400);
        }

        // Handle Session
        let currentSessionId = sessionId;
        if (!currentSessionId) {
            // Create a new session if none is provided
            const newSession = await db.insert(conversationSessions).values({
                userId: userId,
                topic: "General Conversation"
            }).returning({ id: conversationSessions.id });
            currentSessionId = newSession[0]?.id;
        }

        if (!currentSessionId) {
            return c.json({ success: false, error: "Failed to create session" }, 500);
        }

        // Save User Message
        await db.insert(messages).values({
            sessionId: currentSessionId,
            role: 'user',
            content: content
        });

        // Call the AI Service
        const aiResponse = await generateChatResponse(content, history, modelId);
        
        // Save AI Message
        await db.insert(messages).values({
            sessionId: currentSessionId,
            role: 'assistant',
            content: aiResponse.response,
            grammarMistakes: aiResponse.metadata.grammarMistakes || null
        });

        // Save New Vocabularies (Auto-save without duplicates)
        if (aiResponse.metadata.newVocabulary && Array.isArray(aiResponse.metadata.newVocabulary)) {
            for (const item of aiResponse.metadata.newVocabulary) {
                if (typeof item === 'object' && item.word && typeof item.word === 'string' && item.word.trim() !== '') {
                    const wordStr = item.word.trim();
                    
                    // Check for existing word
                    const existing = await db.select()
                        .from(vocabularies)
                        .where(
                            sql`${vocabularies.userId} = ${userId} AND lower(${vocabularies.word}) = lower(${wordStr})`
                        )
                        .limit(1);

                    if (existing.length === 0) {
                        await db.insert(vocabularies).values({
                            userId: userId,
                            word: wordStr,
                            meaning: item.meaning || "No meaning provided",
                            example: item.example || "No example provided",
                            status: 'learning'
                        });
                    }
                }
            }
        }
        
        return c.json({
            success: true,
            sessionId: currentSessionId,
            response: aiResponse.response,
            metadata: aiResponse.metadata
        });
    } catch (e: any) {
        console.error("Chat Error:", e);
        return c.json({ success: false, error: e.message }, 500);
    }
});

export default router;
