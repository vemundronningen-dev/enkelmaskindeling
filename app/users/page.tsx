export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';

export default async function UsersPage() {
  let users: {
    id: string;
    name: string;
    email: string;
    machines: { id: string; machineNumber: string; brand: string; model: string; serialNumber: string | null }[];
  }[] = [];
  let dbError: string | null = null;

  try {
    users = await prisma.user.findMany({
      include: {
        machines: {
          orderBy: { machineNumber: 'asc' }
        }
      },
      orderBy: { name: 'asc' }
    });
  } catch {
    dbError = 'Databasen er ikke klar ennå. Kjør /api/setup én gang, og last siden på nytt.';
  }

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">Brukere</h1>

      {dbError && <p className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">{dbError}</p>}

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
                      {machine.machineNumber} - {machine.brand} {machine.model} ({machine.serialNumber ?? 'uten serienummer'})
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

      {users.length === 0 && !dbError && (
        <p className="rounded-md border bg-white p-3 text-sm text-slate-600">Ingen brukere funnet.</p>
      )}
    </section>
  );
}
