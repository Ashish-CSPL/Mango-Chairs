// app/Redux/Store/store.ts
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";

// Import your reducers
import authReducer from "../Slices/authSlice"; // Assuming you have an authSlice
import cartReducer from "../Store/cartSlice"; // Assuming this is correct path for cartSlice
import wishlistReducer from "../Slices/wishlistSlice"; // <--- IMPORT WISHLIST REDUCER

// Combine your reducers
const rootReducer = combineReducers({
  auth: authReducer,
  cart: cartReducer,
  wishlist: wishlistReducer, // <--- ADD WISHLIST REDUCER HERE
  // Add other reducers if you have them, e.g.:
  // address: addressReducer,
  // order: orderReducer,
  // forgotPassword: forgotPasswordReducer,
});

// Redux Persist configuration
const persistConfig = {
  key: "root",
  version: 1,
  storage,
  whitelist: ["auth", "cart", "wishlist"], // <--- IMPORTANT: Whitelist 'wishlist' to persist its state
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

// Define RootState and AppDispatch types
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
