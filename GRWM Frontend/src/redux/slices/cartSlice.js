// src/redux/cart/cartSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export const fetchCartItems = createAsyncThunk(
  "cart/fetchCartItems",
  async (token) => {
    const response = await axios.get(`${BASE_URL}/cart/items`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data;
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [],
    lastUpdated: Date.now(), // ⬅️ NEW
  },
  reducers: {
    setCartItems(state, action) {
      state.items = action.payload;
      state.totalItems = action.payload.totalItems;
      state.lastUpdated = Date.now(); // ⬅️ UPDATE TIME
    },
    clearCart(state) {
      state.items = [];
      state.totalItems = 0;
      state.lastUpdated = Date.now();
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchCartItems.fulfilled, (state, action) => {
      state.totalItems = action.payload.totalItems;
      state.items = action.payload;
      state.lastUpdated = Date.now(); // ⬅️ UPDATE TIME
    });
  },
});

export const { setCartItems, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
