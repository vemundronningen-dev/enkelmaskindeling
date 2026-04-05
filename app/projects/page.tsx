import { Suspense } from 'react';
import { UserRole } from '@prisma/client';
import { FormSubmitButton } from '@/app/components/form-submit-button';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createProject, updateProject } from './actions';

export const dynamic = 'force-dynamic';

type ProjectsPageProps = {
  searchParams?: {
    edit?: string;
    projectId?: string;
  };
};

type MachineOverviewTableProps = {
  companyId: string;
  selectedProjectId?: string;
};

async function MachineOverviewTable({ companyId, selectedProjectId }: MachineOverviewTableProps) {
  const machines = await prisma.machine.findMany({
    where: {
      companyId,
      ...(selectedProjectId ? { projectId: selectedProjectId } : {})
    },
    select: {
      id: true,
      name: true,
      machineNumber: true,
      type: true,
      project: true,
      projectRef: {
        select: {
          name: true
        }
      },
      responsibleUser: {
        select: {
          name: true,
          phone: true,
          email: true
        }
      }
    },
    orderBy: [{ project: 'asc' }, { machineNumber: 'asc' }]
  });

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-100 text-left">
          <tr>
            <th className="px-3 py-2">Prosjekt</th>
            <th className="px-3 py-2">Maskin</th>
            <th className="px-3 py-2">Serienummer</th>
            <th className="px-3 py-2">Type</th>
            <th className="px-3 py-2">Ansvarlig</th>
            <th className="px-3 py-2">Kontaktinfo</th>
          </tr>
        </thead>
        <tbody>
          {machines.map((machine) => (
            <tr key={machine.id} className="border-t">
              <td className="px-3 py-2">{machine.projectRef?.name ?? machine.project}</td>
              <td className="px-3 py-2">{machine.name}</td>
              <td className="px-3 py-2">{machine.machineNumber}</td>
              <td className="px-3 py-2">{machine.type}</td>
              <td className="px-3 py-2">{machine.responsibleUser?.name ?? 'Ingen ansvarlig'}</td>
              <td className="px-3 py-2">
                {machine.responsibleUser ? (
                  <div className="flex flex-col gap-1">
                    {machine.responsibleUser.phone ? (
                      <a href={`tel:${machine.responsibleUser.phone}`} className="text-blue-700 hover:underline">
                        {machine.responsibleUser.phone}
                      </a>
                    ) : (
                      <span>Telefon mangler</span>
                    )}
                    <a href={`mailto:${machine.responsibleUser.email}`} className="text-blue-700 hover:underline">
                      {machine.responsibleUser.email}
                    </a>
                  </div>
                ) : (
                  '—'
                )}
              </td>
            </tr>
          ))}
          {machines.length === 0 && (
            <tr className="border-t">
              <td className="px-3 py-4 text-slate-500" colSpan={6}>
                Ingen maskiner matcher filtreringen.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const user = await requireUser();
  const selectedProjectId = searchParams?.projectId;

  const [projects, departments, company] = await Promise.all([
    prisma.project.findMany({
      where: { companyId: user.companyId },
      select: {
        id: true,
        name: true,
        departmentId: true,
        department: {
          select: {
            name: true
          }
        },
        _count: {
          select: {
            machines: true
          }
        }
      },
      orderBy: { name: 'asc' }
    }),
    prisma.department.findMany({
      where: { companyId: user.companyId },
      orderBy: { name: 'asc' }
    }),
    prisma.company.findUnique({
      where: { id: user.companyId },
      select: { name: true }
    })
  ]);

  const canManageProjects = user.role === UserRole.ADMIN;
  const projectToEdit = projects.find((project) => project.id === searchParams?.edit);

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">Prosjekter</h1>

      {canManageProjects && (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border bg-white p-4">
            <h2 className="mb-3 text-lg font-semibold">Opprett prosjekt</h2>
            <form action={createProject} className="grid gap-3">
              <label className="text-sm font-medium">
                Prosjektnavn
                <input name="name" required className="mt-1 w-full rounded-md border px-3 py-2" placeholder="Eks. Nytt byggefelt" />
              </label>
              <label className="text-sm font-medium">
                Etat
                <select
                  name="departmentId"
                  defaultValue=""
                  className="mt-1 w-full rounded-md border px-3 py-2"
                >
                  <option value="">Ingen etat</option>
                  {departments.map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.name}
                    </option>
                  ))}
                </select>
              </label>
              <FormSubmitButton
                idleText="Opprett prosjekt"
                pendingText="Oppretter prosjekt…"
                className="w-fit rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
              />
            </form>
          </div>

          {projectToEdit && (
            <div className="rounded-xl border bg-white p-4">
              <h2 className="mb-3 text-lg font-semibold">Rediger prosjekt</h2>
              <form action={updateProject} className="grid gap-3">
                <input type="hidden" name="projectId" value={projectToEdit.id} />
                <label className="text-sm font-medium">
                  Prosjektnavn
                  <input name="name" defaultValue={projectToEdit.name} required className="mt-1 w-full rounded-md border px-3 py-2" />
                </label>
                <label className="text-sm font-medium">
                  Etat
                  <select
                    name="departmentId"
                    defaultValue={projectToEdit.departmentId ?? ''}
                    className="mt-1 w-full rounded-md border px-3 py-2"
                  >
                    <option value="">Ingen etat</option>
                    {departments.map((department) => (
                      <option key={department.id} value={department.id}>
                        {department.name}
                      </option>
                    ))}
                  </select>
                </label>
                <FormSubmitButton
                  idleText="Lagre endringer"
                  pendingText="Lagrer…"
                  className="w-fit rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                />
              </form>
            </div>
          )}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100 text-left">
            <tr>
              <th className="px-3 py-2">Prosjekt</th>
              <th className="px-3 py-2">Bedrift</th>
              <th className="px-3 py-2">Etat</th>
              <th className="px-3 py-2">Maskiner</th>
              {canManageProjects && <th className="px-3 py-2">Handlinger</th>}
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.id} className="border-t">
                <td className="px-3 py-2 font-medium">{project.name}</td>
                <td className="px-3 py-2">{company?.name ?? '—'}</td>
                <td className="px-3 py-2">{project.department?.name ?? '—'}</td>
                <td className="px-3 py-2">{project._count.machines}</td>
                {canManageProjects && (
                  <td className="px-3 py-2">
                    <a href={`/projects?edit=${project.id}`} className="rounded-md border px-2 py-1 hover:bg-slate-100">
                      Rediger
                    </a>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-xl border bg-white p-4">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <h2 className="text-lg font-semibold">Maskinoversikt per prosjekt</h2>
          <form method="GET" className="flex flex-col gap-2 md:flex-row md:items-end">
            <label className="text-sm font-medium">
              Filtrer prosjekt
              <select
                name="projectId"
                defaultValue={selectedProjectId ?? ''}
                className="mt-1 block w-full rounded-md border px-3 py-2 md:min-w-64"
              >
                <option value="">Alle prosjekter</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </label>
            <button className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-slate-100">Filtrer</button>
            {selectedProjectId && (
              <a href="/projects" className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-slate-100">
                Nullstill
              </a>
            )}
          </form>
        </div>

        <Suspense
          key={selectedProjectId ?? 'all-projects'}
          fallback={<p className="px-3 py-4 text-sm text-slate-500">Laster maskinoversikt…</p>}
        >
          <MachineOverviewTable companyId={user.companyId} selectedProjectId={selectedProjectId} />
        </Suspense>
      </div>
    </section>
  );
}
