"use client";

import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { setupStore } from "@/lib/store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  const [{ store, persistor }] = useState(() => setupStore());
  const [queryClient] = useState(() => new QueryClient());

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </PersistGate>
    </Provider>
  );
}
