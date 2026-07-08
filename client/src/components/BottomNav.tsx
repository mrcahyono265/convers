import { Link, useLocation } from 'react-router-dom';
import { Home, MessageSquare, BookOpen, PenTool } from 'lucide-react';

export default function BottomNav() {
  const { pathname } = useLocation();
  const active = (path: string) => pathname === path;

  const tabs = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/chat', icon: MessageSquare, label: 'Chat' },
    { path: '/vocabulary', icon: BookOpen, label: 'Vocab' },
    { path: '/journal', icon: PenTool, label: 'Journal' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 w-full bg-card/95 backdrop-blur-md border-t border-border/50 flex justify-around items-center px-2 pb-1 z-50">
      {tabs.map(({ path, icon: Icon, label }) => {
        const isActive = active(path);
        return (
          <Link key={path} to={path} className={`relative flex flex-col items-center gap-0.5 py-2 px-3 transition-all duration-200 active:scale-90 ${isActive ? 'text-emerald-400' : 'text-muted-foreground hover:text-foreground'}`}>
            {isActive && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full" />}
            <Icon size={20} />
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
