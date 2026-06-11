import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    conversations: [],
    activeConversationId: null,
    unreadCount: 0,
    unreadTotal: 0, // total unread messages across all conversations
    typingUsers: {}, // { conversationId: Set/Array of userIds }
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
    setUnreadTotal(state, action) {
      state.unreadTotal = action.payload;
    },
    setTyping(state, action) {
      const { conversationId, userId, isTyping } = action.payload;
      if (!state.typingUsers[conversationId]) {
        state.typingUsers[conversationId] = [];
      }
      const users = state.typingUsers[conversationId];
      if (isTyping && !users.includes(userId)) {
        users.push(userId);
      } else if (!isTyping) {
        state.typingUsers[conversationId] = users.filter(id => id !== userId);
      }
    },
  },
});

export const { setConversations, setActiveConversation, setUnreadCount, setUnreadTotal, setTyping } = chatSlice.actions;
export default chatSlice.reducer;





