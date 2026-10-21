import { create } from "zustand";

import {
  persist,
  createJSONStorage,
} from "zustand/middleware";

import AsyncStorage from "@react-native-async-storage/async-storage";

interface UserData {
  username: string;
  email: string;
  role: string | null;
  user_id: number;
}

interface AuthState {

  token: string | null;
  user: UserData | null;
  isAuthenticated: boolean;
  showLogin: boolean;

  login: (
    token: string,
    user: UserData
  ) => void;

  logout: () => Promise<void>;
  openLogin: () => void;
  closeLogin: () => void;
}

export const useAuthStore = create<AuthState>()(

  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      showLogin: false,
      login: (token, user) =>

        set({
          token,
          user,
          isAuthenticated: true,
          showLogin: false,
        }),

      logout: async () => {

        await AsyncStorage.removeItem(
          "accessToken"
        );

        await AsyncStorage.removeItem(
          "refreshToken"
        );

        set({
          token: null,
          user: null,
          isAuthenticated: false,
        });
      },

      openLogin: () =>
        set({
          showLogin: true,
        }),

      closeLogin: () =>
        set({
          showLogin: false,
        }),
    }),

    {
      name: "auth-storage",
      storage: createJSONStorage(
        () => AsyncStorage
      ),
    }
  )
);