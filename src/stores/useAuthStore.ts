import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';

const AUTH_STORAGE_KEY = '@pulsefeed_auth_session_v1';

interface AuthStoreState {
  user: User | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  isLoading: boolean;

  hydrate: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginAsGuest: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
}

export const useAuthStore = create<AuthStoreState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isHydrated: false,
  isLoading: false,

  hydrate: async () => {
    try {
      const stored = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const parsed: User = JSON.parse(stored);
        set({ user: parsed, isAuthenticated: true, isHydrated: true });
      } else {
        set({ isHydrated: true });
      }
    } catch (e) {
      console.warn('Failed to hydrate auth session:', e);
      set({ isHydrated: true });
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    // Simulate brief network authentication roundtrip
    await new Promise((resolve) => setTimeout(resolve, 600));

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      set({ isLoading: false });
      return { success: false, error: 'Please enter a valid email address.' };
    }

    if (!password || password.length < 6) {
      set({ isLoading: false });
      return { success: false, error: 'Password must be at least 6 characters.' };
    }

    const user: User = {
      id: `usr_${Date.now()}`,
      email: cleanEmail,
      name: cleanEmail.split('@')[0],
      createdAt: new Date().toISOString(),
      isGuest: false,
    };

    set({ user, isAuthenticated: true, isLoading: false });

    try {
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } catch (e) {
      console.warn('Failed to persist auth session:', e);
    }

    return { success: true };
  },

  register: async (name: string, email: string, password: string) => {
    set({ isLoading: true });
    await new Promise((resolve) => setTimeout(resolve, 600));

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName) {
      set({ isLoading: false });
      return { success: false, error: 'Please enter your name.' };
    }

    if (!cleanEmail || !cleanEmail.includes('@')) {
      set({ isLoading: false });
      return { success: false, error: 'Please enter a valid email address.' };
    }

    if (!password || password.length < 6) {
      set({ isLoading: false });
      return { success: false, error: 'Password must be at least 6 characters.' };
    }

    const user: User = {
      id: `usr_${Date.now()}`,
      email: cleanEmail,
      name: cleanName,
      createdAt: new Date().toISOString(),
      isGuest: false,
    };

    set({ user, isAuthenticated: true, isLoading: false });

    try {
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } catch (e) {
      console.warn('Failed to persist auth session:', e);
    }

    return { success: true };
  },

  loginAsGuest: async () => {
    set({ isLoading: true });
    await new Promise((resolve) => setTimeout(resolve, 200));

    const guestUser: User = {
      id: 'usr_guest',
      email: 'guest@pulsefeed.local',
      name: 'Guest Reader',
      createdAt: new Date().toISOString(),
      isGuest: true,
    };

    set({ user: guestUser, isAuthenticated: true, isLoading: false });

    try {
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(guestUser));
    } catch (e) {
      console.warn('Failed to persist guest session:', e);
    }
  },

  logout: async () => {
    set({ user: null, isAuthenticated: false });
    try {
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to clear auth session:', e);
    }
  },

  resetPassword: async (email: string) => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
    return { success: true };
  },
}));
