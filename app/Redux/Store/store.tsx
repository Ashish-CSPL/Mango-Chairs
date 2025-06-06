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

// --- Ensure these imports are present ---
import authReducer from "../Slices/authSlice";
import cartReducer from "../Store/cartSlice";
import wishlistReducer from "../Slices/wishlistSlice"; // <--- ADD THIS IMPORT

import forgotPasswordReducer from "../Slices/forgotPasswordSlice";
import addressReducer from "../Slices/addressSlice";
import orderReducer from "../Slices/orderSlice";

// --- Ensure wishlist is included in combineReducers ---
const rootReducer = combineReducers({
  auth: authReducer,
  cart: cartReducer,
  wishlist: wishlistReducer, // <--- ADD THIS LINE
  forgotPassword: forgotPasswordReducer,
  address: addressReducer,
  order: orderReducer,
});

const persistConfig = {
  key: "root",
  version: 1,
  storage,
  // IMPORTANT: Ensure 'wishlist' is in the whitelist if you want it to persist
  // If you don't want it to persist, keep it out of the whitelist.
  // Example: whitelist: ["auth", "cart", "wishlist"],
  whitelist: ["auth", "cart", "wishlist"], // <--- ADD 'wishlist' HERE IF YOU WANT IT PERSISTED
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

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
