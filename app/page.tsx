import Link from 'next/link';

type IconName = 'overview' | 'availability' | 'ownership' | 'analytics' | 'security' | 'deploy';

const valuePoints = [
  'Full oversikt over maskiner på tvers av prosjekter og lokasjoner',
  'Se hvilke maskiner som er ledige akkurat nå – uten telefonrunder',
  'Tydelig ansvarlig per maskin og prosjekt',
  'Mindre kaos i drift, raskere beslutninger i ledelsen',
  'Bedre utnyttelse av maskinparken og mindre nedetid',
  'Skalerbart for konsern med flere selskaper og avdelinger'
];

const features: { title: string; text: string; icon: IconName }[] = [
  {
    title: 'Maskinoversikt i sanntid',
    text: 'Samle alt utstyr i én strukturert oversikt med status, prosjekt og ansvarlig bruker.',
    icon: 'overview'
  },
  {
    title: 'Tilgjengelighet med ett blikk',
    text: 'Finn ledige maskiner på sekunder og unngå at kritisk utstyr står ubrukt.',
    icon: 'availability'
  },
  {
    title: 'Klart eierskap',
    text: 'Alle maskiner har tydelig ansvarlig, så hele organisasjonen vet hvem som følger opp.',
    icon: 'ownership'
  },
  {
    title: 'Bedre beslutningsgrunnlag',
    text: 'Få et ryddig bilde av kapasitet på tvers av prosjekter før neste planleggingsmøte.',
    icon: 'analytics'
  },
  {
    title: 'Kontroll per selskap',
    text: 'Egne administratorer og tydelig rollefordeling gir trygg drift i større organisasjoner.',
    icon: 'security'
  },
  {
    title: 'Rask implementering',
    text: 'Kom i gang raskt med et oppsett som fungerer fra første dag uten tung opplæring.',
    icon: 'deploy'
  }
];

const steps = [
  {
    title: 'Registrer maskiner og prosjekter',
    text: 'Importer eller legg inn utstyr, og knytt maskiner til riktige prosjekter.'
  },
  {
    title: 'Tildel ansvarlige brukere',
    text: 'Definer hvem som eier hva, slik at oppfølging blir tydelig i hele organisasjonen.'
  },
  {
    title: 'Styr drift med løpende oversikt',
    text: 'Se kapasitet, tilgjengelighet og eierskap i ett bilde – og ta raske beslutninger.'
  }
];

const audience = [
  'Entreprenører med flere aktive prosjekter',
  'Industrikonsern med utstyr fordelt på flere avdelinger',
  'Drifts- og prosjektmiljøer som trenger tydelig ansvar og tilgjengelighet'
];

const transformation = [
  {
    before: 'Spredte Excel-ark og manuell oppfølging',
    after: 'Én oppdatert kilde for hele organisasjonen'
  },
  {
    before: 'Uklart hvem som har ansvar for maskiner',
    after: 'Tydelig eierskap og mindre ventetid i drift'
  },
  {
    before: 'Tidsbruk på telefoner og ad hoc-planlegging',
    after: 'Rask prioritering basert på sanntidsoversikt'
  }
];

function FeatureIcon({ icon }: { icon: IconName }) {
  const iconMap: Record<IconName, string> = {
    overview: '▦',
    availability: '◉',
    ownership: '◍',
    analytics: '◈',
    security: '◌',
    deploy: '◎'
  };

  return (
    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-lg text-blue-700">
      {iconMap[icon]}
    </span>
  );
}

export default function Home() {
  return (
    <div className="space-y-20 py-8 md:py-12">
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-900 p-8 text-white shadow-xl md:p-14">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-blue-400/30 blur-3xl" aria-hidden="true" />
        <div className="absolute -bottom-24 -left-16 h-80 w-80 rounded-full bg-indigo-400/20 blur-3xl" aria-hidden="true" />
        <div className="relative grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-end">
          <div className="space-y-6">
            <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-blue-100">
              Bygget for profesjonell maskinstyring
            </span>
            <h1 className="max-w-3xl text-3xl font-semibold leading-tight tracking-tight md:text-5xl">
              Premium kontroll på maskiner, prosjekter og ansvar i stor skala.
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-slate-200 md:text-lg">
              maskindeling.no gir organisasjoner et felles driftsbilde for utstyr på tvers av avdelinger. Resultatet er
              høyere utnyttelse, færre avbrudd og tryggere beslutninger.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/signup-company"
                className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
              >
                Book oppstart
              </Link>
              <Link
                href="/demo"
                className="rounded-lg border border-white/40 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                Se demo
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-100">Hva du får</p>
            <ul className="mt-4 space-y-3">
              {valuePoints.slice(0, 4).map((point) => (
                <li key={point} className="flex items-start gap-3 text-sm text-slate-200">
                  <span className="mt-0.5 inline-flex h-5 w-5 flex-none items-center justify-center rounded-full bg-emerald-300/25 text-emerald-200">
                    ✓
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section id="funksjoner" className="space-y-6 scroll-mt-24">
        <div className="max-w-3xl space-y-3">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">Funksjoner laget for drift i stor skala</h2>
          <p className="text-slate-600">En moderne og enkel plattform med tydelig struktur for hele organisasjonen.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <FeatureIcon icon={feature.icon} />
              <h3 className="mt-4 text-lg font-semibold text-slate-900">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{feature.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="slik-fungerer-det" className="space-y-6 scroll-mt-24">
        <div className="max-w-3xl space-y-3">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">Slik fungerer det</h2>
          <p className="text-slate-600">Tre enkle steg fra oppstart til full kontroll.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((step, index) => (
            <article key={step.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                {index + 1}
              </span>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="for-hvem" className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:p-10">
        <div className="max-w-4xl space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">For hvem passer dette?</h2>
          <p className="text-slate-700">
            For virksomheter der mange mennesker og maskiner må spille sammen hver dag – uten at kontrollen går tapt.
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            {audience.map((item) => (
              <div key={item} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-800">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="fra-kaos-til-kontroll" className="space-y-6 scroll-mt-24">
        <div className="max-w-3xl space-y-3">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">Fra kaos til kontroll</h2>
          <p className="text-slate-600">Se forskjellen før og etter en felles plattform for maskindeling.</p>
        </div>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {transformation.map((item) => (
            <div key={item.before} className="grid gap-2 border-b border-slate-200 p-5 md:grid-cols-2 md:gap-8 last:border-b-0">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Før</p>
                <p className="mt-1 text-sm text-slate-700">{item.before}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Etter</p>
                <p className="mt-1 text-sm font-medium text-slate-900">{item.after}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="hvorfor-oss" className="rounded-3xl border border-blue-200 bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white shadow-sm md:p-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Klar for å standardisere maskinstyringen?</h2>
            <p className="text-sm text-blue-50 md:text-base">
              Få en trygg oppstart og en løsning som skalerer med organisasjonen deres.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/signup-company" className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50">
              Opprett bedrift
            </Link>
            <Link
              href="/login"
              className="rounded-lg border border-white/60 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
            >
              Logg inn
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
