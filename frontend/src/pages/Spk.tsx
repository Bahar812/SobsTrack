import { useEffect, useMemo, useState } from 'react';
import api from '../api/client';

type BranchOption = {
  id: number;
  name: string;
};

type SalesOption = {
  id: number;
  name: string;
  branch_id?: number | null;
  role?: string;
};

type SpkRecord = {
  id: number;
  spk_no?: string | null;
  spk_status?: 'spk' | 'do' | null;
  spk_date: string;
  plan_do_date?: string | null;
  sales?: { id: number; name: string } | null;
  branch?: { id: number; name: string } | null;
  customer_name: string;
  customer_age?: number | null;
  customer_gender?: 'laki-laki' | 'perempuan' | null;
  customer_job?: string | null;
  customer_phone?: string | null;
  customer_address_ktp?: string | null;
  customer_address_domisili?: string | null;
  payment_method?: 'cash' | 'kredit' | null;
  brand?: string | null;
  fuel_type?: 'bensin' | 'listrik' | null;
  type?: string | null;
  unit_name: string;
  color?: string | null;
  year?: number | null;
  unit_status?: 'ready' | 'indent' | null;
  price_otr?: number | null;
  discount?: number | null;
  booking_fee?: number | null;
  dp_gross?: number | null;
  dp_net?: number | null;
  tenor_months?: number | null;
  installment?: number | null;
  leasing_name?: string | null;
  note?: string | null;
  document_url?: string | null;
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

const formatCurrency = (value?: number | null) => {
  if (value === null || value === undefined) {
    return '-';
  }
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
};

export default function Spk() {
  const [records, setRecords] = useState<SpkRecord[]>([]);
  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [sales, setSales] = useState<SalesOption[]>([]);
  const [dateFilter, setDateFilter] = useState('');
  const [branchFilterId, setBranchFilterId] = useState<number | 'all'>('all');
  const [salesSearch, setSalesSearch] = useState('');
  const [selectedSpk, setSelectedSpk] = useState<SpkRecord | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingSpkId, setEditingSpkId] = useState<number | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [form, setForm] = useState({
    sales_id: '',
    branch_id: '',
    spk_date: '',
    customer_name: '',
    customer_age: '',
    customer_gender: '',
    customer_job: '',
    customer_phone: '',
    customer_address_ktp: '',
    customer_address_domisili: '',
    payment_method: 'cash',
    brand: '',
    fuel_type: 'bensin',
    type: '',
    color: '',
    year: '',
    unit_status: 'ready',
    unit_name: '',
    spk_status: 'spk',
    plan_do_date: '',
    price_otr: '',
    discount: '',
    booking_fee: '',
    dp_gross: '',
    dp_net: '',
    tenor_months: '',
    installment: '',
    leasing_name: '',
  });
  const [documentFile, setDocumentFile] = useState<File | null>(null);

  const resolveUnitName = () => {
    if (form.brand && form.type) {
      return `${form.brand} ${form.type}`;
    }
    if (form.type) {
      return form.type;
    }
    if (form.brand) {
      return form.brand;
    }
    return form.unit_name || 'Unit';
  };

  const loadSpk = async () => {
    const response = await api.get('/spk', {
      params: {
        date: dateFilter || undefined,
        branch_id: branchFilterId === 'all' ? undefined : branchFilterId,
        name: salesSearch.trim() || undefined,
      },
    });
    const payload = Array.isArray(response.data) ? response.data : response.data?.data;
    setRecords(Array.isArray(payload) ? payload : []);
  };

  useEffect(() => {
    loadSpk();
  }, [dateFilter, branchFilterId, salesSearch]);

  useEffect(() => {
    api
      .get('/branches')
      .then((response) => setBranches(Array.isArray(response.data) ? response.data : []))
      .catch(() => setBranches([]));
  }, []);

  useEffect(() => {
    api
      .get('/users')
      .then((response) => {
        const list = Array.isArray(response.data) ? response.data : [];
        setSales(list.filter((item: SalesOption) => item.role === 'sales'));
      })
      .catch(() => setSales([]));
  }, []);

  const summary = useMemo(() => {
    const totalDo = records.filter((row) => row.spk_status === 'do').length;
    const totalSpk = records.filter((row) => row.spk_status !== 'do').length;
    return { totalSpk, totalDo };
  }, [records]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 px-6 py-4 shadow-glow">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Total SPK</p>
          <p className="mt-2 font-display text-3xl font-semibold text-slate-900 dark:text-white">{summary.totalSpk}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 px-6 py-4 shadow-glow">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Total DO</p>
          <p className="mt-2 font-display text-3xl font-semibold text-slate-900 dark:text-white">{summary.totalDo}</p>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 p-6 shadow-glow">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h3 className="font-display text-xl font-semibold">Daftar SPK / DO</h3>
          <div className="flex flex-wrap gap-2">
            <input
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm"
              type="date"
              value={dateFilter}
              onChange={(event) => setDateFilter(event.target.value)}
            />
            <select
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm"
              value={branchFilterId}
              onChange={(event) => {
                const value = event.target.value;
                setBranchFilterId(value === 'all' ? 'all' : Number(value));
              }}
            >
              <option value="all">Semua Cabang</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
            <input
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm"
              placeholder="Cari sales"
              value={salesSearch}
              onChange={(event) => setSalesSearch(event.target.value)}
            />
            <button
              className="rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950"
              onClick={() => {
                setForm({
                  sales_id: '',
                  branch_id: '',
                  spk_date: '',
                  customer_name: '',
                  customer_age: '',
                  customer_gender: '',
                  customer_job: '',
                  customer_phone: '',
                  customer_address_ktp: '',
                  customer_address_domisili: '',
                  payment_method: 'cash',
                  brand: '',
                  fuel_type: 'bensin',
                  type: '',
                  color: '',
                  year: '',
                  unit_status: 'ready',
                  unit_name: '',
                  spk_status: 'spk',
                  plan_do_date: '',
                  price_otr: '',
                  discount: '',
                  booking_fee: '',
                  dp_gross: '',
                  dp_net: '',
                  tenor_months: '',
                  installment: '',
                  leasing_name: '',
                });
                setEditingSpkId(null);
                setFormError(null);
                setShowForm(true);
                setDocumentFile(null);
              }}
            >
              Tambahkan SPK
            </button>
          </div>
        </div>
        <div className="mt-4">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2">Sales</th>
                <th className="py-2">Pembeli</th>
                <th className="py-2">Unit</th>
                <th className="py-2">Tanggal Pesan</th>
                <th className="py-2">Status</th>
                <th className="py-2">Detail</th>
              </tr>
            </thead>
            <tbody className="text-slate-800 dark:text-slate-200">
              {records.length ? (
                records.map((row) => (
                  <tr key={row.id} className="border-t border-slate-200 dark:border-slate-800">
                    <td className="py-3">{row.sales?.name ?? '-'}</td>
                    <td className="py-3">{row.customer_name}</td>
                    <td className="py-3">{row.type ?? row.unit_name}</td>
                    <td className="py-3">{formatDateLong(row.spk_date)}</td>
                    <td className="py-3">{row.spk_status ?? 'spk'}</td>
                    <td className="py-3">
                      <button
                        className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1 text-xs text-slate-800 dark:text-slate-200 hover:border-emerald-500 dark:hover:border-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-200"
                        onClick={() => setSelectedSpk(row)}
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="border-t border-slate-200 dark:border-slate-800">
                  <td className="py-3 text-slate-500" colSpan={9}>
                    Belum ada data SPK.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedSpk && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-200/70 dark:bg-slate-950/80 p-4">
          <div className="w-full max-w-5xl max-h-[85vh] overflow-y-auto rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-glow">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h4 className="font-display text-lg font-semibold">Detail SPK / DO</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">{selectedSpk.sales?.name ?? '-'}</p>
              </div>
              <button
                className="rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-1 text-sm text-slate-800 dark:text-slate-200 hover:border-emerald-500 dark:hover:border-emerald-400"
                onClick={() => setSelectedSpk(null)}
              >
                Tutup
              </button>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-950/40 p-4 text-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Customer</p>
                <div className="mt-3 space-y-2 text-slate-800 dark:text-slate-200">
                  <p>Nama: {selectedSpk.customer_name}</p>
                  <p>Umur: {selectedSpk.customer_age ?? '-'}</p>
                  <p>Gender: {selectedSpk.customer_gender ?? '-'}</p>
                  <p>Pekerjaan: {selectedSpk.customer_job ?? '-'}</p>
                  <p>HP: {selectedSpk.customer_phone ?? '-'}</p>
                  <p>Alamat KTP: {selectedSpk.customer_address_ktp ?? '-'}</p>
                  <p>Alamat Domisili: {selectedSpk.customer_address_domisili ?? '-'}</p>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-950/40 p-4 text-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Unit</p>
                <div className="mt-3 space-y-2 text-slate-800 dark:text-slate-200">
                  <p>Merk: {selectedSpk.brand ?? '-'}</p>
                  <p>Jenis: {selectedSpk.fuel_type ?? '-'}</p>
                  <p>Type: {selectedSpk.type ?? selectedSpk.unit_name}</p>
                  <p>Warna: {selectedSpk.color ?? '-'}</p>
                  <p>Tahun: {selectedSpk.year ?? '-'}</p>
                  <p>Status: {selectedSpk.unit_status ?? '-'}</p>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-950/40 p-4 text-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Transaksi</p>
                <div className="mt-3 space-y-2 text-slate-800 dark:text-slate-200">
                  <p>Tanggal Pesan: {formatDateLong(selectedSpk.spk_date)}</p>
                  <p>Plan DO: {formatDateLong(selectedSpk.plan_do_date)}</p>
                  <p>Pembayaran: {selectedSpk.payment_method ?? '-'}</p>
                  <p>Harga OTR: {formatCurrency(selectedSpk.price_otr)}</p>
                  <p>Diskon: {formatCurrency(selectedSpk.discount)}</p>
                  <p>Tanda Jadi: {formatCurrency(selectedSpk.booking_fee)}</p>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-950/40 p-4 text-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Kredit</p>
                <div className="mt-3 space-y-2 text-slate-800 dark:text-slate-200">
                  <p>DP Gross: {formatCurrency(selectedSpk.dp_gross)}</p>
                  <p>DP Rill: {formatCurrency(selectedSpk.dp_net)}</p>
                  <p>Tenor: {selectedSpk.tenor_months ? `${selectedSpk.tenor_months} bulan` : '-'}</p>
                  <p>Angsuran: {formatCurrency(selectedSpk.installment)}</p>
                  <p>Leasing: {selectedSpk.leasing_name ?? '-'}</p>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-950/40 p-4 text-sm md:col-span-2">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Catatan & Dokumen</p>
                <div className="mt-3 space-y-2 text-slate-800 dark:text-slate-200">
                  <p>Catatan: {selectedSpk.note ?? '-'}</p>
                  <p>
                    Dokumen:{' '}
                    {selectedSpk.document_url ? (
                      <a className="text-emerald-600 dark:text-emerald-300 underline" href={selectedSpk.document_url} target="_blank">
                        Lihat Dokumen
                      </a>
                    ) : (
                      '-'
                    )}
                  </p>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-950/40 p-4 text-sm md:col-span-2">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Status SPK / DO</p>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-slate-800 dark:text-slate-200">
                  <span>Status: {selectedSpk.spk_status ?? 'spk'}</span>
                  <button
                    className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1 text-xs text-slate-800 dark:text-slate-200 hover:border-emerald-500 dark:hover:border-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-200"
                    onClick={() => {
                      setForm({
                        sales_id: selectedSpk.sales?.id ? String(selectedSpk.sales.id) : '',
                        branch_id: selectedSpk.branch?.id ? String(selectedSpk.branch.id) : '',
                        spk_date: selectedSpk.spk_date,
                        customer_name: selectedSpk.customer_name,
                        customer_age: selectedSpk.customer_age ? String(selectedSpk.customer_age) : '',
                        customer_gender: selectedSpk.customer_gender ?? '',
                        customer_job: selectedSpk.customer_job ?? '',
                        customer_phone: selectedSpk.customer_phone ?? '',
                        customer_address_ktp: selectedSpk.customer_address_ktp ?? '',
                        customer_address_domisili: selectedSpk.customer_address_domisili ?? '',
                        payment_method: selectedSpk.payment_method ?? 'cash',
                        brand: selectedSpk.brand ?? '',
                        fuel_type: selectedSpk.fuel_type ?? 'bensin',
                        type: selectedSpk.type ?? '',
                        color: selectedSpk.color ?? '',
                        year: selectedSpk.year ? String(selectedSpk.year) : '',
                        unit_status: selectedSpk.unit_status ?? 'ready',
                        unit_name: selectedSpk.unit_name,
                        spk_status: selectedSpk.spk_status ?? 'spk',
                        plan_do_date: selectedSpk.plan_do_date ?? '',
                        price_otr: selectedSpk.price_otr ? String(selectedSpk.price_otr) : '',
                        discount: selectedSpk.discount ? String(selectedSpk.discount) : '',
                        booking_fee: selectedSpk.booking_fee ? String(selectedSpk.booking_fee) : '',
                        dp_gross: selectedSpk.dp_gross ? String(selectedSpk.dp_gross) : '',
                        dp_net: selectedSpk.dp_net ? String(selectedSpk.dp_net) : '',
                        tenor_months: selectedSpk.tenor_months ? String(selectedSpk.tenor_months) : '',
                        installment: selectedSpk.installment ? String(selectedSpk.installment) : '',
                        leasing_name: selectedSpk.leasing_name ?? '',
                      });
                      setEditingSpkId(selectedSpk.id);
                      setFormError(null);
                      setShowForm(true);
                      setDocumentFile(null);
                    }}
                  >
                    Ubah Status
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-200/70 dark:bg-slate-950/80 p-4">
          <div className="w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-glow">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h4 className="font-display text-lg font-semibold">
                {editingSpkId ? 'Ubah Status SPK' : 'Tambah SPK'}
              </h4>
              <button
                className="rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-1 text-sm text-slate-800 dark:text-slate-200 hover:border-emerald-500 dark:hover:border-emerald-400"
                onClick={() => setShowForm(false)}
              >
                Tutup
              </button>
            </div>
            {formError && <p className="mt-3 text-xs text-rose-700 dark:text-rose-300">{formError}</p>}
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="text-xs text-slate-600 dark:text-slate-400">
                Sales
                <select
                  className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm"
                  value={form.sales_id}
                  onChange={(event) => {
                    const value = event.target.value;
                    const match = sales.find((item) => String(item.id) === value);
                    setForm((prev) => ({
                      ...prev,
                      sales_id: value,
                      branch_id: match?.branch_id ? String(match.branch_id) : prev.branch_id,
                    }));
                  }}
                >
                  <option value="">Pilih Sales</option>
                  {sales.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs text-slate-600 dark:text-slate-400">
                Cabang
                <select
                  className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm"
                  value={form.branch_id}
                  onChange={(event) => setForm((prev) => ({ ...prev, branch_id: event.target.value }))}
                >
                  <option value="">Pilih Cabang</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs text-slate-600 dark:text-slate-400">
                Sistem Pembayaran
                <select
                  className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm"
                  value={form.payment_method}
                  onChange={(event) => setForm((prev) => ({ ...prev, payment_method: event.target.value }))}
                >
                  <option value="cash">Cash</option>
                  <option value="kredit">Kredit</option>
                </select>
              </label>
              <label className="text-xs text-slate-600 dark:text-slate-400">
                Tanggal Pesan
                <input
                  className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm"
                  type="date"
                  value={form.spk_date}
                  onChange={(event) => setForm((prev) => ({ ...prev, spk_date: event.target.value }))}
                />
              </label>
              <label className="text-xs text-slate-600 dark:text-slate-400">
                Nama Customer
                <input
                  className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm"
                  value={form.customer_name}
                  onChange={(event) => setForm((prev) => ({ ...prev, customer_name: event.target.value }))}
                />
              </label>
              <label className="text-xs text-slate-600 dark:text-slate-400">
                Umur
                <input
                  className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm"
                  type="number"
                  value={form.customer_age}
                  onChange={(event) => setForm((prev) => ({ ...prev, customer_age: event.target.value }))}
                />
              </label>
              <label className="text-xs text-slate-600 dark:text-slate-400">
                Gender
                <select
                  className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm"
                  value={form.customer_gender}
                  onChange={(event) => setForm((prev) => ({ ...prev, customer_gender: event.target.value }))}
                >
                  <option value="">Pilih</option>
                  <option value="laki-laki">Laki-laki</option>
                  <option value="perempuan">Perempuan</option>
                </select>
              </label>
              <label className="text-xs text-slate-600 dark:text-slate-400">
                Pekerjaan
                <input
                  className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm"
                  value={form.customer_job}
                  onChange={(event) => setForm((prev) => ({ ...prev, customer_job: event.target.value }))}
                />
              </label>
              <label className="text-xs text-slate-600 dark:text-slate-400">
                Nomor HP
                <input
                  className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm"
                  value={form.customer_phone}
                  onChange={(event) => setForm((prev) => ({ ...prev, customer_phone: event.target.value }))}
                />
              </label>
              <label className="text-xs text-slate-600 dark:text-slate-400 md:col-span-2">
                Alamat KTP
                <input
                  className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm"
                  value={form.customer_address_ktp}
                  onChange={(event) => setForm((prev) => ({ ...prev, customer_address_ktp: event.target.value }))}
                />
              </label>
              <label className="text-xs text-slate-600 dark:text-slate-400 md:col-span-2">
                Alamat Domisili (opsional jika beda)
                <input
                  className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm"
                  value={form.customer_address_domisili}
                  onChange={(event) => setForm((prev) => ({ ...prev, customer_address_domisili: event.target.value }))}
                />
              </label>
              <label className="text-xs text-slate-600 dark:text-slate-400">
                Merk
                <input
                  className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm"
                  value={form.brand}
                  onChange={(event) => setForm((prev) => ({ ...prev, brand: event.target.value }))}
                />
              </label>
              <label className="text-xs text-slate-600 dark:text-slate-400">
                Jenis
                <select
                  className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm"
                  value={form.fuel_type}
                  onChange={(event) => setForm((prev) => ({ ...prev, fuel_type: event.target.value }))}
                >
                  <option value="bensin">Bensin</option>
                  <option value="listrik">Listrik</option>
                </select>
              </label>
              <label className="text-xs text-slate-600 dark:text-slate-400">
                Type
                <input
                  className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm"
                  value={form.type}
                  onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value }))}
                />
              </label>
              <label className="text-xs text-slate-600 dark:text-slate-400">
                Warna
                <input
                  className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm"
                  value={form.color}
                  onChange={(event) => setForm((prev) => ({ ...prev, color: event.target.value }))}
                />
              </label>
              <label className="text-xs text-slate-600 dark:text-slate-400">
                Tahun
                <input
                  className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm"
                  type="number"
                  value={form.year}
                  onChange={(event) => setForm((prev) => ({ ...prev, year: event.target.value }))}
                />
              </label>
              <label className="text-xs text-slate-600 dark:text-slate-400">
                Status Unit
                <select
                  className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm"
                  value={form.unit_status}
                  onChange={(event) => setForm((prev) => ({ ...prev, unit_status: event.target.value }))}
                >
                  <option value="ready">Ready</option>
                  <option value="indent">Indent</option>
                </select>
              </label>
              <label className="text-xs text-slate-600 dark:text-slate-400">
                Status
                <select
                  className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm"
                  value={form.spk_status}
                  onChange={(event) => setForm((prev) => ({ ...prev, spk_status: event.target.value }))}
                >
                  <option value="spk">SPK</option>
                  <option value="do">DO</option>
                </select>
              </label>
              <label className="text-xs text-slate-600 dark:text-slate-400">
                Plan DO
                <input
                  className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm"
                  type="date"
                  value={form.plan_do_date}
                  onChange={(event) => setForm((prev) => ({ ...prev, plan_do_date: event.target.value }))}
                />
              </label>
              <label className="text-xs text-slate-600 dark:text-slate-400">
                Harga OTR
                <input
                  className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm"
                  type="number"
                  value={form.price_otr}
                  onChange={(event) => setForm((prev) => ({ ...prev, price_otr: event.target.value }))}
                />
              </label>
              <label className="text-xs text-slate-600 dark:text-slate-400">
                Diskon
                <input
                  className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm"
                  type="number"
                  value={form.discount}
                  onChange={(event) => setForm((prev) => ({ ...prev, discount: event.target.value }))}
                />
              </label>
              <label className="text-xs text-slate-600 dark:text-slate-400">
                Jumlah Tanda Jadi
                <input
                  className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm"
                  type="number"
                  value={form.booking_fee}
                  onChange={(event) => setForm((prev) => ({ ...prev, booking_fee: event.target.value }))}
                />
              </label>
              {form.payment_method === 'kredit' && (
                <>
                  <label className="text-xs text-slate-600 dark:text-slate-400">
                    Uang Muka Gross
                    <input
                      className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm"
                      type="number"
                      value={form.dp_gross}
                      onChange={(event) => setForm((prev) => ({ ...prev, dp_gross: event.target.value }))}
                    />
                  </label>
                  <label className="text-xs text-slate-600 dark:text-slate-400">
                    Uang Muka Rill
                    <input
                      className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm"
                      type="number"
                      value={form.dp_net}
                      onChange={(event) => setForm((prev) => ({ ...prev, dp_net: event.target.value }))}
                    />
                  </label>
                  <label className="text-xs text-slate-600 dark:text-slate-400">
                    Tenor (bulan)
                    <input
                      className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm"
                      type="number"
                      value={form.tenor_months}
                      onChange={(event) => setForm((prev) => ({ ...prev, tenor_months: event.target.value }))}
                    />
                  </label>
                  <label className="text-xs text-slate-600 dark:text-slate-400">
                    Angsuran
                    <input
                      className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm"
                      type="number"
                      value={form.installment}
                      onChange={(event) => setForm((prev) => ({ ...prev, installment: event.target.value }))}
                    />
                  </label>
                  <label className="text-xs text-slate-600 dark:text-slate-400">
                    Nama Leasing
                    <input
                      className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm"
                      value={form.leasing_name}
                      onChange={(event) => setForm((prev) => ({ ...prev, leasing_name: event.target.value }))}
                    />
                  </label>
                </>
              )}
              <label className="text-xs text-slate-600 dark:text-slate-400 md:col-span-2">
                Dokumen SPK
                <input
                  className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-slate-200 dark:file:bg-slate-700/70 file:px-3 file:py-1 file:text-slate-600 dark:file:text-slate-100"
                  type="file"
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null;
                    setDocumentFile(file);
                  }}
                />
              </label>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                className="rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950"
                onClick={async () => {
                  setFormError(null);
                  if (
                    !form.sales_id ||
                    !form.branch_id ||
                    !form.spk_date ||
                    !form.customer_name ||
                    !form.customer_address_ktp ||
                    !form.customer_phone
                  ) {
                    setFormError('Lengkapi sales, cabang, tanggal, customer, alamat KTP, dan nomor HP.');
                    return;
                  }
                  try {
                    if (editingSpkId) {
                      await api.put(`/spk/${editingSpkId}`, {
                        spk_status: form.spk_status,
                        plan_do_date: form.plan_do_date || null,
                      });
                    } else {
                      const formData = new FormData();
                      formData.append('sales_id', form.sales_id);
                      formData.append('branch_id', form.branch_id);
                      formData.append('spk_date', form.spk_date);
                      formData.append('customer_name', form.customer_name);
                      formData.append('unit_name', resolveUnitName());
                      formData.append('spk_status', form.spk_status);
                      if (form.plan_do_date) {
                        formData.append('plan_do_date', form.plan_do_date);
                      }
                      if (form.customer_age) {
                        formData.append('customer_age', form.customer_age);
                      }
                      if (form.customer_gender) {
                        formData.append('customer_gender', form.customer_gender);
                      }
                      if (form.customer_job) {
                        formData.append('customer_job', form.customer_job);
                      }
                      if (form.customer_phone) {
                        formData.append('customer_phone', form.customer_phone);
                      }
                      if (form.customer_address_ktp) {
                        formData.append('customer_address_ktp', form.customer_address_ktp);
                      }
                      if (form.customer_address_domisili) {
                        formData.append('customer_address_domisili', form.customer_address_domisili);
                      }
                      formData.append('payment_method', form.payment_method);
                      if (form.brand) {
                        formData.append('brand', form.brand);
                      }
                      if (form.fuel_type) {
                        formData.append('fuel_type', form.fuel_type);
                      }
                      if (form.type) {
                        formData.append('type', form.type);
                      }
                      if (form.color) {
                        formData.append('color', form.color);
                      }
                      if (form.year) {
                        formData.append('year', form.year);
                      }
                      if (form.unit_status) {
                        formData.append('unit_status', form.unit_status);
                      }
                      if (form.price_otr) {
                        formData.append('price_otr', form.price_otr);
                      }
                      if (form.discount) {
                        formData.append('discount', form.discount);
                      }
                      if (form.booking_fee) {
                        formData.append('booking_fee', form.booking_fee);
                      }
                      if (form.payment_method === 'kredit') {
                        if (form.dp_gross) {
                          formData.append('dp_gross', form.dp_gross);
                        }
                        if (form.dp_net) {
                          formData.append('dp_net', form.dp_net);
                        }
                        if (form.tenor_months) {
                          formData.append('tenor_months', form.tenor_months);
                        }
                        if (form.installment) {
                          formData.append('installment', form.installment);
                        }
                        if (form.leasing_name) {
                          formData.append('leasing_name', form.leasing_name);
                        }
                      }
                      if (documentFile) {
                        formData.append('document', documentFile);
                      }
                      await api.post('/spk', formData, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                      });
                    }
                    setShowForm(false);
                    setEditingSpkId(null);
                    setDocumentFile(null);
                    await loadSpk();
                  } catch (error) {
                    setFormError('Gagal menyimpan SPK.');
                  }
                }}
              >
                Simpan
              </button>
              <button
                className="rounded-2xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm text-slate-800 dark:text-slate-200"
                onClick={() => setShowForm(false)}
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
