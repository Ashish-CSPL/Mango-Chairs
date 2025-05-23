// /Redux/Provider/provider.tsx
"use client";

import { ReactNode } from "react";
import { Provider } from "react-redux";
import { store, persistor } from "../Store/store";
import { PersistGate } from "redux-persist/integration/react";

export default function ReduxProvider({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}
