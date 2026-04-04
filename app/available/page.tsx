import { MachineStatus } from '@prisma/client';
import { StatusBadge } from '@/app/components/status-badge';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function AvailablePage() {
  const currentUser = await requireUser();

  const machines = await prisma.machine.findMany({
    where: {
      status: MachineStatus.LEDIG,
      companyId: currentUser.companyId
    },
    include: { projectRef: true },
    orderBy: { machineNumber: 'asc' }
  });

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">Ledige maskiner</h1>
      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100 text-left">
            <tr>
              <th className="px-3 py-2">Merke + modell</th>
              <th className="px-3 py-2">Serienummer</th>
              <th className="px-3 py-2">Type</th>
              <th className="px-3 py-2">Prosjekt</th>
              <th className="px-3 py-2">Status</th>
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
