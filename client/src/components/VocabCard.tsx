import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { api } from '../api/client';
import type { PracticeEvaluation } from '../types/vocabulary';

interface Props {
  vocab: any;
}

export default function VocabCard({ vocab }: Props) {
  const [isPracticing, setIsPracticing] = useState(false);
  const [sentence, setSentence] = useState('');
  const [result, setResult] = useState<PracticeEvaluation | null>(null);
  const [isReciting, setIsReciting] = useState(false);

  const practiceMutation = useMutation({
    mutationFn: async (text: string) => api<{ success: boolean; evaluation: PracticeEvaluation }>(`/api/vocabulary/${vocab.id}/practice`, { method: 'POST', body: { sentence: text } }),
  });

  const reciteMutation = useMutation({
    mutationFn: () => api<{ success: boolean }>(`/api/vocabulary/${vocab.id}/recite`, { method: 'POST' }),
  });

  const handlePracticeSubmit = () => {
    practiceMutation.mutate(sentence, {
      onSuccess: (data) => {
        setResult(data.evaluation);
        vocab.practiceAttempts = (vocab.practiceAttempts || 0) + 1;
        vocab.reviewCount = (vocab.reviewCount || 0) + 1;
      },
    });
  };

  const handleRecite = () => {
    if (isReciting) return;
    reciteMutation.mutate(undefined, {
      onSuccess: () => {
        vocab.reviewCount = (vocab.reviewCount || 0) + 1;
        setIsReciting(true);
        setTimeout(() => setIsReciting(false), 2000);
      },
    });
  };

  const handleClear = () => { setSentence(''); setResult(null); setIsPracticing(false); };

  return (
    <div className="border border-border rounded-xl p-6 bg-card flex flex-col gap-3 transition-all">
      <div className="flex justify-between items-start">
        <h3 className="text-xl font-bold text-primary">{vocab.word}</h3>
        <span className={`text-xs px-2 py-1 rounded-full ${vocab.status === 'learning' ? 'bg-blue-900/30 text-blue-400' : vocab.status === 'review' ? 'bg-amber-900/30 text-amber-400' : 'bg-emerald-900/30 text-emerald-400'}`}>{vocab.status}</span>
      </div>
      <p className="text-foreground">{vocab.meaning}</p>
      <p className="text-muted-foreground text-sm italic">"{vocab.example}"</p>
      <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
        <span>Reviewed: {vocab.reviewCount || 0} times</span>
        <span>Practice Attempts: {vocab.practiceAttempts || 0}</span>
      </div>
      {!isPracticing ? (
        <div className="mt-2 flex gap-3">
          <button onClick={() => setIsPracticing(true)} className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary text-sm font-medium rounded-lg transition">Practice this word</button>
          <button onClick={handleRecite} disabled={reciteMutation.isPending || isReciting}
            className={`px-4 py-2 flex items-center gap-2 text-sm font-medium rounded-lg transition ${isReciting ? 'bg-emerald-500/20 text-emerald-500' : 'bg-muted text-muted-foreground hover:bg-accent'}`}>
            {isReciting ? '✅ Recited' : 'Recite (Murojaah)'}
          </button>
        </div>
      ) : (
        <div className="mt-4 pt-4 border-t border-border flex flex-col gap-3">
          <textarea className="w-full bg-input border border-border rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none"
            rows={3} placeholder="Write a sentence using this word..." value={sentence}
            onChange={e => setSentence(e.target.value)} disabled={practiceMutation.isPending || !!result} />
          {!result && (
            <div className="flex gap-2 self-end">
              <button onClick={handleClear} className="px-4 py-1.5 rounded-lg text-sm bg-muted text-muted-foreground hover:text-foreground transition">Cancel</button>
              <button onClick={handlePracticeSubmit} disabled={!sentence.trim() || practiceMutation.isPending}
                className="px-4 py-1.5 rounded-lg text-sm bg-primary text-primary-foreground font-medium disabled:opacity-50 transition">
                {practiceMutation.isPending ? 'Checking...' : 'Submit'}
              </button>
            </div>
          )}
          {result && (
            <div className={`p-4 rounded-lg border text-sm flex flex-col gap-2 ${result.isCorrect ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100' : 'border-amber-500/30 bg-amber-500/10 text-amber-100'}`}>
              <div className="font-bold flex items-center gap-2">{result.isCorrect ? '✅ Correct' : '⚠️ Needs work'}</div>
              <p>{result.feedback}</p>
              {result.improvedSentence && (
                <div className={`mt-2 pt-2 border-t ${result.isCorrect ? 'border-emerald-500/20 text-emerald-200' : 'border-amber-500/20 text-amber-200'} italic`}>
                  <span className="font-medium not-italic">Better:</span> "{result.improvedSentence}"
                </div>
              )}
              <button onClick={handleClear} className="mt-2 self-end px-3 py-1 bg-black/20 hover:bg-black/40 rounded transition">Clear</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
