'use client';

import { useState } from 'react';
import { UserRole } from '@prisma/client';
import { updateUser } from './actions';
import { FormSubmitButton } from '@/app/components/form-submit-button';

type MachineSummary = {
  id: string;
  name: string;
  machineNumber: string;
};

type UserCardProps = {
  currentUserId: string;
  currentUserRole: UserRole;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    role: UserRole;
    company: {
      name: string;
    } | null;
    department: {
      name: string;
    } | null;
    machines: MachineSummary[];
  };
};

export function UserCard({ currentUserId, currentUserRole, user }: UserCardProps) {
  const canEdit = currentUserRole === UserRole.ADMIN || currentUserId === user.id;
  const canEditRole = currentUserRole === UserRole.ADMIN;
  const [isEditing, setIsEditing] = useState(false);

  return (
    <article className="rounded-xl border bg-white p-4">
      {!isEditing ? (
        <>
          <h2 className="text-lg font-semibold">{user.name}</h2>
          <p className="text-sm text-slate-600">{user.email}</p>
          <p className="text-sm text-slate-600">Telefon: {user.phone || 'Ikke registrert'}</p>
          <p className="text-sm text-slate-600">Rolle: {user.role}</p>
          <p className="text-sm text-slate-600">
            {user.company?.name ?? 'Ingen bedrift'} {user.department ? `· ${user.department.name}` : ''}
          </p>
          {canEdit && (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="mt-3 rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Rediger
            </button>
          )}
        </>
      ) : (
        <form action={updateUser} className="space-y-3">
          <input type="hidden" name="userId" value={user.id} />
          <label className="block text-sm font-medium text-slate-800">
            Fullt navn
            <input
              name="name"
              defaultValue={user.name}
              className="mt-1 w-full rounded-md border px-3 py-2"
              required
              minLength={2}
            />
          </label>
          <label className="block text-sm font-medium text-slate-800">
            E-post
            <input
              type="email"
              name="email"
              defaultValue={user.email}
              className="mt-1 w-full rounded-md border px-3 py-2"
              required
            />
          </label>
          <label className="block text-sm font-medium text-slate-800">
            Telefonnummer
            <input
              type="tel"
              name="phone"
              defaultValue={user.phone ?? ''}
              className="mt-1 w-full rounded-md border px-3 py-2"
              placeholder="+47 999 99 999"
            />
          </label>
          {canEditRole && (
            <label className="block text-sm font-medium text-slate-800">
              Rolle
              <select name="role" defaultValue={user.role} className="mt-1 w-full rounded-md border px-3 py-2">
                <option value={UserRole.USER}>Standardbruker</option>
                <option value={UserRole.ADMIN}>Administrator</option>
              </select>
            </label>
          )}
          <div className="flex items-center gap-2 pt-1">
            <FormSubmitButton
              idleText="Lagre"
              pendingText="Lagrer…"
              className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            />
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Avbryt
            </button>
          </div>
        </form>
      )}

      <div className="mt-3">
        <h3 className="text-sm font-medium">Ansvarlige maskiner</h3>
        {user.machines.length > 0 ? (
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
            {user.machines.map((machine) => (
              <li key={machine.id}>
                {machine.name} ({machine.machineNumber})
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-slate-500">Ingen maskiner tildelt.</p>
        )}
      </div>
    </article>
  );
}
