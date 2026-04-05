import { FormSubmitButton } from '@/app/components/form-submit-button';
import { signupCompany } from './actions';

export default function SignupCompanyPage({
  searchParams
}: {
  searchParams?: { error?: string; field?: 'companyName' | 'orgNumber' | 'adminName' | 'adminEmail' | 'password' };
}) {
  const fieldError = searchParams?.error ? searchParams.field : undefined;

  return (
    <section id="opprett-bedrift" className="mx-auto max-w-xl space-y-6 rounded-xl border bg-white p-6">
      <div>
        <h1 className="text-2xl font-bold">Opprett bedrift</h1>
        <p className="text-sm text-slate-600">Registrer ny bedrift og første adminbruker.</p>
      </div>

      {searchParams?.error && !fieldError && (
        <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{searchParams.error}</p>
      )}

      <form action={signupCompany} className="space-y-4">
        <label className="block text-sm font-medium text-slate-800">
          Bedriftsnavn
          <input
            type="text"
            name="companyName"
            required
            autoFocus
            className="mt-1 w-full rounded-md border px-3 py-2"
            placeholder="Eks. Fjell Anlegg AS"
          />
          {fieldError === 'companyName' && <span className="mt-1 block text-xs font-normal text-red-700">{searchParams?.error}</span>}
        </label>

        <label className="block text-sm font-medium text-slate-800">
          Organisasjonsnummer (valgfritt)
          <input
            type="text"
            name="orgNumber"
            className="mt-1 w-full rounded-md border px-3 py-2"
            placeholder="9 siffer"
          />
          {fieldError === 'orgNumber' && <span className="mt-1 block text-xs font-normal text-red-700">{searchParams?.error}</span>}
        </label>

        <label className="block text-sm font-medium text-slate-800">
          Admin navn
          <input type="text" name="adminName" required className="mt-1 w-full rounded-md border px-3 py-2" placeholder="Eks. Ola Nordmann" />
          {fieldError === 'adminName' && <span className="mt-1 block text-xs font-normal text-red-700">{searchParams?.error}</span>}
        </label>

        <label className="block text-sm font-medium text-slate-800">
          Admin e-post
          <input
            type="email"
            name="adminEmail"
            autoComplete="email"
            required
            className="mt-1 w-full rounded-md border px-3 py-2"
            placeholder="ola@firma.no"
          />
          {fieldError === 'adminEmail' && <span className="mt-1 block text-xs font-normal text-red-700">{searchParams?.error}</span>}
        </label>

        <label className="block text-sm font-medium text-slate-800">
          Passord
          <input
            type="password"
            name="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="mt-1 w-full rounded-md border px-3 py-2"
            placeholder="Minst 8 tegn"
          />
          {fieldError === 'password' && <span className="mt-1 block text-xs font-normal text-red-700">{searchParams?.error}</span>}
        </label>

        <FormSubmitButton
          idleText="Opprett bedrift og admin"
          pendingText="Oppretter bedrift…"
          className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        />
      </form>
    </section>
  );
}
