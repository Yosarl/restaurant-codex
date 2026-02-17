import { create } from 'zustand';

interface AuthState {
  accessToken: string | null;
  userEmail: string | null;
  setSession: (token: string, email: string) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  userEmail: null,
  setSession: (token, email) => set({ accessToken: token, userEmail: email }),
  clear: () => set({ accessToken: null, userEmail: null })
}));
