import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

// Async Thunk to fetch wishlist items
export const fetchWishlistItems = createAsyncThunk(
  "wishlist/fetchWishlistItems",
  async (token) => {
    const response = await axios.get(`${BASE_URL}/wishlists`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data?.products || [];
  }
);

// Slice
const wishlistSlice = createSlice({
  name: "wishlist",
  initialState: {
    items: [],
    lastUpdated: Date.now(),
  },
  reducers: {
    setWishlistItems(state, action) {
      state.items = action.payload;
      state.lastUpdated = Date.now();
    },
    removeWishlistItem(state, action) {
      state.items = state.items.filter((item) => item._id !== action.payload);
    },
    clearWishlist(state) {
      state.items = [];
      state.lastUpdated = Date.now();
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchWishlistItems.fulfilled, (state, action) => {
      state.items = action.payload;
      state.lastUpdated = Date.now();
    });
  },
});

export const { setWishlistItems, removeWishlistItem, clearWishlist } =
  wishlistSlice.actions;
export default wishlistSlice.reducer;
