'use client';

import dynamic from 'next/dynamic';

const SpaApp = dynamic(() => import('../src/App'), { ssr: false });

export default function CatchAllPage() {
  return <SpaApp />;
}
