import { useState, useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Play, Pause, Flag } from 'lucide-react';
import { getToken, api } from '../api/client';
import type { ChatResponse } from '../types/chat';

const INITIAL_GREETINGS = [
  "Hey! How's your day going? I just had the best coffee, what are you up to? ☕",
  "Hi there! I was just thinking about movies. Have you seen anything good lately? 🎬",
  "Hey! Hope you're having a good day. Got any fun plans for today? ✨",
  "Omg hi! I'm Emma. I was just reading a really cool article, what are you doing right now? 📖",
  "Hii! How are you doing? I just woke up from a nap haha, feeling so refreshed! 🥱",
];

type MessageMetrics = { reactionTime: number; wordCount: number; wpm: number; confidence?: number };

export default function ChatInterface() {
  const [messages, setMessages] = useState<{ role: string; content: string; metrics?: MessageMetrics }[]>(() => [
    { role: 'assistant', content: INITIAL_GREETINGS[Math.floor(Math.random() * INITIAL_GREETINGS.length)] },
  ]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [modelId, setModelId] = useState('meta/llama-3.1-8b-instruct');
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const timeRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const secondsRef = useRef(seconds);
  const [confidenceScores, setConfidenceScores] = useState<number[]>([]);
  const confidenceRef = useRef<number[]>([]);
  const [wpmScores, setWpmScores] = useState<number[]>([]);
  const wpmRef = useRef<number[]>([]);
  const lastAIMessageTimeRef = useRef<number>(Date.now());
  const pendingMessageStatsRef = useRef<{ reactionTime: number; wordCount: number } | null>(null);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  useEffect(() => { secondsRef.current = seconds; }, [seconds]);
  useEffect(() => { confidenceRef.current = confidenceScores; }, [confidenceScores]);
  useEffect(() => { wpmRef.current = wpmScores; }, [wpmScores]);

  useEffect(() => {
    if (isActive) {
      timeRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
    } else if (timeRef.current) {
      clearInterval(timeRef.current);
    }
    return () => { if (timeRef.current) clearInterval(timeRef.current); };
  }, [isActive]);

  useEffect(() => {
    return () => {
      const finalSeconds = secondsRef.current;
      const scores = confidenceRef.current;
      const wScores = wpmRef.current;
      const avgConfidence = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
      const avgWpm = wScores.length > 0 ? Math.round(wScores.reduce((a, b) => a + b, 0) / wScores.length) : 0;
      if (finalSeconds > 0 || avgConfidence > 0 || avgWpm > 0) {
        fetch('/api/dashboard/progress/minutes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
          body: JSON.stringify({ minutes: finalSeconds / 60, averageConfidence: avgConfidence, wpm: avgWpm }),
          keepalive: true,
        }).catch(console.error);
      }
    };
  }, []);

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const chatMutation = useMutation({
    mutationFn: async (message: string) =>
      api<ChatResponse>('/api/chat/message', {
        method: 'POST',
        body: { sessionId, content: message, history: messages.map(m => ({ role: m.role, content: m.content })), modelId },
      }),
    onSuccess: (data) => {
      let msgConfidence: number | undefined;
      if (pendingMessageStatsRef.current && data.metadata) {
        const { wordCount } = pendingMessageStatsRef.current;
        const grammarCount = data.metadata.grammarMistakes?.length || 0;
        const contextScore = data.metadata.contextScore || 50;

        let effortScore = 0;
        if (wordCount > 12) effortScore = 100;
        else if (wordCount > 8) effortScore = 80;
        else if (wordCount > 5) effortScore = 50;
        else if (wordCount > 3) effortScore = 25;

        let grammarPenalty = 100;
        if (grammarCount > 0) grammarPenalty = Math.max(0, 100 - grammarCount * 25);

        msgConfidence = Math.round(contextScore * 0.6 + effortScore * 0.25 + grammarPenalty * 0.15);
        if (wordCount <= 3) msgConfidence = Math.min(msgConfidence, 40);
        setConfidenceScores(prev => [...prev, msgConfidence!]);
      }

      setMessages(prev => {
        const arr = [...prev];
        if (msgConfidence !== undefined) {
          for (let i = arr.length - 1; i >= 0; i--) {
            if (arr[i].role === 'user' && arr[i].metrics && arr[i].metrics!.confidence === undefined) {
              arr[i].metrics!.confidence = msgConfidence;
              break;
            }
          }
        }
        return [...arr, { role: 'assistant', content: data.response }];
      });

      if (!sessionId && data.sessionId) setSessionId(data.sessionId);
      lastAIMessageTimeRef.current = Date.now();
      pendingMessageStatsRef.current = null;
    },
    onError: () => {
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting right now." }]);
      lastAIMessageTimeRef.current = Date.now();
    },
  });

  const handleSend = () => {
    if (!input.trim() || chatMutation.isPending) return;
    if (!isActive) setIsActive(true);
    const userMsg = input.trim();
    const reactionTime = Math.max(0.1, (Date.now() - lastAIMessageTimeRef.current) / 1000);
    const wordCount = userMsg.split(/\s+/).filter(Boolean).length;
    const wpm = Math.round((wordCount / Math.max(1, reactionTime)) * 60);
    setWpmScores(prev => [...prev, wpm]);
    pendingMessageStatsRef.current = { reactionTime, wordCount };
    setMessages(prev => [...prev, { role: 'user', content: userMsg, metrics: { reactionTime: parseFloat(reactionTime.toFixed(1)), wordCount, wpm } }]);
    setInput('');
    chatMutation.mutate(userMsg);
  };

  const avgConf = confidenceScores.length > 0 ? Math.round(confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length) : 0;

  return (
    <div className="p-4 flex flex-col h-full w-full max-w-4xl mx-auto overflow-hidden">
      <div className="flex justify-between items-center bg-card border border-border/50 p-3 rounded-2xl mb-4 shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <span className={`w-2.5 h-2.5 rounded-full ${isActive ? 'bg-emerald-400 shadow-lg shadow-emerald-500/30 animate-pulse' : 'bg-amber-400'}`} />
          <span className="font-mono text-lg font-bold tracking-wider text-foreground">{formatTime(seconds)}</span>
          {confidenceScores.length > 0 && (
            <span className="ml-2 text-xs font-semibold px-2.5 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">{avgConf}% conf</span>
          )}
        </div>
        <div className="flex items-center gap-1.5 sm:gap-3">
          <select value={modelId} onChange={e => setModelId(e.target.value)}
            className="bg-input border border-border/50 text-foreground text-xs sm:text-sm rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 max-w-[90px] sm:max-w-none appearance-none cursor-pointer">
            <option value="meta/llama-3.1-8b-instruct">Fast</option>
            <option value="meta/llama-3.1-70b-instruct">Smart</option>
            <option value="nvidia/nemotron-4-340b-instruct">Nemotron</option>
          </select>
          <button onClick={() => setIsActive(!isActive)}
            className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground transition text-sm font-medium">
            {isActive ? <><Pause size={16} /><span className="hidden sm:inline">Pause</span></> : <><Play size={16} /><span className="hidden sm:inline">Resume</span></>}
          </button>
          <button onClick={() => { setIsActive(false); setShowSummaryModal(true); }}
            className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-gradient-to-r hover:from-emerald-500 hover:to-emerald-600 hover:text-white transition-all text-sm font-medium border border-emerald-500/20">
            <Flag size={16} /><span className="hidden sm:inline">Finish</span>
          </button>
        </div>
      </div>

      <div className="flex-1 relative mb-4 border border-border rounded-xl bg-card overflow-hidden flex flex-col">
        {!isActive && !showSummaryModal && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="bg-card p-6 border border-border rounded-xl shadow-lg text-center">
              <Pause size={32} className="text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Conversation Paused</h3>
              <p className="text-muted-foreground text-sm mb-4">Take your time. Resume when you're ready.</p>
              <button onClick={() => setIsActive(true)} className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition">Resume Chat</button>
            </div>
          </div>
        )}

        {showSummaryModal && (
          <div className="absolute inset-0 bg-background/70 backdrop-blur-md flex items-center justify-center z-20 animate-[slide-up_0.3s_ease-out]">
            <div className="bg-card p-8 border border-border/50 rounded-3xl shadow-2xl text-center max-w-sm w-full mx-4 shadow-emerald-500/5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20"><span className="text-3xl">🎉</span></div>
              <h3 className="text-2xl font-bold mb-2 text-foreground">Session Finished!</h3>
              <p className="text-muted-foreground text-sm mb-6">Great job practicing today. Here's your summary:</p>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between p-3 bg-muted/50 rounded-xl"><span className="text-muted-foreground">⏱️ Total Time</span><span className="font-mono font-bold">{formatTime(seconds)}</span></div>
                <div className="flex justify-between p-3 bg-muted/50 rounded-xl"><span className="text-muted-foreground">💬 Messages Sent</span><span className="font-bold">{messages.filter(m => m.role === 'user').length}</span></div>
                <div className="flex justify-between p-3 bg-muted/50 rounded-xl"><span className="text-muted-foreground">🎯 Avg Confidence</span><span className="font-bold text-emerald-400">{avgConf}%</span></div>
              </div>
              <button onClick={() => window.location.href = '/'}
                className="w-full px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-2xl font-medium hover:from-emerald-400 hover:to-emerald-500 transition-all shadow-lg shadow-emerald-500/20">Back to Dashboard</button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto flex flex-col gap-4 p-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex flex-col max-w-[80%] animate-[slide-up_0.3s_ease-out] ${m.role === 'user' ? 'self-end items-end' : 'self-start items-start'}`}>
              <div className={`p-4 rounded-2xl ${m.role === 'user' ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-tr-sm shadow-lg shadow-emerald-500/20' : 'bg-card border border-border/50 text-foreground rounded-tl-sm shadow-sm'}`}>{m.content}</div>
              {m.role === 'user' && m.metrics && (
                <div className="mt-1.5 flex items-center gap-2 text-[10px] text-muted-foreground bg-card/80 px-3 py-1 rounded-full border border-border/40 backdrop-blur-sm">
                  <span>⌨️ {m.metrics.wpm} WPM</span><span className="text-border">|</span>
                  <span>📝 {m.metrics.wordCount} w</span><span className="text-border">|</span>
                  <span className={m.metrics.confidence ? (m.metrics.confidence >= 80 ? 'text-emerald-400' : m.metrics.confidence >= 50 ? 'text-amber-400' : 'text-red-400') : 'animate-pulse'}>
                    🎯 {m.metrics.confidence !== undefined ? `${m.metrics.confidence}%` : '...'}
                  </span>
                </div>
              )}
            </div>
          ))}
          {chatMutation.isPending && (
            <div className="flex items-center gap-1.5 p-4 rounded-2xl max-w-[80%] bg-card border border-border/50 text-muted-foreground self-start rounded-tl-sm shadow-sm">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="flex gap-3">
        <input type="text"
          className="flex-1 bg-input border border-border/50 rounded-2xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all disabled:opacity-50"
          placeholder={isActive ? "Say something to Emma..." : "Chat paused..."}
          value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()} disabled={!isActive} />
        <button onClick={handleSend} disabled={chatMutation.isPending || !isActive}
          className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-medium rounded-2xl disabled:opacity-50 hover:from-emerald-400 hover:to-emerald-500 transition-all shadow-lg shadow-emerald-500/20">Send</button>
      </div>
    </div>
  );
}
