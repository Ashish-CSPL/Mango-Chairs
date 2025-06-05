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
import authReducer from "../Slices/authSlice";
import cartReducer from "../Store/cartSlice"; // <-- Assuming this path is correct
import wishlistReducer from "../Slices/wishlistSlice";
import forgotPasswordReducer from "../Slices/forgotPasswordSlice";
import addressReducer from "../Slices/addressSlice"; // <--- ADD THIS IMPORT
import orderReducer from "../Slices/orderSlice"; // <--- ADD THIS IMPORT

// Combine your reducers
const rootReducer = combineReducers({
  auth: authReducer,
  cart: cartReducer,
  wishlist: wishlistReducer,
  forgotPassword: forgotPasswordReducer,
  address: addressReducer, // <--- ADD THIS LINE
  order: orderReducer, // <--- ADD THIS LINE
});

// Redux Persist configuration
const persistConfig = {
  key: "root",
  version: 1,
  storage,
  // IMPORTANT: Do NOT persist forgotPassword, address, or order slices as they should reset or be fetched dynamically
  whitelist: ["auth", "cart", "wishlist"],
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
