import { MachineStatus, UserRole } from '@prisma/client';
import { StatusBadge } from '@/app/components/status-badge';
import { ensureDatabaseSetup } from '@/lib/db-init';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { createMachine, updateMachine, updateResponsibleUser } from './actions';

type MachinesPageProps = {
  searchParams?: {
    edit?: string;
  };
};

const statusOptions: { value: MachineStatus; label: string }[] = [
  { value: MachineStatus.LEDIG, label: 'Ledig' },
  { value: MachineStatus.TILDELT, label: 'Tildelt' },
  { value: MachineStatus.SERVICE, label: 'Service' }
];

export const dynamic = 'force-dynamic';

export default async function MachinesPage({ searchParams }: MachinesPageProps) {
  const user = await requireUser();
  const editId = searchParams?.edit;
  await ensureDatabaseSetup();

  const scopeWhere =
    user.role === UserRole.SUPERADMIN
      ? {}
      : {
          projectRef: {
            companyId: user.companyId ?? undefined,
            ...(user.role === UserRole.DEPARTMENT_MANAGER && user.departmentId ? { departmentId: user.departmentId } : {})
          }
        };

  const [machines, users, projects] = await Promise.all([
    prisma.machine.findMany({
      where: scopeWhere,
      include: { responsibleUser: true, projectRef: true },
      orderBy: { machineNumber: 'asc' }
    }),
    prisma.user.findMany({
      where: user.role === UserRole.SUPERADMIN ? {} : { companyId: user.companyId ?? undefined },
      orderBy: { name: 'asc' }
    }),
    prisma.project.findMany({
      where: user.role === UserRole.SUPERADMIN ? {} : { companyId: user.companyId ?? undefined },
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
            <select name="projectId" className="mt-1 w-full rounded-md border px-3 py-2" required>
              <option value="">Velg prosjekt</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </label>
          <div className="md:col-span-2">
            <button type="submit" className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">
              Opprett maskin
            </button>
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
              <select name="projectId" defaultValue={machineToEdit.projectId ?? ''} className="mt-1 w-full rounded-md border px-3 py-2" required>
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
              <button type="submit" className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">
                Lagre endringer
              </button>
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
                <td className="px-3 py-2">{machine.projectRef?.name ?? machine.project}</td>
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
                    <button type="submit" className="rounded-md border px-2 py-1 hover:bg-slate-100">
                      Lagre
                    </button>
                  </form>
                </td>
                <td className="px-3 py-2">
                  <a href={`/machines?edit=${machine.id}`} className="rounded-md border px-2 py-1 hover:bg-slate-100">
                    Rediger
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
