import { MachineStatus } from '@prisma/client';
import { StatusBadge } from '@/app/components/status-badge';
import { FormSubmitButton } from '@/app/components/form-submit-button';
import { ensureDatabaseSetup } from '@/lib/db-init';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { createMachine, updateMachine, updateMachineProject, updateResponsibleUser } from './actions';

type MachinesPageProps = {
  searchParams?: {
    edit?: string;
  };
};

const statusOptions: { value: MachineStatus; label: string }[] = [
  { value: MachineStatus.LEDIG, label: 'Tilgjengelig' },
  { value: MachineStatus.TILDELT, label: 'Tildelt' },
  { value: MachineStatus.BOOKET, label: 'Booket' },
  { value: MachineStatus.I_BRUK, label: 'I bruk' },
  { value: MachineStatus.SERVICE, label: 'Service' },
  { value: MachineStatus.UTE_AV_DRIFT, label: 'Ute av drift' }
];

export const dynamic = 'force-dynamic';

export default async function MachinesPage({ searchParams }: MachinesPageProps) {
  const user = await requireUser();
  const editId = searchParams?.edit;
  await ensureDatabaseSetup();

  const scopeWhere = {
    companyId: user.companyId
  };

  const [machines, users, projects] = await Promise.all([
    prisma.machine.findMany({
      where: scopeWhere,
      select: {
        id: true,
        name: true,
        machineNumber: true,
        type: true,
        projectId: true,
        status: true,
        responsibleUserId: true,
        responsibleUser: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { machineNumber: 'asc' }
    }),
    prisma.user.findMany({
      where: { companyId: user.companyId },
      orderBy: { name: 'asc' }
    }),
    prisma.project.findMany({
      where: { companyId: user.companyId },
      orderBy: { name: 'asc' }
    })
  ]);

  const machineToEdit = machines.find((machine) => machine.id === editId);

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Alle maskiner</h1>
      </div>

      <div className="rounded-xl border bg-white p-4">
        <h2 className="mb-3 text-lg font-semibold">Opprett maskin</h2>
        <form action={createMachine} className="grid gap-3 md:grid-cols-2">
          <label className="text-sm font-medium">
            Merke + modell
            <input name="name" className="mt-1 w-full rounded-md border px-3 py-2" placeholder="Eks. Volvo EC220E" required />
          </label>
          <label className="text-sm font-medium">
            Serienummer
            <input
              name="machineNumber"
              className="mt-1 w-full rounded-md border px-3 py-2"
              placeholder="Eks. VEC220E-2024-001"
              required
            />
          </label>
          <label className="text-sm font-medium">
            Type
            <input name="type" className="mt-1 w-full rounded-md border px-3 py-2" placeholder="Eks. Gravemaskin" required />
          </label>
          <label className="text-sm font-medium">
            Prosjekt
            <select name="projectId" className="mt-1 w-full rounded-md border px-3 py-2">
              <option value="">Ingen prosjekt-tilknytning</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </label>
          <div className="md:col-span-2">
            <FormSubmitButton
              idleText="Opprett maskin"
              pendingText="Oppretter maskin…"
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            />
          </div>
        </form>
      </div>

      {machineToEdit && (
        <div className="rounded-xl border bg-white p-4">
          <h2 className="mb-3 text-lg font-semibold">Rediger maskin: {machineToEdit.name}</h2>
          <form action={updateMachine} className="grid gap-3 md:grid-cols-2">
            <input type="hidden" name="machineId" value={machineToEdit.id} />
            <label className="text-sm font-medium">
              Merke + modell
              <input
                name="name"
                defaultValue={machineToEdit.name}
                className="mt-1 w-full rounded-md border px-3 py-2"
                required
              />
            </label>
            <label className="text-sm font-medium">
              Serienummer
              <input
                name="machineNumber"
                defaultValue={machineToEdit.machineNumber}
                className="mt-1 w-full rounded-md border px-3 py-2"
                required
              />
            </label>
            <label className="text-sm font-medium">
              Type
              <input name="type" defaultValue={machineToEdit.type} className="mt-1 w-full rounded-md border px-3 py-2" required />
            </label>
            <label className="text-sm font-medium">
              Prosjekt
              <select name="projectId" defaultValue={machineToEdit.projectId ?? ''} className="mt-1 w-full rounded-md border px-3 py-2">
                <option value="">Ingen prosjekt-tilknytning</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-medium md:col-span-2">
              Status
              <select name="status" defaultValue={machineToEdit.status} className="mt-1 w-full rounded-md border px-3 py-2">
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <div className="md:col-span-2">
              <FormSubmitButton
                idleText="Lagre endringer"
                pendingText="Lagrer…"
                className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
              />
            </div>
          </form>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100 text-left">
            <tr>
              <th className="px-3 py-2">Merke + modell</th>
              <th className="px-3 py-2">Serienummer</th>
              <th className="px-3 py-2">Type</th>
              <th className="px-3 py-2">Prosjekt</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Ansvarlig bruker</th>
              <th className="px-3 py-2">Handlinger</th>
            </tr>
          </thead>
          <tbody>
            {machines.map((machine) => (
              <tr key={machine.id} className="border-t">
                <td className="px-3 py-2">{machine.name}</td>
                <td className="px-3 py-2">{machine.machineNumber}</td>
                <td className="px-3 py-2">{machine.type}</td>
                <td className="px-3 py-2">
                  <form action={updateMachineProject} className="flex gap-2">
                    <input type="hidden" name="machineId" value={machine.id} />
                    <select name="projectId" defaultValue={machine.projectId ?? ''} className="rounded-md border px-2 py-1">
                      <option value="">Ingen prosjekt-tilknytning</option>
                      {projects.map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.name}
                        </option>
                      ))}
                    </select>
                    <FormSubmitButton
                      idleText="Lagre"
                      pendingText="Lagrer…"
                      className="rounded-md border px-2 py-1 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                    />
                  </form>
                </td>
                <td className="px-3 py-2">
                  <StatusBadge status={machine.status} />
                </td>
                <td className="px-3 py-2">
                  <form action={updateResponsibleUser} className="flex gap-2">
                    <input type="hidden" name="machineId" value={machine.id} />
                    <select
                      name="userId"
                      defaultValue={machine.responsibleUserId ?? ''}
                      className="rounded-md border px-2 py-1"
                    >
                      <option value="">Ingen ansvarlig</option>
                      {users.map((scopeUser) => (
                        <option key={scopeUser.id} value={scopeUser.id}>
                          {scopeUser.name}
                        </option>
                      ))}
                    </select>
                    <FormSubmitButton
                      idleText="Lagre"
                      pendingText="Lagrer…"
                      className="rounded-md border px-2 py-1 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                    />
                  </form>
                </td>
                <td className="px-3 py-2">
                  <div className="flex flex-wrap gap-2">
                    <a href={`/machines?edit=${machine.id}`} className="rounded-md border px-2 py-1 hover:bg-slate-100">
                      Rediger
                    </a>
                    <a href={`/machines/${machine.id}`} className="rounded-md border px-2 py-1 hover:bg-slate-100">
                      Åpne
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
