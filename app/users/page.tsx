import { prisma } from '@/lib/prisma';
import { createUser } from './actions';
export const dynamic = 'force-dynamic';

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    include: {
      machines: {
        orderBy: { machineNumber: 'asc' }
      }
    },
    orderBy: { name: 'asc' }
  });

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
