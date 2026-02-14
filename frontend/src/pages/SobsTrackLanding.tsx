import { useEffect, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { ActivitySquare, BadgeCheck, Bike, ChartNoAxesCombined, FileCheck2, MapPinned, UsersRound } from 'lucide-react';
import salesImage from '../assets/salesimage.jpeg';
import { resolveTheme, setTheme, type ThemeMode } from '../utils/theme';

type ContentItem = {
  title: string;
  detail: string;
};
type FeatureItem = ContentItem & {
  icon: LucideIcon;
};

const navigation = [
  { label: 'Fitur', href: '#fitur' },
  { label: 'Alur', href: '#alur' },
  { label: 'Harga', href: '#harga' },
  { label: 'Kontak', href: '#kontak' },
];

const featureCards: FeatureItem[] = [
  {
    title: 'Leads Terpusat',
    detail: 'Semua prospek tersimpan rapi dari first contact sampai SPK.',
    icon: UsersRound,
  },
  {
    title: 'Aktivitas Harian',
    detail: 'Checklist dan follow-up selalu terlihat untuk tiap sales.',
    icon: ActivitySquare,
  },
  {
    title: 'SPK & Dokumen',
    detail: 'Progress closing dan dokumen pendukung berada di satu panel.',
    icon: FileCheck2,
  },
  {
    title: 'Dashboard Real-time',
    detail: 'Pimpinan cabang bisa membaca performa tanpa menunggu rekap manual.',
    icon: ChartNoAxesCombined,
  },
  {
    title: 'Manajemen Cabang',
    detail: 'Bandingkan hasil antar cabang dengan struktur data yang konsisten.',
    icon: MapPinned,
  },
  {
    title: 'Role Aman',
    detail: 'Kontrol akses admin, leader, dan sales disesuaikan kebutuhan operasional.',
    icon: BadgeCheck,
  },
];

const processSteps: ContentItem[] = [
  {
    title: '1. Tangkap Prospek',
    detail: 'Input lead sekali, lalu track perkembangan prospek tanpa pindah tools.',
  },
  {
    title: '2. Jalankan Follow-up',
    detail: 'Aktivitas, jadwal test drive, dan reminder dibuat agar ritme tim tetap konsisten.',
  },
  {
    title: '3. Evaluasi Cepat',
    detail: 'Dashboard menampilkan bottleneck agar keputusan harian lebih cepat dan tepat.',
  },
];

const pricingTiers = [
  {
    name: 'Starter',
    price: 'Rp149.000',
    detail: 'Per user / bulan untuk tim kecil.',
    points: ['Dashboard sales', 'Leads + aktivitas', 'Kalender follow-up'],
  },
  {
    name: 'Growth',
    price: 'Rp249.000',
    detail: 'Per user / bulan untuk tim cabang aktif.',
    points: ['SPK dan dokumen', 'Analisis cabang', 'Goals dan monitoring'],
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    detail: 'Untuk multi-cabang dengan kebutuhan khusus.',
    points: ['Onboarding dedicated', 'Role dan approval custom', 'SLA prioritas'],
  },
];

const revealStyle = (delayMs: number): CSSProperties => ({
  opacity: 0,
  animation: 'reveal-up 0.7s ease forwards',
  animationDelay: `${delayMs}ms`,
});

export default function SobsTrackLanding() {
  const [theme, setThemeMode] = useState<ThemeMode>(() => resolveTheme());
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  useEffect(() => {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<{ theme: ThemeMode }>;
      if (customEvent.detail?.theme) {
        setThemeMode(customEvent.detail.theme);
      }
    };
    window.addEventListener('themechange', handler as EventListener);
    return () => window.removeEventListener('themechange', handler as EventListener);
  }, []);

  const toggleTheme = () => {
    const nextTheme: ThemeMode = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    setThemeMode(nextTheme);
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f3fbf6] text-emerald-950 dark:bg-[#07120e] dark:text-emerald-50">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-16 top-0 h-72 w-72 rounded-full bg-emerald-300/40 blur-3xl dark:bg-emerald-500/20" />
        <div className="absolute right-0 top-20 h-80 w-80 rounded-full bg-lime-200/50 blur-3xl dark:bg-lime-300/10" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-green-100/70 blur-3xl dark:bg-green-400/10" />
      </div>

      <header className="sticky top-0 z-20 border-b border-emerald-200/70 bg-[#f3fbf6]/90 backdrop-blur dark:border-emerald-800/60 dark:bg-[#07120e]/90">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-10">
          <a href="#" className="flex items-center gap-3">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-lime-300 text-white shadow-[0_10px_30px_rgba(16,185,129,0.28)]">
              <Bike size={18} strokeWidth={2.25} />
            </div>
            <div>
              <p className="font-display text-lg font-semibold">SobsTrack</p>
              <p className="text-xs uppercase tracking-[0.24em] text-emerald-700 dark:text-emerald-300">Sales OS</p>
            </div>
          </a>

          <nav className="hidden items-center gap-7 text-sm text-emerald-800 dark:text-emerald-100 md:flex">
            {navigation.map((item) => (
              <a key={item.href} href={item.href} className="transition hover:text-emerald-500">
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <button
              type="button"
              onClick={toggleTheme}
              className="rounded-full border border-emerald-300/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-emerald-800 transition hover:border-emerald-500 dark:border-emerald-700 dark:text-emerald-100"
            >
              {theme === 'dark' ? 'Light' : 'Dark'}
            </button>
            <Link
              to="/login"
              className="rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(16,185,129,0.35)] transition hover:-translate-y-0.5 hover:bg-emerald-600"
            >
              Masuk
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setIsMobileNavOpen((state) => !state)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-300/70 text-emerald-800 dark:border-emerald-700 dark:text-emerald-100 md:hidden"
            aria-label="Buka menu"
            aria-expanded={isMobileNavOpen}
          >
            {isMobileNavOpen ? 'X' : '||'}
          </button>
        </div>

        {isMobileNavOpen && (
          <div className="border-t border-emerald-200/70 bg-[#f3fbf6] px-4 py-4 dark:border-emerald-800 dark:bg-[#07120e] md:hidden">
            <div className="mx-auto grid max-w-7xl gap-2 text-sm text-emerald-800 dark:text-emerald-100">
              {navigation.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileNavOpen(false)}
                  className="rounded-xl px-3 py-2 hover:bg-emerald-100 dark:hover:bg-emerald-900/40"
                >
                  {item.label}
                </a>
              ))}
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="flex-1 rounded-xl border border-emerald-300/70 px-3 py-2 font-medium dark:border-emerald-700"
                >
                  {theme === 'dark' ? 'Mode Light' : 'Mode Dark'}
                </button>
                <Link
                  to="/login"
                  className="flex-1 rounded-xl bg-emerald-500 px-3 py-2 text-center font-semibold text-white"
                >
                  Login
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      <main>
        <section className="relative mx-auto grid w-full max-w-7xl gap-8 px-4 pb-16 pt-12 sm:px-6 lg:grid-cols-2 lg:gap-12 lg:px-10 lg:pt-20">
          <div style={revealStyle(50)} className="space-y-7">
            <span className="inline-flex items-center rounded-full border border-emerald-300/80 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:border-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">
              Homepage Client
            </span>
            <h1 className="font-display text-4xl leading-tight sm:text-5xl lg:text-6xl">
              Satu dashboard untuk jaga <span className="text-emerald-500">pipeline sales</span> tetap hidup.
            </h1>
            <p className="max-w-xl text-base text-emerald-800 dark:text-emerald-200 sm:text-lg">
              SobsTrack membantu dealer memantau lead, aktivitas, dan closing secara real-time.
              Tim lebih rapi, supervisor lebih cepat mengambil keputusan.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="#fitur"
                className="rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(16,185,129,0.35)] transition hover:-translate-y-0.5 hover:bg-emerald-600"
              >
                Lihat Fitur
              </a>
              <a
                href="#harga"
                className="rounded-full border border-emerald-300/80 px-5 py-3 text-sm font-semibold text-emerald-800 transition hover:border-emerald-500 dark:border-emerald-700 dark:text-emerald-100"
              >
                Cek Harga
              </a>
            </div>
            <div className="grid max-w-lg grid-cols-3 gap-3 text-sm">
              <div className="rounded-2xl border border-emerald-200/80 bg-white/70 p-4 dark:border-emerald-800 dark:bg-emerald-950/40">
                <p className="text-2xl font-semibold text-emerald-600">+35%</p>
                <p className="mt-1 text-emerald-700 dark:text-emerald-200">Follow-up lebih cepat</p>
              </div>
              <div className="rounded-2xl border border-emerald-200/80 bg-white/70 p-4 dark:border-emerald-800 dark:bg-emerald-950/40">
                <p className="text-2xl font-semibold text-emerald-600">4x</p>
                <p className="mt-1 text-emerald-700 dark:text-emerald-200">Visibilitas tim</p>
              </div>
              <div className="rounded-2xl border border-emerald-200/80 bg-white/70 p-4 dark:border-emerald-800 dark:bg-emerald-950/40">
                <p className="text-2xl font-semibold text-emerald-600">24/7</p>
                <p className="mt-1 text-emerald-700 dark:text-emerald-200">Akses data cabang</p>
              </div>
            </div>
          </div>

          <div style={revealStyle(170)} className="rounded-[28px] border border-emerald-200/80 bg-white/80 p-4 shadow-[0_24px_65px_rgba(16,185,129,0.2)] dark:border-emerald-800 dark:bg-emerald-950/55">
            <div className="overflow-hidden rounded-2xl border border-emerald-100 dark:border-emerald-800">
              <img src={salesImage} alt="Tim sales" className="h-56 w-full object-cover sm:h-72" loading="lazy" />
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {['Lead Aktif', 'Follow-up Hari Ini', 'SPK Mingguan', 'Sales On Duty'].map((label, index) => (
                <div key={label} className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-4 dark:border-emerald-800 dark:bg-emerald-900/30">
                  <p className="text-xs uppercase tracking-[0.14em] text-emerald-700 dark:text-emerald-200">{label}</p>
                  <p className="mt-2 text-2xl font-semibold text-emerald-800 dark:text-emerald-50">{45 + index * 6}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="fitur" className="mx-auto w-full max-w-7xl space-y-8 px-4 py-16 sm:px-6 lg:px-10">
          <div className="max-w-3xl space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">Fitur Utama</p>
            <h2 className="font-display text-3xl sm:text-4xl">Didesain untuk kebutuhan operasional dealer.</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {featureCards.map((card, index) => (
              <article
                key={card.title}
                style={revealStyle(60 + index * 70)}
                className="rounded-2xl border border-emerald-200/80 bg-white/80 p-6 shadow-[0_14px_32px_rgba(16,185,129,0.12)] dark:border-emerald-800 dark:bg-emerald-950/45"
              >
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400/40 to-lime-200/70 text-emerald-700 dark:from-emerald-400/30 dark:to-lime-400/20 dark:text-emerald-100">
                  <card.icon size={20} strokeWidth={2.2} />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{card.title}</h3>
                <p className="mt-2 text-sm text-emerald-800 dark:text-emerald-200">{card.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="alur" className="mx-auto w-full max-w-7xl space-y-8 px-4 py-16 sm:px-6 lg:px-10">
          <div className="max-w-3xl space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">Alur Penggunaan</p>
            <h2 className="font-display text-3xl sm:text-4xl">Workflow yang mudah dipahami tim lapangan.</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {processSteps.map((step, index) => (
              <article
                key={step.title}
                style={revealStyle(70 + index * 90)}
                className="rounded-2xl border border-emerald-200/80 bg-white/80 p-6 dark:border-emerald-800 dark:bg-emerald-950/45"
              >
                <h3 className="text-lg font-semibold">{step.title}</h3>
                <p className="mt-3 text-sm text-emerald-800 dark:text-emerald-200">{step.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="harga" className="mx-auto w-full max-w-7xl space-y-8 px-4 py-16 sm:px-6 lg:px-10">
          <div className="max-w-3xl space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">Harga</p>
            <h2 className="font-display text-3xl sm:text-4xl">Pilih paket sesuai skala tim Anda.</h2>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {pricingTiers.map((tier, index) => (
              <article
                key={tier.name}
                style={revealStyle(80 + index * 90)}
                className={`rounded-2xl border p-6 ${
                  tier.highlighted
                    ? 'border-emerald-400 bg-emerald-50 shadow-[0_24px_50px_rgba(16,185,129,0.22)] dark:border-emerald-500 dark:bg-emerald-900/45'
                    : 'border-emerald-200/80 bg-white/80 dark:border-emerald-800 dark:bg-emerald-950/45'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{tier.name}</h3>
                  {tier.highlighted ? (
                    <span className="rounded-full bg-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-600/40 dark:text-emerald-100">
                      Popular
                    </span>
                  ) : null}
                </div>
                <p className="mt-4 text-3xl font-semibold">{tier.price}</p>
                <p className="mt-2 text-sm text-emerald-800 dark:text-emerald-200">{tier.detail}</p>
                <ul className="mt-5 space-y-2 text-sm text-emerald-800 dark:text-emerald-100">
                  {tier.points.map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      {item}
                    </li>
                  ))}
                </ul>
                <button className="mt-6 w-full rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600">
                  Pilih Paket
                </button>
              </article>
            ))}
          </div>
        </section>

        <section id="kontak" className="mx-auto w-full max-w-7xl px-4 pb-20 pt-8 sm:px-6 lg:px-10">
          <div
            style={revealStyle(120)}
            className="grid gap-6 rounded-3xl border border-emerald-300/70 bg-gradient-to-br from-emerald-100 via-white to-lime-100 p-6 dark:border-emerald-700 dark:from-emerald-900/60 dark:via-emerald-950 dark:to-lime-900/20 md:grid-cols-[1.4fr,0.6fr] md:items-center"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-200">Siap Presentasi ke Client</p>
              <h2 className="mt-3 font-display text-3xl">Tampilkan homepage ini sebagai wajah produk Anda.</h2>
              <p className="mt-3 text-emerald-800 dark:text-emerald-200">
                Cocok untuk kebutuhan demo awal, landing campaign, atau pintu masuk client sebelum login.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 md:justify-end">
              <Link
                to="/login"
                className="rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600"
              >
                Masuk Dashboard
              </Link>
              <a
                href="#fitur"
                className="rounded-xl border border-emerald-300/80 px-5 py-3 text-sm font-semibold text-emerald-800 dark:border-emerald-700 dark:text-emerald-100"
              >
                Lihat Detail
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
