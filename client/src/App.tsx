import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider, useMutation, useQuery } from '@tanstack/react-query';
import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Home, MessageSquare, BookOpen, PenTool, Flag } from 'lucide-react';

const queryClient = new QueryClient();

const Dashboard = () => {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['dashboardMetrics'],
    queryFn: async () => {
      const res = await fetch('http://localhost:3000/api/dashboard/metrics', {
        headers: { 'X-User-ID': localStorage.getItem('ec_user_id') || '' }
      });
      if (!res.ok) throw new Error('API Error');
      return res.json();
    }
  });

  const m = metrics?.data || { dayStreak: 0, minutesSpoken: 0, wordsMastered: 0, journalsWritten: 0 };

  return (
    <div className="p-8 space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Good Morning!</h1>
        <p className="text-muted-foreground text-lg">Ready for today's mission?</p>
      </div>

      {isLoading ? (
        <div className="h-24 bg-muted animate-pulse rounded-xl" />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card border border-border p-4 rounded-xl flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-bold text-primary">{m.dayStreak}</span>
            <span className="text-sm text-muted-foreground mt-1">Day Streak</span>
          </div>
          <div className="bg-card border border-border p-4 rounded-xl flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-bold text-primary">{m.minutesSpoken}</span>
            <span className="text-sm text-muted-foreground mt-1">Minutes Spoken</span>
          </div>
          <div className="bg-card border border-border p-4 rounded-xl flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-bold text-emerald-500">{m.wordsMastered}</span>
            <span className="text-sm text-muted-foreground mt-1">Words Mastered</span>
          </div>
          <div className="bg-card border border-border p-4 rounded-xl flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-bold text-amber-500">{m.averageConfidence || 0}%</span>
            <span className="text-sm text-muted-foreground mt-1">Avg Confidence</span>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="p-6 border border-border rounded-xl bg-card shadow-sm flex flex-col items-start gap-4 hover:border-primary/50 transition">
          <h2 className="text-xl font-semibold text-primary">Daily Conversation</h2>
          <p className="text-muted-foreground">Talk to Emma for 10 minutes to build your confidence and learn new words.</p>
          <Link to="/chat" className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition font-medium mt-auto w-full text-center">
            Start Conversation
          </Link>
        </div>
        <div className="p-6 border border-border rounded-xl bg-card shadow-sm flex flex-col items-start gap-4 hover:border-primary/50 transition">
          <h2 className="text-xl font-semibold">Vocabulary Review</h2>
          <p className="text-muted-foreground">You have 5 words waiting for review based on your previous conversations.</p>
          <Link to="/vocabulary" className="px-6 py-2 bg-muted text-foreground border border-border rounded-lg hover:bg-accent hover:text-accent-foreground transition font-medium mt-auto w-full text-center">
            Review Vocabulary
          </Link>
        </div>
      </div>
    </div>
  );
};

const INITIAL_GREETINGS = [
  "Hey! How's your day going? I just had the best coffee, what are you up to? ☕",
  "Hi there! I was just thinking about movies. Have you seen anything good lately? 🎬",
  "Hey! Hope you're having a good day. Got any fun plans for today? ✨",
  "Omg hi! I'm Emma. I was just reading a really cool article, what are you doing right now? 📖",
  "Hii! How are you doing? I just woke up from a nap haha, feeling so refreshed! 🥱"
];

type MessageMetrics = { 
  reactionTime: number; 
  wordCount: number; 
  wpm: number;
  confidence?: number;
};

const ChatInterface = () => {
  const [messages, setMessages] = useState<{role: string, content: string, metrics?: MessageMetrics}[]>(() => [
    { role: 'assistant', content: INITIAL_GREETINGS[Math.floor(Math.random() * INITIAL_GREETINGS.length)] }
  ]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [modelId, setModelId] = useState('meta/llama-3.1-8b-instruct');

  // Timer State
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const timeRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const secondsRef = useRef(seconds);

  // Confidence Tracking
  const [confidenceScores, setConfidenceScores] = useState<number[]>([]);
  const confidenceRef = useRef<number[]>([]);
  const lastAIMessageTimeRef = useRef<number>(Date.now());
  const pendingMessageStatsRef = useRef<{ reactionTime: number, wordCount: number } | null>(null);

  // Finish Session State
  const [showSummaryModal, setShowSummaryModal] = useState(false);

  // Auto Scroll
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    secondsRef.current = seconds;
  }, [seconds]);

  useEffect(() => {
    confidenceRef.current = confidenceScores;
  }, [confidenceScores]);

  useEffect(() => {
    if (isActive) {
      timeRef.current = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    } else if (timeRef.current) {
      clearInterval(timeRef.current);
    }
    return () => {
      if (timeRef.current) clearInterval(timeRef.current);
    };
  }, [isActive]);

  useEffect(() => {
    // Unmount effect to save minutes
    return () => {
      const finalSeconds = secondsRef.current;
      const scores = confidenceRef.current;
      const avgConfidence = scores.length > 0 ? Math.round(scores.reduce((a,b)=>a+b,0)/scores.length) : 0;

      if (finalSeconds > 0 || avgConfidence > 0) {
        fetch('http://localhost:3000/api/dashboard/progress/minutes', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'X-User-ID': localStorage.getItem('ec_user_id') || ''
          },
          body: JSON.stringify({ minutes: finalSeconds / 60, averageConfidence: avgConfidence }),
          keepalive: true
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
    mutationFn: async (message: string) => {
      const res = await fetch('http://localhost:3000/api/chat/message', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-User-ID': localStorage.getItem('ec_user_id') || ''
        },
        body: JSON.stringify({ sessionId, content: message, history: messages.map(m => ({ role: m.role, content: m.content })), modelId })
      });
      if (!res.ok) throw new Error('API Error');
      return res.json();
    },
    onSuccess: (data) => {
      let msgConfidence: number | undefined = undefined;

      // Calculate confidence
      if (pendingMessageStatsRef.current && data.metadata) {
        const { reactionTime, wordCount } = pendingMessageStatsRef.current;
        const grammarMistakesCount = data.metadata.grammarMistakes?.length || 0;
        const contextScore = data.metadata.contextScore || 50;

        const wpm = (wordCount / Math.max(1, reactionTime)) * 60;

        // Speed (WPM): > 40 (100%), > 30 (80%), > 20 (60%), < 20 (40%)
        let speedScore = 40;
        if (wpm > 40) speedScore = 100;
        else if (wpm > 30) speedScore = 80;
        else if (wpm > 20) speedScore = 60;

        // Length: > 12 words (100%), > 7 words (80%), > 3 words (50%), <= 3 words (20%)
        let lengthScore = 20;
        if (wordCount > 12) lengthScore = 100;
        else if (wordCount > 7) lengthScore = 80;
        else if (wordCount > 3) lengthScore = 50;

        // Grammar: 0 mistakes (100%), 1 (80%), 2 (50%), > 2 (20%)
        let grammarScore = 20;
        if (grammarMistakesCount === 0) grammarScore = 100;
        else if (grammarMistakesCount === 1) grammarScore = 80;
        else if (grammarMistakesCount === 2) grammarScore = 50;

        // Weights: Grammar (40%), Context (30%), WPM (15%), Length (15%)
        msgConfidence = Math.round((grammarScore * 0.40) + (contextScore * 0.30) + (speedScore * 0.15) + (lengthScore * 0.15));
        setConfidenceScores(prev => [...prev, msgConfidence!]);
      }

      setMessages(prev => {
        const newArr = [...prev];
        // Inject confidence into the last user message
        if (msgConfidence !== undefined) {
          for (let i = newArr.length - 1; i >= 0; i--) {
            if (newArr[i].role === 'user' && newArr[i].metrics && newArr[i].metrics!.confidence === undefined) {
              newArr[i].metrics!.confidence = msgConfidence;
              break;
            }
          }
        }
        return [...newArr, { role: 'assistant', content: data.response }];
      });

      if (!sessionId && data.sessionId) {
        setSessionId(data.sessionId);
      }

      // Reset timestamp for next message
      lastAIMessageTimeRef.current = Date.now();
      pendingMessageStatsRef.current = null;
    },
    onError: () => {
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting right now." }]);
      lastAIMessageTimeRef.current = Date.now();
    }
  });

  const handleSend = () => {
    if (!input.trim() || chatMutation.isPending) return;
    if (!isActive) setIsActive(true); // auto resume on send
    
    const userMsg = input.trim();
    
    // Capture metrics
    const reactionTime = Math.max(0.1, (Date.now() - lastAIMessageTimeRef.current) / 1000);
    const wordCount = userMsg.split(/\s+/).filter(Boolean).length;
    const wpm = Math.round((wordCount / Math.max(1, reactionTime)) * 60);
    pendingMessageStatsRef.current = { reactionTime, wordCount };

    setMessages(prev => [...prev, { role: 'user', content: userMsg, metrics: { reactionTime: parseFloat(reactionTime.toFixed(1)), wordCount, wpm } }]);
    setInput('');
    chatMutation.mutate(userMsg);
  };

  return (
    <div className="p-4 flex flex-col h-[calc(100vh-73px)] max-w-4xl mx-auto">
      <div className="flex justify-between items-center bg-card border border-border p-3 rounded-xl mb-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${isActive ? (seconds >= 3600 ? 'bg-emerald-500' : 'bg-emerald-500 animate-pulse') : 'bg-amber-500'}`} />
          <span className={`font-mono text-lg font-medium tracking-wider ${seconds >= 3600 ? 'text-emerald-500 font-bold' : ''}`}>
            {formatTime(seconds)}
          </span>
          {confidenceScores.length > 0 && (
            <span className="ml-4 text-xs font-medium px-2 py-1 bg-emerald-500/10 text-emerald-500 rounded-lg">
              Conf: {Math.round(confidenceScores.reduce((a,b)=>a+b,0)/confidenceScores.length)}%
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-1 sm:gap-3">
          <select 
            value={modelId} 
            onChange={(e) => setModelId(e.target.value)}
            className="bg-input border border-border text-foreground text-xs sm:text-sm rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary/50 max-w-[100px] sm:max-w-none"
          >
            <option value="meta/llama-3.1-8b-instruct">Llama 8B (Fast)</option>
            <option value="meta/llama-3.1-70b-instruct">Llama 70B (Smart)</option>
            <option value="nvidia/nemotron-4-340b-instruct">Nemotron</option>
          </select>

          <button
            onClick={() => setIsActive(!isActive)}
            className="flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-lg bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground transition text-sm font-medium"
          >
            {isActive ? (
              <><Pause size={16} /> <span className="hidden sm:inline">Pause</span></>
            ) : (
              <><Play size={16} /> <span className="hidden sm:inline">Resume</span></>
            )}
          </button>
          <button
            onClick={() => {
              setIsActive(false);
              setShowSummaryModal(true);
            }}
            className="flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition text-sm font-medium"
          >
            <Flag size={16} /> <span className="hidden sm:inline">Finish</span>
          </button>
        </div>
      </div>

      <div className="flex-1 relative mb-4 border border-border rounded-xl bg-card overflow-hidden flex flex-col">
        {!isActive && !showSummaryModal && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="bg-card p-6 border border-border rounded-xl shadow-lg text-center flex flex-col items-center gap-4">
              <Pause size={32} className="text-muted-foreground" />
              <h3 className="text-lg font-semibold">Conversation Paused</h3>
              <p className="text-muted-foreground text-sm">Take your time. Resume when you're ready.</p>
              <button 
                onClick={() => setIsActive(true)}
                className="mt-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition"
              >
                Resume Chat
              </button>
            </div>
          </div>
        )}

        {showSummaryModal && (
          <div className="absolute inset-0 bg-background/70 backdrop-blur-md flex items-center justify-center z-20">
            <div className="bg-card p-8 border border-border rounded-xl shadow-2xl text-center flex flex-col items-center gap-6 max-w-sm w-full mx-4">
              <div className="w-16 h-16 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center">
                <span className="text-3xl">🎉</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-2">Session Finished!</h3>
                <p className="text-muted-foreground text-sm">Great job practicing today. Here's your summary:</p>
              </div>
              
              <div className="w-full space-y-3">
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="text-muted-foreground">⏱️ Total Time</span>
                  <span className="font-mono font-medium">{formatTime(seconds)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="text-muted-foreground">💬 Messages Sent</span>
                  <span className="font-medium">{messages.filter(m => m.role === 'user').length}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="text-muted-foreground">🎯 Avg Confidence</span>
                  <span className="font-medium text-emerald-500">
                    {confidenceScores.length > 0 ? Math.round(confidenceScores.reduce((a,b)=>a+b,0)/confidenceScores.length) : 0}%
                  </span>
                </div>
              </div>

              <button 
                onClick={() => window.location.href = '/'}
                className="w-full mt-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        )}
        
        <div className="flex-1 overflow-y-auto flex flex-col gap-4 p-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex flex-col max-w-[80%] ${m.role === 'user' ? 'self-end items-end' : 'self-start items-start'}`}>
              <div className={`p-4 rounded-2xl ${m.role === 'user' ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-muted text-foreground rounded-tl-sm'}`}>
                {m.content}
              </div>
              {m.role === 'user' && m.metrics && (
                <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground bg-card/50 px-2 py-0.5 rounded-full border border-border/50">
                  <span title="Words Per Minute">⌨️ {m.metrics.wpm} WPM</span>
                  <span>|</span>
                  <span title="Word Count">📝 {m.metrics.wordCount} w</span>
                  <span>|</span>
                  <span title="Confidence Score" className={m.metrics.confidence ? (m.metrics.confidence >= 80 ? 'text-emerald-500 font-medium' : m.metrics.confidence >= 50 ? 'text-amber-500 font-medium' : 'text-red-400 font-medium') : 'animate-pulse'}>
                    🎯 {m.metrics.confidence !== undefined ? `${m.metrics.confidence}% Conf` : 'Calculating...'}
                  </span>
                </div>
              )}
            </div>
          ))}
          {chatMutation.isPending && (
            <div className="p-4 rounded-2xl max-w-[80%] bg-muted text-muted-foreground self-start rounded-tl-sm italic">
              Emma is typing...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="flex gap-3">
        <input 
          type="text" 
          className="flex-1 bg-input border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50" 
          placeholder={isActive ? "Say something to Emma..." : "Chat paused..."} 
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          disabled={!isActive}
        />
        <button 
          onClick={handleSend}
          disabled={chatMutation.isPending || !isActive}
          className="px-6 py-3 bg-primary text-primary-foreground font-medium rounded-xl disabled:opacity-50 hover:opacity-90 transition"
        >
          Send
        </button>
      </div>
    </div>
  );
};

const VocabCard = ({ vocab }: { vocab: any }) => {
  const [isPracticing, setIsPracticing] = useState(false);
  const [sentence, setSentence] = useState('');
  const [result, setResult] = useState<any>(null);
  const [isReciting, setIsReciting] = useState(false);

  const practiceMutation = useMutation({
    mutationFn: async (text: string) => {
      const res = await fetch(`http://localhost:3000/api/vocabulary/${vocab.id}/practice`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-User-ID': localStorage.getItem('ec_user_id') || ''
        },
        body: JSON.stringify({ sentence: text })
      });
      if (!res.ok) throw new Error('API Error');
      return res.json();
    }
  });

  const reciteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`http://localhost:3000/api/vocabulary/${vocab.id}/recite`, {
        method: 'POST',
        headers: { 'X-User-ID': localStorage.getItem('ec_user_id') || '' }
      });
      if (!res.ok) throw new Error('API Error');
      return res.json();
    }
  });

  const handlePracticeSubmit = () => {
    practiceMutation.mutate(sentence, {
      onSuccess: (data) => {
        setResult(data.evaluation);
        vocab.practiceAttempts = (vocab.practiceAttempts || 0) + 1;
        vocab.reviewCount = (vocab.reviewCount || 0) + 1;
      }
    });
  };

  const handleRecite = () => {
    if (isReciting) return;
    reciteMutation.mutate(undefined, {
      onSuccess: () => {
        vocab.reviewCount = (vocab.reviewCount || 0) + 1;
        setIsReciting(true);
        setTimeout(() => setIsReciting(false), 2000);
      }
    });
  };

  const handleClear = () => {
    setSentence('');
    setResult(null);
    setIsPracticing(false);
  };

  return (
    <div className="border border-border rounded-xl p-6 bg-card flex flex-col gap-3 transition-all">
      <div className="flex justify-between items-start">
        <h3 className="text-xl font-bold text-primary">{vocab.word}</h3>
        <span className={`text-xs px-2 py-1 rounded-full ${vocab.status === 'learning' ? 'bg-blue-900/30 text-blue-400' : vocab.status === 'review' ? 'bg-amber-900/30 text-amber-400' : 'bg-emerald-900/30 text-emerald-400'}`}>
          {vocab.status}
        </span>
      </div>
      <p className="text-foreground">{vocab.meaning}</p>
      <p className="text-muted-foreground text-sm italic">"{vocab.example}"</p>
      
      <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
        <span>Reviewed: {vocab.reviewCount || 0} times</span>
        <span>Practice Attempts: {vocab.practiceAttempts || 0}</span>
      </div>

      {!isPracticing ? (
        <div className="mt-2 flex gap-3">
          <button 
            onClick={() => setIsPracticing(true)}
            className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary text-sm font-medium rounded-lg transition"
          >
            Practice this word
          </button>
          <button 
            onClick={handleRecite}
            disabled={reciteMutation.isPending || isReciting}
            className={`px-4 py-2 flex items-center gap-2 text-sm font-medium rounded-lg transition ${isReciting ? 'bg-emerald-500/20 text-emerald-500' : 'bg-muted text-muted-foreground hover:bg-accent'}`}
          >
            {isReciting ? '✅ Recited' : 'Recite (Murojaah)'}
          </button>
        </div>
      ) : (
        <div className="mt-4 pt-4 border-t border-border flex flex-col gap-3">
          <textarea
            className="w-full bg-input border border-border rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none"
            rows={3}
            placeholder="Write a sentence using this word..."
            value={sentence}
            onChange={(e) => setSentence(e.target.value)}
            disabled={practiceMutation.isPending || result}
          />
          
          {!result && (
            <div className="flex gap-2 self-end">
              <button 
                onClick={handleClear}
                className="px-4 py-1.5 rounded-lg text-sm bg-muted text-muted-foreground hover:text-foreground transition"
              >
                Cancel
              </button>
              <button 
                onClick={handlePracticeSubmit}
                disabled={!sentence.trim() || practiceMutation.isPending}
                className="px-4 py-1.5 rounded-lg text-sm bg-primary text-primary-foreground font-medium disabled:opacity-50 transition"
              >
                {practiceMutation.isPending ? 'Checking...' : 'Submit'}
              </button>
            </div>
          )}

          {result && (
            <div className={`p-4 rounded-lg border text-sm flex flex-col gap-2 ${result.isCorrect ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100' : 'border-amber-500/30 bg-amber-500/10 text-amber-100'}`}>
              <div className="font-bold flex items-center gap-2">
                {result.isCorrect ? '✅ Correct' : '⚠️ Needs work'}
              </div>
              <p>{result.feedback}</p>
              {result.improvedSentence && (
                <div className={`mt-2 pt-2 border-t ${result.isCorrect ? 'border-emerald-500/20 text-emerald-200' : 'border-amber-500/20 text-amber-200'} italic`}>
                  <span className="font-medium not-italic">Better:</span> "{result.improvedSentence}"
                </div>
              )}
              <button 
                onClick={handleClear}
                className="mt-2 self-end px-3 py-1 bg-black/20 hover:bg-black/40 rounded transition"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const Vocabulary = () => {
  const [sortOrder, setSortOrder] = useState('newest');

  const { data, isLoading } = useQuery({
    queryKey: ['vocabulary'],
    queryFn: async () => {
      const res = await fetch('http://localhost:3000/api/vocabulary', {
        headers: { 'X-User-ID': localStorage.getItem('ec_user_id') || '' }
      });
      if (!res.ok) throw new Error('Network response was not ok');
      return res.json();
    }
  });

  const getSortedData = () => {
    if (!data?.data) return [];
    const arr = [...data.data];
    switch(sortOrder) {
      case 'newest': return arr; // Already sorted by desc from backend
      case 'oldest': return arr.reverse();
      case 'az': return arr.sort((a, b) => a.word.localeCompare(b.word));
      case 'most_reviewed': return arr.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
      default: return arr;
    }
  };

  const sortedData = getSortedData();

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-foreground">Vocabulary Review</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Words extracted from your conversations.</p>
        </div>
        <select 
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="w-full sm:w-auto bg-input border border-border text-foreground text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary/50"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="az">A - Z</option>
          <option value="most_reviewed">Most Reviewed</option>
        </select>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center p-12">Loading vocabulary...</div>
      ) : (
        <div className="flex flex-col gap-6">
          {sortedData.map((vocab: any) => (
            <VocabCard key={vocab.id} vocab={vocab} />
          ))}
          {sortedData.length === 0 && (
            <div className="text-center p-12 border border-dashed border-border rounded-xl">
              <p className="text-muted-foreground">No vocabulary to review right now.</p>
              <p className="text-sm mt-2">Chat with Emma to discover new words!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const Journal = () => {
  const [content, setContent] = useState('');
  
  const { data: promptData, isLoading: isPromptLoading } = useQuery({
    queryKey: ['journalPrompt'],
    queryFn: async () => {
      const res = await fetch('http://localhost:3000/api/journal/prompt', {
        headers: { 'X-User-ID': localStorage.getItem('ec_user_id') || '' }
      });
      if (!res.ok) throw new Error('Network response was not ok');
      return res.json();
    }
  });

  const submitMutation = useMutation({
    mutationFn: async (text: string) => {
      const res = await fetch('http://localhost:3000/api/journal/submit', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-User-ID': localStorage.getItem('ec_user_id') || ''
        },
        body: JSON.stringify({ content: text, prompt: promptData?.data?.prompt })
      });
      if (!res.ok) throw new Error('API Error');
      return res.json();
    }
  });

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-foreground">Daily Journal</h1>
      <p className="text-muted-foreground text-sm sm:text-base mb-6 sm:mb-8">Practice writing without worrying about mistakes.</p>
      
      <div className="border border-border rounded-xl p-4 sm:p-6 bg-card flex flex-col gap-4">
        {isPromptLoading ? (
          <div className="h-6 bg-muted rounded w-1/2 animate-pulse mb-2"></div>
        ) : (
          <h2 className="text-xl font-semibold text-primary mb-2">{promptData?.data?.prompt}</h2>
        )}
        
        <textarea
          className="w-full h-40 sm:h-48 bg-input border border-border rounded-xl p-4 text-foreground text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
          placeholder="Start writing here..."
          value={content}
          onChange={e => setContent(e.target.value)}
        />
        
        <button 
          onClick={() => submitMutation.mutate(content)}
          disabled={!content.trim() || submitMutation.isPending || submitMutation.isSuccess}
          className="self-stretch sm:self-end px-6 py-3 sm:py-2 bg-primary text-primary-foreground font-medium rounded-lg disabled:opacity-50 hover:opacity-90 transition"
        >
          {submitMutation.isPending ? 'Submitting...' : submitMutation.isSuccess ? 'Submitted' : 'Submit to Emma'}
        </button>

        {submitMutation.isSuccess && submitMutation.data?.feedback && (
          <div className="mt-4 flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* General Feedback */}
            <div className="p-4 bg-primary/10 border border-primary/30 rounded-xl">
              <h3 className="font-bold text-primary mb-2 flex items-center gap-2">📝 General Feedback</h3>
              <p className="text-foreground">{submitMutation.data.feedback.generalFeedback}</p>
            </div>

            {/* Corrections */}
            {submitMutation.data.feedback.corrections?.length > 0 && (
              <div className="p-4 bg-card border border-border rounded-xl">
                <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">🔍 Corrections</h3>
                <div className="flex flex-col gap-4">
                  {submitMutation.data.feedback.corrections.map((c: any, i: number) => (
                    <div key={i} className="flex flex-col gap-2 p-3 bg-muted rounded-lg">
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                        <div className="flex-1 bg-red-500/10 text-red-500 p-2 rounded line-through decoration-red-500/50">{c.original}</div>
                        <div className="hidden sm:flex items-center text-muted-foreground">➔</div>
                        <div className="flex-1 bg-emerald-500/10 text-emerald-500 p-2 rounded">{c.corrected}</div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 text-center sm:text-left"><span className="font-medium text-foreground">Why:</span> {c.explanation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Native Rewrite */}
            {submitMutation.data.feedback.nativeRewrite && (
              <div className="p-5 bg-amber-500/10 border border-amber-500/30 rounded-xl relative overflow-hidden">
                <div className="absolute -right-4 -top-4 text-6xl opacity-10">✨</div>
                <h3 className="font-bold text-amber-500 mb-2 flex items-center gap-2">✨ Native Masterpiece</h3>
                <p className="text-foreground italic leading-relaxed">"{submitMutation.data.feedback.nativeRewrite}"</p>
              </div>
            )}

            {/* New Vocabulary */}
            {submitMutation.data.feedback.newVocabulary?.length > 0 && (
              <div className="p-4 bg-card border border-border rounded-xl">
                <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">📚 New Vocabulary Added</h3>
                <div className="flex flex-wrap gap-2">
                  {submitMutation.data.feedback.newVocabulary.map((v: any, i: number) => (
                    <span key={i} className="px-3 py-1.5 bg-secondary text-secondary-foreground text-sm rounded-lg font-medium">
                      {v.word}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">These words have been added to your Vocabulary Review page.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const BottomNav = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <nav className="md:hidden fixed bottom-0 w-full bg-card border-t border-border flex justify-around items-center p-3 z-50">
      <Link to="/" className={`flex flex-col items-center gap-1 ${isActive('/') ? 'text-primary' : 'text-muted-foreground'}`}>
        <Home size={20} />
        <span className="text-[10px] font-medium">Home</span>
      </Link>
      <Link to="/chat" className={`flex flex-col items-center gap-1 ${isActive('/chat') ? 'text-primary' : 'text-muted-foreground'}`}>
        <MessageSquare size={20} />
        <span className="text-[10px] font-medium">Chat</span>
      </Link>
      <Link to="/vocabulary" className={`flex flex-col items-center gap-1 ${isActive('/vocabulary') ? 'text-primary' : 'text-muted-foreground'}`}>
        <BookOpen size={20} />
        <span className="text-[10px] font-medium">Vocab</span>
      </Link>
      <Link to="/journal" className={`flex flex-col items-center gap-1 ${isActive('/journal') ? 'text-primary' : 'text-muted-foreground'}`}>
        <PenTool size={20} />
        <span className="text-[10px] font-medium">Journal</span>
      </Link>
    </nav>
  );
};

function App() {
  useEffect(() => {
    if (!localStorage.getItem('ec_user_id')) {
      localStorage.setItem('ec_user_id', crypto.randomUUID());
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen bg-background text-foreground flex flex-col font-sans pb-16 md:pb-0">
          <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 p-4 flex justify-between items-center z-10">
            <Link to="/" className="text-xl font-bold text-primary flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">E</div>
              <span className="hidden sm:inline">English Companion</span>
            </Link>
            <nav className="hidden md:flex gap-4">
              <Link to="/" className="text-muted-foreground hover:text-foreground font-medium">Dashboard</Link>
              <Link to="/chat" className="text-muted-foreground hover:text-foreground font-medium">Chat</Link>
              <Link to="/vocabulary" className="text-muted-foreground hover:text-foreground font-medium">Vocabulary</Link>
              <Link to="/journal" className="text-muted-foreground hover:text-foreground font-medium">Journal</Link>
            </nav>
          </header>
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/chat" element={<ChatInterface />} />
              <Route path="/vocabulary" element={<Vocabulary />} />
              <Route path="/journal" element={<Journal />} />
            </Routes>
          </main>
          <BottomNav />
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
