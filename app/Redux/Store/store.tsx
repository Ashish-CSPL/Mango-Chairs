// app/Redux/Store/store.ts
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import cartReducer from "./cartSlice";

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

// Import the specific logout action from your authSlice
import { logout } from "./authSlice";

// Configuration for redux-persist
const persistConfig = {
  key: "root", // This is the key under which the state is stored in localStorage
  storage,
  whitelist: ["auth"], // Only persist the 'auth' slice
};

// Create an 'appReducer' that combines all your slices.
// This is the reducer that holds your actual application state logic.
const appReducer = combineReducers({
  auth: authReducer,
  cart: cartReducer,
});

// Create a 'rootReducer' wrapper that handles the logout action.
// When the 'logout' action is dispatched, this reducer will:
// 1. Explicitly remove the persisted state from localStorage.
// 2. Reset the Redux state to undefined, which makes all sub-reducers return their initial state.
const rootReducer = (state: any, action: any) => {
  console.log("STORE: rootReducer received action:", action.type);
  console.log("STORE: Expected logout type:", logout.type);

  // If the dispatched action type matches our logout action's type
  if (action.type === logout.type) {
    console.log("STORE: --- LOGOUT ACTION DETECTED! ---");
    // Explicitly remove the persisted data for the 'root' key
    // This is asynchronous, but the state reset happens synchronously.
    storage
      .removeItem("persist:root")
      .then(() => {
        console.log(
          "STORE: Successfully removed 'persist:root' from localStorage."
        );
      })
      .catch((error) => {
        console.error(
          "STORE: Error removing 'persist:root' from localStorage:",
          error
        );
      });

    // Reset the entire Redux state to undefined.
    // This tells combineReducers to re-initialize all slices to their initialState.
    state = undefined;
    console.log(
      "STORE: Redux state successfully reset to undefined by rootReducer."
    );
  }
  // Call the original appReducer with the (potentially reset) state and the action
  return appReducer(state, action);
};

// Create a persisted reducer using the new rootReducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer, // Use the persisted reducer here
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // Configure serializableCheck to ignore redux-persist actions
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

// Create a persistor
export const persistor = persistStore(store, {}, () => {
  console.log("STORE: Redux-Persist rehydration complete.");
  // Log the user state after rehydration to confirm it's null after logout
  console.log(
    "STORE: Current user state after rehydration:",
    store.getState().auth.user
  );
});

// Define RootState and AppDispatch types for better type safety
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
