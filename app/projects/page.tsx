import { UserRole } from '@prisma/client';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function ProjectsPage() {
  const user = await requireUser();

  const projects = await prisma.project.findMany({
    where:
      user.role === UserRole.SUPERADMIN
        ? {}
        : {
            companyId: user.companyId ?? undefined,
            ...(user.role === UserRole.DEPARTMENT_MANAGER && user.departmentId ? { departmentId: user.departmentId } : {})
          },
    include: {
      company: true,
      department: true,
      machines: {
        orderBy: { machineNumber: 'asc' }
      }
    },
    orderBy: { name: 'asc' }
  });

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">Prosjekter</h1>
      <div className="grid gap-4 md:grid-cols-2">
        {projects.map((project) => (
          <article key={project.id} className="rounded-xl border bg-white p-4">
            <h2 className="text-lg font-semibold">{project.name}</h2>
            <p className="text-sm text-slate-600">
              {project.company.name} {project.department ? `· ${project.department.name}` : ''}
            </p>
            <p className="mt-2 text-sm font-medium">Maskiner: {project.machines.length}</p>
            <ul className="mt-2 list-disc pl-5 text-sm">
              {project.machines.map((machine) => (
                <li key={machine.id}>
                  {machine.name} ({machine.machineNumber})
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
