import { useEffect, useMemo, useState } from 'react';
import api from '../api/client';
import { showToast } from '../utils/toast';

type BranchOption = {
  id: number;
  name: string;
};

type UserRecord = {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'sales' | 'leader';
  phone?: string | null;
  branch?: BranchOption | null;
};

type UserForm = {
  name: string;
  email: string;
  role: 'admin' | 'sales' | 'leader';
  phone: string;
  branchId: string;
  password: string;
};

const emptyForm: UserForm = {
  name: '',
  email: '',
  role: 'sales',
  phone: '',
  branchId: '',
  password: '',
};

export default function Users() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [form, setForm] = useState<UserForm>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadUsers = async () => {
    const response = await api.get('/users');
    setUsers(Array.isArray(response.data) ? response.data : []);
  };

  const loadBranches = async () => {
    const response = await api.get('/branches');
    setBranches(Array.isArray(response.data) ? response.data : []);
  };

  useEffect(() => {
    loadUsers().catch(() => setErrorMessage('Gagal memuat user.'));
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

  const branchLabel = useMemo(() => {
    if (!form.branchId) {
      return 'Tanpa Cabang';
    }
    const branch = branches.find((item) => String(item.id) === form.branchId);
    return branch?.name ?? 'Tanpa Cabang';
  }, [form.branchId, branches]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async () => {
    setMessage(null);
    setErrorMessage(null);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        role: form.role,
        phone: form.phone || null,
        branch_id: form.branchId ? Number(form.branchId) : null,
        password: form.password || undefined,
      };
      if (editingId) {
        await api.put(`/users/${editingId}`, payload);
        setMessage('User berhasil diperbarui.');
      } else {
        await api.post('/users', payload);
        setMessage('User berhasil ditambahkan.');
      }
      await loadUsers();
      resetForm();
    } catch (error) {
      setErrorMessage('Gagal menyimpan user.');
    }
  };

  const handleEdit = (user: UserRecord) => {
    setEditingId(user.id);
    setForm({
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone ?? '',
      branchId: user.branch?.id ? String(user.branch.id) : '',
      password: '',
    });
  };

  const handleDelete = async (user: UserRecord) => {
    if (!window.confirm(`Hapus user ${user.name}?`)) {
      return;
    }
    setMessage(null);
    setErrorMessage(null);
    try {
      await api.delete(`/users/${user.id}`);
      await loadUsers();
      setMessage('User berhasil dihapus.');
      if (editingId === user.id) {
        resetForm();
      }
    } catch (error) {
      setErrorMessage('Gagal menghapus user.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 p-6 shadow-glow">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-display text-xl font-semibold">Manajemen User</h3>
          {message && <span className="text-xs text-emerald-600 dark:text-emerald-300">{message}</span>}
          {errorMessage && <span className="text-xs text-rose-700 dark:text-rose-300">{errorMessage}</span>}
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs text-slate-600 dark:text-slate-400">Nama</label>
            <input
              className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              placeholder="Nama lengkap"
            />
          </div>
          <div>
            <label className="text-xs text-slate-600 dark:text-slate-400">Email</label>
            <input
              className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              placeholder="email@dealer.local"
            />
          </div>
          <div>
            <label className="text-xs text-slate-600 dark:text-slate-400">Role</label>
            <select
              className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm"
              value={form.role}
              onChange={(event) => setForm({ ...form, role: event.target.value as UserForm['role'] })}
            >
              <option value="admin">Admin</option>
              <option value="leader">Leader</option>
              <option value="sales">Sales</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-600 dark:text-slate-400">Cabang</label>
            <select
              className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm"
              value={form.branchId}
              onChange={(event) => setForm({ ...form, branchId: event.target.value })}
            >
              <option value="">{branchLabel}</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-600 dark:text-slate-400">No. Telepon</label>
            <input
              className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm"
              value={form.phone}
              onChange={(event) => setForm({ ...form, phone: event.target.value })}
              placeholder="08xxxxxxxxxx"
            />
          </div>
          <div>
            <label className="text-xs text-slate-600 dark:text-slate-400">
              Password {editingId ? '(kosongkan jika tidak diubah)' : ''}
            </label>
            <input
              className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm"
              type="password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              placeholder="Minimal 6 karakter"
            />
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          <button
            className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950"
            onClick={handleSubmit}
          >
            {editingId ? 'Simpan Perubahan' : 'Tambah User'}
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
        <h3 className="font-display text-lg font-semibold">Daftar User</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2">Nama</th>
                <th className="py-2">Email</th>
                <th className="py-2">Role</th>
                <th className="py-2">Cabang</th>
                <th className="py-2">Telepon</th>
                <th className="py-2">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-slate-800 dark:text-slate-200">
              {users.length ? (
                users.map((user) => (
                  <tr key={user.id} className="border-t border-slate-200 dark:border-slate-800">
                    <td className="py-3">{user.name}</td>
                    <td className="py-3">{user.email}</td>
                    <td className="py-3 capitalize">{user.role}</td>
                    <td className="py-3">{user.branch?.name ?? '-'}</td>
                    <td className="py-3">{user.phone ?? '-'}</td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <button
                          className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1 text-xs text-slate-800 dark:text-slate-200 hover:border-emerald-500 dark:hover:border-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-200"
                          onClick={() => handleEdit(user)}
                        >
                          Edit
                        </button>
                        <button
                          className="rounded-lg border border-rose-500/40 px-3 py-1 text-xs text-rose-700 dark:text-rose-200"
                          onClick={() => handleDelete(user)}
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="border-t border-slate-200 dark:border-slate-800">
                  <td className="py-3 text-slate-500" colSpan={6}>
                    Belum ada user.
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
