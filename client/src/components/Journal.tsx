import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../api/client';

export default function Journal() {
  const [content, setContent] = useState('');

  const { data: promptData, isLoading: isPromptLoading } = useQuery({
    queryKey: ['journalPrompt'],
    queryFn: () => api<{ success: boolean; data: { prompt: string } }>('/api/journal/prompt'),
  });

  const submitMutation = useMutation({
    mutationFn: async (text: string) =>
      api<{ success: boolean; feedback: any }>('/api/journal/submit', {
        method: 'POST',
        body: { content: text, prompt: promptData?.data?.prompt },
      }),
  });

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto animate-[slide-up_0.4s_ease-out]">
      <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-foreground">Daily Journal</h1>
      <p className="text-muted-foreground text-sm sm:text-base mb-6 sm:mb-8">Practice writing without worrying about mistakes.</p>

      <div className="border border-border/50 rounded-2xl p-4 sm:p-6 bg-card flex flex-col gap-4 shadow-sm">
        {isPromptLoading ? (
          <div className="h-7 bg-muted rounded-lg w-2/3 animate-pulse mb-2" />
        ) : (
          <h2 className="text-lg sm:text-xl font-semibold text-emerald-400 mb-2 border-l-4 border-emerald-500 pl-4 leading-relaxed">{promptData?.data?.prompt}</h2>
        )}

        <textarea className="w-full h-40 sm:h-48 bg-input border border-border/50 rounded-2xl p-4 text-foreground text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all resize-none"
          placeholder="Start writing here..." value={content} onChange={e => setContent(e.target.value)} />

        <button onClick={() => submitMutation.mutate(content)}
          disabled={!content.trim() || submitMutation.isPending || submitMutation.isSuccess}
          className="self-stretch sm:self-end px-6 py-3 sm:py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-medium rounded-xl disabled:opacity-50 hover:from-emerald-400 hover:to-emerald-500 transition-all shadow-lg shadow-emerald-500/20">
          {submitMutation.isPending ? 'Submitting...' : submitMutation.isSuccess ? 'Submitted ✓' : 'Submit to Emma'}
        </button>

        {submitMutation.isSuccess && submitMutation.data?.feedback && (
          <div className="mt-4 flex flex-col gap-6">
            <div className="p-5 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
              <h3 className="font-bold text-emerald-400 mb-2 flex items-center gap-2">📝 General Feedback</h3>
              <p className="text-foreground leading-relaxed">{submitMutation.data.feedback.generalFeedback}</p>
            </div>

            {submitMutation.data.feedback.corrections?.length > 0 && (
              <div className="p-5 bg-card border border-border/50 rounded-2xl">
                <h3 className="font-bold text-foreground mb-4">🔍 Corrections ({submitMutation.data.feedback.corrections.length})</h3>
                <div className="flex flex-col gap-4">
                  {submitMutation.data.feedback.corrections.map((c: any, i: number) => (
                    <div key={i} className="flex flex-col gap-2 p-4 bg-muted/50 rounded-xl border border-border/30">
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-start">
                        <div className="flex-1 bg-red-500/10 text-red-400 p-2.5 rounded-xl line-through text-sm w-full sm:w-auto">{c.original}</div>
                        <div className="hidden sm:flex items-center text-muted-foreground px-1">→</div>
                        <div className="flex-1 bg-emerald-500/10 text-emerald-400 p-2.5 rounded-xl text-sm w-full sm:w-auto">{c.corrected}</div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed"><span className="font-medium text-foreground">Why:</span> {c.explanation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {submitMutation.data.feedback.nativeRewrite && (
              <div className="p-5 bg-amber-500/5 border border-amber-500/20 rounded-2xl">
                <h3 className="font-bold text-amber-400 mb-2 flex items-center gap-2">✨ Native Masterpiece</h3>
                <p className="text-foreground italic leading-relaxed">"{submitMutation.data.feedback.nativeRewrite}"</p>
              </div>
            )}

            {submitMutation.data.feedback.newVocabulary?.length > 0 && (
              <div className="p-5 bg-card border border-border/50 rounded-2xl">
                <h3 className="font-bold text-foreground mb-3">📚 New Vocabulary Added</h3>
                <div className="flex flex-wrap gap-2">
                  {submitMutation.data.feedback.newVocabulary.map((v: any, i: number) => (
                    <span key={i} className="px-3 py-1.5 bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 text-emerald-400 text-sm rounded-xl font-medium border border-emerald-500/20">{v.word}</span>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-3">These words have been added to your Vocabulary Review page.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
