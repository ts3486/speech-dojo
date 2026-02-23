'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Shell() {
  const path = usePathname();
  const isSession = path === '/session';
  const isHistory = path === '/history' || path.startsWith('/sessions');
  const isSocial = path === '/social' || path.startsWith('/social/');

  return (
    <header className="app-header">
      <div className="brand">
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
          <rect x="8" y="1" width="6" height="12" rx="3" fill="currentColor" />
          <path d="M3 10a8 8 0 0 0 16 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
          <line x1="11" y1="18" x2="11" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <line x1="7" y1="21" x2="15" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        Speech <span>Dojo</span>
      </div>
      <nav className="nav" aria-label="Primary">
        <Link href="/" aria-current={path === '/' ? 'page' : undefined}>
          Home
        </Link>
        <Link href="/session" aria-current={isSession ? 'page' : undefined}>
          Session
        </Link>
        <Link href="/history" aria-current={isHistory ? 'page' : undefined}>
          History
        </Link>
        <Link href="/social" aria-current={isSocial ? 'page' : undefined}>
          Social Hub
        </Link>
      </nav>
    </header>
  );
}
