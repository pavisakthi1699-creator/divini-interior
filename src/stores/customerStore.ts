import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  customerAuthApi, getCustomerToken, setCustomerToken, removeCustomerToken,
  type CustomerUser,
} from '@/lib/api';

interface CustomerStore {
  user: CustomerUser | null;
  isLoading: boolean;
  error: string | null;

  signIn: (email: string, password: string) => Promise<boolean>;
  signInWithOtp: (email: string, otp: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  signOut: () => void;
  loadMe: () => Promise<void>;
  updateProfile: (data: Partial<CustomerUser> & { password?: string }) => Promise<boolean>;
  clearError: () => void;
  isAuthenticated: () => boolean;
}

export const useCustomerStore = create<CustomerStore>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      error: null,

      signIn: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { token, user } = await customerAuthApi.login(email, password);
          setCustomerToken(token);
          set({ user, isLoading: false });
          return true;
        } catch (e: any) {
          set({ error: e.message, isLoading: false });
          return false;
        }
      },

      signInWithOtp: async (email, otp) => {
        set({ isLoading: true, error: null });
        try {
          const res = await customerAuthApi.verifyOtp(email, otp, 'login') as any;
          if (res.token) {
            setCustomerToken(res.token);
            set({ user: res.user, isLoading: false });
            return true;
          }
          set({ error: 'Verification failed', isLoading: false });
          return false;
        } catch (e: any) {
          set({ error: e.message, isLoading: false });
          return false;
        }
      },

      register: async (name, email, password) => {
        set({ isLoading: true, error: null });
        try {
          await customerAuthApi.register(name, email, password);
          set({ isLoading: false });
          return true;
        } catch (e: any) {
          set({ error: e.message, isLoading: false });
          return false;
        }
      },

      signOut: () => {
        removeCustomerToken();
        set({ user: null, error: null });
      },

      loadMe: async () => {
        if (!getCustomerToken()) return;
        try {
          const user = await customerAuthApi.me();
          set({ user });
        } catch {
          removeCustomerToken();
          set({ user: null });
        }
      },

      updateProfile: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const user = await customerAuthApi.updateProfile(data);
          set({ user, isLoading: false });
          return true;
        } catch (e: any) {
          set({ error: e.message, isLoading: false });
          return false;
        }
      },

      clearError: () => set({ error: null }),
      isAuthenticated: () => !!getCustomerToken() && !!get().user,
    }),
    {
      name: 'di-customer',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ user: s.user }),
    }
  )
);
