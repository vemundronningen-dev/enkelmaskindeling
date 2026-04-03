export const dynamic = 'force-dynamic';

import { MachineStatus } from '@prisma/client';
import { StatusBadge } from '@/app/components/status-badge';
import { prisma } from '@/lib/prisma';

export default async function AvailablePage() {
  let machines: {
    id: string;
    machineNumber: string;
    brand: string;
    model: string;
    serialNumber: string | null;
    type: string;
    project: string;
    status: MachineStatus;
  }[] = [];
  let dbError: string | null = null;

  try {
    machines = await prisma.machine.findMany({
      where: { status: MachineStatus.LEDIG },
      orderBy: { machineNumber: 'asc' }
    });
  } catch {
    dbError = 'Databasen er ikke klar ennå. Kjør /api/setup én gang, og last siden på nytt.';
  }

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">Ledige maskiner</h1>

      {dbError && <p className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">{dbError}</p>}

      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100 text-left">
            <tr>
              <th className="px-3 py-2">Maskinnummer</th>
              <th className="px-3 py-2">Merke</th>
              <th className="px-3 py-2">Modell</th>
              <th className="px-3 py-2">Serienummer</th>
              <th className="px-3 py-2">Type</th>
              <th className="px-3 py-2">Prosjekt</th>
              <th className="px-3 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {machines.map((machine) => (
              <tr key={machine.id} className="border-t">
                <td className="px-3 py-2">{machine.machineNumber}</td>
                <td className="px-3 py-2">{machine.brand}</td>
                <td className="px-3 py-2">{machine.model}</td>
                <td className="px-3 py-2">{machine.serialNumber ?? '-'}</td>
                <td className="px-3 py-2">{machine.type}</td>
                <td className="px-3 py-2">{machine.project}</td>
                <td className="px-3 py-2">
                  <StatusBadge status={machine.status} />
                </td>
              </tr>
            ))}
            {machines.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center text-slate-500">
                  Ingen ledige maskiner å vise.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
