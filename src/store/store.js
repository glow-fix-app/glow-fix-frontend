import { configureStore, combineReducers } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import chatReducer from "./slices/chatSlice";
import notificationReducer from "./slices/notificationSlice";
import checkoutReducer from "./slices/checkoutSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  chat: chatReducer,
  notifications: notificationReducer,
  checkout: checkoutReducer,
});

export const store = configureStore({
  reducer: rootReducer,
});

