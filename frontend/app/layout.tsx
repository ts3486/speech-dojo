import '../src/index.css';
import { Providers } from './providers';
import { Shell } from './shell';

export const metadata = {
  title: 'Speech Dojo',
  description: 'Practice your speech and share socially',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Lexend:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>
          <a href="#main" className="skip-link">
            Skip to main content
          </a>
          <div className="app-header-wrapper">
            <Shell />
          </div>
          <div className="app-shell">
            <main id="main" role="main">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
