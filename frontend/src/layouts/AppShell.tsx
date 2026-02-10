import type { AuthUser } from '../utils/auth';
import { NavLink, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import ThemeToggle from '../components/ThemeToggle';

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/sales-dashboard', label: 'Dashboard' },
  { to: '/absensi', label: 'Absensi' },
  { to: '/aktivitas', label: 'Aktivitas' },
  { to: '/leads', label: 'Leads' },
  { to: '/kalender', label: 'Kalender' },
  { to: '/spk', label: 'SPK / DO' },
  { to: '/dokumen', label: 'Dokumen' },
  { to: '/analysis', label: 'Analysis' },
  { to: '/cabang', label: 'Cabang' },
  { to: '/goals', label: 'Goals' },
  { to: '/units', label: 'Unit' },
  { to: '/users', label: 'User' },
  { to: '/izin', label: 'Izin / Cuti' },
  { to: '/operasional', label: 'Klaim Operasional' },
];

const salesAllowed = new Set(['/sales-dashboard', '/absensi', '/aktivitas', '/kalender', '/dokumen']);

type AppShellProps = {
  user: AuthUser;
  onLogout: () => void;
};

export default function AppShell({ user, onLogout }: AppShellProps) {
  const filteredNavItems = navItems.filter((item) => {
    if (item.to === '/dashboard') {
      return user.role !== 'sales';
    }
    if (item.to === '/sales-dashboard') {
      return user.role === 'sales';
    }
    if (item.to === '/users') {
      return user.role === 'admin';
    }
    if (item.to === '/izin') {
      return user.role === 'sales';
    }
    if (item.to === '/operasional') {
      return user.role === 'sales';
    }
    if (item.to === '/goals') {
      return user.role === 'admin';
    }
    if (item.to === '/units') {
      return user.role === 'admin';
    }
    if (item.to === '/cabang') {
      return user.role === 'admin' || user.role === 'leader';
    }
    if (user.role === 'sales') {
      return salesAllowed.has(item.to);
    }
    return true;
  });
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60000);
    return () => window.clearInterval(timer);
  }, []);

  const currentDate = new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(now);
  const currentTime = new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(now);

  return (
    <div className="relative min-h-screen overflow-hidden text-slate-900 dark:text-slate-100">
      <div className="mesh-bg">
        <div className="mesh-blob h-56 w-56 bg-emerald-200/60 dark:bg-emerald-500/20 left-[6%] top-[8%]" />
        <div className="mesh-blob is-secondary h-64 w-64 bg-sky-200/60 dark:bg-sky-500/20 right-[4%] top-[12%]" />
        <div className="mesh-blob is-tertiary h-72 w-72 bg-amber-200/60 dark:bg-amber-500/20 right-[8%] bottom-[10%]" />
      </div>
      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl gap-6 px-4 py-6">
        <aside className="hidden w-64 flex-shrink-0 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 p-6 shadow-glow md:block">
          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-600 dark:text-slate-400">Dealer Hub</p>
            <h1 className="font-display text-2xl font-semibold text-slate-900 dark:text-white">CRM</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">Marketing & Sales</p>
          </div>
          <nav className="space-y-2">
            {filteredNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `block rounded-xl px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-300'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <div className="flex-1">
          <header className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 px-6 py-4 shadow-glow">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-600 dark:text-slate-400">Cabang Pusat</p>
              <h2 className="font-display text-2xl font-semibold">Dashboard Internal</h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">{currentDate} • {currentTime} WIB</p>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <div className="rounded-2xl bg-slate-100 dark:bg-slate-800/70 px-4 py-2">
                <p className="text-sm text-slate-800 dark:text-slate-200">{user.name}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">{user.email}</p>
                <p className="text-xs uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-300">{user.role}</p>
              </div>
              <button
                className="rounded-2xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm text-slate-800 dark:text-slate-200 hover:border-emerald-500 dark:hover:border-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-200"
                onClick={onLogout}
              >
                Logout
              </button>
            </div>
          </header>

          <main className="space-y-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
