import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';

import { errorMessage } from '../api/errors';
import { getMe } from '../api/users';
import { useAuth } from '../auth/AuthContext';
import { ChevronRightIcon } from '../components/icons';
import { Avatar, Button, ErrorState, LoadingState } from '../components/ui';
import { formatDate, monthlyRemainingCounter } from '../lib/format';

const ROLE_LABELS = {
  student: 'Student',
  teacher: 'Profesor',
  admin: 'Administrator',
};

function AccountCard({ user }) {
  if (user.status === 'blocked') {
    return (
      <section className="rounded-xl bg-suprafata p-4 ring-1 ring-red-600">
        <h2 className="flex items-center gap-2 text-base font-bold text-red-700">
          <span className="size-3 rounded-full bg-red-600" aria-hidden="true" />
          {user.blockedUntil
            ? `Cont blocat până la ${formatDate(user.blockedUntil)}`
            : 'Cont blocat'}
        </h2>
        <p className="mt-2 text-sm">Neprezentări: {user.noShowCount}</p>
        {/* TODO(M2): "Plătește amenda" button, once fine payments exist. */}
      </section>
    );
  }
  return (
    <section className="rounded-xl bg-suprafata p-4 ring-1 ring-bordura">
      <h2 className="flex items-center gap-2 text-base font-bold">
        <span className="size-3 rounded-full bg-text" aria-hidden="true" />
        Cont activ
      </h2>
      <p className="mt-2 text-sm">{monthlyRemainingCounter(user)}</p>
      <p className="mt-1 text-sm">Neprezentări: {user.noShowCount}</p>
    </section>
  );
}

/** Screen 09 Profil (Figma; 09b for blocked accounts), from GET /users/me. */
export default function ProfilePage() {
  const { logout } = useAuth();
  // Refetched on every visit, so the counters are current.
  const me = useQuery({ queryKey: ['me'], queryFn: getMe });

  if (me.isPending) {
    return <LoadingState />;
  }
  if (me.isError) {
    return (
      <ErrorState text={errorMessage(me.error)} onRetry={() => me.refetch()} />
    );
  }
  const user = me.data;

  return (
    <div className="flex min-h-[calc(100dvh-12rem)] flex-col gap-6 md:min-h-[calc(100dvh-9rem)]">
      <h1 className="text-[24px] font-bold md:text-[32px]">Profil</h1>
      <div className="grid gap-6 md:grid-cols-2 md:gap-8">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <Avatar fullName={user.fullName} className="size-16 text-base" />
            <div>
              <p className="text-base font-bold">{user.fullName}</p>
              <p className="text-sm text-text-secundar">{user.email}</p>
              <span className="mt-1 inline-block rounded-full bg-accent px-3 py-0.5 text-xs font-bold">
                {ROLE_LABELS[user.role] ?? user.role}
              </span>
            </div>
          </div>
          <AccountCard user={user} />
        </div>
        <section>
          <h2 className="text-base font-bold">Setări</h2>
          {/* TODO(M2): "Notificări prin email" switch; nothing stores it yet. */}
          <Link
            to="/profil/parola"
            className="mt-3 flex items-center justify-between border-b border-bordura py-3 text-sm hover:text-principala"
          >
            Schimbă parola
            <ChevronRightIcon className="size-4" />
          </Link>
        </section>
      </div>
      <div className="mt-auto flex md:justify-end">
        <Button variant="outline" onClick={logout} className="w-full md:w-48">
          Deconectare
        </Button>
      </div>
    </div>
  );
}
