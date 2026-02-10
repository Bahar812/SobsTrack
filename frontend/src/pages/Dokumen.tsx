import { useEffect, useMemo, useRef, useState } from 'react';
import api from '../api/client';
import { getStoredUser, onAuthChange } from '../utils/auth';
import { showToast } from '../utils/toast';

type DocumentCategory = {
  id: number;
  name: string;
};

type DocumentRecord = {
  id: number;
  title: string;
  document_url?: string | null;
  category?: DocumentCategory | null;
};

export default function Dokumen() {
  const [user, setUser] = useState(getStoredUser());
  const [categories, setCategories] = useState<DocumentCategory[]>([]);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ category_id: '', title: '' });
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isAdmin = user?.role === 'admin';

  const loadDocuments = async () => {
    const response = await api.get('/documents');
    const payload = Array.isArray(response.data) ? response.data : response.data?.data;
    setDocuments(Array.isArray(payload) ? payload : []);
  };

  const loadCategories = async () => {
    const response = await api.get('/document-categories');
    setCategories(Array.isArray(response.data) ? response.data : []);
  };

  useEffect(() => {
    loadDocuments().catch(() => setErrorMessage('Gagal memuat dokumen.'));
  }, []);

  useEffect(() => {
    loadCategories().catch(() => setCategories([]));
  }, [isAdmin]);

  useEffect(() => {
    return onAuthChange(() => setUser(getStoredUser()));
  }, []);

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

  const groupedDocs = useMemo(() => {
    return categories.map((category) => ({
      category,
      docs: documents.filter((doc) => doc.category?.id === category.id),
    }));
  }, [categories, documents]);

  const resetForm = () => {
    setForm({ category_id: '', title: '' });
    setDocumentFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async () => {
    setMessage(null);
    setErrorMessage(null);
    if (!form.category_id || !form.title || !documentFile) {
      setErrorMessage('Lengkapi kategori, judul, dan file.');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('category_id', form.category_id);
      formData.append('title', form.title);
      formData.append('file', documentFile);
      await api.post('/documents', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setMessage('Dokumen berhasil diupload.');
      resetForm();
      setShowForm(false);
      await loadDocuments();
    } catch (error) {
      setErrorMessage('Gagal upload dokumen.');
    }
  };

  const handleDelete = async (docId: number) => {
    if (!window.confirm('Hapus dokumen ini?')) {
      return;
    }
    setMessage(null);
    setErrorMessage(null);
    try {
      await api.delete(`/documents/${docId}`);
      await loadDocuments();
      setMessage('Dokumen dihapus.');
    } catch (error) {
      setErrorMessage('Gagal menghapus dokumen.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 p-6 shadow-glow">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-display text-xl font-semibold">Dokumen Sales</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Brosur, pricelist, SPK, SOP</p>
          </div>
          {isAdmin && (
            <button
              className="rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950"
              onClick={() => setShowForm(true)}
            >
              Upload Dokumen
            </button>
          )}
        </div>
        {message && <p className="mt-3 text-xs text-emerald-600 dark:text-emerald-300">{message}</p>}
        {errorMessage && <p className="mt-3 text-xs text-rose-700 dark:text-rose-300">{errorMessage}</p>}
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {groupedDocs.length ? (
            groupedDocs.map(({ category, docs }) => (
              <div key={category.id} className="rounded-2xl bg-slate-100 dark:bg-slate-800/60 p-4">
                <p className="text-sm text-slate-700 dark:text-slate-300">{category.name}</p>
                <div className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  {docs.length ? (
                    docs.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between gap-2">
                        <span>{doc.title}</span>
                        <div className="flex items-center gap-2">
                          {doc.document_url ? (
                            <a
                              className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1 text-xs text-slate-800 dark:text-slate-200"
                              href={doc.document_url}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Download
                            </a>
                          ) : (
                            <span className="text-xs text-slate-500">-</span>
                          )}
                          {isAdmin && (
                            <button
                              className="rounded-lg border border-rose-500/40 px-3 py-1 text-xs text-rose-700 dark:text-rose-200"
                              onClick={() => handleDelete(doc.id)}
                            >
                              Hapus
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500">Belum ada dokumen.</p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">Belum ada kategori dokumen.</p>
          )}
        </div>
      </div>

      {showForm && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-200/70 dark:bg-slate-950/80 p-4">
          <div className="w-full max-w-2xl rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-glow">
            <div className="flex items-center justify-between">
              <h4 className="font-display text-lg font-semibold">Upload Dokumen</h4>
              <button
                className="rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-1 text-sm text-slate-800 dark:text-slate-200 hover:border-emerald-500 dark:hover:border-emerald-400"
                onClick={() => setShowForm(false)}
              >
                Tutup
              </button>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="text-xs text-slate-600 dark:text-slate-400">
                Kategori
                <select
                  className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm"
                  value={form.category_id}
                  onChange={(event) => setForm((prev) => ({ ...prev, category_id: event.target.value }))}
                >
                  <option value="">Pilih Kategori</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs text-slate-600 dark:text-slate-400">
                Judul Dokumen
                <input
                  className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm"
                  value={form.title}
                  onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                />
              </label>
              <label className="text-xs text-slate-600 dark:text-slate-400 md:col-span-2">
                File
                <input
                  ref={fileInputRef}
                  className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-slate-200 dark:file:bg-slate-700/70 file:px-3 file:py-1 file:text-slate-600 dark:file:text-slate-100"
                  type="file"
                  onChange={(event) => setDocumentFile(event.target.files?.[0] ?? null)}
                />
              </label>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                className="rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950"
                onClick={handleUpload}
              >
                Upload
              </button>
              <button
                className="rounded-2xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm text-slate-800 dark:text-slate-200"
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
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
