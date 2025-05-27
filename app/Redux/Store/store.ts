// src/app/Redux/Store/store.ts
import { configureStore } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web

// Import your auth slice reducer
import authReducer from './authSlice';

// 🚨 You need to import your cart slice reducer here 🚨
import cartReducer from './cartSlice'; // Assuming your cart slice is in cartSlice.ts

// Configuration for redux-persist for the 'auth' slice
const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['someAuthDataToPersist'], // Adjust if you want to persist specific auth state parts
};

// Configuration for redux-persist for the 'cart' slice (optional, but common)
const cartPersistConfig = {
  key: 'cart',
  storage,
  whitelist: ['cartItems', 'cartCount'], // Persist these parts of your cart state
};

// Create persisted reducers for slices you want to persist
const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);
const persistedCartReducer = persistReducer(cartPersistConfig, cartReducer); // Create persisted cart reducer

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer, // Use the persisted auth reducer
    cart: persistedCartReducer, // 🚨 Include your persisted cart reducer here 🚨
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// This will now correctly infer:
// { auth: AuthState & PersistPartial, cart: CartState & PersistPartial }

export type AppDispatch = typeof store.dispatch;

export const persistor = persistStore(store);