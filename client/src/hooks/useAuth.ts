import { useState, useEffect, useCallback } from 'react';
import { getToken, clearToken } from '../api/client';

function getUser() {
  try {
    const raw = localStorage.getItem('ec_user');
    return raw ? JSON.parse(raw) as { id: string; name: string; isGuest: boolean; email?: string } : null;
  } catch { return null; }
}

export function useAuth() {
  const [state, setState] = useState({ userId: null as string | null, userName: '', isGuest: true, isLoading: true });

  useEffect(() => {
    const token = getToken();
    if (token) {
      const user = getUser();
      if (user) {
        setState({ userId: user.id, userName: user.name, isGuest: user.isGuest, isLoading: false });
        return;
      }
    }
    setState({ userId: null, userName: '', isGuest: true, isLoading: false });
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setState({ userId: null, userName: '', isGuest: true, isLoading: false });
  }, []);

  return { ...state, logout };
}
