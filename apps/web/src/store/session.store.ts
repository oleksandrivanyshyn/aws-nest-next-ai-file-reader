import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SessionState {
  email: string | null;
  setEmail: (email: string) => void;
  clear: () => void;
}
export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      email: null,
      setEmail: (email) => set({ email }),
      clear: () => set({ email: null }),
    }),
    { name: 'docchat-session' },
  ),
);
