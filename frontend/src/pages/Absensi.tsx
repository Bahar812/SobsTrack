import type { ChangeEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import api from '../api/client';
import { getStoredUser, onAuthChange } from '../utils/auth';
import { showToast } from '../utils/toast';

const branchOptions = [
  'TBS Kalirungkut',
  'TBS Citraland',
  'QJ Citraland',
  'QJ Cipondoh',
  'TBS Yogyakarta',
  'TBS Purwokerto',
  'TBS Bekasi',
  'TBS Tegal',
  'TBS Kelapa Gading',
  'TBS Gading Serpong',
];

type AttendanceRecord = {
  id: number;
  sales: string;
  branch: string;
  checkIn: string;
  checkOut: string;
  checkInAt: string | null;
  status: string;
  selfieUrl: string | null;
  checkoutUrl: string | null;
  cleanlinessUrls: string[];
};

type ApiCleanlinessPhoto = {
  id: number;
  photo_url?: string | null;
};

type ApiAttendance = {
  id: number;
  check_in_at: string | null;
  check_out_at: string | null;
  selfie_url?: string | null;
  checkout_photo_url?: string | null;
  branch?: { name: string } | null;
  user?: { id?: number; name: string } | null;
  cleanliness_photos?: ApiCleanlinessPhoto[];
};

type ApiBranch = {
  id: number;
  name: string;
};

const formatTime = (value?: string | null) =>
  value
    ? new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(value))
    : '-';

const mapAttendance = (attendance: ApiAttendance): AttendanceRecord => ({
  id: attendance.id,
  sales: attendance.user?.name ?? 'Sales',
  branch: attendance.branch?.name ?? '-',
  checkIn: formatTime(attendance.check_in_at),
  checkOut: formatTime(attendance.check_out_at),
  checkInAt: attendance.check_in_at,
  status: attendance.check_out_at ? 'Lengkap' : attendance.check_in_at ? 'Aktif' : 'Belum Check-in',
  selfieUrl: attendance.selfie_url ?? null,
  checkoutUrl: attendance.checkout_photo_url ?? null,
  cleanlinessUrls: (attendance.cleanliness_photos ?? [])
    .map((photo) => photo.photo_url ?? '')
    .filter((url): url is string => Boolean(url)),
});

const WORK_START_KEY = 'attendance_work_start';
const HOUR_OPTIONS = Array.from({ length: 24 }, (_, index) => String(index).padStart(2, '0'));
const MINUTE_OPTIONS = Array.from({ length: 12 }, (_, index) => String(index * 5).padStart(2, '0'));
const MAPTILER_KEY = '6a33927048a4447182bc3e1f84014323_3813886776d88571bc10bc24979c340b9c85638e264f6439c18be9654b598d17';

const getToday = () => new Date().toISOString().slice(0, 10);

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

const isLateCheckIn = (checkInAt: string | null, workStart: string) => {
  if (!checkInAt) {
    return false;
  }
  const attendanceDate = new Date(checkInAt);
  const [hours, minutes] = workStart.split(':').map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return false;
  }
  const threshold = new Date(attendanceDate);
  threshold.setHours(hours, minutes, 0, 0);
  return attendanceDate > threshold;
};

const formatDateLabel = (value: Date) =>
  new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(
    value
  );

const formatTimeLabel = (value: Date) =>
  new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false }).format(
    value
  );

const loadMapImage = (lat: number, lng: number, width: number, height: number, zoom = 16) =>
  new Promise<HTMLImageElement | null>((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = `https://api.maptiler.com/maps/streets/static/${lng},${lat},${zoom}/${width}x${height}.png?key=${MAPTILER_KEY}`;
  });

const drawFallbackMap = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number
) => {
  ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.fillRect(x, y, width, height);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.lineWidth = 1;
  const step = 18;
  for (let i = x; i <= x + width; i += step) {
    ctx.beginPath();
    ctx.moveTo(i, y);
    ctx.lineTo(i, y + height);
    ctx.stroke();
  }
  for (let j = y; j <= y + height; j += step) {
    ctx.beginPath();
    ctx.moveTo(x, j);
    ctx.lineTo(x + width, j);
    ctx.stroke();
  }
  ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
  ctx.beginPath();
  ctx.arc(x + width * 0.5, y + height * 0.55, 6, 0, Math.PI * 2);
  ctx.fill();
};

type CameraCaptureProps = {
  title: string;
  facingMode: 'user' | 'environment';
  previewUrl: string | null;
  onCapture: (file: File, previewUrl: string) => void;
  onClear: () => void;
};

const CameraCapture = ({ title, facingMode, previewUrl, onCapture, onClear }: CameraCaptureProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const [location, setLocation] = useState<{
    lat: number;
    lng: number;
    altitude?: number | null;
    accuracy?: number | null;
  } | null>(null);
  const [locationStatus, setLocationStatus] = useState('Mencari lokasi...');
  const [addressLabel, setAddressLabel] = useState<string | null>(null);
  const locationWatchRef = useRef<number | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, [isOpen]);

  const startLocationWatch = () => {
    setLocation(null);
    setAddressLabel(null);
    setLocationStatus('Mencari lokasi...');
    if (!navigator.geolocation) {
      setLocationStatus('Lokasi tidak tersedia.');
      return;
    }
    if (locationWatchRef.current !== null) {
      navigator.geolocation.clearWatch(locationWatchRef.current);
      locationWatchRef.current = null;
    }
    locationWatchRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          altitude: pos.coords.altitude,
          accuracy: pos.coords.accuracy,
        });
        setLocationStatus('Lokasi terekam.');
      },
      () => {
        setLocationStatus('Gagal mengambil lokasi.');
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    startLocationWatch();
    return () => {
      if (locationWatchRef.current !== null) {
        navigator.geolocation.clearWatch(locationWatchRef.current);
        locationWatchRef.current = null;
      }
    };
  }, [isOpen]);

  useEffect(() => {
    if (!location) {
      return;
    }
    const controller = new AbortController();
    const fetchAddress = async () => {
      try {
        const response = await fetch(
          `https://api.maptiler.com/geocoding/${location.lng},${location.lat}.json?key=${MAPTILER_KEY}`,
          { signal: controller.signal }
        );
        if (!response.ok) {
          throw new Error('reverse geocode failed');
        }
        const data = await response.json();
        const displayName =
          data?.features && data.features.length > 0 ? data.features[0]?.place_name : null;
        setAddressLabel(typeof displayName === 'string' ? displayName : null);
      } catch (error) {
        setAddressLabel(null);
      }
    };
    fetchAddress();
    return () => controller.abort();
  }, [location]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const startCamera = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          setCameraError('Browser tidak mendukung akses kamera.');
          return;
        }
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode },
          audio: false,
        });
        streamRef.current = mediaStream;
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          await videoRef.current.play();
        }
        setCameraError(null);
      } catch (error) {
        setCameraError('Tidak bisa mengakses kamera. Izinkan akses kamera di browser.');
      }
    };
    startCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      streamRef.current = null;
    };
  }, [isOpen, facingMode]);

  const handleClose = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    streamRef.current = null;
    if (locationWatchRef.current !== null) {
      navigator.geolocation.clearWatch(locationWatchRef.current);
      locationWatchRef.current = null;
    }
    setIsOpen(false);
  };

  const handleCapture = async () => {
    if (!videoRef.current) {
      return;
    }
    if (!location) {
      setLocationStatus('Lokasi belum siap. Tunggu GPS...');
      return;
    }
    const width = videoRef.current.videoWidth || 1280;
    const height = videoRef.current.videoHeight || 720;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }
    ctx.drawImage(videoRef.current, 0, 0, width, height);

    const overlayHeight = Math.max(160, Math.round(height * 0.25));
    const overlayY = height - overlayHeight;
    ctx.fillStyle = 'rgba(2, 6, 23, 0.55)';
    ctx.fillRect(0, overlayY, width, overlayHeight);

    const padding = 16;
    const mapWidth = Math.min(240, Math.round(width * 0.32));
    const mapHeight = overlayHeight - padding * 2;
    const mapX = padding;
    const mapY = overlayY + padding;

    if (location) {
      const mapImage = await loadMapImage(location.lat, location.lng, mapWidth, mapHeight);
      if (mapImage) {
        ctx.drawImage(mapImage, mapX, mapY, mapWidth, mapHeight);
        ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
        ctx.beginPath();
        ctx.arc(mapX + mapWidth * 0.5, mapY + mapHeight * 0.5, 6, 0, Math.PI * 2);
        ctx.fill();
      } else {
        drawFallbackMap(ctx, mapX, mapY, mapWidth, mapHeight);
      }
    } else {
      drawFallbackMap(ctx, mapX, mapY, mapWidth, mapHeight);
    }

    const timeLabel = `${formatDateLabel(now)} ${formatTimeLabel(now)}.${String(
      now.getSeconds()
    ).padStart(2, '0')}`;
    const locationLabel = `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`;
    const altitudeLabel =
      location.altitude !== null && location.altitude !== undefined
        ? `Alt ${Math.round(location.altitude)} m`
        : 'Alt -';
    const addressText = addressLabel ?? 'Alamat tidak tersedia';

    const wrapText = (text: string, maxWidth: number, lineHeight: number, maxLines: number) => {
      const words = text.split(' ');
      const lines: string[] = [];
      let currentLine = '';
      words.forEach((word) => {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        if (ctx.measureText(testLine).width > maxWidth && currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      });
      if (currentLine) {
        lines.push(currentLine);
      }
      return lines.slice(0, maxLines).map((line, index) => ({
        text: line,
        yOffset: index * lineHeight,
      }));
    };

    const textX = mapX + mapWidth + padding;
    let textY = overlayY + padding + 22;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.font = '600 22px "IBM Plex Sans", sans-serif';
    ctx.fillText(title, textX, textY);
    ctx.font = '500 16px "IBM Plex Sans", sans-serif';
    textY += 26;
    ctx.fillText(timeLabel, textX, textY);
    textY += 22;
    ctx.fillText(`${locationLabel} • ${altitudeLabel}`, textX, textY);
    textY += 22;
    const lines = wrapText(addressText, width - textX - padding, 18, 2);
    lines.forEach((line) => {
      ctx.fillText(line.text, textX, textY + line.yOffset);
    });

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((result) => resolve(result), 'image/jpeg', 0.92);
    });
    if (!blob) {
      return;
    }
    const file = new File([blob], `attendance-${Date.now()}.jpg`, { type: 'image/jpeg' });
    const nextUrl = URL.createObjectURL(file);
    onCapture(file, nextUrl);
    handleClose();
  };

  return (
    <div className="mt-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{title}</p>
          <p className="text-xs text-slate-500">{locationStatus}</p>
        </div>
        <div className="flex items-center gap-2">
          {previewUrl && (
            <button
              className="rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-1 text-xs text-slate-700 dark:text-slate-200 hover:border-emerald-500 dark:hover:border-emerald-400"
              onClick={onClear}
            >
              Hapus Foto
            </button>
          )}
          <button
            className="rounded-xl bg-emerald-500 px-3 py-1 text-xs font-semibold text-emerald-950"
            onClick={() => setIsOpen(true)}
          >
            Buka Kamera
          </button>
        </div>
      </div>
      {cameraError && <p className="mt-2 text-xs text-rose-700 dark:text-rose-200">{cameraError}</p>}
      {previewUrl && (
        <img
          src={previewUrl}
          alt={`Preview ${title}`}
          className="mt-3 h-32 w-32 rounded-xl border border-slate-200 dark:border-slate-700 object-cover"
        />
      )}
      {isOpen && (
        <div className="mt-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-100/80 dark:bg-slate-950/40 p-4">
          <div className="aspect-video w-full overflow-hidden rounded-xl bg-slate-900">
            <video ref={videoRef} className="h-full w-full object-cover" playsInline muted />
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-400">
            <span>
              {formatDateLabel(now)} {formatTimeLabel(now)}.{String(now.getSeconds()).padStart(2, '0')} WIB
            </span>
            <div className="flex gap-2">
              <button
                className="rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-1 text-xs text-slate-700 dark:text-slate-200"
                onClick={startLocationWatch}
              >
                Refresh Lokasi
              </button>
              <button
                className="rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-1 text-xs text-slate-700 dark:text-slate-200"
                onClick={handleClose}
              >
                Tutup
              </button>
              <button
                className="rounded-xl bg-emerald-500 px-3 py-1 text-xs font-semibold text-emerald-950 disabled:cursor-not-allowed disabled:opacity-70"
                onClick={handleCapture}
                disabled={!location}
              >
                Ambil Foto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function Absensi() {
  const [user, setUser] = useState(getStoredUser());
  const [branch, setBranch] = useState(branchOptions[0]);
  const [selfieUrl, setSelfieUrl] = useState<string | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [cleanlinessUrls, setCleanlinessUrls] = useState<string[]>([]);
  const [cleanlinessFiles, setCleanlinessFiles] = useState<File[]>([]);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [checkoutFile, setCheckoutFile] = useState<File | null>(null);
  const [attendanceId, setAttendanceId] = useState<number | null>(null);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [branches, setBranches] = useState<ApiBranch[]>([]);
  const [branchFilterId, setBranchFilterId] = useState<number | 'all'>('all');
  const [dateRange, setDateRange] = useState<'day' | 'week' | 'month'>('day');
  const [dateAnchor, setDateAnchor] = useState(getToday());
  const [salesSearch, setSalesSearch] = useState('');
  const [workStartTime, setWorkStartTime] = useState(
    () => localStorage.getItem(WORK_START_KEY) ?? '08:00'
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const cleanlinessInputRef = useRef<HTMLInputElement | null>(null);
  const isSales = user?.role === 'sales';
  const isAdmin = user?.role === 'admin' || user?.role === 'leader';

  useEffect(() => {
    if (successMessage) {
      showToast(successMessage, 'success');
    }
  }, [successMessage]);

  useEffect(() => {
    if (errorMessage) {
      showToast(errorMessage, 'error');
    }
  }, [errorMessage]);

  const loadAttendances = async () => {
    try {
      const range = isAdmin ? getRangeDates(dateAnchor, dateRange) : null;
      const params =
        isSales && user?.id
          ? { sales_id: user.id }
          : isAdmin
            ? {
                start_date: range?.start,
                end_date: range?.end,
                branch_id: branchFilterId === 'all' ? undefined : branchFilterId,
              }
            : undefined;
      const response = await api.get('/attendances', {
        params,
      });
      const payload = Array.isArray(response.data) ? response.data : response.data?.data;
      if (!Array.isArray(payload)) {
        return;
      }
      const mapped = payload.map(mapAttendance);
      if (isSales && user?.id) {
        const filtered = payload
          .filter((attendance: ApiAttendance) => attendance.user?.id === user.id)
          .map(mapAttendance);
        setRecords(filtered);
      } else {
        setRecords(mapped);
      }
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage('Gagal memuat data. Pastikan sudah login.');
    }
  };

  useEffect(() => {
    loadAttendances();
  }, [user, dateRange, dateAnchor, branchFilterId]);

  useEffect(() => {
    if (!isAdmin) {
      return;
    }
    api
      .get('/branches')
      .then((response) => {
        setBranches(Array.isArray(response.data) ? response.data : []);
      })
      .catch(() => {
        setBranches([]);
      });
  }, [isAdmin]);

  useEffect(() => {
    return onAuthChange(() => {
      setUser(getStoredUser());
    });
  }, []);

  useEffect(() => {
    if (!successMessage) {
      return;
    }
    const timer = window.setTimeout(() => {
      setSuccessMessage(null);
    }, 2500);
    return () => window.clearTimeout(timer);
  }, [successMessage]);

  useEffect(() => {
    return () => {
      if (successMessage) {
        setSuccessMessage(null);
      }
      if (selfieUrl) {
        URL.revokeObjectURL(selfieUrl);
      }
      if (checkoutUrl) {
        URL.revokeObjectURL(checkoutUrl);
      }
      cleanlinessUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [selfieUrl, checkoutUrl, cleanlinessUrls]);

  const handleCleanlinessChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) {
      return;
    }
    cleanlinessUrls.forEach((url) => URL.revokeObjectURL(url));
    setCleanlinessFiles(files);
    setCleanlinessUrls(files.map((file) => URL.createObjectURL(file)));
  };

  const handleSelfieCapture = (file: File, url: string) => {
    if (selfieUrl) {
      URL.revokeObjectURL(selfieUrl);
    }
    setSelfieFile(file);
    setSelfieUrl(url);
  };

  const handleCheckoutCapture = (file: File, url: string) => {
    if (checkoutUrl) {
      URL.revokeObjectURL(checkoutUrl);
    }
    setCheckoutFile(file);
    setCheckoutUrl(url);
  };

  const clearSelfie = () => {
    if (selfieUrl) {
      URL.revokeObjectURL(selfieUrl);
    }
    setSelfieFile(null);
    setSelfieUrl(null);
  };

  const clearCheckout = () => {
    if (checkoutUrl) {
      URL.revokeObjectURL(checkoutUrl);
    }
    setCheckoutFile(null);
    setCheckoutUrl(null);
  };

  const handleCheckIn = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    if (!selfieFile) {
      setErrorMessage('Selfie wajib diambil dari kamera sebelum check-in.');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('branch_name', branch);
      formData.append('selfie', selfieFile);

      const response = await api.post('/attendances/check-in', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setAttendanceId(response.data?.id ?? null);
      setSuccessMessage('Selfie berhasil diupload. Check-in tercatat.');
      clearSelfie();
      await loadAttendances();
    } catch (error) {
      setErrorMessage('Gagal check-in. Pastikan sudah login.');
    }
  };

  const handleUploadCleanliness = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    if (!attendanceId) {
      setErrorMessage('Check-in dulu sebelum upload foto kebersihan.');
      return;
    }
    if (!cleanlinessFiles.length) {
      setErrorMessage('Pilih minimal 1 foto kebersihan.');
      return;
    }
    try {
      const formData = new FormData();
      cleanlinessFiles.forEach((file) => {
        formData.append('photos[]', file);
      });
      await api.post(`/attendances/${attendanceId}/cleanliness-photos`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccessMessage('Foto kebersihan berhasil diupload.');
      cleanlinessUrls.forEach((url) => URL.revokeObjectURL(url));
      setCleanlinessFiles([]);
      setCleanlinessUrls([]);
      if (cleanlinessInputRef.current) {
        cleanlinessInputRef.current.value = '';
      }
      await loadAttendances();
    } catch (error) {
      setErrorMessage('Gagal upload foto kebersihan.');
    }
  };

  const handleCheckOut = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    if (!attendanceId) {
      setErrorMessage('Check-in dulu sebelum check-out.');
      return;
    }
    if (!checkoutFile) {
      setErrorMessage('Foto check-out wajib diambil dari kamera.');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('attendance_id', String(attendanceId));
      formData.append('checkout_photo', checkoutFile);
      await api.post('/attendances/check-out', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccessMessage('Check-out berhasil. Terima kasih!');
      clearCheckout();
      await loadAttendances();
    } catch (error) {
      setErrorMessage('Gagal check-out.');
    }
  };

  const filteredRecords = records.filter((record) => {
    if (!salesSearch.trim()) {
      return true;
    }
    return record.sales.toLowerCase().includes(salesSearch.trim().toLowerCase());
  });

  const [workHour, workMinute] = workStartTime.split(':');
  const safeWorkHour = HOUR_OPTIONS.includes(workHour) ? workHour : '08';
  const safeWorkMinute = MINUTE_OPTIONS.includes(workMinute) ? workMinute : '00';
  const handleWorkTimeChange = (nextHour: string, nextMinute: string) => {
    const nextValue = `${nextHour}:${nextMinute}`;
    setWorkStartTime(nextValue);
    localStorage.setItem(WORK_START_KEY, nextValue);
  };

  const openDetail = (record: AttendanceRecord) => {
    setSelectedRecord(record);
  };

  const closeDetail = () => {
    setSelectedRecord(null);
  };

  const openPreview = (url: string) => {
    setPreviewImage(url);
  };

  const closePreview = () => {
    setPreviewImage(null);
  };

  return (
    <div className="space-y-6">
      {isSales && (
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 p-6 shadow-glow">
          <h3 className="font-display text-xl font-semibold">Check-in / Check-out</h3>
          <div className="mt-4 rounded-2xl bg-slate-100 dark:bg-slate-800/60 p-4">
            {errorMessage && (
              <p className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-700 dark:text-rose-200">
                {errorMessage}
              </p>
            )}
            {successMessage && (
              <p className="mt-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-700 dark:text-emerald-200 animate-pulse">
                {successMessage}
              </p>
            )}
            <p className="text-sm text-slate-700 dark:text-slate-300">Lokasi Cabang</p>
            <select
              className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm"
              value={branch}
              onChange={(event) => setBranch(event.target.value)}
            >
              {branchOptions.map((option) => (
                <option key={option} value={option} className="bg-white dark:bg-slate-900">
                  {option}
                </option>
              ))}
            </select>

            <CameraCapture
              title="Selfie Check-in"
              facingMode="user"
              previewUrl={selfieUrl}
              onCapture={handleSelfieCapture}
              onClear={clearSelfie}
            />
            <button
              className="mt-4 w-full rounded-xl bg-emerald-500 py-2 text-sm font-semibold text-emerald-950"
              onClick={handleCheckIn}
            >
              Check-in Sekarang
            </button>

            <div className="mt-5 border-t border-slate-200/70 dark:border-slate-200 dark:border-slate-700/60 pt-5">
              <p className="text-sm text-slate-700 dark:text-slate-300">Foto Kebersihan Dealer</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <input
                  ref={cleanlinessInputRef}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-slate-200 dark:file:bg-slate-700/70 file:px-3 file:py-1 file:text-slate-600 dark:file:text-slate-100"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleCleanlinessChange}
                />
                <span className="text-xs text-slate-500">1-3 foto per cabang</span>
              </div>
              {cleanlinessUrls.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {cleanlinessUrls.map((url) => (
                    <img key={url} src={url} alt="Preview kebersihan" className="h-20 w-20 rounded-xl object-cover" />
                  ))}
                </div>
              )}
              <button
                className="mt-4 w-full rounded-xl border border-emerald-400/50 px-4 py-2 text-sm text-emerald-700 dark:text-emerald-200"
                onClick={handleUploadCleanliness}
              >
                Upload Foto Kebersihan
              </button>
            </div>

            <div className="mt-5 border-t border-slate-200/70 dark:border-slate-200 dark:border-slate-700/60 pt-5">
              <CameraCapture
                title="Foto Check-out"
                facingMode="environment"
                previewUrl={checkoutUrl}
                onCapture={handleCheckoutCapture}
                onClear={clearCheckout}
              />
              <button
                className="mt-4 w-full rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm text-slate-800 dark:text-slate-200"
                onClick={handleCheckOut}
              >
                Check-out
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 p-6 shadow-glow">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h3 className="font-display text-xl font-semibold">Rekap Absensi</h3>
          {isAdmin && (
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2">
                <span className="text-xs uppercase tracking-[0.2em] text-slate-500">Jam Masuk</span>
                <div className="flex items-center gap-2">
                  <select
                    className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 px-2 py-1 text-xs"
                    value={safeWorkHour}
                    onChange={(event) => handleWorkTimeChange(event.target.value, safeWorkMinute)}
                  >
                    {HOUR_OPTIONS.map((hour) => (
                      <option key={hour} value={hour}>
                        {hour}
                      </option>
                    ))}
                  </select>
                  <span className="text-xs text-slate-600 dark:text-slate-400">:</span>
                  <select
                    className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 px-2 py-1 text-xs"
                    value={safeWorkMinute}
                    onChange={(event) => handleWorkTimeChange(safeWorkHour, event.target.value)}
                  >
                    {MINUTE_OPTIONS.map((minute) => (
                      <option key={minute} value={minute}>
                        {minute}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <select
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm"
                value={dateRange}
                onChange={(event) => setDateRange(event.target.value as 'day' | 'week' | 'month')}
              >
                <option value="day">Sehari</option>
                <option value="week">Seminggu</option>
                <option value="month">Sebulan</option>
              </select>
              <input
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm"
                type="date"
                value={dateAnchor}
                onChange={(event) => setDateAnchor(event.target.value)}
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
          )}
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2">Sales</th>
                <th className="py-2">Cabang</th>
                <th className="py-2">Check-in</th>
                <th className="py-2">Check-out</th>
                <th className="py-2">Detail Foto</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody className="text-slate-800 dark:text-slate-200">
              {filteredRecords.length ? (
                filteredRecords.map((row) => {
                  const isLate = isAdmin && isLateCheckIn(row.checkInAt, workStartTime);
                  return (
                  <tr key={`${row.id}-${row.branch}`} className="border-t border-slate-200 dark:border-slate-800">
                    <td className="py-3">{row.sales}</td>
                    <td className="py-3">{row.branch}</td>
                    <td className="py-3">{row.checkIn}</td>
                    <td className="py-3">{row.checkOut}</td>
                    <td className="py-3">
                      <button
                        className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1 text-xs text-slate-800 dark:text-slate-200 hover:border-emerald-500 dark:hover:border-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-200"
                        onClick={() => openDetail(row)}
                      >
                        Lihat Foto
                      </button>
                    </td>
                    <td className="py-3">
                      <span className="text-emerald-600 dark:text-emerald-300">{row.status}</span>
                      {isLate && <span className="ml-2 rounded-full bg-amber-100 dark:bg-amber-500/15 px-2 py-0.5 text-xs text-amber-700 dark:text-amber-200">Terlambat</span>}
                    </td>
                  </tr>
                  );
                })
              ) : (
                <tr className="border-t border-slate-200 dark:border-slate-800">
                  <td className="py-3 text-slate-500" colSpan={6}>
                    Belum ada data absensi.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-200/70 dark:bg-slate-950/70 p-4">
          <div className="w-full max-w-4xl rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-glow">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h4 className="font-display text-lg font-semibold">Detail Foto Absensi</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {selectedRecord.sales} - {selectedRecord.branch}
                </p>
              </div>
              <button
                className="rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-1 text-sm text-slate-800 dark:text-slate-200 hover:border-emerald-500 dark:hover:border-emerald-400"
                onClick={closeDetail}
              >
                Tutup
              </button>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-950/40 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Check-in</p>
                {selectedRecord.selfieUrl ? (
                  <img
                    src={selectedRecord.selfieUrl}
                    alt="Foto check-in"
                    className="mt-3 h-40 w-full cursor-pointer rounded-xl object-cover"
                    onClick={() => openPreview(selectedRecord.selfieUrl!)}
                  />
                ) : (
                  <p className="mt-3 text-sm text-slate-500">Belum ada foto check-in.</p>
                )}
              </div>
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-950/40 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Check-out</p>
                {selectedRecord.checkoutUrl ? (
                  <img
                    src={selectedRecord.checkoutUrl}
                    alt="Foto check-out"
                    className="mt-3 h-40 w-full cursor-pointer rounded-xl object-cover"
                    onClick={() => openPreview(selectedRecord.checkoutUrl!)}
                  />
                ) : (
                  <p className="mt-3 text-sm text-slate-500">Belum ada foto check-out.</p>
                )}
              </div>
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-950/40 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Kebersihan</p>
                {selectedRecord.cleanlinessUrls.length ? (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {selectedRecord.cleanlinessUrls.map((url) => (
                      <img
                        key={url}
                        src={url}
                        alt="Foto kebersihan"
                        className="h-20 w-full cursor-pointer rounded-lg object-cover"
                        onClick={() => openPreview(url)}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-slate-500">Belum ada foto kebersihan.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-200/70 dark:bg-slate-950/80 p-4" onClick={closePreview}>
          <img
            src={previewImage}
            alt="Preview foto absensi"
            className="max-h-[85vh] w-auto max-w-[90vw] rounded-2xl border border-slate-200 dark:border-slate-700 object-contain shadow-glow"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
