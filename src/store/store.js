import { configureStore, combineReducers } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import chatReducer from "./slices/chatSlice";
import checkoutReducer from "./slices/checkoutSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  chat: chatReducer,
  checkout: checkoutReducer,
});

export const store = configureStore({
  reducer: rootReducer,
});

