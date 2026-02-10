import { useEffect, useMemo, useState } from 'react';
import api from '../api/client';
import { showToast } from '../utils/toast';

type Summary = {
  month: string;
  activity: {
    actual_total: number;
    target_total: number;
    percent: number;
    today?: {
      actuals: Record<string, number>;
      missing: string[];
      is_complete: boolean;
    };
  };
  sales: {
    actual: number;
    target: number;
    percent: number;
  };
};

type ScheduleDay = {
  date: string;
  sales: Array<{ id: number; name: string }>;
};

const currentMonth = () => new Date().toISOString().slice(0, 7);

const clampPercent = (value: number) => Math.min(100, Math.max(0, value));

const getWeekRange = () => {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const start = new Date(now.setDate(diff));
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start, end };
};

const formatDateShort = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short' }).format(date);
};

const formatDateKey = (value: Date) => {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function SalesDashboard() {
  const [month, setMonth] = useState(currentMonth());
  const [summary, setSummary] = useState<Summary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [schedule, setSchedule] = useState<Record<string, ScheduleDay>>({});

  useEffect(() => {
    setIsLoading(true);
    api
      .get('/sales-dashboard/summary', { params: { month } })
      .then((response) => {
        setSummary(response.data);
      })
      .catch(() => {
        showToast('Gagal memuat ringkasan dashboard.', 'error');
      })
      .finally(() => setIsLoading(false));
  }, [month]);

  useEffect(() => {
    const range = getWeekRange();
    api
      .get('/sales-shift-schedules/me', {
        params: {
          start_date: formatDateKey(range.start),
          end_date: formatDateKey(range.end),
        },
      })
      .then((response) => {
        const data = Array.isArray(response.data) ? response.data : [];
        const mapped: Record<string, ScheduleDay> = {};
        data.forEach((item: ScheduleDay) => {
          mapped[item.date] = item;
        });
        setSchedule(mapped);
      })
      .catch(() => {
        showToast('Gagal memuat jadwal mingguan.', 'error');
      });
  }, []);

  useEffect(() => {
    if (!summary?.activity?.today || summary.activity.today.is_complete) {
      return;
    }
    const labelMap: Record<string, string> = {
      wa_story: 'WA Story',
      fb_marketplace: 'FB Marketplace',
      tiktok_post: 'TikTok',
      new_prospect: 'Prospek Baru',
      fu_prospect: 'Follow Up',
    };
    const missing = summary.activity.today.missing
      .map((key) => labelMap[key] ?? key)
      .join(', ');
    showToast(`Aktivitas hari ini belum lengkap: ${missing}.`, 'warning');
  }, [summary]);

  const activityPercent = useMemo(
    () => clampPercent(summary?.activity.percent ?? 0),
    [summary?.activity.percent]
  );
  const salesPercent = useMemo(
    () => clampPercent(summary?.sales.percent ?? 0),
    [summary?.sales.percent]
  );

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 p-6 shadow-glow">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-display text-xl font-semibold">Dashboard Sales</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Pantau progres aktivitas dan penjualan.</p>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-600 dark:text-slate-400">Bulan</label>
            <input
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm"
              type="month"
              value={month}
              onChange={(event) => setMonth(event.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 p-6 shadow-glow">
          <div className="flex items-center justify-between">
            <h4 className="font-display text-lg font-semibold">Aktivitas</h4>
            <span className="text-sm text-slate-600 dark:text-slate-400">{activityPercent}%</span>
          </div>
          <div className="mt-4 h-2 rounded-full bg-slate-200 dark:bg-slate-800">
            <div
              className="h-2 rounded-full bg-emerald-500"
              style={{ width: `${activityPercent}%` }}
            />
          </div>
          <div className="mt-4 text-sm text-slate-700 dark:text-slate-200">
            {isLoading ? (
              <p>Memuat data...</p>
            ) : (
              <p>
                Total aktivitas: {summary?.activity.actual_total ?? 0} dari{' '}
                {summary?.activity.target_total ?? 0}
              </p>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 p-6 shadow-glow">
          <div className="flex items-center justify-between">
            <h4 className="font-display text-lg font-semibold">Penjualan</h4>
            <span className="text-sm text-slate-600 dark:text-slate-400">{salesPercent}%</span>
          </div>
          <div className="mt-4 h-2 rounded-full bg-slate-200 dark:bg-slate-800">
            <div className="h-2 rounded-full bg-sky-500" style={{ width: `${salesPercent}%` }} />
          </div>
          <div className="mt-4 text-sm text-slate-700 dark:text-slate-200">
            {isLoading ? (
              <p>Memuat data...</p>
            ) : (
              <p>
                Unit terjual: {summary?.sales.actual ?? 0} dari {summary?.sales.target ?? 0}
              </p>
            )}
          </div>
        </div>
      </div>

      {summary?.activity?.today && !summary.activity.today.is_complete && (
        <div className="rounded-3xl border border-amber-200 bg-amber-50/90 p-4 text-sm text-amber-800 shadow-glow dark:border-amber-400/40 dark:bg-amber-500/10 dark:text-amber-200">
          <p className="font-semibold">Pengingat Aktivitas</p>
          <p className="mt-1">
            Aktivitas hari ini belum lengkap. Lengkapi: {summary.activity.today.missing.join(', ')}.
          </p>
        </div>
      )}

      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 p-6 shadow-glow">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-display text-lg font-semibold">Jadwal Minggu Ini</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400">Daftar hari yang dijadwalkan.</p>
          </div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-7">
          {(() => {
            const { start } = getWeekRange();
            return Array.from({ length: 7 }).map((_, index) => {
              const date = new Date(start);
              date.setDate(start.getDate() + index);
              const dateKey = formatDateKey(date);
              const dayLabel = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'][date.getDay()];
              const item = schedule[dateKey];
              return (
                <div
                  key={dateKey}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/40 p-3"
                >
                  <p className="text-xs text-slate-500">{dayLabel}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">{formatDateShort(dateKey)}</p>
                  <div className="mt-2 text-xs text-slate-700 dark:text-slate-200">
                    {item?.sales?.length ? (
                      <p>Masuk</p>
                    ) : (
                      <p className="text-slate-500">Libur</p>
                    )}
                  </div>
                </div>
              );
            });
          })()}
        </div>
      </div>
    </div>
  );
}
