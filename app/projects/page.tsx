import { prisma } from '@/lib/prisma';
import { createProject } from './actions';

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({
    orderBy: { name: 'asc' }
  });

  const machines = await prisma.machine.findMany({
    select: {
      id: true,
      name: true,
      machineNumber: true,
      project: true
    },
    orderBy: { machineNumber: 'asc' }
  });

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">Prosjekter</h1>

      <div className="rounded-xl border bg-white p-4">
        <h2 className="mb-3 text-lg font-semibold">Opprett prosjekt</h2>
        <form action={createProject} className="flex flex-col gap-3 md:flex-row md:items-end">
          <label className="text-sm font-medium md:min-w-80">
            Prosjektnavn
            <input name="name" className="mt-1 w-full rounded-md border px-3 py-2" placeholder="Eks. Oslo Vest" required />
          </label>
          <button type="submit" className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">
            Opprett prosjekt
          </button>
        </form>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {projects.map((project) => {
          const projectMachines = machines.filter((machine) => machine.project === project.name);

          return (
            <article key={project.id} className="rounded-xl border bg-white p-4">
              <h2 className="text-lg font-semibold">{project.name}</h2>
              <p className="mt-1 text-sm text-slate-600">Maskiner på prosjekt: {projectMachines.length}</p>
              {projectMachines.length > 0 ? (
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
                  {projectMachines.map((machine) => (
                    <li key={machine.id}>
                      {machine.name} ({machine.machineNumber})
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-slate-500">Ingen maskiner er koblet til prosjektet enda.</p>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
