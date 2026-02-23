'use client';

import { QueryProvider } from '../src/providers/queryClient';
import { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return <QueryProvider>{children}</QueryProvider>;
}
