import { create } from "zustand";
import { cartApi } from "@/api/cartApi";
import type { Cart } from "@/types";

interface CartState {
  cart: Cart | null;
  totalItems: number;
  isLoading: boolean;
}

interface CartActions {
  fetchCart: () => Promise<void>;
  addToCart: (productId: number, quantity?: number) => Promise<string | null>;
  updateItem: (itemId: number, quantity: number) => Promise<string | null>;
  removeItem: (itemId: number) => Promise<string | null>;
  clearCart: () => Promise<void>;
  resetCart: () => void;
}

export const useCartStore = create<CartState & CartActions>((set) => ({
  cart: null,
  totalItems: 0,
  isLoading: false,

  fetchCart: async () => {
    set({ isLoading: true });
    const result = await cartApi.get();
    set({ isLoading: false });
    if (result.data) set({ cart: result.data, totalItems: result.data.total_items });
  },

  addToCart: async (productId, quantity = 1) => {
    const result = await cartApi.add({ product_id: productId, quantity });
    if (result.data) set({ cart: result.data, totalItems: result.data.total_items });
    return result.error;
  },

  updateItem: async (itemId, quantity) => {
    const result = await cartApi.updateItem(itemId, quantity);
    if (result.data) set({ cart: result.data, totalItems: result.data.total_items });
    return result.error;
  },

  removeItem: async (itemId) => {
    const result = await cartApi.removeItem(itemId);
    if (result.data) set({ cart: result.data, totalItems: result.data.total_items });
    return result.error;
  },

  clearCart: async () => {
    await cartApi.clear();
    set({ cart: null, totalItems: 0 });
  },

  resetCart: () => set({ cart: null, totalItems: 0 }),
}));
