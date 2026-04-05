import { getCurrentUser } from '@/lib/auth';
import { login } from './actions';
import { redirect } from 'next/navigation';
import { FormSubmitButton } from '@/app/components/form-submit-button';

export default async function LoginPage({
  searchParams
}: {
  searchParams?: { error?: string; success?: string };
}) {
  const user = await getCurrentUser();

  if (user) {
    redirect('/machines');
  }

  return (
    <section className="mx-auto max-w-md space-y-6 rounded-xl border bg-white p-6">
      <div>
        <h1 className="text-2xl font-bold">Logg inn</h1>
        <p className="text-sm text-slate-600">Logg inn med e-post og passord for å se dataene til din bedrift.</p>
      </div>
      {searchParams?.error && <p className="rounded-md bg-red-50 p-2 text-sm text-red-700">{searchParams.error}</p>}
      {searchParams?.success && <p className="rounded-md bg-emerald-50 p-2 text-sm text-emerald-700">{searchParams.success}</p>}
      <form action={login} className="space-y-3">
        <label className="block text-sm font-medium">
          E-post
          <input type="email" name="email" required className="mt-1 w-full rounded-md border px-3 py-2" />
        </label>
        <label className="block text-sm font-medium">
          Passord
          <input type="password" name="password" required className="mt-1 w-full rounded-md border px-3 py-2" />
        </label>
        <FormSubmitButton
          idleText="Logg inn"
          pendingText="Logger inn..."
          className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
        />
      </form>
    </section>
  );
}
