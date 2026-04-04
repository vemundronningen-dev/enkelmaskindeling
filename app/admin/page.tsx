import { UserRole } from '@prisma/client';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createDepartment, createManagedUser, createProject } from './actions';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect('/signup-company');
  }

  if (currentUser.role !== UserRole.ADMIN) {
    redirect('/machines');
  }

  const whereCompany = { id: currentUser.companyId };

  const companies = await prisma.company.findMany({
    where: whereCompany,
    include: {
      departments: true,
      projects: {
        include: {
          machines: true,
          department: true
        }
      },
      users: {
        orderBy: { createdAt: 'desc' }
      }
    },
    orderBy: { name: 'asc' }
  });

  const departments = companies.flatMap((company) => company.departments);

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">Admin: selskaper, etater og prosjekter</h1>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border bg-white p-4">
          <h2 className="mb-3 text-lg font-semibold">Opprett etat</h2>
          <form action={createDepartment} className="space-y-3">
            <input name="name" required placeholder="Eks. Vann- og avløpsetaten" className="w-full rounded-md border px-3 py-2" />
            <select name="companyId" required className="w-full rounded-md border px-3 py-2">
              <option value="">Velg bedrift</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
            <button className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white">Opprett etat</button>
          </form>
        </div>

        <div className="rounded-xl border bg-white p-4">
          <h2 className="mb-3 text-lg font-semibold">Opprett prosjekt</h2>
          <form action={createProject} className="space-y-3">
            <input name="name" required placeholder="Eks. RKV energiforsyning" className="w-full rounded-md border px-3 py-2" />
            <select name="companyId" required className="w-full rounded-md border px-3 py-2">
              <option value="">Velg bedrift</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
            <select name="departmentId" className="w-full rounded-md border px-3 py-2">
              <option value="">Ingen etat</option>
              {departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </select>
            <button className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white">Opprett prosjekt</button>
          </form>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-4">
        <h2 className="mb-3 text-lg font-semibold">Opprett bruker</h2>
        <form action={createManagedUser} className="grid gap-3 md:grid-cols-2">
          <input name="name" required placeholder="Navn" className="rounded-md border px-3 py-2" />
          <input type="email" name="email" required placeholder="E-post" className="rounded-md border px-3 py-2" />
          <input name="phone" placeholder="Telefon" className="rounded-md border px-3 py-2" />
          <input name="password" required placeholder="Midlertidig passord" className="rounded-md border px-3 py-2" />
          <select name="role" required className="rounded-md border px-3 py-2">
            <option value={UserRole.USER}>Bruker</option>
            <option value={UserRole.ADMIN}>Admin</option>
          </select>
          <select name="companyId" required className="rounded-md border px-3 py-2">
            <option value="">Velg bedrift</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
          <select name="departmentId" className="rounded-md border px-3 py-2">
            <option value="">Ingen etat</option>
            {departments.map((department) => (
              <option key={department.id} value={department.id}>
                {department.name}
              </option>
            ))}
          </select>
          <div className="md:col-span-2">
            <button className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white">Opprett bruker</button>
          </div>
        </form>
      </div>

      <div className="space-y-3">
        {companies.map((company) => (
          <article key={company.id} className="rounded-xl border bg-white p-4">
            <h2 className="text-lg font-semibold">{company.name}</h2>
            <p className="text-sm text-slate-600">
              {company.departments.length} etater · {company.projects.length} prosjekter · {company.users.length} brukere
            </p>
            <ul className="mt-3 space-y-1 text-sm">
              {company.projects.map((project) => (
                <li key={project.id}>
                  {project.name} {project.department ? `(${project.department.name})` : ''} — {project.machines.length} maskiner
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
