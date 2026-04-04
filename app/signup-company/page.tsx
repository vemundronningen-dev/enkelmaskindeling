import { signupCompany } from './actions';

export default function SignupCompanyPage({
  searchParams
}: {
  searchParams?: { error?: string };
}) {
  return (
    <section className="mx-auto max-w-xl space-y-6 rounded-xl border bg-white p-6">
      <div>
        <h1 className="text-2xl font-bold">Opprett bedrift</h1>
        <p className="text-sm text-slate-600">Registrer ny bedrift og første adminbruker.</p>
      </div>

      {searchParams?.error && <p className="rounded-md bg-red-50 p-2 text-sm text-red-700">{searchParams.error}</p>}

      <form action={signupCompany} className="space-y-3">
        <label className="block text-sm font-medium">
          Bedriftsnavn
          <input type="text" name="companyName" required className="mt-1 w-full rounded-md border px-3 py-2" />
        </label>

        <label className="block text-sm font-medium">
          Organisasjonsnummer (valgfritt)
          <input type="text" name="orgNumber" className="mt-1 w-full rounded-md border px-3 py-2" />
        </label>

        <label className="block text-sm font-medium">
          Admin navn
          <input type="text" name="adminName" required className="mt-1 w-full rounded-md border px-3 py-2" />
        </label>

        <label className="block text-sm font-medium">
          Admin e-post
          <input type="email" name="adminEmail" required className="mt-1 w-full rounded-md border px-3 py-2" />
        </label>

        <label className="block text-sm font-medium">
          Passord
          <input type="password" name="password" required className="mt-1 w-full rounded-md border px-3 py-2" />
        </label>

        <button type="submit" className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">
          Opprett bedrift og admin
        </button>
      </form>
    </section>
  );
}
