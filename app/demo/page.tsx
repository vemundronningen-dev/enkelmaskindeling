import { MachineStatus } from '@prisma/client';
import Link from 'next/link';
import { StatusBadge } from '@/app/components/status-badge';

type DemoMachine = {
  id: string;
  name: string;
  machineNumber: string;
  type: string;
  status: MachineStatus;
  project: string;
  responsibleUser: string;
};

const demoMachines: DemoMachine[] = [
  {
    id: 'm1',
    name: 'Volvo EC220E',
    machineNumber: 'VEC220E-2025-011',
    type: 'Gravemaskin',
    status: MachineStatus.TILDELT,
    project: 'E39 Utbedring Arna–Voss',
    responsibleUser: 'Marius Nilsen'
  },
  {
    id: 'm2',
    name: 'Caterpillar 966M',
    machineNumber: 'CAT966M-2024-008',
    type: 'Hjullaster',
    status: MachineStatus.LEDIG,
    project: 'Ringvei Sør byggetrinn 2',
    responsibleUser: 'Sofie Hansen'
  },
  {
    id: 'm3',
    name: 'Hitachi ZX300LC',
    machineNumber: 'HIT300LC-2023-019',
    type: 'Gravemaskin',
    status: MachineStatus.SERVICE,
    project: 'Kaiutvidelse Bergen Havn',
    responsibleUser: 'Andreas Lie'
  },
  {
    id: 'm4',
    name: 'Komatsu D65EX',
    machineNumber: 'KOMD65EX-2025-004',
    type: 'Bulldoser',
    status: MachineStatus.LEDIG,
    project: 'E39 Utbedring Arna–Voss',
    responsibleUser: 'Marius Nilsen'
  },
  {
    id: 'm5',
    name: 'Doosan DA45',
    machineNumber: 'DOODA45-2022-017',
    type: 'Dumper',
    status: MachineStatus.TILDELT,
    project: 'Ringvei Sør byggetrinn 2',
    responsibleUser: 'Sofie Hansen'
  }
];

const demoProjects = [
  {
    name: 'E39 Utbedring Arna–Voss',
    machineCount: 2,
    ledigCount: 1,
    owner: 'Marius Nilsen'
  },
  {
    name: 'Ringvei Sør byggetrinn 2',
    machineCount: 2,
    ledigCount: 1,
    owner: 'Sofie Hansen'
  },
  {
    name: 'Kaiutvidelse Bergen Havn',
    machineCount: 1,
    ledigCount: 0,
    owner: 'Andreas Lie'
  }
];

const responsibleUsers = [
  { name: 'Marius Nilsen', role: 'Prosjektleder', machines: 2 },
  { name: 'Sofie Hansen', role: 'Formann', machines: 2 },
  { name: 'Andreas Lie', role: 'Driftskoordinator', machines: 1 }
];

export default function DemoPage() {
  const totalMachines = demoMachines.length;
  const availableMachines = demoMachines.filter((machine) => machine.status === MachineStatus.LEDIG).length;
  const assignedMachines = demoMachines.filter((machine) => machine.status === MachineStatus.TILDELT).length;

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Prøv demo • uten innlogging</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Demo: oversikt over maskiner, prosjekter og ansvar</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-700">
          Dette er eksempeldata som viser hvordan maskindeling.no gir ledelsen rask innsikt i maskiner, prosjekter,
          tilgjengelighet og ansvarlige brukere uten å påvirke ekte data.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/signup-company" className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700">
            Opprett egen bedrift
          </Link>
          <Link href="/" className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-100">
            Tilbake til forsiden
          </Link>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-xl border bg-white p-4">
          <p className="text-sm text-slate-600">Maskiner totalt</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{totalMachines}</p>
        </article>
        <article className="rounded-xl border bg-white p-4">
          <p className="text-sm text-slate-600">Ledige maskiner</p>
          <p className="mt-1 text-2xl font-bold text-emerald-700">{availableMachines}</p>
        </article>
        <article className="rounded-xl border bg-white p-4">
          <p className="text-sm text-slate-600">Tildelte maskiner</p>
          <p className="mt-1 text-2xl font-bold text-blue-700">{assignedMachines}</p>
        </article>
        <article className="rounded-xl border bg-white p-4">
          <p className="text-sm text-slate-600">Prosjekter</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{demoProjects.length}</p>
        </article>
      </div>

      <div className="overflow-x-auto rounded-xl border bg-white">
        <div className="border-b px-4 py-3">
          <h2 className="text-lg font-semibold text-slate-900">Maskiner</h2>
          <p className="text-sm text-slate-600">Full oversikt over status, prosjekt og ansvarlig bruker.</p>
        </div>
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100 text-left">
            <tr>
              <th className="px-3 py-2">Maskin</th>
              <th className="px-3 py-2">Serienummer</th>
              <th className="px-3 py-2">Type</th>
              <th className="px-3 py-2">Prosjekt</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Ansvarlig</th>
            </tr>
          </thead>
          <tbody>
            {demoMachines.map((machine) => (
              <tr key={machine.id} className="border-t">
                <td className="px-3 py-2 font-medium text-slate-900">{machine.name}</td>
                <td className="px-3 py-2">{machine.machineNumber}</td>
                <td className="px-3 py-2">{machine.type}</td>
                <td className="px-3 py-2">{machine.project}</td>
                <td className="px-3 py-2">
                  <StatusBadge status={machine.status} />
                </td>
                <td className="px-3 py-2">{machine.responsibleUser}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border bg-white">
          <div className="border-b px-4 py-3">
            <h2 className="text-lg font-semibold text-slate-900">Prosjekter</h2>
            <p className="text-sm text-slate-600">Se maskinbehov, tilgjengelighet og ansvarlig per prosjekt.</p>
          </div>
          <ul className="divide-y">
            {demoProjects.map((project) => (
              <li key={project.name} className="space-y-1 px-4 py-3 text-sm">
                <p className="font-medium text-slate-900">{project.name}</p>
                <p className="text-slate-600">
                  {project.machineCount} maskiner • {project.ledigCount} ledige • Ansvarlig: {project.owner}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border bg-white">
          <div className="border-b px-4 py-3">
            <h2 className="text-lg font-semibold text-slate-900">Ansvarlige brukere</h2>
            <p className="text-sm text-slate-600">Tydelig eierskap gjør oppfølging enklere i drift.</p>
          </div>
          <ul className="divide-y">
            {responsibleUsers.map((user) => (
              <li key={user.name} className="space-y-1 px-4 py-3 text-sm">
                <p className="font-medium text-slate-900">{user.name}</p>
                <p className="text-slate-600">
                  {user.role} • Ansvarlig for {user.machines} maskiner
                </p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </section>
  );
}
