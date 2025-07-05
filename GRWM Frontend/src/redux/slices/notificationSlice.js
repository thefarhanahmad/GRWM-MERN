import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

// ✅ Fetch all notifications
export const fetchNotifications = createAsyncThunk(
  "notifications/fetchNotifications",
  async (token, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return response.data;
    } catch (error) {
      return rejectWithValue("Failed to fetch notifications");
    }
  }
);

// ✅ Mark all notifications as read
export const markAllNotificationsAsRead = createAsyncThunk(
  "notifications/markAllAsRead",
  async (token, { rejectWithValue }) => {
    try {
      await axios.patch(`${BASE_URL}/notifications/mark-all-read`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return true;
    } catch (error) {
      return rejectWithValue("Failed to mark notifications as read");
    }
  }
);

const notificationsSlice = createSlice({
  name: "notifications",
  initialState: {
    notifications: [],
    unreadCount: 0,
    loading: false,
    error: null,
  },
  reducers: {
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.read) {
        state.unreadCount += 1;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload.data || [];
        state.unreadCount = action.payload.unreadNotifications || 0;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch notifications";
      })

      // Mark All As Read
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.notifications = state.notifications.map((n) => ({
          ...n,
          read: true,
        }));
        state.unreadCount = 0;
      })
      .addCase(markAllNotificationsAsRead.rejected, (state, action) => {
        state.error = action.payload || "Failed to mark all as read";
      });
  },
});

export const { clearNotifications, addNotification } =
  notificationsSlice.actions;

export default notificationsSlice.reducer;
