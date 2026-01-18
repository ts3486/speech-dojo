'use client';

import type { AppProps } from 'next/app';
import { QueryProvider } from '../src/providers/queryClient';
import '../src/index.css';

export default function CustomApp({ Component, pageProps }: AppProps) {
  return (
    <QueryProvider>
      <Component {...pageProps} />
    </QueryProvider>
  );
}
