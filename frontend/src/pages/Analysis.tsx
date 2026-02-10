import { useEffect, useMemo, useState } from 'react';
import api from '../api/client';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, BarElement, Tooltip, Legend);

type ForecastItem = {
  period: string;
  period_start: string;
  total_spk: number;
  total_do: number;
};

type AnalysisSummary = {
  forecast: {
    weekly: ForecastItem[];
    monthly: ForecastItem[];
  };
  top_units: Array<{ label: string; total: number }>;
  top_branches: Array<{ branch: string; total: number }>;
  age_per_unit: Array<{ label: string; avg_age: number; total: number }>;
  age_groups: Array<{ age_group: string; total: number }>;
};

const formatDateLong = (value?: string | null) => {
  if (!value) {
    return '-';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }).format(date);
};

  const formatMonth = (value: string) => {
  const [year, month] = value.split('-').map(Number);
  if (!year || !month) {
    return value;
  }
  return new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(
    new Date(year, month - 1, 1)
  );
};

export default function Analysis() {
  const [summary, setSummary] = useState<AnalysisSummary | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    api
      .get('/analysis/summary', {
        params: {
          start_date: startDate || undefined,
          end_date: endDate || undefined,
        },
      })
      .then((response) => setSummary(response.data))
      .catch(() => setSummary(null));
  }, [startDate, endDate]);

  const maxMonthly = useMemo(() => {
    return Math.max(...(summary?.forecast.monthly ?? []).map((item) => item.total_spk), 1);
  }, [summary]);

  const maxUnits = useMemo(() => {
    return Math.max(...(summary?.top_units ?? []).map((item) => item.total), 1);
  }, [summary]);

  const maxBranches = useMemo(() => {
    return Math.max(...(summary?.top_branches ?? []).map((item) => item.total), 1);
  }, [summary]);

  const maxAgePerUnit = useMemo(() => {
    return Math.max(...(summary?.age_per_unit ?? []).map((item) => item.avg_age || 0), 1);
  }, [summary]);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 p-6 shadow-glow">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-display text-xl font-semibold">Forecasting SPK / DO</h3>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <input
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm"
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
            <input
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm"
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
            />
          </div>
        </div>
        <div className="mt-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-950/40 p-4">
          <p className="text-sm text-slate-700 dark:text-slate-300">Per Bulan</p>
          {(summary?.forecast.monthly ?? []).length ? (
            <div className="mt-4 h-56">
              <Line
                data={{
                  labels: summary?.forecast.monthly.map((item) => formatMonth(item.period)),
                  datasets: [
                    {
                      label: 'SPK',
                      data: summary?.forecast.monthly.map((item) => item.total_spk),
                      borderColor: '#34d399',
                      backgroundColor: 'rgba(52, 211, 153, 0.2)',
                      tension: 0.35,
                    },
                    {
                      label: 'DO',
                      data: summary?.forecast.monthly.map((item) => item.total_do),
                      borderColor: '#38bdf8',
                      backgroundColor: 'rgba(56, 189, 248, 0.2)',
                      tension: 0.35,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { labels: { color: '#cbd5f5' } },
                  },
                  scales: {
                    x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(148,163,184,0.1)' } },
                    y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(148,163,184,0.1)' } },
                  },
                }}
              />
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-500">Belum ada data.</p>
          )}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 p-6 shadow-glow">
          <h3 className="font-display text-xl font-semibold">Top Unit Terjual</h3>
          {(summary?.top_units ?? []).length ? (
            <div className="mt-4 h-64">
              <Doughnut
                data={{
                  labels: summary?.top_units.map((item) => item.label),
                  datasets: [
                    {
                      data: summary?.top_units.map((item) => item.total),
                      backgroundColor: ['#34d399', '#38bdf8', '#a78bfa', '#f97316', '#22c55e', '#facc15', '#f43f5e', '#60a5fa'],
                      borderWidth: 0,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { labels: { color: '#cbd5f5' } },
                  },
                }}
              />
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-500">Belum ada data.</p>
          )}
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 p-6 shadow-glow">
          <h3 className="font-display text-xl font-semibold">Sebaran Penjualan Cabang</h3>
          {(summary?.top_branches ?? []).length ? (
            <div className="mt-4 h-64">
              <Doughnut
                data={{
                  labels: summary?.top_branches.map((item) => item.branch),
                  datasets: [
                    {
                      data: summary?.top_branches.map((item) => item.total),
                      backgroundColor: ['#38bdf8', '#34d399', '#f59e0b', '#a78bfa', '#f43f5e', '#22c55e', '#60a5fa', '#f97316'],
                      borderWidth: 0,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { labels: { color: '#cbd5f5' } },
                  },
                }}
              />
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-500">Belum ada data.</p>
          )}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 p-6 shadow-glow">
          <h3 className="font-display text-xl font-semibold">Profil Umur vs Unit Terjual</h3>
          {(summary?.age_per_unit ?? []).length ? (
            <div className="mt-4 h-64">
              <Bar
                data={{
                  labels: summary?.age_per_unit.map((item) => item.label),
                  datasets: [
                    {
                      label: 'Rata-rata Umur',
                      data: summary?.age_per_unit.map((item) => Number(item.avg_age ?? 0)),
                      backgroundColor: '#34d399',
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { labels: { color: '#cbd5f5' } },
                  },
                  scales: {
                    x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(148,163,184,0.1)' } },
                    y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(148,163,184,0.1)' } },
                  },
                }}
              />
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-500">Belum ada data umur customer.</p>
          )}
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 p-6 shadow-glow">
          <h3 className="font-display text-xl font-semibold">Demografi Umur Customer</h3>
          {(summary?.age_groups ?? []).length ? (
            <div className="mt-4 h-64">
              <Bar
                data={{
                  labels: summary?.age_groups.map((item) => item.age_group),
                  datasets: [
                    {
                      label: 'Jumlah',
                      data: summary?.age_groups.map((item) => item.total),
                      backgroundColor: '#38bdf8',
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { labels: { color: '#cbd5f5' } },
                  },
                  scales: {
                    x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(148,163,184,0.1)' } },
                    y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(148,163,184,0.1)' } },
                  },
                }}
              />
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-500">Belum ada data demografi.</p>
          )}
        </div>
      </div>
    </div>
  );
}
