import { useEffect, useMemo, useRef, useState } from 'react';
import api from '../api/client';
import { getStoredUser, onAuthChange } from '../utils/auth';
import { showToast } from '../utils/toast';

type BranchOption = {
  id: number;
  name: string;
};

type EventRecord = {
  id: number;
  name: string;
  event_start: string;
  event_end?: string | null;
  location: string;
  description?: string | null;
  target?: string | null;
  budget_file_url?: string | null;
  branch?: { id: number; name: string } | null;
  attendees?: Array<{ id: number; name: string; branch?: { id: number; name: string } | null }> | null;
};

type EventForm = {
  name: string;
  event_start: string;
  event_end: string;
  location: string;
  description: string;
  target: string;
  branch_id: string;
  attendee_ids: string[];
};

const emptyForm: EventForm = {
  name: '',
  event_start: '',
  event_end: '',
  location: '',
  description: '',
  target: '',
  branch_id: '',
  attendee_ids: [],
};

const formatTime = (value?: string | null) =>
  value
    ? new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(value))
    : '-';

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

const formatDateShort = (value: Date) => {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const weekRangesForMonth = (monthValue: string) => {
  const [year, month] = monthValue.split('-').map((item) => Number(item));
  const monthIndex = Math.max(0, (month || 1) - 1);
  const safeYear = Number.isNaN(year) ? new Date().getFullYear() : year;
  const lastDay = new Date(safeYear, monthIndex + 1, 0).getDate();
  return {
    week1: { start: new Date(safeYear, monthIndex, 1), end: new Date(safeYear, monthIndex, Math.min(7, lastDay)) },
    week2: { start: new Date(safeYear, monthIndex, 8), end: new Date(safeYear, monthIndex, Math.min(14, lastDay)) },
    week3: { start: new Date(safeYear, monthIndex, 15), end: new Date(safeYear, monthIndex, Math.min(21, lastDay)) },
    week4: { start: new Date(safeYear, monthIndex, 22), end: new Date(safeYear, monthIndex, lastDay) },
  } as const;
};

const buildDays = (start: Date, end: Date) => {
  const days: Date[] = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
};

const toDateTimeLocal = (value?: string | null) => {
  if (!value) {
    return '';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export default function Kalender() {
  const [user, setUser] = useState(getStoredUser());
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [salesUsers, setSalesUsers] = useState<Array<{ id: number; name: string; branch?: { id: number; name: string } | null }>>([]);
  const [activeTab, setActiveTab] = useState<'agenda' | 'jadwal'>('agenda');
  const [agendaBranchId, setAgendaBranchId] = useState('');
  const [shiftMonth, setShiftMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [shiftWeek, setShiftWeek] = useState<'week1' | 'week2' | 'week3' | 'week4'>('week1');
  const [shiftBranchId, setShiftBranchId] = useState('');
  const [shiftSchedules, setShiftSchedules] = useState<Record<string, Array<{ id: number; name: string }>>>({});
  const [shiftSelections, setShiftSelections] = useState<Record<string, string[]>>({});
  const [selectedEvent, setSelectedEvent] = useState<EventRecord | null>(null);
  const [form, setForm] = useState<EventForm>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [budgetFile, setBudgetFile] = useState<File | null>(null);
  const [showAttendeePicker, setShowAttendeePicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [weekFilter, setWeekFilter] = useState<'week1' | 'week2' | 'week3' | 'week4'>(() => {
    const today = new Date();
    const day = today.getDate();
    if (day <= 7) return 'week1';
    if (day <= 14) return 'week2';
    if (day <= 21) return 'week3';
    return 'week4';
  });

  const isAdmin = user?.role === 'admin' || user?.role === 'leader';

  const loadEvents = async () => {
    const response = await api.get('/events', {
      params: {
        branch_id: agendaBranchId || undefined,
      },
    });
    setEvents(Array.isArray(response.data) ? response.data : []);
  };

  const loadBranches = async () => {
    if (!isAdmin) {
      return;
    }
    const response = await api.get('/branches');
    setBranches(Array.isArray(response.data) ? response.data : []);
  };

  const loadSalesUsers = async () => {
    if (!isAdmin) {
      return;
    }
    const response = await api.get('/sales');
    setSalesUsers(Array.isArray(response.data) ? response.data : []);
  };

  const loadShiftSchedules = async (startDate: string, endDate: string, branchId: string) => {
    if (!isAdmin || !branchId) {
      return;
    }
    const response = await api.get('/sales-shift-schedules', {
      params: {
        start_date: startDate,
        end_date: endDate,
        branch_id: branchId,
      },
    });
    const data = Array.isArray(response.data) ? response.data : [];
    const nextSchedules: Record<string, Array<{ id: number; name: string }>> = {};
    const nextSelections: Record<string, string[]> = {};
    data.forEach((item) => {
      nextSchedules[item.date] = item.sales ?? [];
      nextSelections[item.date] = (item.sales ?? []).map((sales: { id: number }) => String(sales.id));
    });
    setShiftSchedules(nextSchedules);
    setShiftSelections(nextSelections);
  };

  useEffect(() => {
    loadEvents().catch(() => setErrorMessage('Gagal memuat event.'));
  }, [agendaBranchId]);

  useEffect(() => {
    loadBranches().catch(() => setBranches([]));
    loadSalesUsers().catch(() => setSalesUsers([]));
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) {
      return;
    }
    if (!agendaBranchId && branches.length) {
      setAgendaBranchId(String(branches[0].id));
    }
  }, [agendaBranchId, branches, isAdmin]);

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

  useEffect(() => {
    if (!isAdmin) {
      return;
    }
    if (!shiftBranchId && branches.length) {
      setShiftBranchId(String(branches[0].id));
    }
  }, [branches, isAdmin, shiftBranchId]);

  const shiftWeekRanges = useMemo(() => weekRangesForMonth(shiftMonth), [shiftMonth]);

  useEffect(() => {
    const range = shiftWeekRanges[shiftWeek];
    if (!range || !shiftBranchId) {
      return;
    }
    loadShiftSchedules(formatDateShort(range.start), formatDateShort(range.end), shiftBranchId).catch(() =>
      setErrorMessage('Gagal memuat jadwal shift.')
    );
  }, [shiftBranchId, shiftWeek, shiftWeekRanges, isAdmin]);

  const weekRanges = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const lastDay = new Date(year, month + 1, 0).getDate();
    const ranges = {
      week1: { start: new Date(year, month, 1), end: new Date(year, month, Math.min(7, lastDay)) },
      week2: { start: new Date(year, month, 8), end: new Date(year, month, Math.min(14, lastDay)) },
      week3: { start: new Date(year, month, 15), end: new Date(year, month, Math.min(21, lastDay)) },
      week4: { start: new Date(year, month, 22), end: new Date(year, month, lastDay) },
    };
    return ranges;
  }, []);

  const weekLabel = useMemo(() => {
    const range = weekRanges[weekFilter];
    return `${formatDateLong(range.start.toISOString())} - ${formatDateLong(range.end.toISOString())}`;
  }, [weekFilter, weekRanges]);

  const filteredEvents = useMemo(() => {
    const range = weekRanges[weekFilter];
    return events.filter((event) => {
      const eventDate = new Date(event.event_start);
      return eventDate >= range.start && eventDate <= range.end;
    });
  }, [events, weekFilter, weekRanges]);

  const filteredAgendaSales = useMemo(() => {
    if (!agendaBranchId) {
      return salesUsers;
    }
    return salesUsers.filter((sales) => String(sales.branch?.id ?? '') === agendaBranchId);
  }, [salesUsers, agendaBranchId]);

  const eventsByDay = useMemo(() => {
    const grouped: Record<string, EventRecord[]> = {
      Sen: [],
      Sel: [],
      Rab: [],
      Kam: [],
      Jum: [],
      Sab: [],
      Min: [],
    };
    filteredEvents.forEach((event) => {
      const date = new Date(event.event_start);
      const day = date.getDay();
      const key = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'][day] ?? 'Sen';
      grouped[key].push(event);
    });
    return grouped;
  }, [filteredEvents]);

  const shiftSalesUsers = useMemo(() => {
    if (!shiftBranchId) {
      return [];
    }
    return salesUsers.filter((sales) => String(sales.branch?.id ?? '') === shiftBranchId);
  }, [salesUsers, shiftBranchId]);

  const shiftWeekLabel = useMemo(() => {
    const range = shiftWeekRanges[shiftWeek];
    return `${formatDateLong(range.start.toISOString())} - ${formatDateLong(range.end.toISOString())}`;
  }, [shiftWeek, shiftWeekRanges]);

  const shiftDays = useMemo(() => {
    const range = shiftWeekRanges[shiftWeek];
    return buildDays(range.start, range.end);
  }, [shiftWeek, shiftWeekRanges]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setBudgetFile(null);
    setShowForm(false);
    setShowAttendeePicker(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    setMessage(null);
    setErrorMessage(null);
    try {
      if (!form.name || !form.location || !form.event_start || !form.branch_id) {
        setErrorMessage('Lengkapi nama acara, lokasi, tanggal mulai, dan cabang.');
        return;
      }
      if (form.event_end) {
        const startDate = new Date(form.event_start);
        const endDate = new Date(form.event_end);
        if (endDate < startDate) {
          setErrorMessage('Waktu berakhir tidak boleh sebelum waktu mulai.');
          return;
        }
      }
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('event_start', form.event_start);
      if (form.event_end) {
        formData.append('event_end', form.event_end);
      }
      formData.append('location', form.location);
      formData.append('branch_id', form.branch_id);
      formData.append('description', form.description);
      formData.append('target', form.target);
      formData.append('attendees_present', '1');
      form.attendee_ids.forEach((id) => formData.append('attendees[]', id));
      if (budgetFile) {
        formData.append('budget_file', budgetFile);
      }
      if (editingId) {
        await api.post(`/events/${editingId}?_method=PUT`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setMessage('Event berhasil diperbarui.');
      } else {
        await api.post('/events', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setMessage('Event berhasil dibuat.');
      }
      await loadEvents();
      resetForm();
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } })?.response?.data
          ?.message ?? 'Gagal menyimpan event.';
      setErrorMessage(message);
    }
  };

  const handleEdit = (event: EventRecord) => {
    setEditingId(event.id);
    setForm({
      name: event.name,
      event_start: toDateTimeLocal(event.event_start),
      event_end: toDateTimeLocal(event.event_end ?? null),
      location: event.location,
      description: event.description ?? '',
      target: event.target ?? '',
      branch_id: event.branch?.id ? String(event.branch.id) : '',
      attendee_ids: (event.attendees ?? []).map((attendee) => String(attendee.id)),
    });
    setShowForm(true);
    setBudgetFile(null);
    setShowAttendeePicker(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleShiftSelectionChange = (dateKey: string, values: string[]) => {
    setShiftSelections((prev) => ({
      ...prev,
      [dateKey]: values,
    }));
  };

  const handleShiftWeekSave = async () => {
    if (!shiftBranchId) {
      setErrorMessage('Pilih cabang terlebih dahulu.');
      return;
    }
    try {
      await Promise.all(
        shiftDays.map((date) => {
          const dateKey = formatDateShort(date);
          return api.post('/sales-shift-schedules', {
            shift_date: dateKey,
            branch_id: Number(shiftBranchId),
            user_ids: (shiftSelections[dateKey] ?? []).map((value) => Number(value)),
          });
        })
      );
      const range = shiftWeekRanges[shiftWeek];
      await loadShiftSchedules(formatDateShort(range.start), formatDateShort(range.end), shiftBranchId);
      setMessage('Jadwal shift diperbarui.');
    } catch (error) {
      setErrorMessage('Gagal menyimpan jadwal shift.');
    }
  };

  const handleDelete = async (eventId: number) => {
    if (!window.confirm('Hapus event ini?')) {
      return;
    }
    setMessage(null);
    setErrorMessage(null);
    try {
      await api.delete(`/events/${eventId}`);
      await loadEvents();
      setMessage('Event dihapus.');
      if (editingId === eventId) {
        resetForm();
      }
    } catch (error) {
      setErrorMessage('Gagal menghapus event.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 p-6 shadow-glow">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-display text-xl font-semibold">Kalender Mingguan</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Agenda event marketing & sales</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <select
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm text-slate-800 dark:text-slate-200"
                value={weekFilter}
                onChange={(event) => setWeekFilter(event.target.value as typeof weekFilter)}
              >
                <option value="week1">Minggu 1</option>
                <option value="week2">Minggu 2</option>
                <option value="week3">Minggu 3</option>
                <option value="week4">Minggu 4</option>
              </select>
              <span className="text-xs text-slate-500">{weekLabel}</span>
            </div>
            {isAdmin && (
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <select
                  className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm text-slate-800 dark:text-slate-200"
                  value={agendaBranchId}
                  onChange={(event) => setAgendaBranchId(event.target.value)}
                >
                  <option value="">Semua Cabang</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {isAdmin && (
              <button
                className="rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950"
                onClick={() => {
                  resetForm();
                  setShowForm(true);
                }}
              >
                Tambah Event
              </button>
            )}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            className={`rounded-xl border px-4 py-2 text-sm ${
              activeTab === 'agenda'
                ? 'border-emerald-400 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300'
                : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
            }`}
            onClick={() => setActiveTab('agenda')}
          >
            Agenda
          </button>
          {isAdmin && (
            <button
              className={`rounded-xl border px-4 py-2 text-sm ${
                activeTab === 'jadwal'
                  ? 'border-emerald-400 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300'
                  : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
              }`}
              onClick={() => setActiveTab('jadwal')}
            >
              Jadwal
            </button>
          )}
        </div>
        {activeTab === 'agenda' && (
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((day) => (
              <div key={day} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/40 p-4">
                <p className="text-sm text-slate-600 dark:text-slate-400">{day}</p>
                <div className="mt-3 space-y-2">
                  {(eventsByDay[day] ?? []).length ? (
                    eventsByDay[day].map((event) => (
                      <button
                        key={`${event.id}-${day}`}
                        className="w-full rounded-xl bg-white/80 dark:bg-slate-900/70 p-3 text-left"
                        onClick={() => setSelectedEvent(event)}
                      >
                        <p className="text-sm text-slate-900 dark:text-white">{event.name}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          {formatTime(event.event_start)} - {formatTime(event.event_end)}
                        </p>
                        <p className="text-xs text-slate-500">{event.location}</p>
                        {event.attendees?.length ? (
                          <p className="text-xs text-slate-500">
                            Sales: {event.attendees.map((attendee) => attendee.name).join(', ')}
                          </p>
                        ) : null}
                      </button>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500">Belum ada event.</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isAdmin && activeTab === 'jadwal' && (
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 p-6 shadow-glow">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-display text-lg font-semibold">Jadwal Shift Sales (Per Minggu)</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Pilih cabang dan minggu, centang sales yang masuk tiap hari, lalu klik Simpan Jadwal.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-600 dark:text-slate-400">Bulan</label>
                <input
                  className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm"
                  type="month"
                  value={shiftMonth}
                  onChange={(event) => setShiftMonth(event.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-600 dark:text-slate-400">Minggu</label>
                <select
                  className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm"
                  value={shiftWeek}
                  onChange={(event) => setShiftWeek(event.target.value as typeof shiftWeek)}
                >
                  <option value="week1">Minggu 1</option>
                  <option value="week2">Minggu 2</option>
                  <option value="week3">Minggu 3</option>
                  <option value="week4">Minggu 4</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-600 dark:text-slate-400">Cabang</label>
                <select
                  className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm"
                  value={shiftBranchId}
                  onChange={(event) => setShiftBranchId(event.target.value)}
                >
                  <option value="">Pilih cabang</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
              </div>
              <span className="text-xs text-slate-500">{shiftWeekLabel}</span>
              <button
                className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm text-slate-800 dark:text-slate-200 hover:border-emerald-500 dark:hover:border-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-200"
                onClick={handleShiftWeekSave}
                disabled={!shiftBranchId}
              >
                Simpan Jadwal
              </button>
            </div>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-7">
            {shiftDays.map((date) => {
              const dateKey = formatDateShort(date);
              const dayLabel = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'][date.getDay()];
              const salesList = shiftSchedules[dateKey] ?? [];
              return (
                <div
                  key={dateKey}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/40 p-3"
                >
                  <p className="text-xs text-slate-500">{dayLabel}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">{formatDateLong(dateKey)}</p>
                  <div className="mt-2 space-y-1 text-xs text-slate-700 dark:text-slate-200">
                    {salesList.length ? (
                      salesList.map((sales) => <p key={sales.id}>{sales.name}</p>)
                    ) : (
                      <p className="text-slate-500">Libur</p>
                    )}
                  </div>
                  <div className="mt-3 space-y-2">
                    {shiftSalesUsers.length ? (
                      shiftSalesUsers.map((sales) => {
                        const selected = (shiftSelections[dateKey] ?? []).includes(String(sales.id));
                        return (
                          <label key={sales.id} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-200">
                            <input
                              type="checkbox"
                              checked={selected}
                              onChange={(event) => {
                                const next = new Set(shiftSelections[dateKey] ?? []);
                                if (event.target.checked) {
                                  next.add(String(sales.id));
                                } else {
                                  next.delete(String(sales.id));
                                }
                                handleShiftSelectionChange(dateKey, Array.from(next));
                              }}
                              disabled={!shiftBranchId}
                            />
                            <span>{sales.name}</span>
                          </label>
                        );
                      })
                  ) : (
                    <p className="text-xs text-slate-500">Sales cabang kosong.</p>
                  )}
                </div>
              </div>
            );
          })}
          </div>
        </div>
      )}

      {isAdmin && showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-200/70 dark:bg-slate-950/80 p-4">
          <div className="w-full max-w-3xl rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-glow">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-display text-xl font-semibold">{editingId ? 'Edit Event' : 'Form Event'}</h3>
              <button
                className="rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-1 text-sm text-slate-800 dark:text-slate-200 hover:border-emerald-500 dark:hover:border-emerald-400"
                onClick={resetForm}
              >
                Tutup
              </button>
            </div>
            {message && <p className="mt-3 text-xs text-emerald-600 dark:text-emerald-300">{message}</p>}
            {errorMessage && <p className="mt-3 text-xs text-rose-700 dark:text-rose-300">{errorMessage}</p>}
            <div className="mt-4 max-h-[70vh] overflow-y-auto pr-1">
              <div className="grid gap-4 md:grid-cols-2">
              <label className="text-xs text-slate-600 dark:text-slate-400">
                Nama Acara
                <input
                  className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm"
                  placeholder="Nama acara"
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                />
              </label>
              <label className="text-xs text-slate-600 dark:text-slate-400">
                Lokasi
                <input
                  className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm"
                  placeholder="Lokasi"
                  value={form.location}
                  onChange={(event) => setForm({ ...form, location: event.target.value })}
                />
              </label>
              <label className="text-xs text-slate-600 dark:text-slate-400">
                Mulai Kapan
                <input
                  className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm"
                  type="datetime-local"
                  value={form.event_start}
                  onChange={(event) => setForm({ ...form, event_start: event.target.value })}
                />
              </label>
              <label className="text-xs text-slate-600 dark:text-slate-400">
                Berakhir Kapan
                <input
                  className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm"
                  type="datetime-local"
                  value={form.event_end}
                  onChange={(event) => setForm({ ...form, event_end: event.target.value })}
                />
              </label>
              <label className="text-xs text-slate-600 dark:text-slate-400">
                Cabang
                <select
                  className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm"
                  value={form.branch_id}
                  onChange={(event) => setForm({ ...form, branch_id: event.target.value })}
                >
                  <option value="">Pilih Cabang</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs text-slate-600 dark:text-slate-400 md:col-span-2">
                Sales yang Hadir
                <div className="relative mt-2">
                  <button
                    type="button"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm text-left"
                    onClick={() => setShowAttendeePicker((prev) => !prev)}
                  >
                    {form.attendee_ids.length
                      ? `${form.attendee_ids.length} sales dipilih`
                      : 'Pilih sales'}
                  </button>
                  {showAttendeePicker && (
                    <div className="absolute z-10 mt-2 max-h-48 w-full overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 p-3 text-sm shadow-glow">
                      {filteredAgendaSales.length ? (
                        filteredAgendaSales.map((sales) => {
                          const selected = form.attendee_ids.includes(String(sales.id));
                          return (
                            <label
                              key={sales.id}
                              className="flex items-center gap-2 py-1 text-slate-800 dark:text-slate-200"
                            >
                              <input
                                type="checkbox"
                                checked={selected}
                                onChange={(event) => {
                                  const next = new Set(form.attendee_ids);
                                  if (event.target.checked) {
                                    next.add(String(sales.id));
                                  } else {
                                    next.delete(String(sales.id));
                                  }
                                  setForm({ ...form, attendee_ids: Array.from(next) });
                                }}
                              />
                              <span>
                                {sales.name} {sales.branch?.name ? `- ${sales.branch.name}` : ''}
                              </span>
                            </label>
                          );
                        })
                      ) : (
                        <p className="text-xs text-slate-500">Belum ada data sales.</p>
                      )}
                    </div>
                  )}
                </div>
              </label>
              <label className="text-xs text-slate-600 dark:text-slate-400">
                Rancangan Biaya
                <input
                  ref={fileInputRef}
                  className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-slate-200 dark:file:bg-slate-700/70 file:px-3 file:py-1 file:text-slate-600 dark:file:text-slate-100"
                  type="file"
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null;
                    setBudgetFile(file);
                  }}
                />
              </label>
              <label className="text-xs text-slate-600 dark:text-slate-400 md:col-span-2">
                Detail Acara
                <textarea
                  className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm"
                  placeholder="Detail acara (ngapain)"
                  value={form.description}
                  onChange={(event) => setForm({ ...form, description: event.target.value })}
                />
              </label>
              <label className="text-xs text-slate-600 dark:text-slate-400 md:col-span-2">
                Target yang Ingin Dicapai
                <textarea
                  className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm"
                  placeholder="Target yang ingin dicapai"
                  value={form.target}
                  onChange={(event) => setForm({ ...form, target: event.target.value })}
                />
              </label>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                className="rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950"
                onClick={handleSubmit}
              >
                {editingId ? 'Simpan Perubahan' : 'Simpan Event'}
              </button>
              {editingId && (
                <button
                  className="rounded-2xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm text-slate-800 dark:text-slate-200"
                  onClick={resetForm}
                >
                  Batal
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-200/70 dark:bg-slate-950/80 p-4">
          <div className="w-full max-w-3xl rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-glow">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h4 className="font-display text-lg font-semibold">Detail Event</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">{selectedEvent.branch?.name ?? '-'}</p>
              </div>
              <div className="flex gap-2">
                {isAdmin && (
                  <button
                    className="rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-1 text-sm text-slate-800 dark:text-slate-200 hover:border-emerald-500 dark:hover:border-emerald-400"
                    onClick={() => {
                      handleEdit(selectedEvent);
                      setSelectedEvent(null);
                    }}
                  >
                    Edit
                  </button>
                )}
                {isAdmin && (
                  <button
                    className="rounded-xl border border-rose-500/40 px-3 py-1 text-sm text-rose-700 dark:text-rose-200"
                    onClick={() => handleDelete(selectedEvent.id)}
                  >
                    Hapus
                  </button>
                )}
                <button
                  className="rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-1 text-sm text-slate-800 dark:text-slate-200 hover:border-emerald-500 dark:hover:border-emerald-400"
                  onClick={() => setSelectedEvent(null)}
                >
                  Tutup
                </button>
              </div>
            </div>
            <div className="mt-4 max-h-[70vh] overflow-y-auto pr-1">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-950/40 p-4 text-sm">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Informasi</p>
                  <div className="mt-3 space-y-2 text-slate-800 dark:text-slate-200">
                    <p>Nama Acara: {selectedEvent.name}</p>
                    <p>Tanggal: {formatDateLong(selectedEvent.event_start)}</p>
                    <p>
                      Jam: {formatTime(selectedEvent.event_start)} - {formatTime(selectedEvent.event_end)}
                    </p>
                    <p>Lokasi: {selectedEvent.location}</p>
                    <p>
                      Sales hadir:{' '}
                      {(selectedEvent.attendees ?? []).length
                        ? selectedEvent.attendees?.map((attendee) => attendee.name).join(', ')
                        : '-'}
                    </p>
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-950/40 p-4 text-sm">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Rencana</p>
                  <div className="mt-3 space-y-2 text-slate-800 dark:text-slate-200">
                    <p>Detail: {selectedEvent.description ?? '-'}</p>
                    <p>Target: {selectedEvent.target ?? '-'}</p>
                    <p>
                      Rancangan Biaya:{' '}
                      {selectedEvent.budget_file_url ? (
                        <a className="text-emerald-600 dark:text-emerald-300 underline" href={selectedEvent.budget_file_url} target="_blank">
                          Lihat File
                        </a>
                      ) : (
                        '-'
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
