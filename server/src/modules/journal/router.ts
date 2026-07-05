import { Hono } from 'hono';
import { db } from '../../database';
import { journals, vocabularies } from '../../database/schema';
import { evaluateJournalEntry } from '../ai/service';

type Variables = { userId: string };
const router = new Hono<{ Variables: Variables }>();

const JOURNAL_PROMPTS = [
    "What is a memorable experience you had recently, and why did it stand out?",
    "If you could instantly become an expert in one subject, what would it be and why?",
    "Describe a challenge you faced this week and how you overcame it.",
    "What is your favorite way to relax after a stressful day?",
    "If you had to move to another country tomorrow, where would you go and what would you do there?",
    "Write about a person who has had a major influence on your life.",
    "What is a goal you are currently working towards, and what steps are you taking to achieve it?",
    "Describe your perfect weekend.",
    "What is a piece of advice you would give to your younger self?",
    "Write about a movie, book, or song that deeply moved you recently."
];

router.get('/prompt', async (c) => {
    // Pick a random prompt
    const prompt = JOURNAL_PROMPTS[Math.floor(Math.random() * JOURNAL_PROMPTS.length)];
    return c.json({
        success: true,
        data: { prompt }
    });
});

router.post('/submit', async (c) => {
    try {
        const userId = c.get('userId');
        const body = await c.req.json();
        
        if (!body.content || !body.prompt) {
            return c.json({ success: false, error: "Content and prompt are required" }, 400);
        }

        // Send 'body.content' to AI for strict evaluation
        const aiEvaluation = await evaluateJournalEntry(body.content, body.prompt);
        
        // Save new vocabularies to DB if any
        if (aiEvaluation.newVocabulary && Array.isArray(aiEvaluation.newVocabulary)) {
            for (const vocab of aiEvaluation.newVocabulary) {
                if (vocab.word && vocab.meaning && vocab.example) {
                    await db.insert(vocabularies).values({
                        userId,
                        word: vocab.word,
                        meaning: vocab.meaning,
                        example: vocab.example,
                        source: "journal",
                        practiceAttempts: 0
                    });
                }
            }
        }

        // Save Journal to Database
        await db.insert(journals).values({
            userId: userId,
            prompt: body.prompt,
            content: body.content,
            aiFeedback: aiEvaluation
        });
        
        return c.json({
            success: true,
            feedback: aiEvaluation
        });
    } catch (e: any) {
        console.error("Journal Submit Error:", e);
        return c.json({ success: false, error: e.message }, 500);
    }
});

export default router;
