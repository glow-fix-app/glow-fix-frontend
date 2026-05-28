import { createSlice } from "@reduxjs/toolkit";

const notificationSlice = createSlice({
  name: "notifications",
  initialState: {
    items: [],
    unreadCount: 0,
  },
  reducers: {
    setNotifications(state, action) {
      state.items = action.payload;
      state.unreadCount = action.payload.filter((item) => !item.read).length;
    },
    markNotificationRead(state, action) {
      const item = state.items.find((notification) => notification.id === action.payload);
      if (item) {
        item.read = true;
      }
      state.unreadCount = state.items.filter((notification) => !notification.read).length;
    },
    markAllRead(state) {
      state.items.forEach((n) => { n.read = true; });
      state.unreadCount = 0;
    },
  },
});

export const { setNotifications, markNotificationRead, markAllRead } = notificationSlice.actions;
export default notificationSlice.reducer;




