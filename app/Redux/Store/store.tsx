// app/Redux/Store/store.ts
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import cartReducer from "./cartSlice";
import authReducer from "../Slices/authSlice"; // Import your new auth slice

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

// Configuration for redux-persist
const persistConfig = {
  key: "root",
  storage,
  // Only persist the 'cart' and 'auth' slices
  whitelist: ["cart", "auth"],
};

const appReducer = combineReducers({
  cart: cartReducer,
  auth: authReducer, // Add the auth reducer here
});

const rootReducer = appReducer;

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

export const persistor = persistStore(store, {}, () => {
  console.log("STORE: Redux-Persist rehydration complete.");
  console.log(
    "STORE: Current cart state after rehydration:",
    store.getState().cart
  );
  console.log(
    "STORE: Current auth state after rehydration:",
    store.getState().auth
  );
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
