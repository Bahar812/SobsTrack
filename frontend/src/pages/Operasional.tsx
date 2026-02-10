import { useEffect, useMemo, useState } from 'react';
import api from '../api/client';
import { showToast } from '../utils/toast';

type OvertimeRequest = {
  id: number;
  overtime_date: string;
  start_time: string;
  end_time: string;
  reason: string;
  proof_url?: string | null;
  status: 'pending' | 'approved' | 'rejected' | string;
};

type Reimbursement = {
  id: number;
  category: string;
  amount: number;
  transaction_date: string;
  merchant_name: string;
  receipt_url?: string | null;
  status: 'pending' | 'paid' | string;
};

const overtimeEmpty = {
  overtime_date: '',
  start_time: '',
  end_time: '',
  reason: '',
};

const reimbursementEmpty = {
  category: '',
  amount: '',
  transaction_date: '',
  merchant_name: '',
};

const formatDate = (value?: string | null) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
};

export default function Operasional() {
  const [activeTab, setActiveTab] = useState<'lembur' | 'reimburse'>('lembur');
  const [overtimeForm, setOvertimeForm] = useState({ ...overtimeEmpty });
  const [overtimeProof, setOvertimeProof] = useState<File | null>(null);
  const [overtimes, setOvertimes] = useState<OvertimeRequest[]>([]);
  const [reimburseForm, setReimburseForm] = useState({ ...reimbursementEmpty });
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [reimbursements, setReimbursements] = useState<Reimbursement[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadOvertimes = async () => {
    const response = await api.get('/overtimes');
    setOvertimes(Array.isArray(response.data) ? response.data : []);
  };

  const loadReimbursements = async () => {
    const response = await api.get('/reimbursements');
    setReimbursements(Array.isArray(response.data) ? response.data : []);
  };

  useEffect(() => {
    loadOvertimes().catch(() => showToast('Gagal memuat data lembur.', 'error'));
    loadReimbursements().catch(() => showToast('Gagal memuat data reimbursement.', 'error'));
  }, []);

  const statusBadge = useMemo(() => {
    return (status: string) => {
      if (status === 'approved' || status === 'paid') {
        return 'text-emerald-600 dark:text-emerald-300';
      }
      if (status === 'rejected') {
        return 'text-rose-600 dark:text-rose-300';
      }
      return 'text-amber-600 dark:text-amber-300';
    };
  }, []);

  const handleOvertimeSubmit = async () => {
    if (!overtimeForm.overtime_date || !overtimeForm.start_time || !overtimeForm.end_time || !overtimeForm.reason) {
      showToast('Lengkapi tanggal, jam, dan alasan lembur.', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('overtime_date', overtimeForm.overtime_date);
      formData.append('start_time', overtimeForm.start_time);
      formData.append('end_time', overtimeForm.end_time);
      formData.append('reason', overtimeForm.reason);
      if (overtimeProof) {
        formData.append('proof_file', overtimeProof);
      }
      await api.post('/overtimes', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await loadOvertimes();
      setOvertimeForm({ ...overtimeEmpty });
      setOvertimeProof(null);
      showToast('Pengajuan lembur berhasil dikirim.', 'success');
    } catch (error) {
      showToast('Gagal mengirim pengajuan lembur.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReimburseSubmit = async () => {
    if (
      !reimburseForm.category ||
      !reimburseForm.amount ||
      !reimburseForm.transaction_date ||
      !reimburseForm.merchant_name ||
      !receiptFile
    ) {
      showToast('Lengkapi data dan unggah bukti.', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('category', reimburseForm.category);
      formData.append('amount', reimburseForm.amount);
      formData.append('transaction_date', reimburseForm.transaction_date);
      formData.append('merchant_name', reimburseForm.merchant_name);
      formData.append('receipt_file', receiptFile);
      await api.post('/reimbursements', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await loadReimbursements();
      setReimburseForm({ ...reimbursementEmpty });
      setReceiptFile(null);
      showToast('Reimbursement berhasil dikirim.', 'success');
    } catch (error) {
      showToast('Gagal mengirim reimbursement.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 p-6 shadow-glow">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-display text-xl font-semibold">Klaim Operasional</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Pengajuan lembur dan reimbursement.</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            className={`rounded-xl border px-4 py-2 text-sm ${
              activeTab === 'lembur'
                ? 'border-emerald-400 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300'
                : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
            }`}
            onClick={() => setActiveTab('lembur')}
          >
            Lembur
          </button>
          <button
            className={`rounded-xl border px-4 py-2 text-sm ${
              activeTab === 'reimburse'
                ? 'border-emerald-400 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300'
                : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
            }`}
            onClick={() => setActiveTab('reimburse')}
          >
            Reimbursement
          </button>
        </div>
      </div>

      {activeTab === 'lembur' && (
        <>
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 p-6 shadow-glow">
            <h4 className="font-display text-lg font-semibold">Form Pengajuan Lembur</h4>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs text-slate-600 dark:text-slate-400">Tanggal Lembur</label>
                <input
                  className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm"
                  type="date"
                  value={overtimeForm.overtime_date}
                  onChange={(event) => setOvertimeForm({ ...overtimeForm, overtime_date: event.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-slate-600 dark:text-slate-400">Jam Mulai</label>
                <input
                  className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm"
                  type="time"
                  value={overtimeForm.start_time}
                  onChange={(event) => setOvertimeForm({ ...overtimeForm, start_time: event.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-slate-600 dark:text-slate-400">Jam Selesai</label>
                <input
                  className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm"
                  type="time"
                  value={overtimeForm.end_time}
                  onChange={(event) => setOvertimeForm({ ...overtimeForm, end_time: event.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-slate-600 dark:text-slate-400">Alasan Lembur</label>
                <input
                  className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm"
                  value={overtimeForm.reason}
                  onChange={(event) => setOvertimeForm({ ...overtimeForm, reason: event.target.value })}
                  placeholder="Contoh: event malam"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs text-slate-600 dark:text-slate-400">Bukti Pendukung (opsional)</label>
                <input
                  className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-slate-200 dark:file:bg-slate-700/70 file:px-3 file:py-1 file:text-slate-600 dark:file:text-slate-100"
                  type="file"
                  onChange={(event) => setOvertimeProof(event.target.files?.[0] ?? null)}
                />
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <button
                className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950 disabled:opacity-60"
                onClick={handleOvertimeSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Mengirim...' : 'Kirim Pengajuan'}
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 p-6 shadow-glow">
            <h4 className="font-display text-lg font-semibold">Status Lembur</h4>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase text-slate-500">
                  <tr>
                    <th className="py-2">Tanggal</th>
                    <th className="py-2">Jam</th>
                    <th className="py-2">Alasan</th>
                    <th className="py-2">Bukti</th>
                    <th className="py-2">Status</th>
                  </tr>
                </thead>
                <tbody className="text-slate-800 dark:text-slate-200">
                  {overtimes.length ? (
                    overtimes.map((item) => (
                      <tr key={item.id} className="border-t border-slate-200 dark:border-slate-800">
                        <td className="py-3">{formatDate(item.overtime_date)}</td>
                        <td className="py-3">
                          {item.start_time} - {item.end_time}
                        </td>
                        <td className="py-3">{item.reason}</td>
                        <td className="py-3">
                          {item.proof_url ? (
                            <a className="text-emerald-600 dark:text-emerald-300 underline" href={item.proof_url} target="_blank">
                              Lihat
                            </a>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className={`py-3 font-semibold ${statusBadge(item.status)}`}>{item.status}</td>
                      </tr>
                    ))
                  ) : (
                    <tr className="border-t border-slate-200 dark:border-slate-800">
                      <td className="py-3 text-slate-500" colSpan={5}>
                        Belum ada pengajuan lembur.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === 'reimburse' && (
        <>
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 p-6 shadow-glow">
            <h4 className="font-display text-lg font-semibold">Form Reimbursement</h4>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs text-slate-600 dark:text-slate-400">Kategori Biaya</label>
                <select
                  className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm"
                  value={reimburseForm.category}
                  onChange={(event) => setReimburseForm({ ...reimburseForm, category: event.target.value })}
                >
                  <option value="">Pilih kategori</option>
                  <option value="transportasi">Transportasi</option>
                  <option value="makan">Makan</option>
                  <option value="penginapan">Penginapan</option>
                  <option value="pulsa">Pulsa</option>
                  <option value="bensin">Bensin</option>
                  <option value="parkir">Parkir</option>
                  <option value="lainnya">Lainnya</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-600 dark:text-slate-400">Nominal</label>
                <input
                  className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm"
                  type="number"
                  min={0}
                  value={reimburseForm.amount}
                  onChange={(event) => setReimburseForm({ ...reimburseForm, amount: event.target.value })}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="text-xs text-slate-600 dark:text-slate-400">Tanggal Transaksi</label>
                <input
                  className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm"
                  type="date"
                  value={reimburseForm.transaction_date}
                  onChange={(event) => setReimburseForm({ ...reimburseForm, transaction_date: event.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-slate-600 dark:text-slate-400">Nama Merchant/Vendor</label>
                <input
                  className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm"
                  value={reimburseForm.merchant_name}
                  onChange={(event) => setReimburseForm({ ...reimburseForm, merchant_name: event.target.value })}
                  placeholder="Contoh: SPBU"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs text-slate-600 dark:text-slate-400">Digital Receipt (wajib)</label>
                <input
                  className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-slate-200 dark:file:bg-slate-700/70 file:px-3 file:py-1 file:text-slate-600 dark:file:text-slate-100"
                  type="file"
                  onChange={(event) => setReceiptFile(event.target.files?.[0] ?? null)}
                />
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <button
                className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950 disabled:opacity-60"
                onClick={handleReimburseSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Mengirim...' : 'Kirim Reimbursement'}
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 p-6 shadow-glow">
            <h4 className="font-display text-lg font-semibold">Status Reimbursement</h4>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase text-slate-500">
                  <tr>
                    <th className="py-2">Kategori</th>
                    <th className="py-2">Tanggal</th>
                    <th className="py-2">Merchant</th>
                    <th className="py-2">Nominal</th>
                    <th className="py-2">Bukti</th>
                    <th className="py-2">Status</th>
                  </tr>
                </thead>
                <tbody className="text-slate-800 dark:text-slate-200">
                  {reimbursements.length ? (
                    reimbursements.map((item) => (
                      <tr key={item.id} className="border-t border-slate-200 dark:border-slate-800">
                        <td className="py-3 capitalize">{item.category}</td>
                        <td className="py-3">{formatDate(item.transaction_date)}</td>
                        <td className="py-3">{item.merchant_name}</td>
                        <td className="py-3">{Number(item.amount).toLocaleString('id-ID')}</td>
                        <td className="py-3">
                          {item.receipt_url ? (
                            <a className="text-emerald-600 dark:text-emerald-300 underline" href={item.receipt_url} target="_blank">
                              Lihat
                            </a>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className={`py-3 font-semibold ${statusBadge(item.status)}`}>{item.status}</td>
                      </tr>
                    ))
                  ) : (
                    <tr className="border-t border-slate-200 dark:border-slate-800">
                      <td className="py-3 text-slate-500" colSpan={6}>
                        Belum ada reimbursement.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
