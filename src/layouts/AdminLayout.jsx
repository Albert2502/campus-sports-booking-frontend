import { Link, NavLink, Outlet } from 'react-router';

import { useAuth } from '../auth/AuthContext';
import { ArrowLeftIcon, GridIcon, LogoutIcon } from '../components/icons';

// Figma also has Rapoarte, Rezervări and Utilizatori și reguli; each one is
// added with its own task.
const NAV_ITEMS = [
  { to: '/admin/facilitati', label: 'Facilități', icon: GridIcon },
];

function sideNavClass({ isActive }) {
  return `block rounded-md px-3 py-2 text-sm font-bold ring-1 ring-bordura ${
    isActive ? 'bg-accent text-white' : 'bg-suprafata text-text hover:bg-fundal'
  }`;
}

function bottomNavClass({ isActive }) {
  return `flex flex-col items-center gap-1 py-2 text-xs ${
    isActive ? 'font-bold text-accent' : 'text-white/85'
  }`;
}

const bottomItemClass =
  'flex flex-col items-center gap-1 py-2 text-xs text-white/85';

/**
 * Admin pages, as in the Figma frames "Admin – Facilități": blue sidebar on
 * desktop, blue bottom bar on phones. Rendered only inside AdminRoute.
 */
export default function AdminLayout() {
  const { logout } = useAuth();
  return (
    <div className="min-h-dvh pb-24 md:pb-0 md:pl-60">
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col bg-principala p-6 text-white md:flex">
        <p className="text-[24px] font-bold">Administrator</p>
        <nav className="mt-8 flex flex-col gap-8" aria-label="Administrare">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} className={sideNavClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto flex flex-col gap-3 text-sm">
          <Link to="/" className="py-1 text-white/90 hover:text-white">
            ‹ Înapoi la aplicație
          </Link>
          <button
            type="button"
            onClick={logout}
            className="rounded-md px-3 py-1.5 text-left text-white/90 ring-1 ring-white/50 hover:bg-white/10"
          >
            Ieșire
          </button>
        </div>
      </aside>
      <header className="flex items-baseline justify-between px-6 pt-6 md:hidden">
        <p className="text-lg font-bold text-principala">Administrator</p>
        <p className="text-sm font-bold text-principala">Administrare</p>
      </header>
      <main className="px-6 py-6 md:px-8 md:py-8">
        <Outlet />
      </main>
      <nav
        className="fixed inset-x-0 bottom-0 z-20 grid auto-cols-fr grid-flow-col bg-principala pb-[env(safe-area-inset-bottom)] md:hidden"
        aria-label="Administrare"
      >
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.to} to={item.to} className={bottomNavClass}>
            <item.icon className="size-5" />
            {item.label}
          </NavLink>
        ))}
        <Link to="/" className={bottomItemClass}>
          <ArrowLeftIcon className="size-5" />
          Înapoi la aplicație
        </Link>
        <button type="button" onClick={logout} className={bottomItemClass}>
          <LogoutIcon className="size-5" />
          Ieșire
        </button>
      </nav>
    </div>
  );
}
