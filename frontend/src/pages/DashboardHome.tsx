import { useEffect, useState } from 'react';
import api from '../api/client';

type DashboardSummary = {
  cards: {
    attendance_today: number;
    activity_today: number;
    leads_active: number;
    spk_this_month: number;
    stock_available: number;
  };
  ranking: Array<{ sales?: { name: string } | null; total: number }>;
  events_this_week: Array<{
    id: number;
    name: string;
    event_start: string;
    event_end?: string | null;
    location: string;
    branch?: { name: string } | null;
  }>;
};

export default function DashboardHome() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);

  useEffect(() => {
    api
      .get('/dashboard/summary')
      .then((response) => setSummary(response.data))
      .catch(() => setSummary(null));
  }, []);

  const stats = summary
    ? [
        { label: 'Absensi Hari Ini', value: summary.cards.attendance_today, accent: 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-200' },
        { label: 'Aktivitas Sales', value: summary.cards.activity_today, accent: 'bg-sky-100 dark:bg-sky-500/15 text-sky-700 dark:text-sky-200' },
        { label: 'Leads Aktif', value: summary.cards.leads_active, accent: 'bg-orange-100 dark:bg-orange-500/15 text-orange-700 dark:text-orange-200' },
        { label: 'SPK Bulan Berjalan', value: summary.cards.spk_this_month, accent: 'bg-violet-100 dark:bg-violet-500/15 text-violet-700 dark:text-violet-200' },
        { label: 'Stok Tersedia', value: summary.cards.stock_available, accent: 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-200' },
      ]
    : [];

  const fallbackRanking: DashboardSummary['ranking'] = [
    { sales: { name: 'Sales Andi' }, total: 18 },
    { sales: { name: 'Sales Rina' }, total: 15 },
    { sales: { name: 'Sales Dika' }, total: 12 },
  ];

  const ranking = summary?.ranking?.length ? summary.ranking : fallbackRanking;

  const formatTime = (value?: string | null) =>
    value
      ? new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(value))
      : '-';

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

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {stats.map((item) => (
          <div
            key={item.label}
            className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 p-5 shadow-glow"
          >
            <p className={`inline-flex rounded-full px-3 py-1 text-xs ${item.accent}`}>{item.label}</p>
            <p className="mt-4 font-display text-3xl font-semibold text-slate-900 dark:text-white">{item.value}</p>
            <p className="text-xs text-slate-600 dark:text-slate-400">Update real-time hari ini</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[2fr,1fr]">
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 p-6 shadow-glow">
          <h3 className="font-display text-xl font-semibold">Tren SPK 4 Minggu</h3>
          <div className="mt-4 grid gap-3">
            {[12, 18, 15, 21].map((value, index) => (
              <div key={value} className="flex items-center gap-4">
                <span className="w-24 text-sm text-slate-600 dark:text-slate-400">Minggu {index + 1}</span>
                <div className="h-3 flex-1 rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-3 rounded-full bg-emerald-400"
                    style={{ width: `${value * 4}%` }}
                  />
                </div>
                <span className="text-sm text-slate-800 dark:text-slate-200">{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 p-6 shadow-glow">
          <h3 className="font-display text-xl font-semibold">Ranking Sales</h3>
          <div className="mt-4 space-y-3">
            {ranking.map((item, index) => (
              <div key={`${item.sales?.name ?? 'sales'}-${index}`} className="flex items-center justify-between rounded-2xl bg-slate-100 dark:bg-slate-800/60 px-4 py-3">
                <div>
                  <p className="text-sm text-slate-700 dark:text-slate-300">#{index + 1} {item.sales?.name ?? 'Sales'}</p>
                  <p className="text-xs text-slate-500">SPK bulan ini</p>
                </div>
                <span className="font-display text-xl text-emerald-600 dark:text-emerald-300">{item.total}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 p-6 shadow-glow">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-display text-xl font-semibold">Event Minggu Ini</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Agenda event marketing & sales</p>
          </div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {summary?.events_this_week?.length ? (
            summary.events_this_week.map((event) => (
              <div key={event.id} className="rounded-2xl bg-slate-100 dark:bg-slate-800/60 p-4">
                <p className="text-sm text-slate-900 dark:text-white">{event.name}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {formatDateLong(event.event_start)} • {formatTime(event.event_start)} - {formatTime(event.event_end)}
                </p>
                <p className="text-xs text-slate-500">{event.location} • {event.branch?.name ?? '-'}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">Belum ada event minggu ini.</p>
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 p-6 shadow-glow">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-xl font-semibold">Aktivitas Hari Ini</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">WA Story, Marketplace, TikTok</p>
          </div>
          <button className="rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950">
            Input Aktivitas
          </button>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2">Sales</th>
                <th className="py-2">WA Story</th>
                <th className="py-2">FB Marketplace</th>
                <th className="py-2">TikTok</th>
                <th className="py-2">Prospek</th>
              </tr>
            </thead>
            <tbody className="text-slate-800 dark:text-slate-200">
              {[
                { name: 'Sales Andi', wa: 1, fb: 4, tiktok: 1, lead: '8 / 20' },
                { name: 'Sales Rina', wa: 1, fb: 3, tiktok: 1, lead: '6 / 18' },
              ].map((row) => (
                <tr key={row.name} className="border-t border-slate-200 dark:border-slate-800">
                  <td className="py-3">{row.name}</td>
                  <td className="py-3">{row.wa}</td>
                  <td className="py-3">{row.fb}</td>
                  <td className="py-3">{row.tiktok}</td>
                  <td className="py-3">{row.lead}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
