import { Hono } from 'hono';
import { db } from '../../database';
import { vocabularies, journals, dailyProgress } from '../../database/schema';
import { eq, sql, desc } from 'drizzle-orm';

type Variables = { userId: string };
const router = new Hono<{ Variables: Variables }>();

router.get('/metrics', async (c) => {
    try {
        const userId = c.get('userId');

        // Words Mastered
        const wordsRes = await db.select({ count: sql<number>`count(*)` })
            .from(vocabularies)
            .where(sql`${vocabularies.userId} = ${userId} AND ${vocabularies.status} = 'mastered'`);
        const wordsMastered = Number(wordsRes[0]?.count) || 0;

        // Journals Written
        const journalsRes = await db.select({ count: sql<number>`count(*)` })
            .from(journals)
            .where(eq(journals.userId, userId));
        const journalsWritten = Number(journalsRes[0]?.count) || 0;

        // Total Minutes & Streak
        const progressRes = await db.select()
            .from(dailyProgress)
            .where(eq(dailyProgress.userId, userId))
            .orderBy(desc(dailyProgress.date));

        let totalMinutes = 0;
        let streak = 0;
        
        if (progressRes.length > 0) {
            totalMinutes = progressRes.reduce((acc, curr) => acc + (curr.conversationMinutes || 0), 0);
            
            // Calculate simple streak
            let currentDate = new Date();
            currentDate.setHours(0, 0, 0, 0);
            let checkDate = new Date(currentDate);

            for (const p of progressRes) {
                const pDate = new Date(p.date);
                pDate.setHours(0, 0, 0, 0);
                
                const diffTime = checkDate.getTime() - pDate.getTime();
                const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays === 0) {
                    if (p.conversationMinutes! > 0 || p.journalWritten) {
                        streak = 1;
                        checkDate.setDate(checkDate.getDate() - 1); // Expect yesterday next
                    }
                } else if (diffDays === 1 && streak > 0) {
                    if (p.conversationMinutes! > 0 || p.journalWritten) {
                        streak += 1;
                        checkDate.setDate(checkDate.getDate() - 1);
                    } else {
                        break;
                    }
                } else if (diffDays === 1 && streak === 0) {
                    // Missed today, but did yesterday
                    if (p.conversationMinutes! > 0 || p.journalWritten) {
                        streak = 1;
                        checkDate.setDate(checkDate.getDate() - 1);
                    } else {
                        break;
                    }
                } else {
                    break;
                }
            }
        }

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setHours(0, 0, 0, 0);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        let totalConfidence = 0;
        let confidenceDays = 0;
        let totalWpm = 0;
        let wpmDays = 0;
        let recentMinutes = 0;

        for (const p of progressRes) {
            const pDate = new Date(p.date);
            if (pDate >= sevenDaysAgo) {
                if (p.averageConfidence && p.averageConfidence > 0) {
                    totalConfidence += p.averageConfidence;
                    confidenceDays++;
                }
                if (p.averageWpm && p.averageWpm > 0) {
                    totalWpm += p.averageWpm;
                    wpmDays++;
                }
                recentMinutes += (p.conversationMinutes || 0);
            }
        }
        
        const averageConfidence = confidenceDays > 0 ? Math.round(totalConfidence / confidenceDays) : 0;
        const averageWpm = wpmDays > 0 ? Math.round(totalWpm / wpmDays) : 0;
        const averageMinutesSpoken = Math.round(recentMinutes / 7);

        return c.json({
            success: true,
            data: {
                dayStreak: streak,
                averageMinutesSpoken,
                averageWpm,
                averageConfidence
            }
        });
    } catch (e: any) {
        console.error("Dashboard Metrics Error:", e);
        return c.json({ success: false, error: e.message }, 500);
    }
});

    router.post('/progress/minutes', async (c) => {
    try {
        const userId = c.get('userId' as never) as string;
        const body = await c.req.json();
        const minutes = Math.floor(body.minutes || 0);
        const incomingConfidence = body.averageConfidence || 0;
        const incomingWpm = body.wpm || 0;

        if (minutes <= 0 && incomingConfidence <= 0 && incomingWpm <= 0) {
            return c.json({ success: true, message: 'Ignored zero metrics' });
        }

        const today = new Date();
        const allProgress = await db.select().from(dailyProgress).where(eq(dailyProgress.userId, userId));
        
        const todayStr = today.toISOString().split('T')[0];
        const existing = allProgress.find(p => {
            const pDate = new Date(p.date);
            return pDate.toISOString().split('T')[0] === todayStr;
        });

        if (existing) {
            // Average the confidence if already exists and new one is > 0
            let newConf = existing.averageConfidence || 0;
            if (incomingConfidence > 0) {
                newConf = newConf > 0 ? Math.round((newConf + incomingConfidence) / 2) : incomingConfidence;
            }
            
            // Average WPM
            let newWpm = existing.averageWpm || 0;
            if (incomingWpm > 0) {
                newWpm = newWpm > 0 ? Math.round((newWpm + incomingWpm) / 2) : incomingWpm;
            }

            await db.update(dailyProgress)
                .set({ 
                    conversationMinutes: (existing.conversationMinutes || 0) + minutes,
                    averageConfidence: newConf,
                    averageWpm: newWpm
                })
                .where(eq(dailyProgress.id, existing.id));
        } else {
            await db.insert(dailyProgress).values({
                userId: userId,
                date: today,
                conversationMinutes: minutes,
                averageConfidence: incomingConfidence,
                averageWpm: incomingWpm
            });
        }

        return c.json({ success: true });
    } catch (e: any) {
        console.error("Progress Error:", e);
        return c.json({ success: false, error: e.message }, 500);
    }
});

export default router;
