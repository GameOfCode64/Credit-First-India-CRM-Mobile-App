import { create } from "zustand";
import { api } from "../services/api";
import {
  getStoredToken,
  login as loginService,
  logout as logoutService,
} from "../services/auth.service";
import { registerFcmToken } from "../services/call.service";
import type { User } from "../types";

interface AuthStore {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  login: (identifier: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
  setFcmToken: (token: string) => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (identifier, password) => {
    const { token, user } = await loginService(identifier, password);
    set({ user, token, isAuthenticated: true });
  },

  logout: async () => {
    await logoutService();
    set({ user: null, token: null, isAuthenticated: false });
  },

  // Called on app start — restores session from SecureStore
  hydrate: async () => {
    try {
      const token = await getStoredToken();
      if (!token) {
        set({ isLoading: false });
        return;
      }

      // Verify token is still valid by fetching /me
      const res = await api.get("/users/me");
      set({ user: res.data, token, isAuthenticated: true, isLoading: false });
    } catch {
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  setFcmToken: async (fcmToken) => {
    try {
      await registerFcmToken(fcmToken);
    } catch (err) {
      console.warn("[FCM] Token registration failed:", err);
    }
  },
}));
