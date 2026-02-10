import { useEffect, useState } from 'react';
import type { ThemeMode } from '../utils/theme';
import { resolveTheme, setTheme } from '../utils/theme';

type ThemeToggleProps = {
  className?: string;
};

export default function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const [theme, setThemeState] = useState<ThemeMode>(() => resolveTheme());

  useEffect(() => {
    const handleThemeChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ theme: ThemeMode }>;
      if (customEvent.detail?.theme) {
        setThemeState(customEvent.detail.theme);
      }
    };

    window.addEventListener('themechange', handleThemeChange);
    return () => window.removeEventListener('themechange', handleThemeChange);
  }, []);

  const handleToggle = () => {
    const nextTheme: ThemeMode = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    setThemeState(nextTheme);
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-pressed={theme === 'dark'}
      className={`inline-flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/60 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 dark:text-slate-200 shadow-glow transition hover:border-emerald-500 dark:hover:border-emerald-400 ${className}`}
    >
      <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
      {theme === 'dark' ? 'Dark' : 'Light'}
    </button>
  );
}
