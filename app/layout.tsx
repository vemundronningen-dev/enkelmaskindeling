import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
import { getCurrentUser } from '@/lib/auth';
import { logout } from '@/app/login/actions';

export const metadata: Metadata = {
  title: 'Maskinoversikt',
  description: 'Admin og maskinoversikt med hierarki'
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();
  const menu = user
    ? [
        { href: '/machines', label: 'Maskiner' },
        { href: '/available', label: 'Ledige maskiner' },
        { href: '/users', label: 'Brukere' },
        { href: '/projects', label: 'Prosjekter' },
        { href: '/admin', label: 'Admin' }
      ]
    : [];

  return (
    <html lang="no">
      <body>
        <header className="border-b bg-white">
          <nav className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-4">
            <span className="text-lg font-semibold">Maskinoversikt</span>
            <div className="ml-auto flex items-center gap-2">
              {menu.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-md border border-slate-200 px-3 py-1.5 text-sm hover:bg-slate-100"
                >
                  {item.label}
                </Link>
              ))}
              {user ? (
                <form action={logout}>
                  <button className="rounded-md border border-slate-200 px-3 py-1.5 text-sm hover:bg-slate-100">Logg ut</button>
                </form>
              ) : (
                <Link href="/login" className="rounded-md border border-slate-200 px-3 py-1.5 text-sm hover:bg-slate-100">
                  Logg inn
                </Link>
              )}
            </div>
          </nav>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
