import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// 🚀 Fetch Achievements
export const fetchAchievements = createAsyncThunk(
  "achievements/fetch",
  async ({ userId, token, baseUrl }) => {
    const res = await axios.get(`${baseUrl}/achievements/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data.data;
  }
);

// ✅ Mark Popups Seen (URL fixed to match backend)
export const markPopupsSeen = createAsyncThunk(
  "achievements/markSeen",
  async ({ userId, token, baseUrl }) => {
    await axios.put(`${baseUrl}/achievement/seen/${userId}`, null, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return;
  }
);

const achievementsSlice = createSlice({
  name: "achievements",
  initialState: {
    list: [],
    popupList: [],
    totalSold: 0,
    status: "idle",
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAchievements.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchAchievements.fulfilled, (state, { payload }) => {
        state.status = "succeeded";
        state.list = payload.achievements;
        state.popupList = payload.popupAchievements;
        state.totalSold = payload.totalSold;
      })
      .addCase(fetchAchievements.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(markPopupsSeen.fulfilled, (state) => {
        state.popupList = [];
      });
  },
});

export default achievementsSlice.reducer;
