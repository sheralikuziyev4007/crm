import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Session, SignOutReason, User } from "@/features/auth/types";
import { STORAGE_KEYS } from "@/lib/constants";

interface AuthState {
  token: string | null;
  user: User | null;
  signOutReason: SignOutReason | null;
  signIn: (session: Session) => void;
  signOut: (reason?: SignOutReason) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      signOutReason: null,
      signIn: ({ token, user }) => set({ token, user, signOutReason: null }),
      signOut: (reason = "signed-out") => set({ token: null, user: null, signOutReason: reason }),
    }),
    {
      name: STORAGE_KEYS.auth,
      storage: createJSONStorage(() => localStorage),
      // Only the session is remembered; the sign-out reason is a one-time message
      partialize: ({ token, user }) => ({ token, user }),
    },
  ),
);

export const selectIsAuthenticated = (state: AuthState) => state.token !== null;
