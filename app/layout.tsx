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
  const appMenu = user
    ? [
        { href: '/machines', label: 'Maskiner' },
        { href: '/available', label: 'Ledige maskiner' },
        { href: '/users', label: 'Brukere' },
        { href: '/projects', label: 'Prosjekter' },
        { href: '/admin', label: 'Admin' }
      ]
    : [];
  const publicMenu = [
    { href: '/#funksjoner', label: 'Funksjoner' },
    { href: '/#hvorfor-oss', label: 'Hvorfor oss' },
    { href: '/admin', label: 'Opprett bedrift' },
    { href: '/users', label: 'Registrer bruker' }
  ];

  return (
    <html lang="no">
      <body>
        <header className="border-b bg-white">
          <nav className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-4">
            <Link href="/" className="text-lg font-semibold text-slate-900">
              maskindeling.no
            </Link>
            <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
              {user ? 'Innlogget app' : 'Offentlig nettside'}
            </span>

            <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
              {(user ? appMenu : publicMenu).map((item) => (
                <Link key={item.href} href={item.href} className="rounded-md border border-slate-200 px-3 py-1.5 text-sm hover:bg-slate-100">
                  {item.label}
                </Link>
              ))}

              {user ? (
                <>
                  <Link href="/" className="rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm text-blue-700 hover:bg-blue-100">
                    Til nettsiden
                  </Link>
                  <form action={logout}>
                    <button className="rounded-md border border-slate-200 px-3 py-1.5 text-sm hover:bg-slate-100">Logg ut</button>
                  </form>
                </>
              ) : (
                <Link href="/login" className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700">
                  Logg inn
                </Link>
              )}
            </div>
          </nav>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
        <footer className="border-t bg-white">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-semibold text-slate-900">maskindeling.no</p>
              <p>Offentlig nettside for informasjon • Innlogget app for daglig drift.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/#funksjoner" className="hover:text-slate-900">
                Funksjoner
              </Link>
              <Link href="/#hvorfor-oss" className="hover:text-slate-900">
                Hvorfor oss
              </Link>
              <Link href="/login" className="hover:text-slate-900">
                Logg inn
              </Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
