import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface User {
  id: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string) => Promise<any>;
  signOut: () => void;
  resetPassword: (email: string) => Promise<any>;
  updatePassword: (token: string, newPassword: string) => Promise<any>;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      signIn: async (email, password) => {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        
        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.message);
        }

        const data = await res.json();
        set({ user: data.user, token: data.token });
        return data;
      },
      signUp: async (email, password) => {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.message);
        }

        return await res.json();
      },
      signOut: () => {
        set({ user: null, token: null });
      },
      resetPassword: async (email) => {
        const res = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });

        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.message);
        }

        return await res.json();
      },
      updatePassword: async (token, newPassword) => {
        const res = await fetch('/api/auth/update-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, newPassword }),
        });

        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.message);
        }

        return await res.json();
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);