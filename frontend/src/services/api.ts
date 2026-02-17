import { useAuthStore } from '../store/auth-store';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const token = useAuthStore.getState().accessToken;
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {})
    }
  });

  if (!res.ok) {
    throw new Error(`API ${res.status}`);
  }

  if (res.status === 204) return {} as T;
  return res.json() as Promise<T>;
}
