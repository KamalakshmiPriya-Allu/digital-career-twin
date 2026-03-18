import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
  onboardingDone: boolean;
  targetRole?: string;
  avatarUrl?: string;
  streakDays?: number;
  careerReadiness?: number;
  skills?: Record<string, number>;
  degree?: string;
  year?: number;
  college?: string;
  marks10th?: number;
  marks12th?: number;
  cgpa?: number;
  targetCompany?: string;
  expectedSalary?: number;
  learningPreference?: string;
  interests?: string[];
  strengths?: string[];
  weaknesses?: string[];
  notificationsEnabled?: boolean;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  updateUser: (partial: Partial<User>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      setAuth: (user, token) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('dct_token', token);
        }
        set({ user, token });
      },
      updateUser: (partial) => {
        const u = get().user;
        if (u) set({ user: { ...u, ...partial } });
      },
      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('dct_token');
          // Clear cookie with explicit path and domain if possible, but path=/ is standard
          document.cookie = 'dct_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
          
          set({ user: null, token: null });
          window.location.replace('/login');
        } else {
          set({ user: null, token: null });
        }
      },
    }),
    { name: 'dct-auth' }
  )
);
