import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Header() {
  const { userName, isGuest, isLoading, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="border-b border-emerald-500/20 bg-gradient-to-r from-card/80 via-card/50 to-card/80 backdrop-blur-md sticky top-0 p-4 flex justify-between items-center z-10 shrink-0">
      <Link to="/" className="text-xl font-bold flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">E</div>
        <span className="hidden sm:inline text-foreground">English Companion</span>
      </Link>
      <div className="flex items-center gap-3">
        <nav className="hidden md:flex gap-4 mr-4">
          <Link to="/" className="text-muted-foreground hover:text-emerald-400 font-medium transition-colors">Dashboard</Link>
          <Link to="/chat" className="text-muted-foreground hover:text-emerald-400 font-medium transition-colors">Chat</Link>
          <Link to="/vocabulary" className="text-muted-foreground hover:text-emerald-400 font-medium transition-colors">Vocabulary</Link>
          <Link to="/journal" className="text-muted-foreground hover:text-emerald-400 font-medium transition-colors">Journal</Link>
        </nav>
        {!isLoading && (
          <div className="flex items-center gap-2 text-sm">
            {isGuest ? (
              <>
                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded text-xs font-medium border border-emerald-500/20">Guest</span>
                <Link to="/login" className="text-muted-foreground hover:text-foreground font-medium transition-colors">Sign In</Link>
                <Link to="/register" className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg text-xs font-medium hover:from-emerald-400 hover:to-emerald-500 transition-all shadow-lg shadow-emerald-500/20">Register</Link>
              </>
            ) : (
              <>
                <span className="text-muted-foreground font-medium">{userName}</span>
                <button onClick={() => { logout(); navigate('/login'); }} className="text-muted-foreground hover:text-red-400 text-xs font-medium transition-colors">Logout</button>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
