import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { isAuthenticated } from './api/client';
import { createGuestSession } from './api/auth';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import Dashboard from './components/Dashboard';
import ChatInterface from './components/ChatInterface';
import Vocabulary from './components/Vocabulary';
import Journal from './components/Journal';

const queryClient = new QueryClient();

function AuthGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) {
      setReady(true);
      return;
    }
    createGuestSession()
      .catch(console.error)
      .finally(() => setReady(true));
  }, []);

  if (!ready) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground animate-pulse">Loading...</div>
      </div>
    );
  }

  return <>{children}</>;
}

function AppLayout() {
  return (
    <div className="h-screen bg-background text-foreground flex flex-col font-sans pb-16 md:pb-0 overflow-hidden">
      <Header />
      <main className="flex-1 flex flex-col overflow-y-auto">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/chat" element={<ChatInterface />} />
          <Route path="/vocabulary" element={<Vocabulary />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <BottomNav />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthGate>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage onAuthSuccess={() => window.location.href = '/'} />} />
            <Route path="/register" element={<RegisterPage onAuthSuccess={() => window.location.href = '/'} />} />
            <Route path="/*" element={<AppLayout />} />
          </Routes>
        </BrowserRouter>
      </AuthGate>
    </QueryClientProvider>
  );
}
