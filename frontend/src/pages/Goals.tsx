import { useEffect, useMemo, useState } from 'react';
import api from '../api/client';
import { showToast } from '../utils/toast';

type BranchOption = {
  id: number;
  name: string;
};

type UnitOption = {
  id: number;
  name: string;
};

type SalesUser = {
  id: number;
  name: string;
  role: 'admin' | 'sales' | 'leader';
  branch?: BranchOption | null;
};

type BranchGoal = {
  id: number;
  month: string;
  unit_name: string;
  unit_target: number;
  branch?: BranchOption | null;
};

type SalesGoal = {
  id: number;
  month: string;
  unit_name: string;
  unit_target: number;
  user?: SalesUser | null;
  branch?: BranchOption | null;
};

type ActivityGoal = {
  id: number;
  month: string;
  wa_story_target: number;
  fb_marketplace_target: number;
  tiktok_post_target: number;
  new_prospect_target: number;
  fu_prospect_target: number;
  user?: SalesUser | null;
};

type BranchForm = {
  branchId: string;
  unitName: string;
  unitTarget: string;
};

type SalesForm = {
  userId: string;
  unitName: string;
  unitTarget: string;
};

type ActivityForm = {
  userId: string;
  waStoryTarget: string;
  fbMarketplaceTarget: string;
  tiktokPostTarget: string;
  newProspectTarget: string;
  fuProspectTarget: string;
};

const emptyBranchForm: BranchForm = {
  branchId: '',
  unitName: '',
  unitTarget: '',
};

const emptySalesForm: SalesForm = {
  userId: '',
  unitName: '',
  unitTarget: '',
};

const emptyActivityForm: ActivityForm = {
  userId: '',
  waStoryTarget: '',
  fbMarketplaceTarget: '',
  tiktokPostTarget: '',
  newProspectTarget: '',
  fuProspectTarget: '',
};

const currentMonth = () => new Date().toISOString().slice(0, 7);

export default function Goals() {
  const [month, setMonth] = useState(currentMonth());
  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [branchFilterId, setBranchFilterId] = useState('');
  const [units, setUnits] = useState<UnitOption[]>([]);
  const [activeTab, setActiveTab] = useState<'sales' | 'activity'>('sales');
  const [salesUsers, setSalesUsers] = useState<SalesUser[]>([]);
  const [branchGoals, setBranchGoals] = useState<BranchGoal[]>([]);
  const [salesGoals, setSalesGoals] = useState<SalesGoal[]>([]);
  const [activityGoals, setActivityGoals] = useState<ActivityGoal[]>([]);
  const [branchForm, setBranchForm] = useState<BranchForm>(emptyBranchForm);
  const [salesForm, setSalesForm] = useState<SalesForm>(emptySalesForm);
  const [activityForm, setActivityForm] = useState<ActivityForm>(emptyActivityForm);
  const [editingBranchId, setEditingBranchId] = useState<number | null>(null);
  const [editingSalesId, setEditingSalesId] = useState<number | null>(null);
  const [editingActivityId, setEditingActivityId] = useState<number | null>(null);
  const [activityFilter, setActivityFilter] = useState('');
  const [branchMessage, setBranchMessage] = useState<string | null>(null);
  const [branchError, setBranchError] = useState<string | null>(null);
  const [salesMessage, setSalesMessage] = useState<string | null>(null);
  const [salesError, setSalesError] = useState<string | null>(null);
  const [activityMessage, setActivityMessage] = useState<string | null>(null);
  const [activityError, setActivityError] = useState<string | null>(null);

  const loadBranches = async () => {
    const response = await api.get('/branches');
    setBranches(Array.isArray(response.data) ? response.data : []);
  };

  const loadUnits = async () => {
    const response = await api.get('/units');
    setUnits(Array.isArray(response.data) ? response.data : []);
  };

  const loadSalesUsers = async () => {
    const response = await api.get('/users');
    const data = Array.isArray(response.data) ? response.data : [];
    setSalesUsers(data.filter((user: SalesUser) => user.role === 'sales'));
  };

  const loadBranchGoals = async () => {
    const response = await api.get('/goals/branches', {
      params: {
        month,
        branch_id: branchFilterId || undefined,
      },
    });
    setBranchGoals(Array.isArray(response.data) ? response.data : []);
  };

  const loadSalesGoals = async () => {
    const response = await api.get('/goals/sales', {
      params: {
        month,
        branch_id: branchFilterId || undefined,
      },
    });
    setSalesGoals(Array.isArray(response.data) ? response.data : []);
  };

  const loadActivityGoals = async (filter = activityFilter) => {
    const response = await api.get('/goals/activity', {
      params: {
        month,
        name: filter || undefined,
      },
    });
    setActivityGoals(Array.isArray(response.data) ? response.data : []);
  };

  useEffect(() => {
    loadBranches().catch(() => setBranchError('Gagal memuat cabang.'));
    loadUnits().catch(() => setBranchError('Gagal memuat unit.'));
    loadSalesUsers().catch(() => setSalesError('Gagal memuat sales.'));
  }, []);

  useEffect(() => {
    if (branchMessage) {
      showToast(branchMessage, 'success');
    }
  }, [branchMessage]);

  useEffect(() => {
    if (branchError) {
      showToast(branchError, 'error');
    }
  }, [branchError]);

  useEffect(() => {
    if (salesMessage) {
      showToast(salesMessage, 'success');
    }
  }, [salesMessage]);

  useEffect(() => {
    if (salesError) {
      showToast(salesError, 'error');
    }
  }, [salesError]);

  useEffect(() => {
    if (activityMessage) {
      showToast(activityMessage, 'success');
    }
  }, [activityMessage]);

  useEffect(() => {
    if (activityError) {
      showToast(activityError, 'error');
    }
  }, [activityError]);

  useEffect(() => {
    loadBranchGoals().catch(() => setBranchError('Gagal memuat target cabang.'));
    loadSalesGoals().catch(() => setSalesError('Gagal memuat target sales.'));
    loadActivityGoals().catch(() => setActivityError('Gagal memuat target aktivitas.'));
  }, [month, branchFilterId]);

  const filteredSalesUsers = useMemo(() => {
    if (!branchFilterId) {
      return salesUsers;
    }
    return salesUsers.filter((user) => String(user.branch?.id ?? '') === branchFilterId);
  }, [salesUsers, branchFilterId]);

  const selectedSales = useMemo(
    () => salesUsers.find((user) => String(user.id) === salesForm.userId),
    [salesForm.userId, salesUsers]
  );

  useEffect(() => {
    if (!branchFilterId || !salesForm.userId) {
      return;
    }
    const exists = filteredSalesUsers.some((user) => String(user.id) === salesForm.userId);
    if (!exists) {
      setSalesForm((prev) => ({ ...prev, userId: '' }));
    }
  }, [branchFilterId, filteredSalesUsers, salesForm.userId]);

  const resetBranchForm = () => {
    setBranchForm((prev) => ({
      ...emptyBranchForm,
      branchId: branchFilterId || prev.branchId,
    }));
    setEditingBranchId(null);
  };

  const resetSalesForm = () => {
    setSalesForm(emptySalesForm);
    setEditingSalesId(null);
  };

  const resetActivityForm = () => {
    setActivityForm(emptyActivityForm);
    setEditingActivityId(null);
  };

  const handleBranchSubmit = async () => {
    setBranchMessage(null);
    setBranchError(null);
    const activeBranchId = branchFilterId || branchForm.branchId;
    if (!activeBranchId) {
      setBranchError('Pilih cabang terlebih dahulu.');
      return;
    }
    if (!branchForm.unitName.trim()) {
      setBranchError('Nama unit wajib diisi.');
      return;
    }
    const unitTarget = Number(branchForm.unitTarget);
    if (Number.isNaN(unitTarget) || unitTarget < 0) {
      setBranchError('Target unit tidak valid.');
      return;
    }
    const payload = {
      branch_id: Number(activeBranchId),
      month,
      unit_name: branchForm.unitName.trim(),
      unit_target: unitTarget,
    };
    try {
      if (editingBranchId) {
        await api.put(`/goals/branches/${editingBranchId}`, payload);
        setBranchMessage('Target cabang diperbarui.');
      } else {
        await api.post('/goals/branches', payload);
        setBranchMessage('Target cabang ditambahkan.');
      }
      await loadBranchGoals();
      resetBranchForm();
    } catch (error) {
      setBranchError('Gagal menyimpan target cabang.');
    }
  };

  const handleSalesSubmit = async () => {
    setSalesMessage(null);
    setSalesError(null);
    if (!salesForm.userId) {
      setSalesError('Pilih sales terlebih dahulu.');
      return;
    }
    if (!salesForm.unitName.trim()) {
      setSalesError('Nama unit wajib diisi.');
      return;
    }
    const unitTarget = Number(salesForm.unitTarget);
    if (Number.isNaN(unitTarget) || unitTarget < 0) {
      setSalesError('Target unit tidak valid.');
      return;
    }
    const payload = {
      user_id: Number(salesForm.userId),
      branch_id: selectedSales?.branch?.id ?? undefined,
      month,
      unit_name: salesForm.unitName.trim(),
      unit_target: unitTarget,
    };
    try {
      if (editingSalesId) {
        await api.put(`/goals/sales/${editingSalesId}`, payload);
        setSalesMessage('Target sales diperbarui.');
      } else {
        await api.post('/goals/sales', payload);
        setSalesMessage('Target sales ditambahkan.');
      }
      await loadSalesGoals();
      resetSalesForm();
    } catch (error) {
      setSalesError('Gagal menyimpan target sales.');
    }
  };

  const handleBranchEdit = (goal: BranchGoal) => {
    setEditingBranchId(goal.id);
    setBranchForm({
      branchId: goal.branch?.id ? String(goal.branch.id) : '',
      unitName: goal.unit_name ?? '',
      unitTarget: String(goal.unit_target ?? 0),
    });
  };

  const handleSalesEdit = (goal: SalesGoal) => {
    setEditingSalesId(goal.id);
    setSalesForm({
      userId: goal.user?.id ? String(goal.user.id) : '',
      unitName: goal.unit_name ?? '',
      unitTarget: String(goal.unit_target ?? 0),
    });
  };

  const handleActivitySubmit = async () => {
    setActivityMessage(null);
    setActivityError(null);
    if (!activityForm.userId) {
      setActivityError('Pilih sales terlebih dahulu.');
      return;
    }
    const waStoryTarget = Number(activityForm.waStoryTarget);
    const fbMarketplaceTarget = Number(activityForm.fbMarketplaceTarget);
    const tiktokPostTarget = Number(activityForm.tiktokPostTarget);
    const newProspectTarget = Number(activityForm.newProspectTarget);
    const fuProspectTarget = Number(activityForm.fuProspectTarget);
    const targets = [
      waStoryTarget,
      fbMarketplaceTarget,
      tiktokPostTarget,
      newProspectTarget,
      fuProspectTarget,
    ];
    if (targets.some((value) => Number.isNaN(value) || value < 0)) {
      setActivityError('Target aktivitas tidak valid.');
      return;
    }
    const payload = {
      user_id: Number(activityForm.userId),
      month,
      wa_story_target: waStoryTarget,
      fb_marketplace_target: fbMarketplaceTarget,
      tiktok_post_target: tiktokPostTarget,
      new_prospect_target: newProspectTarget,
      fu_prospect_target: fuProspectTarget,
    };
    try {
      if (editingActivityId) {
        await api.put(`/goals/activity/${editingActivityId}`, payload);
        setActivityMessage('Target aktivitas diperbarui.');
      } else {
        await api.post('/goals/activity', payload);
        setActivityMessage('Target aktivitas ditambahkan.');
      }
      await loadActivityGoals();
      resetActivityForm();
    } catch (error) {
      setActivityError('Gagal menyimpan target aktivitas.');
    }
  };

  const handleBranchDelete = async (goal: BranchGoal) => {
    if (!window.confirm(`Hapus target cabang ${goal.branch?.name ?? ''}?`)) {
      return;
    }
    setBranchMessage(null);
    setBranchError(null);
    try {
      await api.delete(`/goals/branches/${goal.id}`);
      await loadBranchGoals();
      setBranchMessage('Target cabang dihapus.');
      if (editingBranchId === goal.id) {
        resetBranchForm();
      }
    } catch (error) {
      setBranchError('Gagal menghapus target cabang.');
    }
  };

  const handleSalesDelete = async (goal: SalesGoal) => {
    if (!window.confirm(`Hapus target sales ${goal.user?.name ?? ''}?`)) {
      return;
    }
    setSalesMessage(null);
    setSalesError(null);
    try {
      await api.delete(`/goals/sales/${goal.id}`);
      await loadSalesGoals();
      setSalesMessage('Target sales dihapus.');
      if (editingSalesId === goal.id) {
        resetSalesForm();
      }
    } catch (error) {
      setSalesError('Gagal menghapus target sales.');
    }
  };

  const handleActivityEdit = (goal: ActivityGoal) => {
    setEditingActivityId(goal.id);
    setActivityForm({
      userId: goal.user?.id ? String(goal.user.id) : '',
      waStoryTarget: String(goal.wa_story_target ?? 0),
      fbMarketplaceTarget: String(goal.fb_marketplace_target ?? 0),
      tiktokPostTarget: String(goal.tiktok_post_target ?? 0),
      newProspectTarget: String(goal.new_prospect_target ?? 0),
      fuProspectTarget: String(goal.fu_prospect_target ?? 0),
    });
  };

  const handleActivityDelete = async (goal: ActivityGoal) => {
    if (!window.confirm(`Hapus target aktivitas ${goal.user?.name ?? ''}?`)) {
      return;
    }
    setActivityMessage(null);
    setActivityError(null);
    try {
      await api.delete(`/goals/activity/${goal.id}`);
      await loadActivityGoals();
      setActivityMessage('Target aktivitas dihapus.');
      if (editingActivityId === goal.id) {
        resetActivityForm();
      }
    } catch (error) {
      setActivityError('Gagal menghapus target aktivitas.');
    }
  };

  const handleActivityFilter = () => {
    loadActivityGoals(activityFilter).catch(() => setActivityError('Gagal memuat target aktivitas.'));
  };

  const handleActivityFilterReset = () => {
    setActivityFilter('');
    loadActivityGoals('').catch(() => setActivityError('Gagal memuat target aktivitas.'));
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 p-6 shadow-glow">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-display text-xl font-semibold">Goals Bulanan</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Set target unit & aktivitas per cabang dan per sales.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-600 dark:text-slate-400">Bulan</label>
              <input
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm"
                type="month"
                value={month}
                onChange={(event) => setMonth(event.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-600 dark:text-slate-400">Filter Cabang</label>
              <select
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm"
                value={branchFilterId}
                onChange={(event) => {
                  const value = event.target.value;
                  setBranchFilterId(value);
                  setBranchForm((prev) => ({ ...prev, branchId: value || prev.branchId }));
                }}
              >
                <option value="">Semua cabang</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            className={`rounded-xl border px-4 py-2 text-sm ${
              activeTab === 'sales'
                ? 'border-emerald-400 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300'
                : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
            }`}
            onClick={() => setActiveTab('sales')}
          >
            Set Unit Penjualan
          </button>
          <button
            className={`rounded-xl border px-4 py-2 text-sm ${
              activeTab === 'activity'
                ? 'border-emerald-400 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300'
                : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
            }`}
            onClick={() => setActiveTab('activity')}
          >
            Set Daily Activity
          </button>
        </div>
      </div>

      {activeTab === 'sales' && (
        <>
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 p-6 shadow-glow">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-display text-lg font-semibold">Target Cabang</h3>
          {branchMessage && <span className="text-xs text-emerald-600 dark:text-emerald-300">{branchMessage}</span>}
          {branchError && <span className="text-xs text-rose-700 dark:text-rose-300">{branchError}</span>}
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div>
            <label className="text-xs text-slate-600 dark:text-slate-400">Cabang</label>
            <select
              className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm"
              value={branchFilterId || branchForm.branchId}
              disabled={Boolean(branchFilterId)}
              onChange={(event) => setBranchForm({ ...branchForm, branchId: event.target.value })}
            >
              <option value="">Pilih cabang</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-600 dark:text-slate-400">Nama Unit (per bulan)</label>
            <select
              className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm"
              value={branchForm.unitName}
              onChange={(event) => setBranchForm({ ...branchForm, unitName: event.target.value })}
            >
              <option value="">Pilih unit</option>
              {units.map((unit) => (
                <option key={unit.id} value={unit.name}>
                  {unit.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-600 dark:text-slate-400">Target Unit (per bulan)</label>
            <input
              className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm"
              type="number"
              min={0}
              value={branchForm.unitTarget}
              onChange={(event) => setBranchForm({ ...branchForm, unitTarget: event.target.value })}
              placeholder="0"
            />
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          <button
            className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950"
            onClick={handleBranchSubmit}
          >
            {editingBranchId ? 'Simpan Perubahan' : 'Tambah Target'}
          </button>
          {editingBranchId && (
            <button
              className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm text-slate-800 dark:text-slate-200"
              onClick={resetBranchForm}
            >
              Batal
            </button>
          )}
        </div>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2">Cabang</th>
                <th className="py-2">Unit</th>
                <th className="py-2">Target Unit</th>
                <th className="py-2">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-slate-800 dark:text-slate-200">
              {branchGoals.length ? (
                branchGoals.map((goal) => (
                  <tr key={goal.id} className="border-t border-slate-200 dark:border-slate-800">
                    <td className="py-3">{goal.branch?.name ?? '-'}</td>
                    <td className="py-3">{goal.unit_name ?? '-'}</td>
                    <td className="py-3">{goal.unit_target}</td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <button
                          className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1 text-xs text-slate-800 dark:text-slate-200 hover:border-emerald-500 dark:hover:border-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-200"
                          onClick={() => handleBranchEdit(goal)}
                        >
                          Edit
                        </button>
                        <button
                          className="rounded-lg border border-rose-500/40 px-3 py-1 text-xs text-rose-700 dark:text-rose-200"
                          onClick={() => handleBranchDelete(goal)}
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="border-t border-slate-200 dark:border-slate-800">
                  <td className="py-3 text-slate-500" colSpan={4}>
                    Belum ada target cabang.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
          </div>

          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 p-6 shadow-glow">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-display text-lg font-semibold">Target Sales (Penjualan)</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Target penjualan per sales dan per unit (per bulan).
            </p>
          </div>
          {salesMessage && <span className="text-xs text-emerald-600 dark:text-emerald-300">{salesMessage}</span>}
          {salesError && <span className="text-xs text-rose-700 dark:text-rose-300">{salesError}</span>}
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div>
            <label className="text-xs text-slate-600 dark:text-slate-400">Sales</label>
            <select
              className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm"
              value={salesForm.userId}
              onChange={(event) => setSalesForm({ ...salesForm, userId: event.target.value })}
            >
              <option value="">Pilih sales</option>
              {filteredSalesUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-slate-500">
              Cabang: {selectedSales?.branch?.name ?? 'Belum terdaftar'}
            </p>
          </div>
          <div>
            <label className="text-xs text-slate-600 dark:text-slate-400">Nama Unit (per bulan)</label>
            <select
              className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm"
              value={salesForm.unitName}
              onChange={(event) => setSalesForm({ ...salesForm, unitName: event.target.value })}
            >
              <option value="">Pilih unit</option>
              {units.map((unit) => (
                <option key={unit.id} value={unit.name}>
                  {unit.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-600 dark:text-slate-400">Target Unit (per bulan)</label>
            <input
              className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm"
              type="number"
              min={0}
              value={salesForm.unitTarget}
              onChange={(event) => setSalesForm({ ...salesForm, unitTarget: event.target.value })}
              placeholder="0"
            />
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          <button
            className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950"
            onClick={handleSalesSubmit}
          >
            {editingSalesId ? 'Simpan Perubahan' : 'Tambah Target'}
          </button>
          {editingSalesId && (
            <button
              className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm text-slate-800 dark:text-slate-200"
              onClick={resetSalesForm}
            >
              Batal
            </button>
          )}
        </div>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2">Sales</th>
                <th className="py-2">Cabang</th>
                <th className="py-2">Unit</th>
                <th className="py-2">Target Unit</th>
                <th className="py-2">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-slate-800 dark:text-slate-200">
              {salesGoals.length ? (
                salesGoals.map((goal) => (
                  <tr key={goal.id} className="border-t border-slate-200 dark:border-slate-800">
                    <td className="py-3">{goal.user?.name ?? '-'}</td>
                    <td className="py-3">{goal.branch?.name ?? goal.user?.branch?.name ?? '-'}</td>
                    <td className="py-3">{goal.unit_name ?? '-'}</td>
                    <td className="py-3">{goal.unit_target}</td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <button
                          className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1 text-xs text-slate-800 dark:text-slate-200 hover:border-emerald-500 dark:hover:border-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-200"
                          onClick={() => handleSalesEdit(goal)}
                        >
                          Edit
                        </button>
                        <button
                          className="rounded-lg border border-rose-500/40 px-3 py-1 text-xs text-rose-700 dark:text-rose-200"
                          onClick={() => handleSalesDelete(goal)}
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="border-t border-slate-200 dark:border-slate-800">
                  <td className="py-3 text-slate-500" colSpan={5}>
                    Belum ada target sales.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
          </div>
        </>
      )}

      {activeTab === 'activity' && (
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 p-6 shadow-glow">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-display text-lg font-semibold">Target Aktivitas Harian</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Berlaku untuk semua cabang, di-set per sales.
            </p>
          </div>
          {activityMessage && <span className="text-xs text-emerald-600 dark:text-emerald-300">{activityMessage}</span>}
          {activityError && <span className="text-xs text-rose-700 dark:text-rose-300">{activityError}</span>}
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div>
            <label className="text-xs text-slate-600 dark:text-slate-400">Sales</label>
            <select
              className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm"
              value={activityForm.userId}
              onChange={(event) => setActivityForm({ ...activityForm, userId: event.target.value })}
            >
              <option value="">Pilih sales</option>
              {salesUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-600 dark:text-slate-400">Target WA Story (per hari)</label>
            <input
              className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm"
              type="number"
              min={0}
              value={activityForm.waStoryTarget}
              onChange={(event) => setActivityForm({ ...activityForm, waStoryTarget: event.target.value })}
              placeholder="0"
            />
          </div>
          <div>
            <label className="text-xs text-slate-600 dark:text-slate-400">
              Target FB Marketplace (per hari)
            </label>
            <input
              className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm"
              type="number"
              min={0}
              value={activityForm.fbMarketplaceTarget}
              onChange={(event) => setActivityForm({ ...activityForm, fbMarketplaceTarget: event.target.value })}
              placeholder="0"
            />
          </div>
          <div>
            <label className="text-xs text-slate-600 dark:text-slate-400">Target TikTok (per hari)</label>
            <input
              className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm"
              type="number"
              min={0}
              value={activityForm.tiktokPostTarget}
              onChange={(event) => setActivityForm({ ...activityForm, tiktokPostTarget: event.target.value })}
              placeholder="0"
            />
          </div>
          <div>
            <label className="text-xs text-slate-600 dark:text-slate-400">Target Prospek Baru (per hari)</label>
            <input
              className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm"
              type="number"
              min={0}
              value={activityForm.newProspectTarget}
              onChange={(event) => setActivityForm({ ...activityForm, newProspectTarget: event.target.value })}
              placeholder="0"
            />
          </div>
          <div>
            <label className="text-xs text-slate-600 dark:text-slate-400">Target Follow Up (per hari)</label>
            <input
              className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm"
              type="number"
              min={0}
              value={activityForm.fuProspectTarget}
              onChange={(event) => setActivityForm({ ...activityForm, fuProspectTarget: event.target.value })}
              placeholder="0"
            />
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          <button
            className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950"
            onClick={handleActivitySubmit}
          >
            {editingActivityId ? 'Simpan Perubahan' : 'Tambah Target'}
          </button>
          {editingActivityId && (
            <button
              className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm text-slate-800 dark:text-slate-200"
              onClick={resetActivityForm}
            >
              Batal
            </button>
          )}
        </div>
        <div className="mt-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <label className="text-xs text-slate-600 dark:text-slate-400">Filter Nama Sales</label>
            <div className="mt-2 flex gap-2">
              <input
                className="w-56 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm"
                value={activityFilter}
                onChange={(event) => setActivityFilter(event.target.value)}
                placeholder="Cari nama sales"
              />
              <button
                className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm text-slate-800 dark:text-slate-200"
                onClick={handleActivityFilter}
              >
                Filter
              </button>
              <button
                className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm text-slate-800 dark:text-slate-200"
                onClick={handleActivityFilterReset}
              >
                Reset
              </button>
            </div>
          </div>
        </div>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2">Sales</th>
                <th className="py-2">Cabang</th>
                <th className="py-2">WA</th>
                <th className="py-2">FB</th>
                <th className="py-2">TikTok</th>
                <th className="py-2">Prospek</th>
                <th className="py-2">Follow Up</th>
                <th className="py-2">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-slate-800 dark:text-slate-200">
              {activityGoals.length ? (
                activityGoals.map((goal) => (
                  <tr key={goal.id} className="border-t border-slate-200 dark:border-slate-800">
                    <td className="py-3">{goal.user?.name ?? '-'}</td>
                    <td className="py-3">{goal.user?.branch?.name ?? '-'}</td>
                    <td className="py-3">{goal.wa_story_target}</td>
                    <td className="py-3">{goal.fb_marketplace_target}</td>
                    <td className="py-3">{goal.tiktok_post_target}</td>
                    <td className="py-3">{goal.new_prospect_target}</td>
                    <td className="py-3">{goal.fu_prospect_target}</td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <button
                          className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1 text-xs text-slate-800 dark:text-slate-200 hover:border-emerald-500 dark:hover:border-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-200"
                          onClick={() => handleActivityEdit(goal)}
                        >
                          Edit
                        </button>
                        <button
                          className="rounded-lg border border-rose-500/40 px-3 py-1 text-xs text-rose-700 dark:text-rose-200"
                          onClick={() => handleActivityDelete(goal)}
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="border-t border-slate-200 dark:border-slate-800">
                  <td className="py-3 text-slate-500" colSpan={8}>
                    Belum ada target aktivitas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}
    </div>
  );
}
