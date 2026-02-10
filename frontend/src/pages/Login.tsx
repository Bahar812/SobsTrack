import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import ThemeToggle from '../components/ThemeToggle';
import { storeAuth } from '../utils/auth';
import { showToast } from '../utils/toast';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      storeAuth(response.data.token, response.data.user);
      const nextPath = response.data.user.role === 'sales' ? '/sales-dashboard' : '/dashboard';
      navigate(nextPath, { replace: true });
    } catch (error) {
      setErrorMessage('Login gagal. Periksa email dan password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (errorMessage) {
      showToast(errorMessage, 'error');
    }
  }, [errorMessage]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <div className="mesh-bg">
        <div className="mesh-blob h-56 w-56 bg-emerald-200/60 dark:bg-emerald-500/20 left-[4%] top-[12%]" />
        <div className="mesh-blob is-secondary h-64 w-64 bg-sky-200/60 dark:bg-sky-500/20 right-[8%] top-[6%]" />
        <div className="mesh-blob is-tertiary h-72 w-72 bg-amber-200/60 dark:bg-amber-500/20 left-[18%] bottom-[8%]" />
      </div>
      <div className="absolute right-6 top-6 z-10">
        <ThemeToggle />
      </div>
      <div className="relative z-10 mx-auto flex min-h-screen max-w-5xl items-center gap-10 px-6">
        <div className="hidden flex-1 md:block">
          <h1 className="font-display text-4xl font-semibold">Dealer Motor Dashboard</h1>
          <p className="mt-3 text-slate-600 dark:text-slate-400">
            Pantau absensi, aktivitas, leads, SPK, dokumen, harga, dan stok secara real-time.
          </p>
          <div className="mt-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 p-6 shadow-glow">
            <p className="text-sm text-slate-700 dark:text-slate-300">Highlight hari ini</p>
            <p className="mt-2 font-display text-2xl text-emerald-600 dark:text-emerald-300">21 SPK tercapai</p>
            <p className="text-xs text-slate-500">Target cabang 40 unit</p>
          </div>
        </div>
        <form className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 p-8 shadow-glow" onSubmit={handleSubmit}>
          <h2 className="font-display text-2xl font-semibold">Masuk</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">Gunakan akun leader atau sales</p>
          {errorMessage && (
            <p className="mt-4 rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-700 dark:text-rose-200">
              {errorMessage}
            </p>
          )}
          <div className="mt-6 space-y-4">
            <input
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm"
              placeholder="Email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <input
              type="password"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm"
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            <button
              className="w-full rounded-xl bg-emerald-500 py-2 text-sm font-semibold text-emerald-950 disabled:cursor-not-allowed disabled:opacity-70"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Memproses...' : 'Login'}
            </button>
          </div>
          <p className="mt-4 text-xs text-slate-500">Demo: admin@dealer.local / password</p>
        </form>
      </div>
    </div>
  );
}
