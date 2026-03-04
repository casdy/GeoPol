'use client';

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, ReactNode } from "react";
import { DeviceProvider } from "@/lib/DeviceContext";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <DeviceProvider>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </DeviceProvider>
  );
}
