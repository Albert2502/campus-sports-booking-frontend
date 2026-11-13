import { NavLink, Outlet } from 'react-router';

import { useAuth } from '../auth/AuthContext';
import { ClipboardIcon, FieldIcon, HomeIcon, LogoutIcon } from './icons';
import { Avatar, Logo } from './ui';

function topNavClass({ isActive }) {
  return `py-1 text-white/85 hover:text-white ${
    isActive ? 'font-bold text-white underline underline-offset-8' : ''
  }`;
}

function bottomNavClass({ isActive }) {
  return `flex flex-col items-center gap-1 py-2 text-xs ${
    isActive ? 'font-bold text-white' : 'text-white/75'
  }`;
}

function BottomNav({ items, onLogout }) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-3 bg-principala pb-[env(safe-area-inset-bottom)] md:hidden"
      aria-label="Navigare principală"
    >
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={bottomNavClass}
        >
          <item.icon className="size-6" />
          {item.label}
        </NavLink>
      ))}
      <button
        type="button"
        onClick={onLogout}
        className="flex flex-col items-center gap-1 py-2 text-xs text-white/75"
      >
        <LogoutIcon className="size-6" />
        Ieșire
      </button>
    </nav>
  );
}

const USER_NAV = [
  { to: '/', label: 'Acasă', icon: HomeIcon, end: true },
  { to: '/rezervari', label: 'Rezervări', icon: ClipboardIcon },
];

/** Student and teacher pages: blue top bar on desktop, bottom bar on phones. */
export function UserLayout() {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-dvh pb-24 md:pb-0">
      <header className="hidden bg-principala text-white md:block">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-10 px-6">
          <Logo inverted />
          <nav className="flex gap-7 text-sm" aria-label="Navigare principală">
            {USER_NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={topNavClass}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <Avatar fullName={user.fullName} />
            <span className="text-sm font-bold">{user.fullName}</span>
            <button
              type="button"
              onClick={logout}
              className="ml-2 rounded-md px-3 py-1.5 text-sm text-white/90 ring-1 ring-white/50 hover:bg-white/10"
            >
              Ieșire
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-10">
        <Outlet />
      </main>
      <BottomNav items={USER_NAV} onLogout={logout} />
    </div>
  );
}

const ADMIN_NAV = [
  { to: '/admin/rezervari', label: 'Rezervări', icon: ClipboardIcon },
  { to: '/admin/facilitati', label: 'Facilități', icon: FieldIcon },
];

function sideNavClass({ isActive }) {
  return `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${
    isActive
      ? 'bg-white/15 font-bold text-white'
      : 'text-white/80 hover:bg-white/10'
  }`;
}

/** Administrator pages: blue sidebar on desktop, bottom bar on phones. */
export function AdminLayout() {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-dvh pb-24 md:pb-0 md:pl-64">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col bg-principala p-5 text-white md:flex">
        <Logo inverted />
        <p className="mt-6 mb-2 px-3 text-xs tracking-wide text-white/60 uppercase">
          Administrare
        </p>
        <nav className="flex flex-col gap-1" aria-label="Administrare">
          {ADMIN_NAV.map((item) => (
            <NavLink key={item.to} to={item.to} className={sideNavClass}>
              <item.icon />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto flex items-center gap-3 border-t border-white/20 pt-4">
          <Avatar fullName={user.fullName} />
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">{user.fullName}</p>
            <button
              type="button"
              onClick={logout}
              className="text-xs text-white/80 underline hover:text-white"
            >
              Ieșire
            </button>
          </div>
        </div>
      </aside>
      <header className="flex items-center justify-between bg-principala px-4 py-3 md:hidden">
        <Logo inverted />
        <Avatar fullName={user.fullName} />
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 md:px-10 md:py-10">
        <Outlet />
      </main>
      <BottomNav items={ADMIN_NAV} onLogout={logout} />
    </div>
  );
}
