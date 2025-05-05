import { create } from "zustand";
import { persist } from "zustand/middleware";

const useCartStore = create((set, get) => ({
  cartItems: [],
  cartEateryId: null,

  addItemToCart: (item) => {
    const { cartItems, cartEateryId } = get();
    
    if (cartItems.length > 0 && cartEateryId.eateryId !== item.eatery.eateryId) {
      console.warn("Cannot add item from a different eatery.");
      return;
    }

    const existingItemIndex = cartItems.findIndex((i) => i._id === item._id);
    if (existingItemIndex > -1) {
      const updatedItems = [...cartItems];
      updatedItems[existingItemIndex].quantity += 1;
      set({ cartItems: updatedItems });
    } else {
      set({
        cartItems: [...cartItems, { ...item, quantity: 1 }],
        cartEateryId: item.eatery,
      });
    }
  },

  removeItemFromCart: (id) => {
    const updatedItems = get().cartItems
      .map((i) => (i._id === id ? { ...i, quantity: i.quantity - 1 } : i))
      .filter((i) => i.quantity > 0);
    const updatedEatery = updatedItems.length > 0 ? updatedItems[0].eatery : null;
    set({ cartItems: updatedItems, cartEateryId: updatedEatery });
  },

  clearCart: () => set({ cartItems: [], cartEateryId: null }),

  removeItemCompletely: (id) => {
    const updated = get().cartItems.filter((item) => item._id !== id);
    const updatedEatery = updated.length > 0 ? updated[0].eatery : null;
    set({ cartItems: updated, cartEateryId: updatedEatery });
  },
}));

export default useCartStore;


