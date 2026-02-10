import { useEffect, useMemo, useState } from 'react';
import api from '../api/client';
import { showToast } from '../utils/toast';

type LeadRecord = {
  source_id: number;
  source_type: 'new' | 'follow_up';
  prospect_date: string;
  customer_name: string;
  customer_address: string;
  customer_phone: string;
  interested_unit: string;
  status: 'cold' | 'hot' | 'prospek' | 'spk';
  source: 'whatsapp' | 'ig' | 'tiktok' | 'iklan';
  sales_id?: number | null;
  sales_name?: string | null;
  branch_id?: number | null;
  branch_name?: string | null;
  briefing_note?: string | null;
};

const statusOptions: Array<{ value: 'all' | LeadRecord['status']; label: string }> = [
  { value: 'all', label: 'Semua Status' },
  { value: 'prospek', label: 'Prospek' },
  { value: 'hot', label: 'Hot' },
  { value: 'cold', label: 'Cold' },
  { value: 'spk', label: 'SPK' },
];

const statusStyles: Record<LeadRecord['status'], string> = {
  cold: 'bg-slate-200 dark:bg-slate-500/15 text-slate-800 dark:text-slate-200',
  hot: 'bg-orange-100 dark:bg-orange-500/15 text-orange-700 dark:text-orange-200',
  prospek: 'bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-200',
  spk: 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-200',
};

const formatDateLong = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
};

export default function Leads() {
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | LeadRecord['status']>('prospek');
  const [salesSearch, setSalesSearch] = useState('');
  const [selectedLead, setSelectedLead] = useState<LeadRecord | null>(null);
  const [noteDraft, setNoteDraft] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadLeads = async () => {
    const response = await api.get('/lead-briefings', {
      params: statusFilter === 'all' ? undefined : { status: statusFilter },
    });
    const payload = Array.isArray(response.data) ? response.data : response.data?.data;
    setLeads(Array.isArray(payload) ? payload : []);
  };

  useEffect(() => {
    loadLeads().catch(() => setErrorMessage('Gagal memuat leads.'));
  }, [statusFilter]);

  useEffect(() => {
    if (!message) {
      return;
    }
    const timer = window.setTimeout(() => setMessage(null), 2500);
    return () => window.clearTimeout(timer);
  }, [message]);

  useEffect(() => {
    if (message) {
      showToast(message, 'success');
    }
  }, [message]);

  useEffect(() => {
    if (errorMessage) {
      showToast(errorMessage, 'error');
    }
  }, [errorMessage]);

  const filteredLeads = useMemo(() => {
    if (!salesSearch.trim()) {
      return leads;
    }
    return leads.filter((lead) =>
      (lead.sales_name ?? '').toLowerCase().includes(salesSearch.trim().toLowerCase())
    );
  }, [leads, salesSearch]);

  const openNote = (lead: LeadRecord) => {
    setSelectedLead(lead);
    setNoteDraft(lead.briefing_note ?? '');
  };

  const closeNote = () => {
    setSelectedLead(null);
    setNoteDraft('');
  };

  const handleSaveNote = async () => {
    if (!selectedLead) {
      return;
    }
    setMessage(null);
    setErrorMessage(null);
    try {
      await api.post('/lead-briefings', {
        source_type: selectedLead.source_type,
        source_id: selectedLead.source_id,
        note: noteDraft,
      });
      await loadLeads();
      setMessage('Catatan berhasil disimpan.');
      closeNote();
    } catch (error) {
      setErrorMessage('Gagal menyimpan catatan.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 p-6 shadow-glow">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-display text-xl font-semibold">Leads & CRM</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Filter status prospek/hot per sales</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as 'all' | LeadRecord['status'])}
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <input
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm"
              placeholder="Cari nama sales"
              value={salesSearch}
              onChange={(event) => setSalesSearch(event.target.value)}
            />
          </div>
        </div>
        {message && <p className="mt-3 text-xs text-emerald-600 dark:text-emerald-300">{message}</p>}
        {errorMessage && <p className="mt-3 text-xs text-rose-700 dark:text-rose-300">{errorMessage}</p>}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2">Tanggal</th>
                <th className="py-2">Nama</th>
                <th className="py-2">WhatsApp</th>
                <th className="py-2">Motor</th>
                <th className="py-2">Status</th>
                <th className="py-2">Sales</th>
                <th className="py-2">Cabang</th>
                <th className="py-2">Catatan</th>
              </tr>
            </thead>
            <tbody className="text-slate-800 dark:text-slate-200">
              {filteredLeads.length ? (
                filteredLeads.map((lead) => (
                  <tr key={`${lead.source_type}-${lead.source_id}`} className="border-t border-slate-200 dark:border-slate-800">
                    <td className="py-3">{formatDateLong(lead.prospect_date)}</td>
                    <td className="py-3">{lead.customer_name}</td>
                    <td className="py-3">{lead.customer_phone}</td>
                    <td className="py-3">{lead.interested_unit}</td>
                    <td className="py-3">
                      <span className={`rounded-full px-3 py-1 text-xs ${statusStyles[lead.status]}`}>
                        {lead.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3">{lead.sales_name ?? '-'}</td>
                    <td className="py-3">{lead.branch_name ?? '-'}</td>
                    <td className="py-3">
                      <button
                        className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1 text-xs text-slate-800 dark:text-slate-200 hover:border-emerald-500 dark:hover:border-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-200"
                        onClick={() => openNote(lead)}
                      >
                        Lihat Catatan
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="border-t border-slate-200 dark:border-slate-800">
                  <td className="py-3 text-slate-500" colSpan={8}>
                    Belum ada data leads.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-200/70 dark:bg-slate-950/80 p-4">
          <div className="w-full max-w-3xl rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-glow">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h4 className="font-display text-lg font-semibold">Catatan Lead</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {selectedLead.name} - {selectedLead.sales?.name ?? '-'}
                </p>
              </div>
              <button
                className="rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-1 text-sm text-slate-800 dark:text-slate-200 hover:border-emerald-500 dark:hover:border-emerald-400"
                onClick={closeNote}
              >
                Tutup
              </button>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-950/40 p-4 text-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Data Customer</p>
                <div className="mt-3 space-y-2 text-slate-800 dark:text-slate-200">
                  <p>Nama: {selectedLead.customer_name}</p>
                  <p>Nomor: {selectedLead.customer_phone}</p>
                  <p>Alamat: {selectedLead.customer_address}</p>
                  <p>Unit: {selectedLead.interested_unit}</p>
                  <p>Cabang: {selectedLead.branch_name ?? '-'}</p>
                  <p>Tanggal: {formatDateLong(selectedLead.prospect_date)}</p>
                  <p>Status: {selectedLead.status.toUpperCase()}</p>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-950/40 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Catatan</p>
                <textarea
                  className="mt-3 h-32 w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 p-3 text-sm"
                  value={noteDraft}
                  onChange={(event) => setNoteDraft(event.target.value)}
                  placeholder="Tulis catatan follow-up"
                />
                <button
                  className="mt-3 rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950"
                  onClick={handleSaveNote}
                >
                  Simpan Catatan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
