// app/Redux/Store/store.ts
import { configureStore, combineReducers } from '@reduxjs/toolkit';
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

// Import your reducers
import cartReducer from '../Store/cartSlice';
import authReducer from '../Store/authSlice'; // Ensure this is imported

const rootReducer = combineReducers({
  cart: cartReducer,
  auth: authReducer, // This would have been present even in a simpler auth setup
});

const persistConfig = {
  key: 'root', // The key for the persist storage
  storage,
  whitelist: ['cart'], // Adjust if 'auth' was previously whitelisted or not
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