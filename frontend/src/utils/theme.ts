export type ThemeMode = 'light' | 'dark';

const STORAGE_KEY = 'bikershop-theme';

const isThemeMode = (value: string | null): value is ThemeMode =>
  value === 'light' || value === 'dark';

export const getStoredTheme = (): ThemeMode | null => {
  const value = localStorage.getItem(STORAGE_KEY);
  return isThemeMode(value) ? value : null;
};

export const getSystemTheme = (): ThemeMode =>
  window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

export const resolveTheme = (): ThemeMode => getStoredTheme() ?? getSystemTheme();

export const applyTheme = (theme: ThemeMode) => {
  document.documentElement.classList.toggle('dark', theme === 'dark');
};

export const setTheme = (theme: ThemeMode) => {
  localStorage.setItem(STORAGE_KEY, theme);
  applyTheme(theme);
  window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
};

export const initTheme = (): ThemeMode => {
  const theme = resolveTheme();
  applyTheme(theme);
  return theme;
};
