import { BookingStatus, UserRole } from '@prisma/client';
import Link from 'next/link';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function PlannerPage() {
  const user = await requireUser();
  if (user.role !== UserRole.ADMIN) {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-bold">Ressursplanlegger</h1>
        <p>Kun admin har tilgang til samlet planlegger.</p>
      </section>
    );
  }

  const machines = await prisma.machine.findMany({
    where: { companyId: user.companyId },
    include: {
      bookings: {
        where: { status: { not: BookingStatus.KANSELLERT } },
        include: { responsibleUser: true, project: true },
        orderBy: { startAt: 'asc' },
        take: 5
      }
    },
    orderBy: { machineNumber: 'asc' }
  });

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">Ressursplanlegger (admin)</h1>
      <div className="rounded-xl border bg-white p-4">
        <p className="text-sm text-slate-600">Viser kommende bookinger på tvers av maskiner.</p>
      </div>

      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100 text-left">
            <tr>
              <th className="px-3 py-2">Maskin</th>
              <th className="px-3 py-2">Neste bookinger</th>
            </tr>
          </thead>
          <tbody>
            {machines.map((machine) => (
              <tr key={machine.id} className="border-t align-top">
                <td className="px-3 py-2">
                  <Link href={`/machines/${machine.id}`} className="font-medium text-blue-700 hover:underline">{machine.name}</Link>
                  <p className="text-xs text-slate-600">{machine.machineNumber}</p>
                </td>
                <td className="px-3 py-2">
                  <div className="space-y-2">
                    {machine.bookings.map((booking) => (
                      <div key={booking.id} className="rounded-md border p-2">
                        <p>{booking.startAt.toLocaleString('nb-NO')} → {booking.endAt.toLocaleString('nb-NO')}</p>
                        <p className="text-xs text-slate-600">{booking.location} · {booking.project?.name ?? 'Uten prosjekt'} · {booking.responsibleUser.name}</p>
                      </div>
                    ))}
                    {machine.bookings.length === 0 && <p className="text-slate-500">Ingen kommende booking.</p>}
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
