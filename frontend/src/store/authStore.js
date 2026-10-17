import { create } from "zustand";

import { loginUser, getCurrentUser, logoutUser } from "@/api/authApi";

const useAuthStore = create((set) => ({
  user: null,
  isLoading: false,
  isCheckingAuth: true,

  // Login user
  login: async (credentials) => {
    set({ isLoading: true });

    try {
      const data = await loginUser(credentials);

      set({
        user: data.user,
        isLoading: false,
        isCheckingAuth: false,
      });
      return data.user;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  // Check whether a valid session already exists
  checkAuth: async () => {
    try {
      const data = await getCurrentUser();

      set({
        user: data.user,
        isCheckingAuth: false,
      });
    } catch {
      set({
        user: null,
        isCheckingAuth: false,
      });
    }
  },

  // Logout user
  logout: async () => {
    try {
      await logoutUser();
    } finally {
      set({
        user: null,
        isLoading: false,
        isCheckingAuth: false,
      });
    }
  },

  // Clear user information
  clearAuth: () => {
    set({
      user: null,
      isLoading: false,
      isCheckingAuth: false,
    });
  },
}));

export default useAuthStore;
