import { UserRole } from '@prisma/client';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createProject, updateProject } from './actions';

export const dynamic = 'force-dynamic';

type ProjectsPageProps = {
  searchParams?: {
    edit?: string;
  };
};

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const user = await requireUser();

  const projectScopeWhere = { companyId: user.companyId };

  const [projects, companies, departments] = await Promise.all([
    prisma.project.findMany({
      where: projectScopeWhere,
      include: {
        company: true,
        department: true,
        machines: {
          orderBy: { machineNumber: 'asc' }
        }
      },
      orderBy: { name: 'asc' }
    }),
    prisma.company.findMany({
      where: { id: user.companyId },
      orderBy: { name: 'asc' }
    }),
    prisma.department.findMany({
      where: { companyId: user.companyId },
      orderBy: { name: 'asc' }
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
                Bedrift
                <select
                  name="companyId"
                  required
                  defaultValue={user.companyId}
                  className="mt-1 w-full rounded-md border px-3 py-2"
                  disabled
                >
                  <option value="">Velg bedrift</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
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
              <button className="w-fit rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">
                Opprett prosjekt
              </button>
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
                <button className="w-fit rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">
                  Lagre endringer
                </button>
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
                <td className="px-3 py-2">{project.company.name}</td>
                <td className="px-3 py-2">{project.department?.name ?? '—'}</td>
                <td className="px-3 py-2">{project.machines.length}</td>
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
    </section>
  );
}
