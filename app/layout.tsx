import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'Maskinoversikt',
  description: 'En enkel app for maskiner og ansvarlige brukere'
};

const menu = [
  { href: '/machines', label: 'Maskiner' },
  { href: '/available', label: 'Ledige maskiner' },
  { href: '/users', label: 'Brukere' },
  { href: '/projects', label: 'Prosjekter' }
];

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="no">
      <body>
        <header className="border-b bg-white">
          <nav className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-4">
            <span className="text-lg font-semibold">Maskinoversikt</span>
            <div className="ml-auto flex gap-2">
              {menu.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-md border border-slate-200 px-3 py-1.5 text-sm hover:bg-slate-100"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
