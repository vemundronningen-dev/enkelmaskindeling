import { prisma } from '@/lib/prisma';
import { ensureDatabaseSetup } from '@/lib/db-init';
import { createUser } from './actions';
import { requireUser } from '@/lib/auth';
import { FormSubmitButton } from '@/app/components/form-submit-button';
import { UserCard } from './user-card';

export const dynamic = 'force-dynamic';

export default async function UsersPage({
  searchParams
}: {
  searchParams?: { error?: string; success?: string; field?: 'name' | 'email' | 'password' };
}) {
  await ensureDatabaseSetup();
  const currentUser = await requireUser();

  const users = await prisma.user.findMany({
    where: { companyId: currentUser.companyId },
    include: {
      company: true,
      department: true,
      machines: {
        where: { companyId: currentUser.companyId },
        orderBy: { machineNumber: 'asc' }
      }
    },
    orderBy: { name: 'asc' }
  });

  const fieldError = searchParams?.error ? searchParams.field : undefined;

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">Brukere</h1>
      {searchParams?.error && !fieldError && (
        <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{searchParams.error}</p>
      )}
      {searchParams?.success && (
        <p
          role="status"
          aria-live="polite"
          className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700"
        >
          {searchParams.success}
        </p>
      )}
      <div id="opprett-bruker" className="rounded-xl border bg-white p-5">
        <div className="mb-4 space-y-1">
          <h2 className="text-lg font-semibold">Opprett ny bruker</h2>
          <p className="text-sm text-slate-600">Fyll inn tre felt, så er brukeren klar på få sekunder.</p>
        </div>
        <form action={createUser} className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium text-slate-800">
            Fullt navn
            <input name="name" autoFocus className="mt-1 w-full rounded-md border px-3 py-2" placeholder="Eks. Ola Nordmann" required />
            {fieldError === 'name' && <span className="mt-1 block text-xs font-normal text-red-700">{searchParams?.error}</span>}
          </label>
          <label className="text-sm font-medium text-slate-800">
            E-post
            <input
              type="email"
              name="email"
              autoComplete="email"
              className="mt-1 w-full rounded-md border px-3 py-2"
              placeholder="navn@firma.no"
              required
            />
            {fieldError === 'email' && <span className="mt-1 block text-xs font-normal text-red-700">{searchParams?.error}</span>}
          </label>
          <label className="text-sm font-medium text-slate-800">
            Midlertidig passord
            <input
              type="password"
              name="password"
              autoComplete="new-password"
              minLength={8}
              className="mt-1 w-full rounded-md border px-3 py-2"
              placeholder="Minst 8 tegn"
              required
            />
            {fieldError === 'password' && (
              <span className="mt-1 block text-xs font-normal text-red-700">{searchParams?.error}</span>
            )}
          </label>
          <label className="text-sm font-medium text-slate-800">
            Rolle
            <select name="role" defaultValue="USER" className="mt-1 w-full rounded-md border px-3 py-2">
              <option value="USER">Standardbruker</option>
              <option value="ADMIN">Administrator</option>
            </select>
            <span className="mt-1 block text-xs font-normal text-slate-500">Tips: La denne stå på Standardbruker i de fleste tilfeller.</span>
          </label>
          <div className="md:col-span-2">
            <FormSubmitButton
              idleText="Opprett bruker"
              pendingText="Oppretter bruker…"
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            />
          </div>
        </form>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {users.length === 0 && (
          <p className="md:col-span-2 rounded-md border border-dashed p-4 text-sm text-slate-600">
            Ingen brukere enda. Opprett første bruker over for å komme i gang.
          </p>
        )}
        {users.map((user) => (
          <UserCard key={user.id} user={user} currentUserId={currentUser.id} currentUserRole={currentUser.role} />
        ))}
      </div>
    </section>
  );
}
