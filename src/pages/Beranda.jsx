import { useState, useEffect } from 'react';
import { classInfo as defaultClassInfo, galeri as defaultGaleri, defaultStruktur, initialProdi } from '../data/dummy';
import logoFtia from '../assets/logoftia.jpeg';
import { safeGet, safeSet } from '../utils/storage';

function getTimeGreeting() {
  const hour = new Date().getHours();
  if (hour >= 4 && hour < 11) return 'Selamat pagi';
  if (hour >= 11 && hour < 15) return 'Selamat siang';
  if (hour >= 15 && hour < 18) return 'Selamat sore';
  return 'Selamat malam';
}

function AnimatedCounter({ value, duration = 1200 }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const target = Math.max(0, Number(value) || 0);
    const start = performance.now();
    let frameId;
    const animate = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(target * eased));
      if (progress < 1) frameId = requestAnimationFrame(animate);
    };
    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [value, duration]);

  return <>{displayValue.toLocaleString('id-ID')}</>;
}

function CountdownCard({ tugas }) {
  const [timeLeft, setTimeLeft] = useState({});
  useEffect(() => {
    const update = () => {
      const value = String(tugas.deadline || '');
      const deadline = new Date(value + (value.includes('T') ? '' : 'T23:59:59'));
      const timestamp = deadline.getTime();
      if (!Number.isFinite(timestamp)) return setTimeLeft({ invalid: true });
      const diff = timestamp - Date.now();
      if (diff <= 0) return setTimeLeft({ expired: true });
      const totalMinutes = Math.floor(diff / 60000);
      setTimeLeft({
        hari: Math.floor(totalMinutes / 1440),
        jam: Math.floor((totalMinutes % 1440) / 60),
        menit: totalMinutes % 60,
      });
    };
    update();
    const timer = setInterval(update, 60000);
    return () => clearInterval(timer);
  }, [tugas.deadline]);

  const isUrgent = !timeLeft.invalid && !timeLeft.expired && timeLeft.hari <= 1;

  return (
    <div className={`rounded-2xl p-3.5 border transition-all ${
      isUrgent
        ? 'border-rose-500/30 bg-rose-500/10'
        : 'border-white/10 bg-[#18181D]'
    }`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0 flex-1">
          <span className="text-[10px] font-bold text-[#9E9EA9] uppercase tracking-wider">{tugas.mapel}</span>
          <p className="font-bold text-sm text-white truncate mt-0.5">{tugas.judul}</p>
          <span className="mt-1 inline-block rounded-full bg-white/10 px-2 py-0.5 text-[9px] font-semibold text-white/80">
            {tugas.prodi || 'Semua Prodi'}
          </span>
        </div>
        <span className={`text-[11px] font-bold shrink-0 ${isUrgent ? 'text-rose-400' : 'text-amber-400'}`}>
          {tugas.diffDays === 0 ? 'Hari ini!' : tugas.diffDays === 1 ? 'Besok!' : `${tugas.diffDays} hari lagi`}
          {isUrgent ? ' 🚨' : ''}
        </span>
      </div>

      {timeLeft.invalid ? (
        <p className="text-rose-400 text-xs font-bold">Format deadline tidak valid</p>
      ) : timeLeft.expired ? (
        <p className="text-rose-400 text-xs font-bold">Deadline terlewat</p>
      ) : (
        <div className="flex gap-2 mt-2">
          {[
            ['Hari', timeLeft.hari],
            ['Jam', timeLeft.jam],
            ['Menit', timeLeft.menit],
          ].map(([label, val]) => (
            <div key={label} className="flex-1 text-center rounded-xl py-1.5 bg-black/30 border border-white/5">
              <p className="text-base font-black text-white">{val}</p>
              <p className="text-[9px] text-[#9E9EA9] font-medium">{label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AnnouncementItem({ activity }) {
  const isTask = activity.activityType === 'tugas';
  const deadlineValue = String(activity.deadline || '');
  const deadline = new Date(deadlineValue + (deadlineValue.includes('T') ? '' : 'T00:00:00'));
  const activityText = isTask
    ? `📝 Tugas Baru: ${activity.judul} (${activity.mapel}) — Deadline ${Number.isFinite(deadline.getTime()) ? deadline.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : 'tidak tersedia'}`
    : `💌 Menfest Baru dari ${activity.sender || 'Anonim'} untuk ${activity.to_who || 'Semua Orang'}`;

  return (
    <div className={`p-3.5 rounded-2xl border transition-all hover:bg-white/[0.04] ${
      isTask ? 'border-indigo-500/30 bg-[#16161D]' : 'border-pink-500/30 bg-[#19151C]'
    }`}>
      <div className="flex items-start gap-3">
        <span className="text-lg shrink-0 mt-0.5">{isTask ? '📝' : '💌'}</span>
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-xs sm:text-sm text-white leading-snug">{activityText}</h3>
          <p className="text-[10px] text-[#6E6E77] mt-1.5 font-medium">
            🗓️ {new Date(activity.activityTimestamp).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>
    </div>
  );
}

function BirthdayWidget({ siswaList = [] }) {
  const now = new Date();
  const thisMonth = now.getMonth() + 1;
  const todayStr = `${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const birthdays = siswaList.filter((s) => {
    if (!s.birthday) return false;
    const [, month] = s.birthday.split('-');
    return parseInt(month) === thisMonth;
  }).sort((a, b) => {
    const da = a.birthday.slice(5);
    const db = b.birthday.slice(5);
    return da.localeCompare(db);
  });

  return (
    <div className="space-y-2">
      {birthdays.length === 0 ? (
        <p className="text-[#6E6E77] text-xs py-4 text-center">Tidak ada ulang tahun di bulan ini 🎉</p>
      ) : (
        birthdays.map((s) => {
          const mmdd = s.birthday.slice(5);
          const isToday = mmdd === todayStr;
          return (
            <div
              key={s.id}
              className={`flex items-center gap-3 p-2.5 rounded-2xl border transition-all ${
                isToday
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-200'
                  : 'bg-[#18181D] border-white/5 hover:border-white/15'
              }`}
            >
              <img
                src={s.photo}
                alt={s.name}
                className="w-10 h-10 rounded-xl object-cover bg-[#1E1E26] shrink-0"
                width={40}
                height={40}
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">{s.name}</p>
                <p className="text-[10px] text-[#9E9EA9] truncate">{s.prodi}</p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[10px] font-semibold text-[#9E9EA9]">
                  {new Date(s.birthday).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                </span>
                {isToday && <span className="ml-1 text-sm animate-bounce inline-block">🎂</span>}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

export default function Beranda({
  setActivePage,
  setSelectedProdi,
  anggotaList = [],
  prodiList = initialProdi,
  classInfo = defaultClassInfo,
  tugasList = [],
  tugasLoading = false,
  menfestList = [],
}) {
  const [galeri, setGaleri] = useState(defaultGaleri);
  const [showPengumumanModal, setShowPengumumanModal] = useState(false);
  const [selectedStudentDetail, setSelectedStudentDetail] = useState(null);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sevenDaysAgoTime = sevenDaysAgo.getTime();
  const sourceTugas = Array.isArray(tugasList) ? tugasList : [];

  useEffect(() => {
    if (!showPengumumanModal) return undefined;
    const handleEscape = (event) => {
      if (event.key === 'Escape') setShowPengumumanModal(false);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [showPengumumanModal]);

  useEffect(() => {
    const loadGaleri = () => {
      const saved = safeGet('classhub_galeri_data');
      if (!Array.isArray(saved)) {
        safeSet('classhub_galeri_data', defaultGaleri);
        setGaleri(defaultGaleri);
        return;
      }
      setGaleri(saved);
    };

    loadGaleri();
    window.addEventListener('storage', loadGaleri);
    window.addEventListener('classhub:galeri-updated', loadGaleri);
    return () => {
      window.removeEventListener('storage', loadGaleri);
      window.removeEventListener('classhub:galeri-updated', loadGaleri);
    };
  }, []);

  const liveActivities = [
    ...sourceTugas
      .map((tugas) => ({
        ...tugas,
        activityType: 'tugas',
        activityTimestamp: new Date(tugas.created_at || tugas.createdAt).getTime(),
      }))
      .filter((tugas) => Number.isFinite(tugas.activityTimestamp) && tugas.activityTimestamp >= sevenDaysAgoTime),
    ...menfestList
      .map((menfest) => ({
        ...menfest,
        activityType: 'menfest',
        activityTimestamp: new Date(menfest.created_at).getTime(),
      }))
      .filter((menfest) => Number.isFinite(menfest.activityTimestamp) && menfest.activityTimestamp >= sevenDaysAgoTime),
  ].sort((a, b) => b.activityTimestamp - a.activityTimestamp);

  const activeTugas = sourceTugas.filter((t) => t.status !== 'Selesai' && t.status !== 'selesai');
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const urgentTasks = activeTugas
    .map((t) => {
      const value = String(t.deadline || '');
      const deadline = new Date(value + (value.includes('T') ? '' : 'T23:59:59'));
      const deadlineTime = deadline.getTime();
      if (!Number.isFinite(deadlineTime)) return null;
      const deadlineDateOnly = new Date(deadline);
      deadlineDateOnly.setHours(0, 0, 0, 0);
      const diffDays = Math.round((deadlineDateOnly.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return { ...t, deadlineTime, diffDays };
    })
    .filter((t) => t && t.diffDays >= 0 && t.diffDays <= 2)
    .sort((a, b) => a.deadlineTime - b.deadlineTime);

  const displayedUrgentTasks = urgentTasks.slice(0, 3);
  const remainingCount = urgentTasks.length - 3;

  const thisMonth = new Date().getMonth() + 1;
  const birthdayCount = anggotaList.filter((s) => {
    if (!s.birthday) return false;
    return parseInt(s.birthday.slice(5, 7)) === thisMonth;
  }).length;

  // Shuffle member randomly for music-app discovery feel
  const handleShuffleMember = () => {
    if (anggotaList.length === 0) return;
    const randomIdx = Math.floor(Math.random() * anggotaList.length);
    setSelectedStudentDetail(anggotaList[randomIdx]);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* 1. Header Sapaan & Identitas Kampus (Music App Aesthetic) */}
      <section className="space-y-1">
        <p className="text-xs sm:text-sm font-semibold tracking-wider uppercase text-[#9E9EA9]">
          UNIVERSITAS MITRA BANGSA • FTIA
        </p>
        <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
          {getTimeGreeting()}, Warga FTIA
        </h1>
        <p className="text-xs sm:text-sm text-[#9E9EA9] font-medium max-w-2xl">
          {classInfo.name} — {classInfo.motto}
        </p>
      </section>

      {/* 2. Top Highlight & Streak Banner (Gaya Kartu "Teh Hijau" & "1 Hari Berturut-turut Percikan") */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Kartu Kiri: Quick Identity Card */}
        <div className="card-amoled card-amoled-hover p-4 sm:p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-14 h-14 rounded-2xl overflow-hidden border border-white/15 shrink-0 bg-[#18181D] shadow-lg">
              <img
                src={logoFtia}
                alt="Logo FTIA"
                className="w-full h-full object-cover"
                width={56}
                height={56}
              />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                Pusat Informasi
              </span>
              <h2 className="text-sm sm:text-base font-bold text-white truncate">
                Fakultas Teknologi Informasi & Aktuaria
              </h2>
              <p className="text-xs text-[#9E9EA9] truncate">
                Tahun Akademik {classInfo.academicYear}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActivePage('prodi')}
            className="px-3.5 py-2 rounded-full text-xs font-bold bg-white text-black hover:bg-white/90 spring-press shrink-0 shadow-md"
          >
            Jelajahi
          </button>
        </div>

        {/* Kartu Kanan: Streak / Campus Pulse Card */}
        <div className="card-amoled card-amoled-hover p-4 sm:p-5 flex items-center justify-between gap-4 relative overflow-hidden">
          <div className="flex items-center gap-3.5">
            {/* Ambient flame glow behind icon */}
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FF7A00]/20 to-[#FF3D00]/20 border border-[#FF7A00]/30 flex items-center justify-center shrink-0 flame-glow">
              <span className="text-2xl relative z-10" aria-hidden="true">🔥</span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#FF7A00]">
                Status Kampus
              </span>
              <h3 className="text-sm sm:text-base font-bold text-white">
                Semester Ganjil Aktif
              </h3>
              <p className="text-xs text-[#9E9EA9]">
                Percikan Akademik • 3 Program Studi
              </p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Aktif
            </span>
          </div>
        </div>
      </section>

      {/* 3. Filter Chips Pintasan (Gaya Mood Chips Musik) */}
      <section className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        <button
          type="button"
          onClick={() => {
            setSelectedProdi?.('Semua');
            setActivePage('prodi');
          }}
          className="px-4 py-2 rounded-full text-xs font-semibold pill-inactive spring-press shrink-0 flex items-center gap-1.5"
        >
          <span>👥</span> Direktori Prodi & Anggota
        </button>
        <button
          type="button"
          onClick={() => setActivePage('jadwal')}
          className="px-4 py-2 rounded-full text-xs font-semibold pill-inactive spring-press shrink-0 flex items-center gap-1.5"
        >
          <span>📅</span> Cek Jadwal Kuliah
        </button>
        <button
          type="button"
          onClick={() => setActivePage('tugas')}
          className="px-4 py-2 rounded-full text-xs font-semibold pill-inactive spring-press shrink-0 flex items-center gap-1.5"
        >
          <span>📝</span> Daftar Tugas ({activeTugas.length})
        </button>
        <button
          type="button"
          onClick={() => setActivePage('menfest')}
          className="px-4 py-2 rounded-full text-xs font-semibold pill-inactive spring-press shrink-0 flex items-center gap-1.5"
        >
          <span>💌</span> Kirim Menfest
        </button>
        <button
          type="button"
          onClick={() => setActivePage('prodi')}
          className="px-4 py-2 rounded-full text-xs font-semibold pill-inactive spring-press shrink-0 flex items-center gap-1.5"
        >
          <span>🎂</span> Ulang Tahun Bulan Ini ({birthdayCount})
        </button>
      </section>

      {/* 4. Statistik Kelas (Gaya Grouped Music Cards / Top Playlists) */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {[
          {
            icon: '🎓',
            label: 'Total Mahasiswa',
            value: anggotaList.length,
            color: 'text-white',
            action: () => {
              setSelectedProdi?.('Semua');
              setActivePage('prodi');
            },
          },
          {
            icon: '🏛️',
            label: 'Program Studi',
            value: prodiList.length,
            color: 'text-white',
            action: () => {
              setSelectedProdi?.('Semua');
              setActivePage('prodi');
            },
          },
          {
            icon: '📝',
            label: 'Tugas Belum Selesai',
            value: activeTugas.length,
            color: 'text-[#F87171]',
            action: () => setActivePage('tugas'),
          },
          {
            icon: '🎂',
            label: 'Ulang Tahun Bulan Ini',
            value: birthdayCount,
            color: 'text-[#FBBF24]',
            action: () => setActivePage('prodi'),
          },
        ].map((stat) => (
          <button
            key={stat.label}
            type="button"
            onClick={stat.action}
            className="card-amoled card-amoled-hover p-4 text-left spring-press flex flex-col justify-between min-h-[108px] group"
          >
            <div className="flex items-center justify-between text-base">
              <span className="p-2 rounded-xl bg-white/5 border border-white/5 group-hover:scale-110 transition-transform">
                {stat.icon}
              </span>
              <span className="text-xs text-[#6E6E77] group-hover:text-white transition-colors">→</span>
            </div>
            <div>
              <div className={`text-2xl sm:text-3xl font-black ${stat.color} tracking-tight`}>
                <AnimatedCounter value={stat.value} />
              </div>
              <div className="text-[11px] font-semibold text-[#9E9EA9] mt-0.5 truncate">
                {stat.label}
              </div>
            </div>
          </button>
        ))}
      </section>

      {/* 5. Section "Pilihan Cepat: Anggota & Mahasiswa" (Gaya Daftar Lagu Quick Picks) */}
      <section className="card-amoled p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span>⚡</span> Pilihan Cepat: Mahasiswa FTIA
            </h2>
            <p className="text-xs text-[#9E9EA9]">
              Profil dan direktori teman sekelas per prodi
            </p>
          </div>
          <button
            type="button"
            onClick={handleShuffleMember}
            className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white/10 hover:bg-white/20 text-white flex items-center gap-1.5 transition-colors"
            title="Pilih profil anggota secara acak"
          >
            <span>🔀</span> Acak Profil
          </button>
        </div>

        {anggotaList.length === 0 ? (
          <p className="text-xs text-[#6E6E77] py-6 text-center">Belum ada anggota terdaftar.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {anggotaList.slice(0, 6).map((mhs) => (
              <div
                key={mhs.id || mhs.name}
                className="flex items-center justify-between p-2.5 rounded-2xl bg-[#18181D] hover:bg-[#1E1E26] border border-white/5 hover:border-white/15 transition-all group"
              >
                <button
                  type="button"
                  onClick={() => setSelectedStudentDetail(mhs)}
                  className="flex items-center gap-3 min-w-0 flex-1 text-left"
                >
                  <img
                    src={mhs.photo}
                    alt={mhs.name}
                    className="w-12 h-12 rounded-xl object-cover bg-[#141418] border border-white/10 shrink-0 group-hover:scale-105 transition-transform"
                    width={48}
                    height={48}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-white truncate leading-snug">
                      {mhs.name}
                    </p>
                    <p className="text-xs text-[#9E9EA9] truncate">
                      {mhs.prodi} • "{mhs.nickname || mhs.name.split(' ')[0]}"
                    </p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedStudentDetail(mhs)}
                  className="p-2 text-[#6E6E77] hover:text-white rounded-full hover:bg-white/10 text-base shrink-0"
                  title="Lihat detail quote & info"
                  aria-label="Detail Mahasiswa"
                >
                  ⋮
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={() => setActivePage('prodi')}
            className="text-xs font-bold text-white/80 hover:text-white underline underline-offset-4"
          >
            Lihat Semua {anggotaList.length} Mahasiswa di Direktori →
          </button>
        </div>
      </section>

      {/* 6. Papan Pengumuman & Deadline Terdekat */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom Kiri: Pengumuman Kampus (2 span) */}
        <div className="lg:col-span-2 card-amoled p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>📢</span> Papan Pengumuman Fakultas
            </h2>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white/10 text-white/90 border border-white/15">
              7 Hari Terakhir
            </span>
          </div>

          {liveActivities.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-[#6E6E77]">
              <span className="text-3xl block mb-2">☕</span>
              <p className="text-sm font-semibold">Belum ada pengumuman atau aktivitas baru dalam 7 hari terakhir.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {liveActivities.slice(0, 6).map((activity) => (
                <AnnouncementItem key={`${activity.activityType}-${activity.id}`} activity={activity} />
              ))}
              {liveActivities.length > 6 && (
                <button
                  type="button"
                  onClick={() => setShowPengumumanModal(true)}
                  className="w-full py-2.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-xs font-bold text-white transition-colors"
                >
                  Lihat Selengkapnya ({liveActivities.length} Pengumuman) →
                </button>
              )}
            </div>
          )}
        </div>

        {/* Kolom Kanan: Deadline Tugas & Ulang Tahun */}
        <div className="space-y-6">
          {/* Deadline Countdown */}
          <div className="card-amoled p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>⏰</span> Deadline Terdekat
              </h3>
              <button
                type="button"
                onClick={() => setActivePage('tugas')}
                className="text-xs text-[#9E9EA9] hover:text-white font-semibold"
              >
                Lihat Semua →
              </button>
            </div>

            {tugasLoading ? (
              <p className="text-xs text-[#6E6E77] py-4 text-center">Memuat deadline tugas...</p>
            ) : urgentTasks.length === 0 ? (
              <p className="text-xs text-[#6E6E77] py-4 text-center">Tidak ada deadline mendesak saat ini! 🎉</p>
            ) : (
              <div className="space-y-2.5">
                {displayedUrgentTasks.map((t) => <CountdownCard key={t.id} tugas={t} />)}
                {urgentTasks.length > 3 && (
                  <button
                    type="button"
                    onClick={() => setActivePage('tugas')}
                    className="w-full mt-2 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-[#9E9EA9] hover:text-white font-medium flex items-center justify-center gap-1 transition-colors"
                  >
                    Lihat {remainingCount} tugas mendesak lainnya →
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Birthday Widget */}
          <div className="card-amoled p-5 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>🎂</span> Ulang Tahun Bulan Ini
            </h3>
            <BirthdayWidget siswaList={anggotaList} />
          </div>
        </div>
      </section>

      {/* 7. Section "Struktur Pengurus FTIA" & "Album & Galeri Dokumentasi" */}
      <section className="card-amoled p-5 sm:p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span>🏛️</span> Struktur Pengurus & Pembimbing FTIA
            </h2>
            <p className="text-xs text-[#9E9EA9]">
              Dosen Wali, Ketua Angkatan, dan jajaran pengurus
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {defaultStruktur.map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-2xl bg-[#18181D] border border-white/5 text-center flex flex-col items-center justify-between group hover:border-white/20 transition-colors"
            >
              <img
                src={item.photo}
                alt={item.name}
                className="w-14 h-14 rounded-2xl object-cover bg-[#141418] border border-white/10 mb-2 group-hover:scale-105 transition-transform"
                width={56}
                height={56}
              />
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-white/90">
                {item.role}
              </span>
              <p className="text-xs font-bold text-white mt-1.5 leading-tight truncate w-full">
                {item.name}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 8. Arsip Foto Kelas & Google Drive Dokumentasi */}
      <section className="card-amoled p-6 sm:p-8 relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              ☁️ Folder Bersama Aktif
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              📸 Galeri Kenangan Kelas <span className="text-[#9E9EA9]">(Semester 1 — Lulus)</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#9E9EA9] leading-relaxed">
              Wadah penyimpanan bersama seluruh dokumentasi kegiatan, makrab, praktikum, dan momen kebersamaan kita dari awal masuk kuliah hingga wisuda nanti.
            </p>
          </div>
          <a
            href="https://drive.google.com/drive/folders/1OEuVn9rTkwkznpdgTegRijwDPI5wq-et?usp=drive_link"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-black shadow-lg spring-press hover:bg-white/90"
          >
            Buka Google Drive Dokumentasi <span aria-hidden="true">↗</span>
          </a>
        </div>
      </section>

      {/* 9. Galeri Foto Grid Kegiatan */}
      <section className="card-amoled p-5 sm:p-6 space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span>📸</span> Dokumentasi Kegiatan Terkini
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {galeri.slice(0, 6).map((g) => (
            <div key={g.id} className="group relative aspect-video overflow-hidden rounded-2xl bg-[#18181D] border border-white/5 shadow-md">
              <img
                src={g.url}
                alt={g.caption}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/85 via-black/20 to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
                <div>
                  <p className="text-xs font-bold text-white">{g.caption}</p>
                  {g.date && <p className="text-[10px] text-white/70">{g.date}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Modal Detail Mahasiswa (Lyrics / Profile Card Style) */}
      {selectedStudentDetail && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          onClick={() => setSelectedStudentDetail(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="card-amoled w-full max-w-sm p-6 relative border-white/20 shadow-2xl text-center space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedStudentDetail(null)}
              className="absolute top-4 right-4 text-[#9E9EA9] hover:text-white p-2 rounded-full hover:bg-white/10"
            >
              ✕
            </button>

            <div className="w-24 h-24 mx-auto rounded-2xl overflow-hidden border-2 border-white/20 bg-[#18181D] shadow-xl">
              <img
                src={selectedStudentDetail.photo}
                alt={selectedStudentDetail.name}
                className="w-full h-full object-cover"
                width={96}
                height={96}
              />
            </div>

            <div>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white/10 text-white border border-white/15">
                {selectedStudentDetail.prodi}
              </span>
              <h3 className="text-lg font-bold text-white mt-2 leading-tight">
                {selectedStudentDetail.name}
              </h3>
              <p className="text-xs text-[#9E9EA9]">
                "{selectedStudentDetail.nickname || selectedStudentDetail.name.split(' ')[0]}"
                {selectedStudentDetail.nim && ` • NIM: ${selectedStudentDetail.nim}`}
              </p>
            </div>

            {/* Lyrics style quote card */}
            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 text-left">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#9E9EA9] block mb-1">
                Quote & Motto
              </span>
              <p className="text-sm italic text-white/90 leading-relaxed">
                "{selectedStudentDetail.quote || 'Fokus pada proses, hasil akan mengikuti alurnya.'}"
              </p>
            </div>

            <div className="pt-2 flex justify-center">
              <button
                type="button"
                onClick={() => setSelectedStudentDetail(null)}
                className="px-6 py-2 rounded-full bg-white text-black text-xs font-bold spring-press"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Semua Pengumuman */}
      {showPengumumanModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setShowPengumumanModal(false)}
        >
          <div
            className="card-amoled w-full max-w-2xl p-6 border-white/20 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white">📢 Semua Pengumuman Fakultas</h3>
                <p className="text-xs text-[#9E9EA9]">Aktivitas tugas dan menfest 7 hari terakhir</p>
              </div>
              <button
                type="button"
                onClick={() => setShowPengumumanModal(false)}
                className="text-lg text-[#9E9EA9] hover:text-white p-2 rounded-full hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto space-y-2.5 pr-2">
              {liveActivities.map((activity) => (
                <AnnouncementItem key={`${activity.activityType}-${activity.id}`} activity={activity} />
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowPengumumanModal(false)}
                className="px-5 py-2 rounded-full bg-white text-black text-xs font-bold spring-press"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
