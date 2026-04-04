import { prisma } from '@/lib/prisma';
import { ensureDatabaseSetup } from '@/lib/db-init';
import { createUser } from './actions';
import { requireUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function UsersPage({
  searchParams
}: {
  searchParams?: { error?: string; success?: string };
}) {
  await ensureDatabaseSetup();
  const currentUser = await requireUser();

  const users = await prisma.user.findMany({
    where: { companyId: currentUser.companyId },
    include: {
      company: true,
      department: true,
      machines: {
        orderBy: { machineNumber: 'asc' }
      }
    },
    orderBy: { name: 'asc' }
  });

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">Brukere</h1>
      {searchParams?.error && <p className="rounded-md bg-red-50 p-2 text-sm text-red-700">{searchParams.error}</p>}
      {searchParams?.success && <p className="rounded-md bg-green-50 p-2 text-sm text-green-700">{searchParams.success}</p>}
      <div className="rounded-xl border bg-white p-4">
        <h2 className="mb-3 text-lg font-semibold">Opprett enkel bruker</h2>
        <form action={createUser} className="grid gap-3 md:grid-cols-2">
          <label className="text-sm font-medium">
            Navn
            <input name="name" className="mt-1 w-full rounded-md border px-3 py-2" placeholder="Eks. Ola Nordmann" required />
          </label>
          <label className="text-sm font-medium">
            E-post
            <input
              type="email"
              name="email"
              className="mt-1 w-full rounded-md border px-3 py-2"
              placeholder="ola@firma.no"
              required
            />
          </label>
          <label className="text-sm font-medium">
            Telefonnummer
            <input
              type="tel"
              name="phone"
              className="mt-1 w-full rounded-md border px-3 py-2"
              placeholder="Eks. +47 900 00 000"
            />
          </label>
          <label className="text-sm font-medium">
            Midlertidig passord
            <input
              type="text"
              name="password"
              className="mt-1 w-full rounded-md border px-3 py-2"
              placeholder="Eks. Passord123!"
            />
          </label>
          <div className="md:col-span-2">
            <button type="submit" className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">
              Opprett bruker
            </button>
          </div>
        </form>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {users.map((user) => (
          <article key={user.id} className="rounded-xl border bg-white p-4">
            <h2 className="text-lg font-semibold">{user.name}</h2>
            <p className="text-sm text-slate-600">{user.email}</p>
            <p className="text-sm text-slate-600">Rolle: {user.role}</p>
            <p className="text-sm text-slate-600">
              {user.company?.name ?? 'Ingen bedrift'} {user.department ? `· ${user.department.name}` : ''}
            </p>
            <div className="mt-3">
              <h3 className="text-sm font-medium">Ansvarlige maskiner</h3>
              {user.machines.length > 0 ? (
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                  {user.machines.map((machine) => (
                    <li key={machine.id}>
                      {machine.name} ({machine.machineNumber})
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-slate-500">Ingen maskiner tildelt.</p>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
