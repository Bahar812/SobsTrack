import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import salesImage from '../assets/salesimage.jpeg';
import { resolveTheme, setTheme, type ThemeMode } from '../utils/theme';

const storyPoints = [
  {
    title: 'Banyak lead tercecer',
    detail: 'Catatan tersebar di chat pribadi, follow-up terlambat, dan peluang hilang sebelum closing.',
  },
  {
    title: 'Aktivitas sulit dipantau',
    detail: 'Supervisor tidak punya gambaran real time tentang progres tiap sales.',
  },
  {
    title: 'Laporan manual melelahkan',
    detail: 'Data dikumpulkan dari banyak sumber sehingga rapat mingguan terasa lambat.',
  },
];

const solutionSteps = [
  {
    title: 'Kumpulkan semua lead',
    detail: 'Masukkan lead sekali, lanjutkan perjalanan sampai SPK tanpa kehilangan konteks.',
  },
  {
    title: 'Gerakkan aktivitas harian',
    detail: 'Checklist aktivitas, jadwal follow-up, dan reminder otomatis menjaga ritme penjualan.',
  },
  {
    title: 'Baca performa instan',
    detail: 'Dashboard analitik menampilkan insight target, pipeline, dan produktivitas.',
  },
];

const features = [
  { title: 'Sales Dashboard', detail: 'Ringkas performa tim dan status pipeline harian.' },
  { title: 'Absensi', detail: 'Pantau kehadiran dan kesiapan sales setiap hari.' },
  { title: 'Aktivitas', detail: 'Catat kunjungan, follow-up, dan progress prospek.' },
  { title: 'Leads', detail: 'Kelola prospek dari masuk hingga siap closing.' },
  { title: 'Kalender', detail: 'Jadwalkan follow-up, test drive, dan agenda tim.' },
  { title: 'SPK', detail: 'Dokumentasikan kesepakatan dan status closing.' },
  { title: 'Dokumen', detail: 'Simpan file pendukung dalam satu tempat aman.' },
  { title: 'Analisis', detail: 'Lihat tren penjualan dan performa cabang.' },
  { title: 'Goals', detail: 'Tetapkan target dan pantau realisasi secara jelas.' },
  { title: 'Cabang', detail: 'Atur performa per cabang untuk kontrol yang rapi.' },
  { title: 'Users', detail: 'Kelola role admin, leader, dan sales dengan aman.' },
  { title: 'Units', detail: 'Data produk siap dipakai untuk pipeline dan SPK.' },
  { title: 'Izin', detail: 'Workflow izin sales tanpa harus chat manual.' },
  { title: 'Operasional', detail: 'Tugas lapangan tercatat dan mudah ditinjau.' },
];

const reasons = [
  {
    title: 'Dibangun khusus sales',
    detail: 'Setiap layar fokus ke closing, bukan sekadar CRM generik.',
  },
  {
    title: 'Cepat terlihat dampaknya',
    detail: 'Workflow harian lebih rapi sejak minggu pertama penggunaan.',
  },
  {
    title: 'Insight yang bisa ditindak',
    detail: 'Analitik dibaca sekali, langsung tahu langkah berikutnya.',
  },
  {
    title: 'Siap berkembang',
    detail: 'Struktur cabang, users, dan goals memudahkan scale tim.',
  },
];

const tiers = [
  {
    name: 'Starter',
    price: 'Rp149k',
    detail: 'Per user/bulan, cocok untuk tim kecil yang baru menata proses.',
    perks: ['Dashboard sales', 'Leads + Aktivitas', 'Kalender follow-up'],
  },
  {
    name: 'Growth',
    price: 'Rp249k',
    detail: 'Per user/bulan, untuk tim yang mengejar target agresif.',
    perks: ['SPK & Dokumen', 'Analisis performa', 'Goals & Cabang'],
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    detail: 'Untuk organisasi besar dengan kebutuhan integrasi.',
    perks: ['Role & approval khusus', 'Pendampingan onboarding', 'SLA prioritas'],
  },
];

export default function SobsTrackLanding() {
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setThemeMode] = useState<ThemeMode>(() => resolveTheme());
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1400);
    return () => clearTimeout(timer);
  }, []);

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

  useEffect(() => {
    if (isLoading) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    const timeline = gsap.timeline();
    timeline.from('.hero-animate', {
      opacity: 0,
      y: 24,
      duration: 0.8,
      stagger: 0.12,
      ease: 'power2.out',
    });
    return () => {
      timeline.kill();
    };
  }, [isLoading]);

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const rx = ((y / rect.height) - 0.5) * -6;
    const ry = ((x / rect.width) - 0.5) * 8;
    heroRef.current.style.setProperty('--mouse-x', `${x}px`);
    heroRef.current.style.setProperty('--mouse-y', `${y}px`);
    heroRef.current.style.setProperty('--rx', `${rx}deg`);
    heroRef.current.style.setProperty('--ry', `${ry}deg`);
  };

  const handleMouseLeave = () => {
    if (!heroRef.current) return;
    heroRef.current.style.setProperty('--mouse-x', `50%`);
    heroRef.current.style.setProperty('--mouse-y', `50%`);
    heroRef.current.style.setProperty('--rx', `0deg`);
    heroRef.current.style.setProperty('--ry', `0deg`);
  };

  const toggleTheme = () => {
    const nextTheme: ThemeMode = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    setThemeMode(nextTheme);
  };

  return (
    <div className={`sobs-track min-h-screen bg-white text-emerald-950 ${theme === 'dark' ? 'is-dark' : 'is-light'}`}>
      {isLoading && (
        <div className="sobs-track-loader">
          <div className="loader-core">
            <span className="loader-dot" />
            <span className="loader-dot delay-150" />
            <span className="loader-dot delay-300" />
          </div>
          <p className="text-sm uppercase tracking-[0.4em] text-emerald-700/80">SobsTrack</p>
        </div>
      )}

      <div className="relative overflow-hidden">
        <div className="sobs-track-ambient" />
        <header className="relative z-10 flex items-center justify-between px-6 pb-6 pt-8 md:px-12">
          <div className="flex items-center gap-3 hero-animate">
            <div className="h-10 w-10 rounded-2xl bg-emerald-200/70 shadow-[0_0_24px_rgba(16,185,129,0.25)]">
              <div className="h-full w-full rounded-2xl border border-emerald-300/60 bg-gradient-to-br from-white via-emerald-100 to-emerald-200/60" />
            </div>
            <div>
              <p className="font-display text-lg font-semibold tracking-wide">SobsTrack</p>
              <p className="text-xs uppercase tracking-[0.3em] text-emerald-700/70">SaaS Sales</p>
            </div>
          </div>
          <nav className="hidden items-center gap-8 text-sm text-emerald-700 md:flex">
            <a className="transition hover:text-emerald-900" href="#story">
              Story
            </a>
            <a className="transition hover:text-emerald-900" href="#fitur">
              Fitur
            </a>
            <a className="transition hover:text-emerald-900" href="#alasan">
              Kenapa Kami
            </a>
            <a className="transition hover:text-emerald-900" href="#harga">
              Harga
            </a>
          </nav>
          <div className="flex items-center gap-3 hero-animate">
            <Link
              to="/login"
              className="hidden rounded-full border border-emerald-300/70 px-5 py-2 text-sm text-emerald-800 transition hover:border-emerald-500 hover:text-emerald-900 md:inline-flex"
            >
              Login
            </Link>
            <button
              type="button"
              onClick={toggleTheme}
              className="theme-toggle inline-flex"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? 'Light' : 'Dark'}
            </button>
            <a
              href="#harga"
              className="rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(16,185,129,0.35)] transition hover:-translate-y-0.5 hover:bg-emerald-600"
            >
              Coba Demo
            </a>
          </div>
        </header>

        <section className="relative z-10 grid items-center gap-12 px-6 pb-20 pt-6 md:grid-cols-2 md:px-12">
          <div className="space-y-6 hero-animate">
            <p className="section-label">SobsTrack - Sobat Sales Capai Target</p>
            <h1 className="font-display text-4xl font-semibold leading-tight text-emerald-950 md:text-6xl">
              Cerita dari <span className="text-emerald-600">target</span> yang macet menjadi
              <span className="text-emerald-800"> closing</span> yang konsisten.
            </h1>
            <p className="text-lg text-emerald-700">
              SobsTrack menyatukan lead, aktivitas, dan insight harian dalam satu alur yang ringan.
              Dari masalah follow-up sampai laporan, semuanya tertata dengan visual yang jelas.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <a
                href="#fitur"
                className="glow-button group inline-flex items-center gap-3 rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-white"
              >
                Lihat Fitur
                <span className="transition group-hover:translate-x-1">-&gt;</span>
              </a>
              <a
                href="#story"
                className="inline-flex items-center gap-2 rounded-full border border-emerald-300/70 px-6 py-3 text-sm text-emerald-800 transition hover:border-emerald-500 hover:text-emerald-900"
              >
                Baca Story
              </a>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-emerald-700">
              <div>
                <p className="text-xl font-semibold text-emerald-800">35%</p>
                <p>lebih cepat follow-up</p>
              </div>
              <div>
                <p className="text-xl font-semibold text-emerald-800">4x</p>
                <p>visibilitas pipeline</p>
              </div>
              <div>
                <p className="text-xl font-semibold text-emerald-800">24/7</p>
                <p>pantauan real time</p>
              </div>
            </div>
          </div>

          <div
            ref={heroRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="relative hero-animate"
          >
            <div className="cursor-orb" />
            <div className="hero-tilt rounded-3xl border border-emerald-200/70 bg-white/90 p-4 shadow-[0_25px_60px_rgba(16,185,129,0.18)]">
              <div className="robot-stage">
                <img className="robot-image" src={salesImage} alt="Sales team" loading="lazy" />
              </div>
            </div>
          </div>
        </section>

        <div className="relative z-10 px-6 pb-6 md:px-12">
          <div className="grid gap-8 md:grid-cols-[minmax(0,1fr),minmax(0,1fr)]">
            <div className="hero-tilt sales-card rounded-3xl border border-emerald-200/70 bg-white/90 p-6 shadow-[0_25px_60px_rgba(16,185,129,0.18)]">
              <div className="flex items-center justify-between sales-card__header">
                <p className="text-sm font-semibold text-emerald-800">Sales Flow Live</p>
                <span className="rounded-full border border-emerald-200 px-3 py-1 text-xs text-emerald-700">
                  Hari ini
                </span>
              </div>
              <div className="mt-6 space-y-4">
                <div className="sales-card__pipeline rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-100/60 to-transparent p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-emerald-600">Pipeline</p>
                  <div className="mt-2 flex items-end justify-between">
                    <p className="text-2xl font-semibold text-emerald-900">128 Lead</p>
                    <p className="text-xs text-emerald-600">+12%</p>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {['Follow-up', 'Test Drive', 'SPK', 'Closing'].map((item) => (
                    <div
                      key={item}
                      className="sales-card__item rounded-2xl border border-emerald-200 bg-white/80 p-4 transition hover:-translate-y-1 hover:border-emerald-400"
                    >
                      <p className="text-sm font-medium text-emerald-900">{item}</p>
                      <p className="mt-3 text-2xl font-semibold text-emerald-700">24</p>
                      <p className="text-xs text-emerald-600">terjadwal</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="sales-card__target mt-6 rounded-2xl border border-emerald-200 bg-white/90 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-emerald-600">Target Mingguan</p>
                <div className="mt-3 h-3 w-full rounded-full bg-emerald-100">
                  <div className="h-full w-[68%] rounded-full bg-emerald-500 shadow-[0_0_18px_rgba(16,185,129,0.35)]" />
                </div>
                <p className="mt-2 text-xs text-emerald-600">68% menuju target</p>
              </div>
            </div>
            <div className="space-y-4 self-center">
              <p className="section-label">Sales Flow Live</p>
              <h3 className="font-display text-2xl font-semibold text-emerald-950 md:text-3xl">
                Semua aktivitas sales terlihat rapi di satu panel.
              </h3>
              <p className="text-emerald-700">
                Dari pipeline hingga target mingguan, supervisor langsung tahu apa yang sudah berjalan dan
                apa yang perlu didorong. Tidak ada lagi follow-up terlambat atau laporan yang menghambat.
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  { label: 'Pipeline jelas', value: 'Status lead selalu terpantau.' },
                  { label: 'Aktivitas terjadwal', value: 'Follow-up dan test drive tertata.' },
                  { label: 'Target real time', value: 'Progress weekly mudah dibaca.' },
                  { label: 'Tindakan cepat', value: 'Insight langsung jadi aksi.' },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-emerald-200/60 bg-white/70 p-4">
                    <p className="text-sm font-semibold text-emerald-900">{item.label}</p>
                    <p className="mt-2 text-xs text-emerald-600">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <section id="story" className="relative z-10 space-y-12 px-6 py-20 md:px-12">
        <div className="max-w-3xl space-y-4">
          <p className="section-label">Story</p>
          <h2 className="font-display text-3xl font-semibold text-emerald-950 md:text-4xl">
            Dari masalah harian ke solusi yang nyata.
          </h2>
          <p className="text-emerald-700">
            Kami membangun SobsTrack untuk menyelesaikan kebiasaan manual yang membuat tim sales
            kehilangan momentum.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {storyPoints.map((point, index) => (
            <div key={point.title} className="reveal-card" style={{ animationDelay: `${index * 120}ms` }}>
              <h3 className="text-lg font-semibold text-emerald-900">{point.title}</h3>
              <p className="mt-3 text-sm text-emerald-700">{point.detail}</p>
            </div>
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {solutionSteps.map((step, index) => (
            <div
              key={step.title}
              className="reveal-card is-highlight"
              style={{ animationDelay: `${index * 120}ms` }}
            >
              <h3 className="text-lg font-semibold text-emerald-900">{step.title}</h3>
              <p className="mt-3 text-sm text-emerald-700">{step.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="fitur" className="relative z-10 space-y-12 px-6 py-20 md:px-12">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-3xl space-y-4">
            <p className="section-label">Fitur SobsTrack</p>
            <h2 className="font-display text-3xl font-semibold text-emerald-950 md:text-4xl">
              Setiap fitur dibuat untuk menggerakkan pipeline.
            </h2>
            <p className="text-emerald-700">
              Semua modul yang sudah tersedia di produk ini kami tampilkan agar client melihat
              kekuatan penuh SobsTrack.
            </p>
          </div>
          <a
            href="#harga"
            className="group inline-flex items-center gap-2 rounded-full border border-emerald-300/70 px-5 py-2 text-sm text-emerald-800 transition hover:border-emerald-500 hover:text-emerald-900"
          >
            Lihat Paket
            <span className="transition group-hover:translate-x-1">-&gt;</span>
          </a>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <article key={feature.title} className="feature-card" style={{ animationDelay: `${index * 60}ms` }}>
              <div className="icon-chip" />
              <h3 className="mt-4 text-lg font-semibold text-emerald-900">{feature.title}</h3>
              <p className="mt-2 text-sm text-emerald-700">{feature.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="alasan" className="relative z-10 space-y-12 px-6 py-20 md:px-12">
        <div className="grid gap-10 md:grid-cols-[1.1fr,0.9fr]">
          <div className="space-y-4">
            <p className="section-label">Kenapa Memilih Kami</p>
            <h2 className="font-display text-3xl font-semibold text-emerald-950 md:text-4xl">
              Karena tim sales butuh alat yang tidak memperlambat.
            </h2>
            <p className="text-emerald-700">
              SobsTrack fokus ke inti proses penjualan: visibilitas, kecepatan, dan eksekusi.
            </p>
          </div>
          <div className="results-card rounded-3xl border border-emerald-200 bg-white/90 p-6">
            <p className="text-sm uppercase tracking-[0.3em] text-emerald-600">Hasil Nyata</p>
            <div className="mt-4 grid gap-4">
              <div className="results-card__item rounded-2xl border border-emerald-200 bg-white p-4">
                <p className="text-2xl font-semibold text-emerald-900">+28%</p>
                <p className="text-xs text-emerald-600">Kenaikan closing rate rata-rata</p>
              </div>
              <div className="results-card__item rounded-2xl border border-emerald-200 bg-white p-4">
                <p className="text-2xl font-semibold text-emerald-900">3 jam</p>
                <p className="text-xs text-emerald-600">Laporan mingguan lebih cepat</p>
              </div>
            </div>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {reasons.map((reason, index) => (
            <div key={reason.title} className="reveal-card" style={{ animationDelay: `${index * 120}ms` }}>
              <h3 className="text-base font-semibold text-emerald-900">{reason.title}</h3>
              <p className="mt-3 text-sm text-emerald-700">{reason.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="harga" className="relative z-10 space-y-12 px-6 py-20 md:px-12">
        <div className="max-w-3xl space-y-4">
          <p className="section-label">Paket Subscription</p>
          <h2 className="font-display text-3xl font-semibold text-emerald-950 md:text-4xl">
            Pilih paket yang paling pas untuk tim Anda.
          </h2>
          <p className="text-emerald-700">
            Fleksibel berdasarkan jumlah user dan kebutuhan cabang. Semua paket dapat di-upgrade
            kapan saja.
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`pricing-card ${tier.highlight ? 'highlight' : ''}`}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-emerald-900">{tier.name}</h3>
                {tier.highlight ? (
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs text-emerald-700">
                    Paling populer
                  </span>
                ) : null}
              </div>
              <p className="mt-4 text-3xl font-semibold text-emerald-950">{tier.price}</p>
              <p className="mt-2 text-sm text-emerald-700">{tier.detail}</p>
              <ul className="mt-6 space-y-3 text-sm text-emerald-700">
                {tier.perks.map((perk) => (
                  <li key={perk} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    {perk}
                  </li>
                ))}
              </ul>
              <button className="mt-6 w-full rounded-full border border-emerald-300/70 px-4 py-2 text-sm text-emerald-800 transition hover:border-emerald-500 hover:text-emerald-900">
                Mulai Paket
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="relative z-10 px-6 pb-24 md:px-12">
        <div className="cta-panel">
          <div className="space-y-4">
            <p className="section-label">Siap Bergerak</p>
            <h2 className="font-display text-3xl font-semibold text-emerald-950 md:text-4xl">
              Jadikan SobsTrack partner harian tim sales Anda.
            </h2>
            <p className="text-emerald-700">
              Buktikan sendiri bagaimana alur kerja yang rapi meningkatkan konsistensi closing.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <a
              href="#harga"
              className="rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-emerald-600"
            >
              Jadwalkan Demo
            </a>
            <Link
              to="/login"
              className="rounded-full border border-emerald-300/70 px-6 py-3 text-sm text-emerald-800 transition hover:border-emerald-500 hover:text-emerald-900"
            >
              Masuk Dashboard
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
