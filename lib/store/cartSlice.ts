import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type CartItem = {
  image?: string;
  title: string;
  beatId: string;
  licenseId: string;
  price: number;
};

interface CartState {
  items: CartItem[];
}

const loadFromStorage = (): CartItem[] => {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("cart");
    if (stored) return JSON.parse(stored);
  }
  return [];
};

const saveToStorage = (items: CartItem[]) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("cart", JSON.stringify(items));
  }
};

const initialState: CartState = {
  items: loadFromStorage(),
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<CartItem>) => {
      const existingIndex = state.items.findIndex(
        (i) => i.beatId === action.payload.beatId && i.licenseId === action.payload.licenseId
      );

      if (existingIndex >= 0) {
        // Replace the existing item (e.g., update price)
        state.items[existingIndex] = action.payload;
      } else {
        state.items.push(action.payload);
      }

      saveToStorage(state.items);
    },

    removeItem: (state, action: PayloadAction<{ beatId: string; licenseId?: string }>) => {
      state.items = state.items.filter(
        (i) =>
          !(i.beatId === action.payload.beatId && (!action.payload.licenseId || i.licenseId === action.payload.licenseId))
      );
      saveToStorage(state.items);
    },

    clearCart: (state) => {
      state.items = [];
      saveToStorage(state.items);
    },

    // NEW: setItems allows overwriting the cart entirely
    setItems: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload;
      saveToStorage(state.items);
    },
  },
});

export const { addItem, removeItem, clearCart, setItems } = cartSlice.actions;

export default cartSlice.reducer;
