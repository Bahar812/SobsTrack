import type { RefObject } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import api from '../api/client';
import { getStoredUser, onAuthChange } from '../utils/auth';
import { showToast } from '../utils/toast';

type ActivityProof = {
  id: number;
  proof_type: 'wa_story' | 'fb_marketplace' | 'tiktok' | 'comment';
  proof_full_url?: string | null;
};

type DailyActivity = {
  id: number;
  activity_date: string;
  wa_story_count: number;
  fb_marketplace_count: number;
  tiktok_post_count: number;
  new_prospect_count: number;
  fu_prospect_count: number;
  proofs?: ActivityProof[];
  user?: { id: number; name: string; branch?: { id: number; name: string } | null } | null;
};

type ProspectRecord = {
  id: number;
  user_id?: number;
  prospect_date: string;
  customer_name: string;
  customer_address: string;
  customer_phone: string;
  interested_unit: string;
  status: 'cold' | 'hot' | 'prospek' | 'spk';
  source: 'whatsapp' | 'ig' | 'tiktok' | 'iklan';
  user?: { id: number; name: string; branch?: { id: number; name: string } | null } | null;
};

const STATUS_OPTIONS: ProspectRecord['status'][] = ['cold', 'hot', 'prospek', 'spk'];
const SOURCE_OPTIONS: ProspectRecord['source'][] = ['whatsapp', 'ig', 'tiktok', 'iklan'];

const getToday = () => new Date().toISOString().slice(0, 10);

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

const parseDate = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
};

const formatDateInput = (value: Date) => {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getRangeDates = (anchor: string, range: 'day' | 'week' | 'month') => {
  const anchorDate = parseDate(anchor);
  if (range === 'day') {
    return { start: anchor, end: anchor };
  }
  if (range === 'week') {
    const start = new Date(anchorDate);
    start.setDate(start.getDate() - 6);
    return { start: formatDateInput(start), end: anchor };
  }
  const start = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), 1);
  const end = new Date(anchorDate.getFullYear(), anchorDate.getMonth() + 1, 0);
  return { start: formatDateInput(start), end: formatDateInput(end) };
};

const proofLimits: Record<ActivityProof['proof_type'], number> = {
  wa_story: 1,
  fb_marketplace: 3,
  tiktok: 1,
  comment: 10,
};

const proofLabels: Record<ActivityProof['proof_type'], string> = {
  wa_story: 'WA Story',
  fb_marketplace: 'FB Marketplace',
  tiktok: 'TikTok',
  comment: 'Bukti Komentar Review Otomotif',
};

type BranchOption = {
  id: number;
  name: string;
};

type ProspectForm = {
  prospect_date: string;
  customer_name: string;
  customer_address: string;
  customer_phone: string;
  interested_unit: string;
  status: ProspectRecord['status'];
  source: ProspectRecord['source'];
};

const emptyProspectForm = (date: string): ProspectForm => ({
  prospect_date: date,
  customer_name: '',
  customer_address: '',
  customer_phone: '',
  interested_unit: '',
  status: 'cold',
  source: 'whatsapp',
});

const MAX_PROOF_PER_DAY = 15;
const NEW_TARGET_PER_DAY = 8;
const FU_TARGET_PER_DAY = 30;
const WEIGHT_WA = 10;
const WEIGHT_FB = 20;
const WEIGHT_TIKTOK = 10;
const WEIGHT_COMMENT = 10;
const WEIGHT_NEW = 25;
const WEIGHT_FU = 25;

export default function Aktivitas() {
  const [user, setUser] = useState(getStoredUser());
  const isAdmin = user?.role === 'admin' || user?.role === 'leader';
  const [activityDate, setActivityDate] = useState(getToday());
  const [activityId, setActivityId] = useState<number | null>(null);
  const [proofs, setProofs] = useState<ActivityProof[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Record<ActivityProof['proof_type'], File[]>>({
    wa_story: [],
    fb_marketplace: [],
    tiktok: [],
    comment: [],
  });
  const [newProspects, setNewProspects] = useState<ProspectRecord[]>([]);
  const [followUps, setFollowUps] = useState<ProspectRecord[]>([]);
  const [newForm, setNewForm] = useState<ProspectForm>(() => emptyProspectForm(getToday()));
  const [followForm, setFollowForm] = useState<ProspectForm>(() => emptyProspectForm(getToday()));
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [activityRange, setActivityRange] = useState<'day' | 'week' | 'month'>('day');
  const [activityAnchor, setActivityAnchor] = useState(getToday());
  const [branchFilterId, setBranchFilterId] = useState<number | 'all'>('all');
  const [salesSearch, setSalesSearch] = useState('');
  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [performanceRows, setPerformanceRows] = useState<
    Array<{
      id: number;
      key: string;
      name: string;
      branch: string;
      days: number;
      wa: number;
      fb: number;
      tiktok: number;
      comment: number;
      newCount: number;
      newPercent: number;
      fuCount: number;
      fuPercent: number;
      total: number;
      percent: number;
    }>
  >([]);
  const [adminActivities, setAdminActivities] = useState<DailyActivity[]>([]);
  const [adminNewProspects, setAdminNewProspects] = useState<ProspectRecord[]>([]);
  const [adminFollowUps, setAdminFollowUps] = useState<ProspectRecord[]>([]);
  const [detailSales, setDetailSales] = useState<{ id: number; name: string; branch: string } | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const waInputRef = useRef<HTMLInputElement | null>(null);
  const fbInputRef = useRef<HTMLInputElement | null>(null);
  const tiktokInputRef = useRef<HTMLInputElement | null>(null);
  const commentInputRef = useRef<HTMLInputElement | null>(null);

  const proofByType = useMemo(() => {
    return proofs.reduce<Record<ActivityProof['proof_type'], ActivityProof[]>>(
      (acc, proof) => {
        acc[proof.proof_type].push(proof);
        return acc;
      },
      {
        wa_story: [],
        fb_marketplace: [],
        tiktok: [],
        comment: [],
      }
    );
  }, [proofs]);

  const loadActivity = async () => {
    if (!user) {
      return;
    }
    const response = await api.get('/activities', {
      params: { date: activityDate, sales_id: user.id },
    });
    const payload = Array.isArray(response.data) ? response.data : response.data?.data;
    const activity = Array.isArray(payload) ? (payload[0] as DailyActivity | undefined) : undefined;
    setActivityId(activity?.id ?? null);
    setProofs(activity?.proofs ?? []);
    return activity;
  };

  const loadProspects = async () => {
    if (!user) {
      return;
    }
    const [newResponse, followResponse] = await Promise.all([
      api.get('/new-prospects', { params: { date: activityDate, sales_id: user.id } }),
      api.get('/follow-up-prospects', { params: { date: activityDate, sales_id: user.id } }),
    ]);
    const newPayload = Array.isArray(newResponse.data) ? newResponse.data : newResponse.data?.data;
    const followPayload = Array.isArray(followResponse.data) ? followResponse.data : followResponse.data?.data;
    const newList = Array.isArray(newPayload) ? (newPayload as ProspectRecord[]) : [];
    const followList = Array.isArray(followPayload) ? (followPayload as ProspectRecord[]) : [];
    setNewProspects(newList);
    setFollowUps(followList);
    return { newList, followList };
  };

  const loadAdminActivities = async () => {
    const range = getRangeDates(activityAnchor, activityRange);
    const params = {
      start_date: range.start,
      end_date: range.end,
      branch_id: branchFilterId === 'all' ? undefined : branchFilterId,
      name: salesSearch.trim() || undefined,
    };
    const [activityResponse, newResponse, followResponse] = await Promise.all([
      api.get('/activities', { params }),
      api.get('/new-prospects', { params }),
      api.get('/follow-up-prospects', { params }),
    ]);
    const activityPayload = Array.isArray(activityResponse.data) ? activityResponse.data : activityResponse.data?.data;
    const newPayload = Array.isArray(newResponse.data) ? newResponse.data : newResponse.data?.data;
    const followPayload = Array.isArray(followResponse.data) ? followResponse.data : followResponse.data?.data;
    const list = Array.isArray(activityPayload) ? (activityPayload as DailyActivity[]) : [];
    const newList = Array.isArray(newPayload) ? (newPayload as ProspectRecord[]) : [];
    const followList = Array.isArray(followPayload) ? (followPayload as ProspectRecord[]) : [];
    setAdminActivities(list);
    setAdminNewProspects(newList);
    setAdminFollowUps(followList);

    const rangeDays =
      Math.max(
        1,
        Math.round((parseDate(range.end).getTime() - parseDate(range.start).getTime()) / 86400000) + 1
      ) || 1;
    const grouped = new Map<
      string,
      {
        id: number;
        name: string;
        branch: string;
        days: Set<string>;
        wa: number;
        fb: number;
        tiktok: number;
        comment: number;
        newCount: number;
        fuCount: number;
      }
    >();
    list.forEach((item) => {
      const userId = item.user?.id ?? 0;
      if (!userId) {
        return;
      }
      const userName = item.user?.name ?? 'Sales';
      const branchName = item.user?.branch?.name ?? '-';
      const key = `${userId}-${branchName}`;
      const entry =
        grouped.get(key) ??
        {
          id: userId,
          name: userName,
          branch: branchName,
          days: new Set<string>(),
          wa: 0,
          fb: 0,
          tiktok: 0,
          comment: 0,
          newCount: 0,
          fuCount: 0,
        };
      entry.days.add(item.activity_date);
      entry.wa += item.wa_story_count ?? 0;
      entry.fb += item.fb_marketplace_count ?? 0;
      entry.tiktok += item.tiktok_post_count ?? 0;
      const commentCount = item.proofs?.filter((proof) => proof.proof_type === 'comment').length ?? 0;
      entry.comment += commentCount;
      grouped.set(key, entry);
    });
    newList.forEach((item) => {
      const userId = item.user?.id ?? item.user_id ?? 0;
      if (!userId) {
        return;
      }
      const branchName = item.user?.branch?.name ?? '-';
      const key = `${userId}-${branchName}`;
      const entry =
        grouped.get(key) ??
        {
          id: userId,
          name: item.user?.name ?? 'Sales',
          branch: branchName,
          days: new Set<string>(),
          wa: 0,
          fb: 0,
          tiktok: 0,
          comment: 0,
          newCount: 0,
          fuCount: 0,
        };
      entry.newCount += 1;
      grouped.set(key, entry);
    });
    followList.forEach((item) => {
      const userId = item.user?.id ?? item.user_id ?? 0;
      if (!userId) {
        return;
      }
      const branchName = item.user?.branch?.name ?? '-';
      const key = `${userId}-${branchName}`;
      const entry =
        grouped.get(key) ??
        {
          id: userId,
          name: item.user?.name ?? 'Sales',
          branch: branchName,
          days: new Set<string>(),
          wa: 0,
          fb: 0,
          tiktok: 0,
          comment: 0,
          newCount: 0,
          fuCount: 0,
        };
      entry.fuCount += 1;
      grouped.set(key, entry);
    });
    const rows = Array.from(grouped.values()).map((entry) => {
      const total = entry.wa + entry.fb + entry.tiktok + entry.comment;
      const newTarget = NEW_TARGET_PER_DAY * rangeDays;
      const fuTarget = FU_TARGET_PER_DAY * rangeDays;
      const newPercent = newTarget > 0 ? Math.min(100, Math.round((entry.newCount / newTarget) * 100)) : 0;
      const fuPercent = fuTarget > 0 ? Math.min(100, Math.round((entry.fuCount / fuTarget) * 100)) : 0;
      const waScore = entry.wa >= rangeDays ? WEIGHT_WA : Math.round((entry.wa / Math.max(1, rangeDays)) * WEIGHT_WA);
      const fbScore =
        entry.fb >= rangeDays * 3
          ? WEIGHT_FB
          : Math.round((entry.fb / Math.max(1, rangeDays * 3)) * WEIGHT_FB);
      const tiktokScore =
        entry.tiktok >= rangeDays ? WEIGHT_TIKTOK : Math.round((entry.tiktok / Math.max(1, rangeDays)) * WEIGHT_TIKTOK);
      const commentScore =
        entry.comment >= rangeDays * 10
          ? WEIGHT_COMMENT
          : Math.round((entry.comment / Math.max(1, rangeDays * 10)) * WEIGHT_COMMENT);
      const newScore =
        newTarget > 0 ? Math.min(WEIGHT_NEW, Math.round((entry.newCount / newTarget) * WEIGHT_NEW)) : 0;
      const fuScore =
        fuTarget > 0 ? Math.min(WEIGHT_FU, Math.round((entry.fuCount / fuTarget) * WEIGHT_FU)) : 0;
      const percent = Math.min(100, waScore + fbScore + tiktokScore + commentScore + newScore + fuScore);
      return {
        id: entry.id,
        key: `${entry.id}-${entry.branch}`,
        name: entry.name,
        branch: entry.branch,
        days: entry.days.size,
        wa: entry.wa,
        fb: entry.fb,
        tiktok: entry.tiktok,
        comment: entry.comment,
        newCount: entry.newCount,
        newPercent,
        fuCount: entry.fuCount,
        fuPercent,
        total,
        percent,
      };
    });
    setPerformanceRows(rows);
  };

  const ensureActivity = async () => {
    if (activityId) {
      return activityId;
    }
    const response = await api.post('/activities', {
      activity_date: activityDate,
      wa_story_count: 0,
      fb_marketplace_count: 0,
      tiktok_post_count: 0,
      new_prospect_count: 0,
      fu_prospect_count: 0,
    });
    const createdId = response.data?.id ?? null;
    setActivityId(createdId);
    return createdId;
  };

  const syncActivitySummary = async (counts?: {
    waStory: number;
    fbMarketplace: number;
    tiktok: number;
    newProspect: number;
    followUp: number;
  }) => {
    const summary = counts ?? {
      waStory: proofByType.wa_story.length,
      fbMarketplace: proofByType.fb_marketplace.length,
      tiktok: proofByType.tiktok.length,
      newProspect: newProspects.length,
      followUp: followUps.length,
    };
    await api.post('/activities', {
      activity_date: activityDate,
      wa_story_count: summary.waStory,
      fb_marketplace_count: summary.fbMarketplace,
      tiktok_post_count: summary.tiktok,
      new_prospect_count: summary.newProspect,
      fu_prospect_count: summary.followUp,
    });
  };

  useEffect(() => {
    setNewForm((prev) => ({ ...prev, prospect_date: activityDate }));
    setFollowForm((prev) => ({ ...prev, prospect_date: activityDate }));
    if (!isAdmin) {
      loadActivity().catch(() => setErrorMessage('Gagal memuat aktivitas.'));
      loadProspects().catch(() => setErrorMessage('Gagal memuat database prospek.'));
    }
  }, [activityDate, user, isAdmin]);

  useEffect(() => {
    return onAuthChange(() => {
      setUser(getStoredUser());
    });
  }, []);

  useEffect(() => {
    if (!isAdmin) {
      return;
    }
    api
      .get('/branches')
      .then((response) => {
        setBranches(Array.isArray(response.data) ? response.data : []);
      })
      .catch(() => setBranches([]));
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) {
      return;
    }
    loadAdminActivities().catch(() => setErrorMessage('Gagal memuat performa.'));
  }, [isAdmin, activityRange, activityAnchor, branchFilterId, salesSearch]);

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

  const handleUpload = async (
    proofType: ActivityProof['proof_type'],
    files: File[],
    inputRef?: RefObject<HTMLInputElement>
  ) => {
    setMessage(null);
    setErrorMessage(null);
    try {
      if (!files.length) {
        setErrorMessage('Pilih foto terlebih dahulu.');
        return;
      }
      const currentCount = proofByType[proofType].length;
      if (currentCount + files.length > proofLimits[proofType]) {
        setErrorMessage('Jumlah foto melebihi batas.');
        return;
      }
      const activityIdValue = await ensureActivity();
      if (!activityIdValue) {
        setErrorMessage('Gagal membuat aktivitas.');
        return;
      }
      const formData = new FormData();
      formData.append('proof_type', proofType);
      files.forEach((file) => formData.append('files[]', file));
      await api.post(`/activities/${activityIdValue}/proofs`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (inputRef?.current) {
        inputRef.current.value = '';
      }
      setSelectedFiles((prev) => ({ ...prev, [proofType]: [] }));
      const activity = await loadActivity();
      const proofsList = activity?.proofs ?? [];
      const byType = proofsList.reduce<Record<ActivityProof['proof_type'], ActivityProof[]>>(
        (acc, proof) => {
          acc[proof.proof_type].push(proof);
          return acc;
        },
        { wa_story: [], fb_marketplace: [], tiktok: [], comment: [] }
      );
      await syncActivitySummary({
        waStory: byType.wa_story.length,
        fbMarketplace: byType.fb_marketplace.length,
        tiktok: byType.tiktok.length,
        newProspect: newProspects.length,
        followUp: followUps.length,
      });
      setMessage('Bukti berhasil diupload.');
    } catch (error) {
      setErrorMessage('Gagal upload bukti.');
    }
  };

  const handleRemoveSelected = (proofType: ActivityProof['proof_type'], inputRef?: RefObject<HTMLInputElement>) => {
    setSelectedFiles((prev) => ({ ...prev, [proofType]: [] }));
    if (inputRef?.current) {
      inputRef.current.value = '';
    }
  };

  const handleDeleteProof = async (proofId: number) => {
    setMessage(null);
    setErrorMessage(null);
    try {
      await api.delete(`/activities/proofs/${proofId}`);
      const activity = await loadActivity();
      const proofsList = activity?.proofs ?? [];
      const byType = proofsList.reduce<Record<ActivityProof['proof_type'], ActivityProof[]>>(
        (acc, proof) => {
          acc[proof.proof_type].push(proof);
          return acc;
        },
        { wa_story: [], fb_marketplace: [], tiktok: [], comment: [] }
      );
      await syncActivitySummary({
        waStory: byType.wa_story.length,
        fbMarketplace: byType.fb_marketplace.length,
        tiktok: byType.tiktok.length,
        newProspect: newProspects.length,
        followUp: followUps.length,
      });
      setMessage('Bukti berhasil dihapus.');
    } catch (error) {
      setErrorMessage('Gagal menghapus bukti.');
    }
  };

  const openPreview = (url?: string | null) => {
    if (!url) {
      return;
    }
    setPreviewImage(url);
  };

  const closePreview = () => {
    setPreviewImage(null);
  };

  const handleAddNewProspect = async () => {
    setMessage(null);
    setErrorMessage(null);
    try {
      await api.post('/new-prospects', newForm);
      setNewForm(emptyProspectForm(activityDate));
      const data = await loadProspects();
      await syncActivitySummary({
        waStory: proofByType.wa_story.length,
        fbMarketplace: proofByType.fb_marketplace.length,
        tiktok: proofByType.tiktok.length,
        newProspect: data?.newList.length ?? newProspects.length,
        followUp: data?.followList.length ?? followUps.length,
      });
      setMessage('Database new berhasil ditambah.');
    } catch (error) {
      setErrorMessage('Gagal menambah database new.');
    }
  };

  const handleAddFollowUp = async () => {
    setMessage(null);
    setErrorMessage(null);
    try {
      await api.post('/follow-up-prospects', followForm);
      setFollowForm(emptyProspectForm(activityDate));
      const data = await loadProspects();
      await syncActivitySummary({
        waStory: proofByType.wa_story.length,
        fbMarketplace: proofByType.fb_marketplace.length,
        tiktok: proofByType.tiktok.length,
        newProspect: data?.newList.length ?? newProspects.length,
        followUp: data?.followList.length ?? followUps.length,
      });
      setMessage('Database follow-up berhasil ditambah.');
    } catch (error) {
      setErrorMessage('Gagal menambah database follow-up.');
    }
  };

  return (
    <div className="space-y-6">
      {!isAdmin && (
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 p-6 shadow-glow">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-display text-xl font-semibold">Input Aktivitas Harian</h3>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-xs uppercase tracking-[0.2em] text-slate-500">Tanggal</span>
            <input
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm"
              type="date"
              value={activityDate}
              onChange={(event) => setActivityDate(event.target.value)}
            />
          </div>
        </div>
        {message && <p className="mt-3 text-xs text-emerald-600 dark:text-emerald-300">{message}</p>}
        {errorMessage && <p className="mt-3 text-xs text-rose-700 dark:text-rose-300">{errorMessage}</p>}
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {(['wa_story', 'fb_marketplace', 'tiktok', 'comment'] as ActivityProof['proof_type'][]).map((type) => {
            const limit = proofLimits[type];
            const items = proofByType[type];
            const remaining = limit - items.length;
            const isMultiple = limit > 1;
            const inputRef =
              type === 'wa_story'
                ? waInputRef
                : type === 'fb_marketplace'
                  ? fbInputRef
                  : type === 'tiktok'
                    ? tiktokInputRef
                    : commentInputRef;
            return (
              <div key={type} className="rounded-2xl bg-slate-100 dark:bg-slate-800/60 p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm text-slate-700 dark:text-slate-300">{proofLabels[type]}</p>
                  <span className="rounded-full bg-white/80 dark:bg-slate-900/70 px-2 py-1 text-xs text-slate-600 dark:text-slate-400">
                    {items.length}/{limit}
                  </span>
                </div>
                <input
                  ref={inputRef}
                  className="mt-3 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-slate-200 dark:file:bg-slate-700/70 file:px-3 file:py-1 file:text-slate-600 dark:file:text-slate-100"
                  type="file"
                  accept="image/*"
                  multiple={isMultiple}
                  onChange={(event) => {
                    const files = Array.from(event.target.files ?? []);
                    setSelectedFiles((prev) => ({ ...prev, [type]: files }));
                  }}
                />
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                  <span>
                    {remaining > 0 ? `Sisa upload ${remaining} foto` : 'Batas foto sudah terpenuhi.'}
                  </span>
                  {selectedFiles[type].length > 0 && (
                    <span>{selectedFiles[type].length} file dipilih</span>
                  )}
                </div>
                <button
                  className="mt-3 w-full rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm text-slate-800 dark:text-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={selectedFiles[type].length === 0}
                  onClick={() => handleUpload(type, selectedFiles[type], inputRef)}
                >
                  Upload Bukti
                </button>
                {selectedFiles[type].length > 0 && (
                  <button
                    className="mt-2 w-full rounded-xl border border-rose-500/40 px-3 py-2 text-sm text-rose-700 dark:text-rose-200"
                    onClick={() => handleRemoveSelected(type, inputRef)}
                  >
                    Hapus Pilihan
                  </button>
                )}
                {items.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {items.map((item) => (
                      <div key={item.id} className="relative">
                        <img
                          src={item.proof_full_url ?? ''}
                          alt={proofLabels[type]}
                          className="h-16 w-16 cursor-pointer rounded-xl border border-slate-200 dark:border-slate-700 object-cover"
                          onClick={() => openPreview(item.proof_full_url)}
                        />
                        <button
                          className="absolute -right-2 -top-2 rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-semibold text-slate-900 dark:text-white"
                          onClick={() => handleDeleteProof(item.id)}
                        >
                          x
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      )}

      {!isAdmin && (
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 p-6 shadow-glow">
        <h3 className="font-display text-xl font-semibold">Database New</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <input
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm"
            type="date"
            value={newForm.prospect_date}
            onChange={(event) => setNewForm({ ...newForm, prospect_date: event.target.value })}
          />
          <input
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm"
            placeholder="Nama customer"
            value={newForm.customer_name}
            onChange={(event) => setNewForm({ ...newForm, customer_name: event.target.value })}
          />
          <input
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm"
            placeholder="Alamat customer"
            value={newForm.customer_address}
            onChange={(event) => setNewForm({ ...newForm, customer_address: event.target.value })}
          />
          <input
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm"
            placeholder="Nomor customer"
            value={newForm.customer_phone}
            onChange={(event) => setNewForm({ ...newForm, customer_phone: event.target.value })}
          />
          <input
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm"
            placeholder="Unit yang diminati"
            value={newForm.interested_unit}
            onChange={(event) => setNewForm({ ...newForm, interested_unit: event.target.value })}
          />
          <select
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm"
            value={newForm.status}
            onChange={(event) => setNewForm({ ...newForm, status: event.target.value as ProspectRecord['status'] })}
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status.toUpperCase()}
              </option>
            ))}
          </select>
          <select
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm"
            value={newForm.source}
            onChange={(event) => setNewForm({ ...newForm, source: event.target.value as ProspectRecord['source'] })}
          >
            {SOURCE_OPTIONS.map((source) => (
              <option key={source} value={source}>
                {source.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
        <button
          className="mt-4 rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950"
          onClick={handleAddNewProspect}
        >
          Tambah Database New
        </button>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2">Tanggal</th>
                <th className="py-2">Nama</th>
                <th className="py-2">Alamat</th>
                <th className="py-2">Nomor</th>
                <th className="py-2">Unit</th>
                <th className="py-2">Status</th>
                <th className="py-2">Sumber</th>
              </tr>
            </thead>
            <tbody className="text-slate-800 dark:text-slate-200">
              {newProspects.length ? (
                newProspects.map((item) => (
                  <tr key={item.id} className="border-t border-slate-200 dark:border-slate-800">
                    <td className="py-3">{formatDateLong(item.prospect_date)}</td>
                    <td className="py-3">{item.customer_name}</td>
                    <td className="py-3">{item.customer_address}</td>
                    <td className="py-3">{item.customer_phone}</td>
                    <td className="py-3">{item.interested_unit}</td>
                    <td className="py-3 uppercase">{item.status}</td>
                    <td className="py-3 uppercase">{item.source}</td>
                  </tr>
                ))
              ) : (
                <tr className="border-t border-slate-200 dark:border-slate-800">
                  <td className="py-3 text-slate-500" colSpan={7}>
                    Belum ada data.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {!isAdmin && (
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 p-6 shadow-glow">
        <h3 className="font-display text-xl font-semibold">Database Follow-up</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <input
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm"
            type="date"
            value={followForm.prospect_date}
            onChange={(event) => setFollowForm({ ...followForm, prospect_date: event.target.value })}
          />
          <input
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm"
            placeholder="Nama customer"
            value={followForm.customer_name}
            onChange={(event) => setFollowForm({ ...followForm, customer_name: event.target.value })}
          />
          <input
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm"
            placeholder="Alamat customer"
            value={followForm.customer_address}
            onChange={(event) => setFollowForm({ ...followForm, customer_address: event.target.value })}
          />
          <input
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm"
            placeholder="Nomor customer"
            value={followForm.customer_phone}
            onChange={(event) => setFollowForm({ ...followForm, customer_phone: event.target.value })}
          />
          <input
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm"
            placeholder="Unit yang diminati"
            value={followForm.interested_unit}
            onChange={(event) => setFollowForm({ ...followForm, interested_unit: event.target.value })}
          />
          <select
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm"
            value={followForm.status}
            onChange={(event) =>
              setFollowForm({ ...followForm, status: event.target.value as ProspectRecord['status'] })
            }
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status.toUpperCase()}
              </option>
            ))}
          </select>
          <select
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm"
            value={followForm.source}
            onChange={(event) =>
              setFollowForm({ ...followForm, source: event.target.value as ProspectRecord['source'] })
            }
          >
            {SOURCE_OPTIONS.map((source) => (
              <option key={source} value={source}>
                {source.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
        <button
          className="mt-4 rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950"
          onClick={handleAddFollowUp}
        >
          Tambah Database Follow-up
        </button>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2">Tanggal</th>
                <th className="py-2">Nama</th>
                <th className="py-2">Alamat</th>
                <th className="py-2">Nomor</th>
                <th className="py-2">Unit</th>
                <th className="py-2">Status</th>
                <th className="py-2">Sumber</th>
              </tr>
            </thead>
            <tbody className="text-slate-800 dark:text-slate-200">
              {followUps.length ? (
                followUps.map((item) => (
                  <tr key={item.id} className="border-t border-slate-200 dark:border-slate-800">
                    <td className="py-3">{formatDateLong(item.prospect_date)}</td>
                    <td className="py-3">{item.customer_name}</td>
                    <td className="py-3">{item.customer_address}</td>
                    <td className="py-3">{item.customer_phone}</td>
                    <td className="py-3">{item.interested_unit}</td>
                    <td className="py-3 uppercase">{item.status}</td>
                    <td className="py-3 uppercase">{item.source}</td>
                  </tr>
                ))
              ) : (
                <tr className="border-t border-slate-200 dark:border-slate-800">
                  <td className="py-3 text-slate-500" colSpan={7}>
                    Belum ada data.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {isAdmin && (
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 p-6 shadow-glow">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h3 className="font-display text-xl font-semibold">Performa Aktivitas Sales</h3>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <select
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm"
                value={activityRange}
                onChange={(event) => setActivityRange(event.target.value as 'day' | 'week' | 'month')}
              >
                <option value="day">Sehari</option>
                <option value="week">Seminggu</option>
                <option value="month">Sebulan</option>
              </select>
              <input
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm"
                type="date"
                value={activityAnchor}
                onChange={(event) => setActivityAnchor(event.target.value)}
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
                {branches.map((branchItem) => (
                  <option key={branchItem.id} value={branchItem.id}>
                    {branchItem.name}
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
          <div className="mt-4 grid gap-3">
            {performanceRows.length ? (
              performanceRows.map((row) => (
                <div key={row.key} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-950/40 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{row.name}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">{row.branch}</p>
                    </div>
                    <span className="text-xs text-slate-600 dark:text-slate-400">{row.days} hari</span>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-2 rounded-full bg-emerald-400"
                      style={{ width: `${row.percent}%` }}
                    />
                  </div>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
            <span>WA {row.wa}</span>
            <span>FB {row.fb}</span>
            <span>TikTok {row.tiktok}</span>
            <span>Komentar {row.comment}</span>
            <span>New {row.newCount} ({row.newPercent}%)</span>
            <span>FU {row.fuCount} ({row.fuPercent}%)</span>
            <span>Total {row.total}</span>
            <span className="text-emerald-600 dark:text-emerald-300">{row.percent}%</span>
          </div>
        </div>
      ))
            ) : (
              <p className="text-sm text-slate-500">Belum ada data performa.</p>
            )}
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-slate-500">
                <tr>
                  <th className="py-2">Sales</th>
                  <th className="py-2">Cabang</th>
                  <th className="py-2">Hari</th>
                  <th className="py-2">WA</th>
                  <th className="py-2">FB</th>
                  <th className="py-2">TikTok</th>
                  <th className="py-2">Komentar</th>
                  <th className="py-2">New</th>
                  <th className="py-2">% New</th>
                  <th className="py-2">FU</th>
                  <th className="py-2">% FU</th>
                  <th className="py-2">Total</th>
                  <th className="py-2">%</th>
                  <th className="py-2">Detail</th>
                </tr>
              </thead>
              <tbody className="text-slate-800 dark:text-slate-200">
                {performanceRows.length ? (
                  performanceRows.map((row) => (
                    <tr key={`table-${row.key}`} className="border-t border-slate-200 dark:border-slate-800">
                      <td className="py-3">{row.name}</td>
                      <td className="py-3">{row.branch}</td>
                      <td className="py-3">{row.days}</td>
                      <td className="py-3">{row.wa}</td>
                      <td className="py-3">{row.fb}</td>
                      <td className="py-3">{row.tiktok}</td>
                      <td className="py-3">{row.comment}</td>
                      <td className="py-3">{row.newCount}</td>
                      <td className="py-3 text-emerald-600 dark:text-emerald-300">{row.newPercent}%</td>
                      <td className="py-3">{row.fuCount}</td>
                      <td className="py-3 text-emerald-600 dark:text-emerald-300">{row.fuPercent}%</td>
                      <td className="py-3">{row.total}</td>
                      <td className="py-3 text-emerald-600 dark:text-emerald-300">{row.percent}%</td>
                      <td className="py-3">
                        <button
                          className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1 text-xs text-slate-800 dark:text-slate-200 hover:border-emerald-500 dark:hover:border-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-200"
                          onClick={() => setDetailSales({ id: row.id, name: row.name, branch: row.branch })}
                        >
                          Detail
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr className="border-t border-slate-200 dark:border-slate-800">
                    <td className="py-3 text-slate-500" colSpan={14}>
                      Belum ada data performa.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {detailSales && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-200/70 dark:bg-slate-950/80 p-4">
          <div className="w-full max-w-5xl max-h-[85vh] overflow-y-auto rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-glow">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h4 className="font-display text-lg font-semibold">Detail Aktivitas Sales</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {detailSales.name} - {detailSales.branch}
                </p>
              </div>
              <button
                className="rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-1 text-sm text-slate-800 dark:text-slate-200 hover:border-emerald-500 dark:hover:border-emerald-400"
                onClick={() => setDetailSales(null)}
              >
                Tutup
              </button>
            </div>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-950/40 p-4">
                <h5 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Database New</h5>
                <div className="mt-3 max-h-72 overflow-y-auto overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="text-[11px] uppercase text-slate-500 text-center">
                      <tr>
                        <th className="py-2">Tanggal</th>
                        <th className="py-2">Nama</th>
                        <th className="py-2">Alamat</th>
                        <th className="py-2">Nomor</th>
                        <th className="py-2">Unit</th>
                        <th className="py-2">Status</th>
                        <th className="py-2">Sumber</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-800 dark:text-slate-200">
                      {adminNewProspects.filter((item) => (item.user?.id ?? item.user_id) === detailSales.id).length ? (
                        adminNewProspects
                          .filter((item) => (item.user?.id ?? item.user_id) === detailSales.id)
                          .map((item) => (
                            <tr key={`new-${item.id}`} className="border-t border-slate-200 dark:border-slate-800">
                              <td className="py-2">{formatDateLong(item.prospect_date)}</td>
                              <td className="py-2">{item.customer_name}</td>
                              <td className="py-2 whitespace-normal break-words">{item.customer_address}</td>
                              <td className="py-2">{item.customer_phone}</td>
                              <td className="py-2">{item.interested_unit}</td>
                              <td className="py-2 uppercase">{item.status}</td>
                              <td className="py-2 uppercase">{item.source}</td>
                            </tr>
                          ))
                      ) : (
                        <tr className="border-t border-slate-200 dark:border-slate-800">
                          <td className="py-2 text-slate-500" colSpan={7}>
                            Belum ada data.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-950/40 p-4">
                <h5 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Database Follow-up</h5>
                <div className="mt-3 max-h-72 overflow-y-auto overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="text-[11px] uppercase text-slate-500 text-center">
                      <tr>
                        <th className="py-2">Tanggal</th>
                        <th className="py-2">Nama</th>
                        <th className="py-2">Alamat</th>
                        <th className="py-2">Nomor</th>
                        <th className="py-2">Unit</th>
                        <th className="py-2">Status</th>
                        <th className="py-2">Sumber</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-800 dark:text-slate-200">
                      {adminFollowUps.filter((item) => (item.user?.id ?? item.user_id) === detailSales.id).length ? (
                        adminFollowUps
                          .filter((item) => (item.user?.id ?? item.user_id) === detailSales.id)
                          .map((item) => (
                            <tr key={`fu-${item.id}`} className="border-t border-slate-200 dark:border-slate-800">
                              <td className="py-2">{formatDateLong(item.prospect_date)}</td>
                              <td className="py-2">{item.customer_name}</td>
                              <td className="py-2 whitespace-normal break-words">{item.customer_address}</td>
                              <td className="py-2">{item.customer_phone}</td>
                              <td className="py-2">{item.interested_unit}</td>
                              <td className="py-2 uppercase">{item.status}</td>
                              <td className="py-2 uppercase">{item.source}</td>
                            </tr>
                          ))
                      ) : (
                        <tr className="border-t border-slate-200 dark:border-slate-800">
                          <td className="py-2 text-slate-500" colSpan={7}>
                            Belum ada data.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div className="mt-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-950/40 p-4">
              <h5 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Bukti Aktivitas</h5>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {adminActivities
                  .filter((item) => item.user?.id === detailSales.id)
                  .map((item) => (
                    <div key={`proof-${item.id}`} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 p-3">
                      <p className="text-xs text-slate-600 dark:text-slate-400">{formatDateLong(item.activity_date)}</p>
                      {(item.proofs ?? []).length ? (
                        <div className="mt-3 space-y-3">
                          {(['wa_story', 'fb_marketplace', 'tiktok', 'comment'] as ActivityProof['proof_type'][]).map(
                            (type) => {
                              const proofs = (item.proofs ?? []).filter((proof) => proof.proof_type === type);
                              return (
                                <div key={`${item.id}-${type}`}>
                                  <p className="text-[11px] uppercase text-slate-500">{proofLabels[type]}</p>
                                  {proofs.length ? (
                                    <div className="mt-2 flex flex-wrap gap-2">
                                      {proofs.map((proof) => (
                                        <img
                                          key={proof.id}
                                          src={proof.proof_full_url ?? ''}
                                          alt={proofLabels[type]}
                                          className="h-16 w-16 cursor-pointer rounded-lg border border-slate-200 dark:border-slate-700 object-cover"
                                          onClick={() => openPreview(proof.proof_full_url)}
                                        />
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="mt-1 text-xs text-slate-500">Belum ada bukti.</p>
                                  )}
                                </div>
                              );
                            }
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500">Belum ada bukti.</span>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-200/70 dark:bg-slate-950/80 p-4" onClick={closePreview}>
          <img
            src={previewImage}
            alt="Preview bukti aktivitas"
            className="max-h-[85vh] w-auto max-w-[90vw] rounded-2xl border border-slate-200 dark:border-slate-700 object-contain shadow-glow"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
