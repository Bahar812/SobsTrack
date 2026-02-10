export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'sales' | 'leader';
};

const USER_KEY = 'auth_user';
const AUTH_EVENT = 'auth:changed';

export const getStoredUser = (): AuthUser | null => {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
};

export const storeAuth = (token: string, user: AuthUser) => {
  localStorage.setItem('token', token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event(AUTH_EVENT));
};

export const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem(USER_KEY);
  window.dispatchEvent(new Event(AUTH_EVENT));
};

export const getToken = () => localStorage.getItem('token');

export const onAuthChange = (handler: () => void) => {
  window.addEventListener(AUTH_EVENT, handler);
  return () => window.removeEventListener(AUTH_EVENT, handler);
};
