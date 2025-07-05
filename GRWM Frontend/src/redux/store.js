import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { combineReducers } from "redux";
import userReducer from "./auth/userSlice";
import cartReducer from "./slices/cartSlice";
import wishlistReducer from "./slices/wishlistSlice";
import modalReducer from "./slices/modalSlice";
import notificationsReducer from "./slices/notificationSlice";
import achievementsReducer from "./slices/achievementSlice";

// Redux Persist Config for user
const persistConfig = {
  key: "user",
  storage,
  whitelist: [],
};

// Persisted user reducer
const persistedUserReducer = persistReducer(persistConfig, userReducer);

// Root reducer
const rootReducer = combineReducers({
  user: persistedUserReducer,
  cart: cartReducer,
  wishlist: wishlistReducer,
  modal: modalReducer,
  notifications: notificationsReducer,
  achievements: achievementsReducer,
});

// Configure store
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST"],
      },
    }),
});

// Create persistor
export const persistor = persistStore(store);
