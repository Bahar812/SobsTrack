import { useEffect, useMemo, useState } from 'react';
import api from '../api/client';
import { showToast } from '../utils/toast';

type LeaveRequest = {
  id: number;
  type: string;
  reason?: string | null;
  start_date: string;
  end_date: string;
  start_time?: string | null;
  end_time?: string | null;
  status: 'pending' | 'approved' | 'rejected' | string;
};

const emptyForm = {
  type: '',
  reason: '',
  start_date: '',
  end_date: '',
  start_time: '',
  end_time: '',
};

const formatDate = (value?: string | null) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
};

export default function Izin() {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [form, setForm] = useState({ ...emptyForm });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadRequests = async () => {
    const response = await api.get('/leave-requests');
    setRequests(Array.isArray(response.data) ? response.data : []);
  };

  useEffect(() => {
    loadRequests().catch(() => showToast('Gagal memuat data izin.', 'error'));
  }, []);

  const statusLabel = useMemo(() => {
    return (status: LeaveRequest['status']) => {
      if (status === 'approved') return 'Disetujui';
      if (status === 'rejected') return 'Ditolak';
      return 'Menunggu';
    };
  }, []);

  const resetForm = () => {
    setForm({ ...emptyForm });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (!form.type || !form.start_date || !form.end_date) {
        showToast('Lengkapi jenis izin dan tanggal.', 'error');
        return;
      }
      await api.post('/leave-requests', {
        type: form.type,
        reason: form.reason || null,
        start_date: form.start_date,
        end_date: form.end_date,
        start_time: form.start_time || null,
        end_time: form.end_time || null,
      });
      await loadRequests();
      resetForm();
      showToast('Izin berhasil dikirim.', 'success');
    } catch (error) {
      showToast('Gagal mengirim izin.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 p-6 shadow-glow">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-display text-xl font-semibold">Izin / Cuti</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Ajukan izin sakit atau keperluan lainnya.</p>
          </div>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs text-slate-600 dark:text-slate-400">Jenis Izin</label>
            <select
              className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm"
              value={form.type}
              onChange={(event) => setForm({ ...form, type: event.target.value })}
            >
              <option value="">Pilih jenis</option>
              <option value="sakit">Sakit</option>
              <option value="keperluan">Keperluan</option>
              <option value="cuti">Cuti</option>
              <option value="lainnya">Lainnya</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-600 dark:text-slate-400">Alasan</label>
            <input
              className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm"
              value={form.reason}
              onChange={(event) => setForm({ ...form, reason: event.target.value })}
              placeholder="Contoh: kontrol dokter"
            />
          </div>
          <div>
            <label className="text-xs text-slate-600 dark:text-slate-400">Tanggal Mulai</label>
            <input
              className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm"
              type="date"
              value={form.start_date}
              onChange={(event) => setForm({ ...form, start_date: event.target.value })}
            />
          </div>
          <div>
            <label className="text-xs text-slate-600 dark:text-slate-400">Tanggal Selesai</label>
            <input
              className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm"
              type="date"
              value={form.end_date}
              onChange={(event) => setForm({ ...form, end_date: event.target.value })}
            />
          </div>
          <div>
            <label className="text-xs text-slate-600 dark:text-slate-400">Jam Mulai (opsional)</label>
            <input
              className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm"
              type="time"
              value={form.start_time}
              onChange={(event) => setForm({ ...form, start_time: event.target.value })}
            />
          </div>
          <div>
            <label className="text-xs text-slate-600 dark:text-slate-400">Jam Selesai (opsional)</label>
            <input
              className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm"
              type="time"
              value={form.end_time}
              onChange={(event) => setForm({ ...form, end_time: event.target.value })}
            />
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          <button
            className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950 disabled:opacity-60"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Mengirim...' : 'Kirim Izin'}
          </button>
          <button
            className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm text-slate-800 dark:text-slate-200"
            onClick={resetForm}
            disabled={isSubmitting}
          >
            Reset
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 p-6 shadow-glow">
        <h3 className="font-display text-lg font-semibold">Riwayat Izin</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2">Jenis</th>
                <th className="py-2">Tanggal</th>
                <th className="py-2">Jam</th>
                <th className="py-2">Status</th>
                <th className="py-2">Alasan</th>
              </tr>
            </thead>
            <tbody className="text-slate-800 dark:text-slate-200">
              {requests.length ? (
                requests.map((item) => (
                  <tr key={item.id} className="border-t border-slate-200 dark:border-slate-800">
                    <td className="py-3 capitalize">{item.type}</td>
                    <td className="py-3">
                      {formatDate(item.start_date)} - {formatDate(item.end_date)}
                    </td>
                    <td className="py-3">
                      {item.start_time || item.end_time ? (
                        <span>
                          {item.start_time ?? '-'} - {item.end_time ?? '-'}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="py-3">{statusLabel(item.status)}</td>
                    <td className="py-3">{item.reason ?? '-'}</td>
                  </tr>
                ))
              ) : (
                <tr className="border-t border-slate-200 dark:border-slate-800">
                  <td className="py-3 text-slate-500" colSpan={5}>
                    Belum ada izin.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
