import { Hono } from 'hono';
import { db } from '../../database';
import { vocabularies } from '../../database/schema';
import { eq, desc } from 'drizzle-orm';

type Variables = { userId: string };
const router = new Hono<{ Variables: Variables }>();

router.get('/', async (c) => {
    try {
        const userId = c.get('userId');
        
        const userVocabs = await db.select()
            .from(vocabularies)
            .where(eq(vocabularies.userId, userId))
            .orderBy(desc(vocabularies.createdAt));

        return c.json({
            success: true,
            data: userVocabs
        });
    } catch (e: any) {
        console.error("Vocabulary Fetch Error:", e);
        return c.json({ success: false, error: e.message }, 500);
    }
});

import { evaluateVocabularyPractice } from '../ai/service';

router.post('/:id/practice', async (c) => {
    try {
        const userId = c.get('userId' as never) as string;
        const id = c.req.param('id');
        const { sentence } = await c.req.json();

        if (!sentence) {
            return c.json({ success: false, error: "Sentence is required" }, 400);
        }

        // Get the vocabulary word
        const vocabRes = await db.select().from(vocabularies).where(eq(vocabularies.id, id));
        if (vocabRes.length === 0 || vocabRes[0].userId !== userId) {
            return c.json({ success: false, error: "Vocabulary not found" }, 404);
        }

        const vocab = vocabRes[0];

        // Evaluate using AI
        const evaluation = await evaluateVocabularyPractice(vocab.word, sentence);

        // Update counts
        await db.update(vocabularies)
            .set({
                practiceAttempts: (vocab.practiceAttempts || 0) + 1,
                reviewCount: (vocab.reviewCount || 0) + 1,
                lastReviewedAt: new Date()
            })
            .where(eq(vocabularies.id, id));

        return c.json({
            success: true,
            evaluation
        });
    } catch (e: any) {
        console.error("Vocabulary Practice Error:", e);
        return c.json({ success: false, error: e.message }, 500);
    }
});

router.post('/:id/recite', async (c) => {
    try {
        const userId = c.get('userId' as never) as string;
        const id = c.req.param('id');

        // Verify ownership
        const vocabRes = await db.select().from(vocabularies).where(eq(vocabularies.id, id));
        if (vocabRes.length === 0 || vocabRes[0].userId !== userId) {
            return c.json({ success: false, error: "Vocabulary not found" }, 404);
        }

        const vocab = vocabRes[0];

        // Increment review count
        await db.update(vocabularies)
            .set({
                reviewCount: (vocab.reviewCount || 0) + 1,
                lastReviewedAt: new Date()
            })
            .where(eq(vocabularies.id, id));

        return c.json({ success: true });
    } catch (e: any) {
        console.error("Vocabulary Recite Error:", e);
        return c.json({ success: false, error: e.message }, 500);
    }
});

export default router;
