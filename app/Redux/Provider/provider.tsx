// app/Redux/Provider/provider.tsx
"use client";

import { Provider } from "react-redux";
import { store, persistor } from "@/app/Redux/Store/store";
import { PersistGate } from "redux-persist/integration/react";

interface ReduxProviderProps {
  children: React.ReactNode;
}

export function Providers({ children }: ReduxProviderProps) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}
