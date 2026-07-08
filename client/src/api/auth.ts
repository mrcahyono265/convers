import { api, setToken } from './client';
import type { AuthResponse } from '../types/auth';

function saveUser(user: AuthResponse['data']['user']) {
  localStorage.setItem('ec_user', JSON.stringify(user));
}

export async function createGuestSession(): Promise<AuthResponse['data']> {
  const res = await api<AuthResponse>('/api/auth/guest', { method: 'POST' });
  setToken(res.data.token);
  saveUser(res.data.user);
  return res.data;
}

export async function register(email: string, password: string, name: string): Promise<AuthResponse['data']> {
  const res = await api<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: { email, password, name },
  });
  setToken(res.data.token);
  saveUser(res.data.user);
  return res.data;
}

export async function login(email: string, password: string): Promise<AuthResponse['data']> {
  const res = await api<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: { email, password },
  });
  setToken(res.data.token);
  saveUser(res.data.user);
  return res.data;
}
