import type { Context } from 'hono';
import { countMasteredWords, countJournals, getProgress, getTodayProgress, updateProgress, insertProgress } from './repository';

export interface Metrics {
  dayStreak: number;
  averageMinutesSpoken: number;
  averageWpm: number;
  averageConfidence: number;
}

export async function getMetrics(userId: string): Promise<Metrics> {
  const progressRes = await getProgress(userId);

  let streak = 0;
  if (progressRes.length > 0) {
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
          checkDate.setDate(checkDate.getDate() - 1);
        }
      } else if (diffDays === 1 && streak > 0) {
        if (p.conversationMinutes! > 0 || p.journalWritten) {
          streak += 1;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      } else if (diffDays === 1 && streak === 0) {
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

  return {
    dayStreak: streak,
    averageMinutesSpoken: Math.round(recentMinutes / 7),
    averageWpm: wpmDays > 0 ? Math.round(totalWpm / wpmDays) : 0,
    averageConfidence: confidenceDays > 0 ? Math.round(totalConfidence / confidenceDays) : 0,
  };
}

export async function saveProgress(userId: string, minutes: number, confidence: number, wpm: number) {
  if (minutes <= 0 && confidence <= 0 && wpm <= 0) return;

  const today = new Date();
  const allProgress = await getTodayProgress(userId, today.toISOString().split('T')[0]!);
  const todayStr = today.toISOString().split('T')[0];

  const existing = allProgress.find(p => {
    const pDate = new Date(p.date);
    return pDate.toISOString().split('T')[0] === todayStr;
  });

  if (existing) {
    let newConf = existing.averageConfidence || 0;
    if (confidence > 0) {
      newConf = newConf > 0 ? Math.round((newConf + confidence) / 2) : confidence;
    }
    let newWpm = existing.averageWpm || 0;
    if (wpm > 0) {
      newWpm = newWpm > 0 ? Math.round((newWpm + wpm) / 2) : wpm;
    }
    await updateProgress(existing.id, minutes, newConf, newWpm, existing.conversationMinutes || 0);
  } else {
    await insertProgress(userId, today, minutes, confidence, wpm);
  }
}
