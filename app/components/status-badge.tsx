import { MachineStatus } from '@prisma/client';

const statusLabel: Record<MachineStatus, string> = {
  LEDIG: 'Tilgjengelig',
  TILDELT: 'Tildelt',
  BOOKET: 'Booket',
  I_BRUK: 'I bruk',
  SERVICE: 'Service',
  UTE_AV_DRIFT: 'Ute av drift'
};

const statusClasses: Record<MachineStatus, string> = {
  LEDIG: 'bg-emerald-100 text-emerald-800',
  TILDELT: 'bg-blue-100 text-blue-800',
  BOOKET: 'bg-indigo-100 text-indigo-800',
  I_BRUK: 'bg-cyan-100 text-cyan-800',
  SERVICE: 'bg-amber-100 text-amber-800',
  UTE_AV_DRIFT: 'bg-rose-100 text-rose-800'
};

export function StatusBadge({ status }: { status: MachineStatus }) {
  return (
    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusClasses[status]}`}>
      {statusLabel[status]}
    </span>
  );
}
