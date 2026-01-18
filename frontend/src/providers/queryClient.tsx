'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';

const createClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        retry: 1
      }
    }
  });

export function QueryProvider({ children }: { children: ReactNode }) {
  // Ensure a stable client per browser session
  const [client] = useState(() => createClient());
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
