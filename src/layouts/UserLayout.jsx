import { NavLink, Outlet } from 'react-router';

import { ClipboardIcon, HomeIcon } from '../components/icons';
import { Logo } from '../components/ui';

const NAV_ITEMS = [
  { to: '/', label: 'Acasă', icon: HomeIcon, end: true },
  { to: '/rezervari', label: 'Rezervări', icon: ClipboardIcon },
];

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
 * bottom bar on phones.
 */
export default function UserLayout() {
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
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-10">
        <Outlet />
      </main>
      <nav
        className="fixed inset-x-0 bottom-0 z-20 grid auto-cols-fr grid-flow-col bg-principala pb-[env(safe-area-inset-bottom)] md:hidden"
        aria-label="Navigare principală"
      >
        {NAV_ITEMS.map((item) => (
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
