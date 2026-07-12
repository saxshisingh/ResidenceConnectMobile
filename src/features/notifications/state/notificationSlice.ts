import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  fetchNotificationsByResident,
  getNotificationById,
  getUnreadNotificationCount,
  NotificationItem,
} from '../services/notificationService';

interface NotificationState {
  notifications: NotificationItem[];
  loading: boolean;
  error: string | null;
  hasUnread: boolean;
  unreadCount: number;
  hasFetched: boolean;
}

const initialState: NotificationState = {
  notifications: [],
  loading: false,
  error: null,
  hasUnread: false,
  unreadCount: 0,
  hasFetched: false,
};

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchByResident',
  async (residentId: string) => {
    console.log('THUNK → fetchNotifications:', residentId);
    return await fetchNotificationsByResident(residentId);
  }
);

export const fetchNotificationDetail = createAsyncThunk(
  'notifications/fetchDetail',
  async ({ id, residentId }: { id: string; residentId: string }) => {
    return await getNotificationById(id, residentId);
  }
);

export const checkUnreadNotifications = createAsyncThunk(
  'notifications/checkUnread',
  async (residentId: string) => {
    return await getUnreadNotificationCount(residentId);
  }
);

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    markAsRead: (state, action) => {
      const notification = state.notifications.find(
        n => n.id === action.payload
      );
      if (notification) {
        notification.isSeen = true; 
        state.unreadCount = state.notifications.filter(n => !n.isSeen).length;
        state.hasUnread = state.unreadCount > 0;
      }
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchNotifications.pending, state => {
        state.loading = true;
        state.error = null;
        state.hasFetched = false;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload;
        state.unreadCount = action.payload.filter(n => !n.isSeen).length; 
        state.hasUnread = state.unreadCount > 0;
        state.hasFetched = true;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch notifications';
        state.hasFetched = true;
        console.error('Fetch failed:', action.error.message);
      })
      .addCase(fetchNotificationDetail.fulfilled, (state, action) => {
        const index = state.notifications.findIndex(
          n => n.id === action.payload.id
        );
        if (index !== -1) {
          state.notifications[index] = action.payload;
          state.unreadCount = state.notifications.filter(n => !n.isSeen).length;
          state.hasUnread = state.unreadCount > 0;
        }
      })
      .addCase(checkUnreadNotifications.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
        state.hasUnread = action.payload > 0;
      });
  },
});

export const { markAsRead } = notificationSlice.actions;
export default notificationSlice.reducer;
