"use client";

import React from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "@/store/store";

/**
 * Redux + Persist provider.
 * PersistGate delays rendering until the auth slice is rehydrated from localStorage.
 * This prevents a flash of unauthenticated UI on page refresh.
 */
export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}
