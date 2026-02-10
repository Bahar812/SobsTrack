import { useEffect, useState } from 'react';
import api from '../api/client';
import { showToast } from '../utils/toast';

type BranchRecord = {
  id: number;
  name: string;
  address?: string | null;
};

type BranchForm = {
  name: string;
  address: string;
};

const emptyForm: BranchForm = {
  name: '',
  address: '',
};

export default function Cabang() {
  const [branches, setBranches] = useState<BranchRecord[]>([]);
  const [form, setForm] = useState<BranchForm>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadBranches = async () => {
    const response = await api.get('/branches');
    setBranches(Array.isArray(response.data) ? response.data : []);
  };

  useEffect(() => {
    loadBranches().catch(() => setErrorMessage('Gagal memuat cabang.'));
  }, []);

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

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async () => {
    setMessage(null);
    setErrorMessage(null);
    if (!form.name.trim()) {
      setErrorMessage('Nama cabang wajib diisi.');
      return;
    }
    const payload = {
      name: form.name.trim(),
      address: form.address.trim() || null,
    };
    try {
      if (editingId) {
        await api.put(`/branches/${editingId}`, payload);
        setMessage('Cabang berhasil diperbarui.');
      } else {
        await api.post('/branches', payload);
        setMessage('Cabang berhasil ditambahkan.');
      }
      await loadBranches();
      resetForm();
    } catch (error) {
      setErrorMessage('Gagal menyimpan cabang.');
    }
  };

  const handleEdit = (branch: BranchRecord) => {
    setEditingId(branch.id);
    setForm({
      name: branch.name ?? '',
      address: branch.address ?? '',
    });
  };

  const handleDelete = async (branch: BranchRecord) => {
    if (!window.confirm(`Hapus cabang ${branch.name}?`)) {
      return;
    }
    setMessage(null);
    setErrorMessage(null);
    try {
      await api.delete(`/branches/${branch.id}`);
      await loadBranches();
      setMessage('Cabang berhasil dihapus.');
      if (editingId === branch.id) {
        resetForm();
      }
    } catch (error) {
      setErrorMessage('Gagal menghapus cabang.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 p-6 shadow-glow">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-display text-xl font-semibold">Manajemen Cabang</h3>
          {message && <span className="text-xs text-emerald-600 dark:text-emerald-300">{message}</span>}
          {errorMessage && <span className="text-xs text-rose-700 dark:text-rose-300">{errorMessage}</span>}
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs text-slate-600 dark:text-slate-400">Nama Cabang</label>
            <input
              className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              placeholder="Cabang Pusat"
            />
          </div>
          <div>
            <label className="text-xs text-slate-600 dark:text-slate-400">Alamat</label>
            <input
              className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm"
              value={form.address}
              onChange={(event) => setForm({ ...form, address: event.target.value })}
              placeholder="Jl. Sudirman No. 10"
            />
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          <button
            className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950"
            onClick={handleSubmit}
          >
            {editingId ? 'Simpan Perubahan' : 'Tambah Cabang'}
          </button>
          {editingId && (
            <button
              className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm text-slate-800 dark:text-slate-200"
              onClick={resetForm}
            >
              Batal
            </button>
          )}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 p-6 shadow-glow">
        <h3 className="font-display text-lg font-semibold">Daftar Cabang</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2">Nama</th>
                <th className="py-2">Alamat</th>
                <th className="py-2">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-slate-800 dark:text-slate-200">
              {branches.length ? (
                branches.map((branch) => (
                  <tr key={branch.id} className="border-t border-slate-200 dark:border-slate-800">
                    <td className="py-3">{branch.name}</td>
                    <td className="py-3">{branch.address ?? '-'}</td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <button
                          className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1 text-xs text-slate-800 dark:text-slate-200 hover:border-emerald-500 dark:hover:border-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-200"
                          onClick={() => handleEdit(branch)}
                        >
                          Edit
                        </button>
                        <button
                          className="rounded-lg border border-rose-500/40 px-3 py-1 text-xs text-rose-700 dark:text-rose-200"
                          onClick={() => handleDelete(branch)}
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="border-t border-slate-200 dark:border-slate-800">
                  <td className="py-3 text-slate-500" colSpan={3}>
                    Belum ada cabang.
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
