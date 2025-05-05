// import { create } from 'zustand';

// const useAuthStore = create((set) => ({
//   user: null,
//   token: null,
//   setAuth: ({ user, token }) => set({ user, token }),
//   clearAuth: () => set({ user: null, token: null }),
// }));

// export default useAuthStore;
import { create } from "zustand";
import { persist } from "zustand/middleware";

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,

      setAuth: ({ user, token }) => set({ user, token }),
      clearAuth: () => set({ user: null, token: null }),
    }),
    {
      name: "auth-storage", // uses localStorage
    }
  )
);

export default useAuthStore;