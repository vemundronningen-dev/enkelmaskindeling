export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';

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
