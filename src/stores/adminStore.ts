import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { authApi, getToken, setToken, removeToken } from '@/lib/api';
import type { AdminUser } from '@/lib/api';

interface AdminStore {
  user: AdminUser | null;
  adminProfile: AdminUser | null; // alias kept for backward compat
  isLoading: boolean;
  error: string | null;

  signIn:          (email: string, password: string) => Promise<boolean>;
  signOut:         () => Promise<void>;
  loadMe:          () => Promise<void>;
  clearError:      () => void;
  isAuthenticated: () => boolean;
  canEdit:         () => boolean;
}

export const useAdminStore = create<AdminStore>()(
  persist(
    (set, get) => ({
      user:         null,
      adminProfile: null,
      isLoading:    false,
      error:        null,

      signIn: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { token, user } = await authApi.login(email, password);
          setToken(token);
          set({ user, adminProfile: user, isLoading: false });
          return true;
        } catch (err: any) {
          set({ error: err.message ?? 'Sign in failed', isLoading: false });
          return false;
        }
      },

      signOut: async () => {
        try { await authApi.logout(); } catch { /* ignore */ }
        removeToken();
        set({ user: null, adminProfile: null });
      },

      // loadMe — silently refreshes user from server using stored JWT.
      // On any failure it removes the bad token so the guard redirects cleanly.
      loadMe: async () => {
        const token = getToken();
        if (!token) return;
        try {
          const user = await authApi.me();
          set({ user, adminProfile: user });
        } catch {
          // Token is invalid or expired — clear everything
          removeToken();
          set({ user: null, adminProfile: null });
        }
      },

      clearError: () => set({ error: null }),

      isAuthenticated: () => !!getToken() && !!get().user,

      canEdit: () => {
        const role = get().user?.role;
        return !!role && ['super_admin', 'admin', 'editor'].includes(role);
      },
    }),
    {
      name:       'di-admin',
      storage:    createJSONStorage(() => localStorage),
      partialize: (s) => ({ user: s.user, adminProfile: s.adminProfile }),
    }
  )
);
