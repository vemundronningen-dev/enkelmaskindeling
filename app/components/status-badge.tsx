import { MachineStatus } from '@prisma/client';

const statusLabel: Record<MachineStatus, string> = {
  LEDIG: 'Ledig',
  TILDELT: 'Tildelt',
  SERVICE: 'Service'
};

const statusClasses: Record<MachineStatus, string> = {
  LEDIG: 'bg-emerald-100 text-emerald-800',
  TILDELT: 'bg-blue-100 text-blue-800',
  SERVICE: 'bg-amber-100 text-amber-800'
};

export function StatusBadge({ status }: { status: MachineStatus }) {
  return (
    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusClasses[status]}`}>
      {statusLabel[status]}
    </span>
  );
}
