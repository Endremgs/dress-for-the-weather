import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Kle deg riktig',
  description: 'Kledningsanbefalinger basert på lokalt vær og aktivitet',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nb">
      <body className="min-h-screen bg-slate-50 dark:bg-slate-900">
        {children}
      </body>
    </html>
  );
}
