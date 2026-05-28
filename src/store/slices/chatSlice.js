import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    conversations: [],
    activeConversationId: null,
    unreadCount: 0,
  },
  reducers: {
    setConversations(state, action) {
      state.conversations = action.payload;
    },
    setActiveConversation(state, action) {
      state.activeConversationId = action.payload;
    },
    setUnreadCount(state, action) {
      state.unreadCount = action.payload;
    },
  },
});

export const { setConversations, setActiveConversation, setUnreadCount } = chatSlice.actions;
export default chatSlice.reducer;




