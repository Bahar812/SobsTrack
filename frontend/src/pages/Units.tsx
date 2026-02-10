import { useEffect, useState } from 'react';
import api from '../api/client';
import { showToast } from '../utils/toast';

type UnitRecord = {
  id: number;
  name: string;
};

type UnitForm = {
  name: string;
};

const emptyForm: UnitForm = {
  name: '',
};

export default function Units() {
  const [units, setUnits] = useState<UnitRecord[]>([]);
  const [form, setForm] = useState<UnitForm>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadUnits = async () => {
    const response = await api.get('/units');
    setUnits(Array.isArray(response.data) ? response.data : []);
  };

  useEffect(() => {
    loadUnits().catch(() => setErrorMessage('Gagal memuat unit.'));
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
      setErrorMessage('Nama unit wajib diisi.');
      return;
    }
    const payload = {
      name: form.name.trim(),
    };
    try {
      if (editingId) {
        await api.put(`/units/${editingId}`, payload);
        setMessage('Unit berhasil diperbarui.');
      } else {
        await api.post('/units', payload);
        setMessage('Unit berhasil ditambahkan.');
      }
      await loadUnits();
      resetForm();
    } catch (error) {
      setErrorMessage('Gagal menyimpan unit.');
    }
  };

  const handleEdit = (unit: UnitRecord) => {
    setEditingId(unit.id);
    setForm({
      name: unit.name,
    });
  };

  const handleDelete = async (unit: UnitRecord) => {
    if (!window.confirm(`Hapus unit ${unit.name}?`)) {
      return;
    }
    setMessage(null);
    setErrorMessage(null);
    try {
      await api.delete(`/units/${unit.id}`);
      await loadUnits();
      setMessage('Unit berhasil dihapus.');
      if (editingId === unit.id) {
        resetForm();
      }
    } catch (error) {
      setErrorMessage('Gagal menghapus unit.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 p-6 shadow-glow">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-display text-xl font-semibold">Manajemen Unit</h3>
          {message && <span className="text-xs text-emerald-600 dark:text-emerald-300">{message}</span>}
          {errorMessage && <span className="text-xs text-rose-700 dark:text-rose-300">{errorMessage}</span>}
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs text-slate-600 dark:text-slate-400">Nama Unit</label>
            <input
              className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              placeholder="NMAX 155"
            />
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          <button
            className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950"
            onClick={handleSubmit}
          >
            {editingId ? 'Simpan Perubahan' : 'Tambah Unit'}
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
        <h3 className="font-display text-lg font-semibold">Daftar Unit</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2">Nama Unit</th>
                <th className="py-2">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-slate-800 dark:text-slate-200">
              {units.length ? (
                units.map((unit) => (
                  <tr key={unit.id} className="border-t border-slate-200 dark:border-slate-800">
                    <td className="py-3">{unit.name}</td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <button
                          className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1 text-xs text-slate-800 dark:text-slate-200 hover:border-emerald-500 dark:hover:border-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-200"
                          onClick={() => handleEdit(unit)}
                        >
                          Edit
                        </button>
                        <button
                          className="rounded-lg border border-rose-500/40 px-3 py-1 text-xs text-rose-700 dark:text-rose-200"
                          onClick={() => handleDelete(unit)}
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="border-t border-slate-200 dark:border-slate-800">
                  <td className="py-3 text-slate-500" colSpan={2}>
                    Belum ada unit.
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
