import { create } from "zustand";
import { persist } from "zustand/middleware";

const useOrderStore = create(
  persist(
    (set) => ({
      orderId: null,
      setOrderId: (id) => set({ orderId: id }), // Store the order ID
    }),
    {
      name: "order-storage", // The name of the storage key
      getStorage: () => localStorage, // Use localStorage to persist the data
    }
  )
);

export default useOrderStore;
