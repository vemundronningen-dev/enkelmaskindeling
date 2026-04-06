import Link from 'next/link';
import { BookingStatus, MachineStatus, UserRole } from '@prisma/client';
import { notFound } from 'next/navigation';
import { FormSubmitButton } from '@/app/components/form-submit-button';
import { StatusBadge } from '@/app/components/status-badge';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { cancelBooking, createBooking, setManualMachineStatus, updateBooking } from './actions';

const machineStatusOptions: { value: MachineStatus; label: string }[] = [
  { value: MachineStatus.LEDIG, label: 'Tilgjengelig' },
  { value: MachineStatus.BOOKET, label: 'Booket' },
  { value: MachineStatus.I_BRUK, label: 'I bruk' },
  { value: MachineStatus.SERVICE, label: 'Service' },
  { value: MachineStatus.UTE_AV_DRIFT, label: 'Ute av drift' }
];

const bookingStatusLabels: Record<BookingStatus, string> = {
  PLANLAGT: 'Planlagt',
  AKTIV: 'Aktiv',
  FULLFORT: 'Fullført',
  KANSELLERT: 'Kansellert'
};

type MachineDetailProps = {
  params: { machineId: string };
  searchParams?: {
    tab?: string;
    editBooking?: string;
    from?: string;
    to?: string;
    projectId?: string;
    userId?: string;
  };
};

export const dynamic = 'force-dynamic';

export default async function MachineDetailPage({ params, searchParams }: MachineDetailProps) {
  const user = await requireUser();
  const tab = searchParams?.tab ?? 'overview';

  const [machine, users, projects, bookings, statusLogs, locationHistory] = await Promise.all([
    prisma.machine.findFirst({
      where: { id: params.machineId, companyId: user.companyId },
      include: {
        responsibleUser: true,
        projectRef: true
      }
    }),
    prisma.user.findMany({ where: { companyId: user.companyId }, orderBy: { name: 'asc' } }),
    prisma.project.findMany({ where: { companyId: user.companyId }, orderBy: { name: 'asc' } }),
    prisma.machineBooking.findMany({
      where: { machineId: params.machineId, companyId: user.companyId },
      include: {
        project: true,
        responsibleUser: true,
        createdBy: true,
        updatedBy: true
      },
      orderBy: { startAt: 'desc' }
    }),
    prisma.machineStatusLog.findMany({
      where: { machineId: params.machineId, companyId: user.companyId },
      include: { createdBy: true },
      orderBy: { createdAt: 'desc' },
      take: 100
    }),
    prisma.machineLocationHistory.findMany({
      where: {
        machineId: params.machineId,
        companyId: user.companyId,
        ...(searchParams?.from ? { createdAt: { gte: new Date(searchParams.from) } } : {}),
        ...(searchParams?.to ? { createdAt: { lte: new Date(searchParams.to) } } : {}),
        ...(searchParams?.projectId ? { projectId: searchParams.projectId } : {}),
        ...(searchParams?.userId ? { responsibleUserId: searchParams.userId } : {})
      },
      include: { project: true, responsibleUser: true, createdBy: true },
      orderBy: { createdAt: 'desc' }
    })
  ]);

  if (!machine) notFound();

  const bookingToEdit = bookings.find((booking) => booking.id === searchParams?.editBooking);

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">Maskin</p>
          <h1 className="text-2xl font-bold">{machine.name}</h1>
          <p className="text-sm text-slate-600">{machine.machineNumber} · {machine.type}</p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={machine.status} />
          <Link href="/machines" className="rounded-md border px-3 py-1.5 text-sm hover:bg-slate-100">Tilbake</Link>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          ['overview', 'Oversikt'],
          ['calendar', 'Kalender'],
          ['booking', 'Booking'],
          ['history', 'Historikk']
        ].map(([value, label]) => (
          <Link
            key={value}
            href={`/machines/${machine.id}?tab=${value}`}
            className={`rounded-md border px-3 py-1.5 text-sm ${tab === value ? 'border-slate-900 bg-slate-900 text-white' : 'hover:bg-slate-100'}`}
          >
            {label}
          </Link>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border bg-white p-4">
            <h2 className="mb-3 text-lg font-semibold">Maskinoversikt</h2>
            <dl className="grid grid-cols-2 gap-2 text-sm">
              <dt className="text-slate-500">Prosjekt</dt><dd>{machine.projectRef?.name ?? machine.project}</dd>
              <dt className="text-slate-500">Ansvarlig</dt><dd>{machine.responsibleUser?.name ?? 'Ingen'}</dd>
              <dt className="text-slate-500">Manuell status</dt><dd>{machine.manualOverrideStatus ?? 'Auto'}</dd>
              <dt className="text-slate-500">Overstyringsnotat</dt><dd>{machine.manualOverrideReason ?? '—'}</dd>
            </dl>
          </div>

          {user.role === UserRole.ADMIN && (
            <div className="rounded-xl border bg-white p-4">
              <h2 className="mb-3 text-lg font-semibold">Manuell statusoverstyring</h2>
              <form action={setManualMachineStatus} className="grid gap-3">
                <input type="hidden" name="machineId" value={machine.id} />
                <label className="text-sm font-medium">
                  Status
                  <select name="status" defaultValue={machine.manualOverrideStatus ?? 'AUTO'} className="mt-1 w-full rounded-md border px-3 py-2">
                    <option value="AUTO">Auto (basert på booking)</option>
                    {machineStatusOptions.map((status) => (
                      <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                  </select>
                </label>
                <label className="text-sm font-medium">
                  Begrunnelse
                  <textarea name="reason" defaultValue={machine.manualOverrideReason ?? ''} rows={3} className="mt-1 w-full rounded-md border px-3 py-2" />
                </label>
                <FormSubmitButton idleText="Lagre overstyring" pendingText="Lagrer…" className="w-fit rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white" />
              </form>
            </div>
          )}
        </div>
      )}

      {tab === 'calendar' && (
        <div className="space-y-4 rounded-xl border bg-white p-4">
          <h2 className="text-lg font-semibold">Kalender / liste</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-100 text-left">
                <tr>
                  <th className="px-3 py-2">Fra</th>
                  <th className="px-3 py-2">Til</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Lokasjon</th>
                  <th className="px-3 py-2">Prosjekt</th>
                  <th className="px-3 py-2">Ansvarlig</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id} className="border-t">
                    <td className="px-3 py-2">{booking.startAt.toLocaleString('nb-NO')}</td>
                    <td className="px-3 py-2">{booking.endAt.toLocaleString('nb-NO')}</td>
                    <td className="px-3 py-2">{bookingStatusLabels[booking.status]}</td>
                    <td className="px-3 py-2">{booking.location}</td>
                    <td className="px-3 py-2">{booking.project?.name ?? '—'}</td>
                    <td className="px-3 py-2">{booking.responsibleUser.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'booking' && (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border bg-white p-4">
            <h2 className="mb-3 text-lg font-semibold">Opprett booking</h2>
            <form action={createBooking} className="grid gap-3">
              <input type="hidden" name="machineId" value={machine.id} />
              <label className="text-sm font-medium">Prosjekt
                <select name="projectId" className="mt-1 w-full rounded-md border px-3 py-2" defaultValue={machine.projectId ?? ''}>
                  <option value="">Ingen prosjekt</option>
                  {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
                </select>
              </label>
              <label className="text-sm font-medium">Lokasjon<input required name="location" className="mt-1 w-full rounded-md border px-3 py-2" /></label>
              <div className="grid grid-cols-2 gap-3">
                <label className="text-sm font-medium">Fra<input required type="datetime-local" name="startAt" className="mt-1 w-full rounded-md border px-3 py-2" /></label>
                <label className="text-sm font-medium">Til<input required type="datetime-local" name="endAt" className="mt-1 w-full rounded-md border px-3 py-2" /></label>
              </div>
              <label className="text-sm font-medium">Ansvarlig bruker
                <select name="responsibleUserId" className="mt-1 w-full rounded-md border px-3 py-2" defaultValue={machine.responsibleUserId ?? ''} required>
                  <option value="" disabled>Velg ansvarlig</option>
                  {users.map((scopeUser) => <option key={scopeUser.id} value={scopeUser.id}>{scopeUser.name}</option>)}
                </select>
              </label>
              <label className="text-sm font-medium">Firma<input name="companyName" className="mt-1 w-full rounded-md border px-3 py-2" /></label>
              <label className="text-sm font-medium">Kommentar<textarea name="comment" rows={3} className="mt-1 w-full rounded-md border px-3 py-2" /></label>
              {user.role === UserRole.ADMIN && (
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="allowConflict" value="1" /> Tillat overstyring ved konflikt (admin)</label>
              )}
              <FormSubmitButton idleText="Opprett booking" pendingText="Lagrer…" className="w-fit rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white" />
            </form>
          </div>

          <div className="rounded-xl border bg-white p-4">
            <h2 className="mb-3 text-lg font-semibold">Eksisterende bookinger</h2>
            <div className="space-y-3">
              {bookings.map((booking) => (
                <div key={booking.id} className="rounded-lg border p-3">
                  <p className="text-sm font-medium">{booking.startAt.toLocaleString('nb-NO')} → {booking.endAt.toLocaleString('nb-NO')}</p>
                  <p className="text-sm text-slate-600">{booking.location} · {booking.responsibleUser.name}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Link href={`/machines/${machine.id}?tab=booking&editBooking=${booking.id}`} className="rounded-md border px-2 py-1 text-xs hover:bg-slate-100">Rediger</Link>
                    <form action={cancelBooking}>
                      <input type="hidden" name="machineId" value={machine.id} />
                      <input type="hidden" name="bookingId" value={booking.id} />
                      <FormSubmitButton idleText="Kanseller" pendingText="Kansellerer…" className="rounded-md border px-2 py-1 text-xs" />
                    </form>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {bookingToEdit && (
            <div className="rounded-xl border bg-white p-4 lg:col-span-2">
              <h2 className="mb-3 text-lg font-semibold">Rediger booking</h2>
              <form action={updateBooking} className="grid gap-3 lg:grid-cols-2">
                <input type="hidden" name="bookingId" value={bookingToEdit.id} />
                <input type="hidden" name="machineId" value={machine.id} />
                <label className="text-sm font-medium">Prosjekt
                  <select name="projectId" defaultValue={bookingToEdit.projectId ?? ''} className="mt-1 w-full rounded-md border px-3 py-2">
                    <option value="">Ingen prosjekt</option>
                    {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
                  </select>
                </label>
                <label className="text-sm font-medium">Lokasjon<input required name="location" defaultValue={bookingToEdit.location} className="mt-1 w-full rounded-md border px-3 py-2" /></label>
                <label className="text-sm font-medium">Fra<input required type="datetime-local" name="startAt" defaultValue={toInputDateTime(bookingToEdit.startAt)} className="mt-1 w-full rounded-md border px-3 py-2" /></label>
                <label className="text-sm font-medium">Til<input required type="datetime-local" name="endAt" defaultValue={toInputDateTime(bookingToEdit.endAt)} className="mt-1 w-full rounded-md border px-3 py-2" /></label>
                <label className="text-sm font-medium">Ansvarlig bruker
                  <select name="responsibleUserId" defaultValue={bookingToEdit.responsibleUserId} className="mt-1 w-full rounded-md border px-3 py-2">
                    {users.map((scopeUser) => <option key={scopeUser.id} value={scopeUser.id}>{scopeUser.name}</option>)}
                  </select>
                </label>
                <label className="text-sm font-medium">Firma<input name="companyName" defaultValue={bookingToEdit.companyName ?? ''} className="mt-1 w-full rounded-md border px-3 py-2" /></label>
                <label className="text-sm font-medium lg:col-span-2">Kommentar<textarea name="comment" defaultValue={bookingToEdit.comment ?? ''} rows={3} className="mt-1 w-full rounded-md border px-3 py-2" /></label>
                {user.role === UserRole.ADMIN && (
                  <label className="flex items-center gap-2 text-sm lg:col-span-2"><input type="checkbox" name="allowConflict" value="1" /> Tillat overstyring ved konflikt (admin)</label>
                )}
                <FormSubmitButton idleText="Lagre booking" pendingText="Lagrer…" className="w-fit rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white" />
              </form>
            </div>
          )}
        </div>
      )}

      {tab === 'history' && (
        <div className="space-y-4">
          <div className="rounded-xl border bg-white p-4">
            <h2 className="mb-3 text-lg font-semibold">Filter historikk</h2>
            <form className="grid gap-3 md:grid-cols-4">
              <input type="hidden" name="tab" value="history" />
              <label className="text-sm font-medium">Fra dato<input type="date" name="from" defaultValue={searchParams?.from ?? ''} className="mt-1 w-full rounded-md border px-3 py-2" /></label>
              <label className="text-sm font-medium">Til dato<input type="date" name="to" defaultValue={searchParams?.to ?? ''} className="mt-1 w-full rounded-md border px-3 py-2" /></label>
              <label className="text-sm font-medium">Prosjekt<select name="projectId" defaultValue={searchParams?.projectId ?? ''} className="mt-1 w-full rounded-md border px-3 py-2"><option value="">Alle</option>{projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
              <label className="text-sm font-medium">Bruker<select name="userId" defaultValue={searchParams?.userId ?? ''} className="mt-1 w-full rounded-md border px-3 py-2"><option value="">Alle</option>{users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</select></label>
              <FormSubmitButton idleText="Filtrer" pendingText="Filtrerer…" className="w-fit rounded-md border px-3 py-2 text-sm" />
            </form>
          </div>

          <div className="rounded-xl border bg-white p-4">
            <h3 className="mb-3 text-lg font-semibold">Lokasjonslogg</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-100 text-left">
                  <tr><th className="px-3 py-2">Tidspunkt</th><th className="px-3 py-2">Lokasjon</th><th className="px-3 py-2">Prosjekt</th><th className="px-3 py-2">Ansvarlig</th><th className="px-3 py-2">Registrert av</th></tr>
                </thead>
                <tbody>
                  {locationHistory.map((item) => (
                    <tr key={item.id} className="border-t"><td className="px-3 py-2">{item.createdAt.toLocaleString('nb-NO')}</td><td className="px-3 py-2">{item.location}</td><td className="px-3 py-2">{item.project?.name ?? '—'}</td><td className="px-3 py-2">{item.responsibleUser?.name ?? '—'}</td><td className="px-3 py-2">{item.createdBy?.name ?? 'System'}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-xl border bg-white p-4">
            <h3 className="mb-3 text-lg font-semibold">Endringslogg</h3>
            <div className="space-y-2 text-sm">
              {statusLogs.map((item) => (
                <div key={item.id} className="rounded-md border p-2">{item.createdAt.toLocaleString('nb-NO')} · {item.source} · {item.fromStatus ?? '—'} → {item.toStatus} · {item.createdBy?.name ?? 'System'}</div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function toInputDateTime(date: Date) {
  const copy = new Date(date);
  copy.setMinutes(copy.getMinutes() - copy.getTimezoneOffset());
  return copy.toISOString().slice(0, 16);
}
