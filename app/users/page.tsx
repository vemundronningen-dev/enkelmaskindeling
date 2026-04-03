import { prisma } from '@/lib/prisma';
import { ensureDatabaseSetup } from '@/lib/db-init';
import { createUser, updateUser } from './actions';
export const dynamic = 'force-dynamic';

type UsersPageProps = {
  searchParams?: {
    edit?: string;
  };
};

export default async function UsersPage({ searchParams }: UsersPageProps) {
  await ensureDatabaseSetup();
  const editId = searchParams?.edit;

  const users = await prisma.user.findMany({
    include: {
      machines: {
        orderBy: { machineNumber: 'asc' }
      }
    },
    orderBy: { name: 'asc' }
  });
  const userToEdit = users.find((user) => user.id === editId);

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">Brukere</h1>
      <div className="rounded-xl border bg-white p-4">
        <h2 className="mb-3 text-lg font-semibold">Opprett bruker</h2>
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
              required
            />
          </label>
          <div className="md:col-span-2">
            <button type="submit" className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">
              Opprett bruker
            </button>
          </div>
        </form>
      </div>
      {userToEdit && (
        <div className="rounded-xl border bg-white p-4">
          <h2 className="mb-3 text-lg font-semibold">Rediger bruker: {userToEdit.name}</h2>
          <form action={updateUser} className="grid gap-3 md:grid-cols-2">
            <input type="hidden" name="userId" value={userToEdit.id} />
            <label className="text-sm font-medium">
              Navn
              <input
                name="name"
                defaultValue={userToEdit.name}
                className="mt-1 w-full rounded-md border px-3 py-2"
                required
              />
            </label>
            <label className="text-sm font-medium">
              E-post
              <input
                type="email"
                name="email"
                defaultValue={userToEdit.email}
                className="mt-1 w-full rounded-md border px-3 py-2"
                required
              />
            </label>
            <label className="text-sm font-medium">
              Telefonnummer
              <input
                type="tel"
                name="phone"
                defaultValue={userToEdit.phone ?? ''}
                className="mt-1 w-full rounded-md border px-3 py-2"
                required
              />
            </label>
            <div className="md:col-span-2">
              <button type="submit" className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">
                Lagre endringer
              </button>
            </div>
          </form>
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        {users.map((user) => (
          <article key={user.id} className="rounded-xl border bg-white p-4">
            <h2 className="text-lg font-semibold">{user.name}</h2>
            <p className="text-sm text-slate-600">{user.email}</p>
            <p className="text-sm text-slate-600">{user.phone ?? 'Telefonnummer mangler'}</p>
            <div className="mt-3">
              <a href={`/users?edit=${user.id}`} className="rounded-md border px-2 py-1 text-sm hover:bg-slate-100">
                Rediger bruker
              </a>
            </div>
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
