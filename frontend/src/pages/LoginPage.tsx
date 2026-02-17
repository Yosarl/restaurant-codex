import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuthStore } from '../store/auth-store';

export function LoginPage() {
  const [email, setEmail] = useState('admin@restaurant.local');
  const [password, setPassword] = useState('Admin@1234');
  const [mfa, setMfa] = useState('');
  const [error, setError] = useState('');
  const setSession = useAuthStore((s) => s.setSession);
  const navigate = useNavigate();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      if (mfa && mfa.length < 6) throw new Error('Invalid MFA code');
      const data = await api<{ accessToken: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      setSession(data.accessToken, email);
      navigate('/dashboard');
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center p-4">
      <form className="bg-white shadow-md rounded-2xl p-6 w-full max-w-md" onSubmit={onSubmit}>
        <h1 className="text-2xl font-semibold">Login</h1>
        <p className="text-sm text-slate-600 mt-1">Use MFA code if enabled for your account.</p>
        <label className="block mt-4 text-sm">Email</label>
        <input className="w-full border rounded px-3 py-2" value={email} onChange={(e) => setEmail(e.target.value)} />
        <label className="block mt-3 text-sm">Password</label>
        <input
          className="w-full border rounded px-3 py-2"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <label className="block mt-3 text-sm">MFA (Optional)</label>
        <input className="w-full border rounded px-3 py-2" value={mfa} onChange={(e) => setMfa(e.target.value)} />
        {error ? <p className="text-sm text-rose-700 mt-2">{error}</p> : null}
        <button className="w-full mt-4 rounded bg-brand-700 text-white py-2">Sign In</button>
      </form>
    </div>
  );
}
