import Link from 'next/link';

const valuePoints = [
  'Full oversikt over maskiner på tvers av prosjekter',
  'Se hvilke maskiner som er ledige akkurat nå',
  'Tydelig ansvarlig per maskin og prosjekt',
  'Mindre kaos, færre telefoner og raskere beslutninger',
  'Bedre kontroll på prosjekter, brukere og utstyr',
  'Skalerbart for flere avdelinger, selskaper og prosjekter'
];

const features = [
  {
    title: 'Maskinoversikt',
    text: 'Samle alt utstyr i én strukturert oversikt med status, prosjekt og ansvarlig bruker.'
  },
  {
    title: 'Prosjektoversikt',
    text: 'Se hvilke maskiner som er knyttet til hvert prosjekt og få bedre planlegging i hverdagen.'
  },
  {
    title: 'Ansvarlig bruker',
    text: 'Alle maskiner har tydelig eierskap, så hele organisasjonen vet hvem som følger opp hva.'
  },
  {
    title: 'Ledige maskiner',
    text: 'Finn tilgjengelig utstyr på sekunder og utnytt maskinparken mer effektivt.'
  },
  {
    title: 'Admin per bedrift',
    text: 'Hver bedrift kan ha egne administratorer med kontroll på brukere, prosjekter og tilgang.'
  },
  {
    title: 'Enkel oppstart',
    text: 'Kom raskt i gang med et ryddig oppsett som fungerer både for små team og store konsern.'
  }
];

export default function Home() {
  return (
    <div className="space-y-16 py-8 md:py-12">
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-blue-100 p-8 shadow-sm md:p-12">
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-blue-200/40 blur-3xl" aria-hidden="true" />
        <div className="absolute -bottom-16 -left-10 h-56 w-56 rounded-full bg-indigo-200/40 blur-3xl" aria-hidden="true" />
        <div className="relative max-w-3xl space-y-6">
          <span className="inline-flex rounded-full border border-blue-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
            B2B SaaS for maskindeling
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-5xl">
            Få kontroll på maskiner, prosjekter og brukere i hele organisasjonen.
          </h1>
          <p className="text-base leading-relaxed text-slate-700 md:text-lg">
            maskindeling.no gir store organisasjoner én felles plattform for å administrere utstyr på tvers av avdelinger
            og prosjekter. Resultatet er bedre oversikt, mindre manuelt arbeid og raskere drift.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/login"
              className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Prøv gratis
            </Link>
            <Link
              href="/admin"
              className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              Opprett bedrift
            </Link>
          </div>
        </div>
      </section>

      <section id="hvorfor-oss" className="space-y-6 scroll-mt-24">
        <div className="max-w-3xl space-y-3">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">Hvorfor velge maskindeling.no?</h2>
          <p className="text-slate-600">
            Bygget for virksomheter som håndterer mange maskiner og mange samtidige prosjekter.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {valuePoints.map((point) => (
            <div key={point} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <span className="mt-1 inline-flex h-5 w-5 flex-none items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                ✓
              </span>
              <p className="text-sm text-slate-700 md:text-base">{point}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="funksjoner" className="space-y-6 scroll-mt-24">
        <div className="max-w-3xl space-y-3">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">Funksjoner som gir flyt i hverdagen</h2>
          <p className="text-slate-600">Enkelt grensesnitt, tydelige roller og kontroll i alle ledd.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <article key={feature.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{feature.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:p-10">
        <div className="max-w-4xl space-y-4">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">Perfekt for store organisasjoner</h2>
          <p className="text-slate-700">
            Systemet er laget for virksomheter der flere prosjekter kjører samtidig, mange ansatte bruker utstyr, og
            ledelsen trenger kontroll både per prosjekt og per selskap.
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">Flere samtidige prosjekter</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">Mange ansatte og brukere</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">Kontroll per prosjekt og selskap</p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-blue-200 bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white shadow-sm md:p-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl space-y-2">
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Klar for bedre maskinstyring?</h2>
            <p className="text-sm text-blue-50 md:text-base">
              Gi teamene dine en felles plattform for planlegging, ansvar og tilgjengelighet.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin" className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50">
              Opprett bedrift
            </Link>
            <Link
              href="/users"
              className="rounded-lg border border-white/60 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
            >
              Registrer bruker
            </Link>
            <Link
              href="/login"
              className="rounded-lg border border-white/60 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
            >
              Prøv demo
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
