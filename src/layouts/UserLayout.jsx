import { NavLink, Outlet } from 'react-router';

import { useAuth } from '../auth/AuthContext';
import { ClipboardIcon, HomeIcon, UserIcon } from '../components/icons';
import { Avatar, Logo } from '../components/ui';

const NAV_ITEMS = [
  { to: '/', label: 'Acasă', icon: HomeIcon, end: true },
  { to: '/rezervari', label: 'Rezervări', icon: ClipboardIcon },
];

// The phone bar ends with Profil (Figma); on desktop the name links there.
const PROFILE_ITEM = { to: '/profil', label: 'Profil', icon: UserIcon };

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

/**
 * Student and teacher pages, as in Figma: blue top bar on desktop, blue
 * bottom bar on phones. Rendered only inside ProtectedRoute.
 */
export default function UserLayout() {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-dvh pb-24 md:pb-0">
      <header className="hidden bg-principala text-white md:block">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-10 px-6">
          <Logo inverted />
          <nav className="flex gap-7 text-sm" aria-label="Navigare principală">
            {NAV_ITEMS.map((item) => (
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
            <NavLink
              to={PROFILE_ITEM.to}
              className="flex items-center gap-3 text-sm font-bold underline-offset-4 hover:underline"
            >
              <Avatar fullName={user.fullName} />
              {user.fullName}
            </NavLink>
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
      <nav
        className="fixed inset-x-0 bottom-0 z-20 grid auto-cols-fr grid-flow-col bg-principala pb-[env(safe-area-inset-bottom)] md:hidden"
        aria-label="Navigare principală"
      >
        {[...NAV_ITEMS, PROFILE_ITEM].map((item) => (
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
      </nav>
    </div>
  );
}
