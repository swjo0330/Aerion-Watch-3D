"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthStore {
  token: string | null;
  username: string | null;
  setToken: (token: string, username: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      token: null,
      username: null,
      setToken: (token, username) => set({ token, username }),
      logout: () => set({ token: null, username: null }),
    }),
    { name: "skywatch-auth" }
  )
);
