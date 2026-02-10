import { Navigate, Route, Routes } from 'react-router-dom';
import AppShell from './layouts/AppShell';
import DashboardHome from './pages/DashboardHome';
import SalesDashboard from './pages/SalesDashboard';
import Izin from './pages/Izin';
import Operasional from './pages/Operasional';
import Absensi from './pages/Absensi';
import Aktivitas from './pages/Aktivitas';
import Leads from './pages/Leads';
import Kalender from './pages/Kalender';
import Spk from './pages/Spk';
import Dokumen from './pages/Dokumen';
import Analysis from './pages/Analysis';
import Users from './pages/Users';
import Cabang from './pages/Cabang';
import Goals from './pages/Goals';
import Units from './pages/Units';
import Login from './pages/Login';
import SobsTrackLanding from './pages/SobsTrackLanding';
import api from './api/client';
import { clearAuth, getStoredUser, getToken, onAuthChange, storeAuth } from './utils/auth';
import { useEffect, useMemo, useState } from 'react';

export default function App() {
  const [user, setUser] = useState(getStoredUser());
  const [isLoading, setIsLoading] = useState(true);

  const redirectForRole = useMemo(() => {
    if (!user) {
      return '/login';
    }
    return user.role === 'sales' ? '/sales-dashboard' : '/dashboard';
  }, [user]);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setIsLoading(false);
      return;
    }
    if (user) {
      setIsLoading(false);
      return;
    }
    api
      .get('/auth/me')
      .then((response) => {
        storeAuth(token, response.data);
        setUser(response.data);
      })
      .catch(() => {
        clearAuth();
      })
      .finally(() => setIsLoading(false));
  }, [user]);

  useEffect(() => {
    return onAuthChange(() => {
      setUser(getStoredUser());
    });
  }, []);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      clearAuth();
      setUser(null);
    }
  };

  if (isLoading) {
    return null;
  }

  return (
    <Routes>
      <Route path="/" element={<SobsTrackLanding />} />
      <Route path="/sobs-track" element={<SobsTrackLanding />} />
      <Route path="/login" element={<Login />} />
      <Route
        element={
          user ? <AppShell user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />
        }
      >
        <Route
          path="/dashboard"
          element={user?.role === 'sales' ? <Navigate to="/sales-dashboard" replace /> : <DashboardHome />}
        />
        <Route
          path="/sales-dashboard"
          element={user?.role === 'sales' ? <SalesDashboard /> : <Navigate to="/dashboard" replace />}
        />
        <Route
          path="/izin"
          element={user?.role === 'sales' ? <Izin /> : <Navigate to="/dashboard" replace />}
        />
        <Route
          path="/operasional"
          element={user?.role === 'sales' ? <Operasional /> : <Navigate to="/dashboard" replace />}
        />
        <Route path="/absensi" element={<Absensi />} />
        <Route path="/aktivitas" element={<Aktivitas />} />
        <Route
          path="/leads"
          element={user?.role === 'sales' ? <Navigate to="/absensi" replace /> : <Leads />}
        />
        <Route path="/kalender" element={<Kalender />} />
        <Route
          path="/spk"
          element={user?.role === 'sales' ? <Navigate to="/absensi" replace /> : <Spk />}
        />
        <Route path="/dokumen" element={<Dokumen />} />
        <Route path="/analysis" element={<Analysis />} />
        <Route
          path="/cabang"
          element={
            user?.role === 'admin' || user?.role === 'leader' ? (
              <Cabang />
            ) : (
              <Navigate to="/absensi" replace />
            )
          }
        />
        <Route
          path="/goals"
          element={user?.role === 'admin' ? <Goals /> : <Navigate to="/absensi" replace />}
        />
        <Route
          path="/users"
          element={user?.role === 'admin' ? <Users /> : <Navigate to="/absensi" replace />}
        />
        <Route
          path="/units"
          element={user?.role === 'admin' ? <Units /> : <Navigate to="/absensi" replace />}
        />
      </Route>
      <Route path="*" element={<Navigate to={redirectForRole} replace />} />
    </Routes>
  );
}
