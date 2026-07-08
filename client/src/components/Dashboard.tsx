import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Flame, Timer, Gauge, Target } from 'lucide-react';
import { api } from '../api/client';
import { queryKeys } from '../api/keys';
import type { DashboardMetrics } from '../types/dashboard';

export default function Dashboard() {
  const { data: res, isLoading } = useQuery({
    queryKey: queryKeys.dashboard.metrics,
    queryFn: () => api<{ success: boolean; data: DashboardMetrics }>('/api/dashboard/metrics'),
  });

  const m = res?.data || { dayStreak: 0, averageMinutesSpoken: 0, averageWpm: 0, averageConfidence: 0 };

  const metrics = [
    { label: 'Day Streak', value: m.dayStreak, unit: '', icon: Flame, color: 'from-orange-500 to-rose-500', shadow: 'shadow-orange-500/20' },
    { label: 'Avg Minutes (7d)', value: m.averageMinutesSpoken, unit: 'm/day', icon: Timer, color: 'from-sky-500 to-blue-500', shadow: 'shadow-blue-500/20' },
    { label: 'Avg WPM (7d)', value: m.averageWpm || 0, unit: '', icon: Gauge, color: 'from-emerald-500 to-teal-500', shadow: 'shadow-emerald-500/20' },
    { label: 'Avg Confidence (7d)', value: `${m.averageConfidence || 0}`, unit: '%', icon: Target, color: 'from-violet-500 to-purple-500', shadow: 'shadow-purple-500/20' },
  ];

  return (
    <div className="p-8 space-y-8 max-w-4xl mx-auto animate-[slide-up_0.4s_ease-out]">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Good Morning!</h1>
        <p className="text-muted-foreground text-lg">Ready for today's mission?</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-28 bg-muted animate-pulse rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {metrics.map(({ label, value, unit, icon: Icon, color, shadow }) => (
            <div key={label} className={`bg-card border border-border/50 p-5 rounded-2xl flex flex-col items-center justify-center text-center hover:border-emerald-500/30 hover:${shadow} hover:-translate-y-0.5 transition-all duration-300 group`}>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3 shadow-lg ${shadow} group-hover:scale-110 transition-transform`}>
                <Icon size={18} className="text-white" />
              </div>
              <span className="text-2xl font-bold text-foreground">{value}{unit}</span>
              <span className="text-xs text-muted-foreground mt-1">{label}</span>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link to="/chat" className="group p-6 border border-border/50 rounded-2xl bg-gradient-to-br from-card to-card/80 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300 flex flex-col gap-3">
          <h2 className="text-xl font-semibold text-emerald-400 group-hover:text-emerald-300 transition-colors">Daily Conversation</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">Talk to Emma for 10 minutes to build your confidence and learn new words.</p>
          <span className="mt-2 text-sm font-medium text-emerald-400 group-hover:translate-x-1 transition-transform">Start Conversation &rarr;</span>
        </Link>
        <Link to="/vocabulary" className="group p-6 border border-border/50 rounded-2xl bg-gradient-to-br from-card to-card/80 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300 flex flex-col gap-3">
          <h2 className="text-xl font-semibold text-foreground group-hover:text-emerald-400 transition-colors">Vocabulary Review</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">Review words from your conversations. Practice makes perfect!</p>
          <span className="mt-2 text-sm font-medium text-emerald-400 group-hover:translate-x-1 transition-transform">Review Vocabulary &rarr;</span>
        </Link>
      </div>
    </div>
  );
}
