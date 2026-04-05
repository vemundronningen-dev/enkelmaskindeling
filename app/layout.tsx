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
    { href: '/#slik-fungerer-det', label: 'Slik fungerer det' },
    { href: '/#for-hvem', label: 'For hvem' },
    { href: '/#fra-kaos-til-kontroll', label: 'Fra kaos til kontroll' },
    { href: '/signup-company', label: 'Opprett bedrift' },
    { href: '/login', label: 'Logg inn' }
  ];

  return (
    <html lang="no">
      <body>
        <header className="border-b bg-white">
          <nav className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-4">
            <Link href="/" className="text-lg font-semibold text-slate-900">
              maskindeling.no
            </Link>

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
                <Link
                  href="/signup-company"
                  className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700"
                >
                  Opprett bedrift
                </Link>
              )}
            </div>
          </nav>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
        <footer className="border-t bg-white">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-semibold text-slate-900">Maskindeling.no (Undervogn AS)</p>
              <p>Ødegårds vei 9</p>
              <p>1470 Lørenskog</p>
              <p className="mt-2">Tlf: +47 469 12 005</p>
              <p>E-post: post@undervogn.no</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/#funksjoner" className="hover:text-slate-900">
                Funksjoner
              </Link>
              <Link href="/#slik-fungerer-det" className="hover:text-slate-900">
                Slik fungerer det
              </Link>
              <Link href="/#for-hvem" className="hover:text-slate-900">
                For hvem
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
