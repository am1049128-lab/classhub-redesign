import { useState, useEffect, useCallback } from 'react';
import { initialProdi } from '../data/dummy';
import { useTheme } from '../context/ThemeContext';
import { getJadwalList } from '../lib/supabase';

const HARI = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];

function isClassActiveNow(hari, jam) {
  const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const now = new Date();
  const currentDay = dayNames[now.getDay()];
  if (currentDay !== hari) return false;
  if (!jam || !jam.includes('-')) return false;
  const [start, end] = jam.split('-').map(s => s.trim());
  const [startH, startM] = (start || '').split(':').map(Number);
  const [endH, endM] = (end || '').split(':').map(Number);
  if (Number.isNaN(startH) || Number.isNaN(endH)) return false;
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const startMinutes = startH * 60 + (startM || 0);
  const endMinutes = endH * 60 + (endM || 0);
  return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
}

export default function Jadwal({ prodiList = initialProdi, jadwalList, onUpdateJadwal }) {
  const { isDark } = useTheme();
  const todayIdx = new Date().getDay();
  const hariToday = HARI[todayIdx - 1] || 'Senin';
  const [activeHari, setActiveHari] = useState(hariToday);
  const [filterProdi, setFilterProdi] = useState('Semua');
  const [jadwalFlat, setJadwalFlat] = useState(Array.isArray(jadwalList) && jadwalList.length > 0 ? jadwalList : []);
  const [loading, setLoading] = useState(false);
  const [isCloud, setIsCloud] = useState(false);

  const fetchJadwal = useCallback(async () => {
    setLoading(true);
    try {
      const { data, isSupabase } = await getJadwalList();
      if (Array.isArray(data)) {
        setJadwalFlat(data);
        onUpdateJadwal?.(data);
      }
      setIsCloud(isSupabase);
    } catch (err) {
      console.warn('Gagal fetch jadwal:', err);
    } finally {
      setLoading(false);
    }
  }, [onUpdateJadwal]);

  useEffect(() => {
    if (Array.isArray(jadwalList) && jadwalList.length > 0) {
      setJadwalFlat(jadwalList);
    } else {
      fetchJadwal();
    }
  }, [jadwalList, fetchJadwal]);

  const listJadwal = jadwalFlat.filter(item => (
    item.hari === activeHari && (filterProdi === 'Semua' || item.prodi === filterProdi || item.prodi === 'Semua')
  ));

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white">
              AKADEMIK & PERKULIAHAN
            </span>
            <span className="text-xs text-zinc-500">•</span>
            <span className="text-xs text-zinc-400 font-medium">Semester Ganjil 2026/2027</span>
            {isCloud && (
              <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                ☁️ Cloud
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            📅 Jadwal Kuliah
          </h1>
          <p className="mt-1 max-w-2xl text-xs sm:text-sm text-zinc-400">
            Jadwal perkuliahan mingguan per program studi, ruangan kelas, dan laboratorium Fakultas Teknologi Informasi dan Aktuaria.
          </p>
        </div>
      </div>

      {/* Filter Bar: Hari (Mood Chips) + Dropdown Prodi */}
      <div className="rounded-[22px] border border-white/[0.08] bg-[#141418] p-3.5 sm:p-4.5">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          {/* Day Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            {HARI.map(hari => {
              const isActive = activeHari === hari;
              const isToday = hari === hariToday;
              return (
                <button
                  key={hari}
                  type="button"
                  onClick={() => setActiveHari(hari)}
                  className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all duration-200 active:scale-95 ${
                    isActive
                      ? 'bg-white text-black shadow-md'
                      : 'bg-[#18181D] text-zinc-400 border border-white/5 hover:border-white/15 hover:text-white'
                  }`}
                >
                  <span>{hari}</span>
                  {isToday && (
                    <span
                      className={`h-2 w-2 rounded-full ${
                        isActive ? 'bg-emerald-600' : 'bg-emerald-400'
                      }`}
                      title="Hari Ini"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Prodi Filter Dropdown */}
          <div className="flex items-center gap-2 text-xs w-full lg:w-auto">
            <span className="text-zinc-400 font-semibold shrink-0">Filter Prodi:</span>
            <select
              value={filterProdi}
              onChange={e => setFilterProdi(e.target.value)}
              className="w-full lg:w-auto rounded-full border border-white/10 bg-[#18181D] px-4 py-2 text-xs text-white outline-none transition focus:border-white/30"
            >
              <option value="Semua">Semua Program Studi</option>
              {prodiList.map(p => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      {loading ? (
        <div className="rounded-[24px] border border-white/[0.08] bg-[#141418] py-16 text-center text-zinc-400 space-y-3">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
          <p className="text-xs font-semibold text-zinc-300">Memuat jadwal kuliah...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sesi Perkuliahan (Playlist Track Rows) */}
          <section className="lg:col-span-2 rounded-[24px] border border-white/[0.08] bg-[#141418] p-5 sm:p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-4">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <span>📚 Mata Kuliah Hari {activeHari}</span>
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Daftar sesi perkuliahan aktif untuk hari {activeHari}
                </p>
              </div>
              <span className="shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-zinc-300">
                {listJadwal.length} Sesi Perkuliahan
              </span>
            </div>

            {listJadwal.length === 0 ? (
              <div className="py-14 text-center text-zinc-400">
                <span className="text-4xl block mb-2">🏖️</span>
                <p className="font-bold text-white">Tidak ada jadwal kuliah</p>
                <p className="mt-1 text-xs text-zinc-500">
                  Tidak ada perkuliahan pada hari {activeHari} untuk kriteria ini.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {listJadwal.map(item => {
                  const isOngoing = isClassActiveNow(item.hari, item.jam);
                  return (
                    <article
                      key={item.id}
                      className={`group relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-[18px] border p-3.5 sm:p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${
                        isOngoing
                          ? 'border-emerald-500/40 bg-emerald-500/[0.04]'
                          : 'border-white/[0.06] bg-[#18181D] hover:border-white/15'
                      }`}
                    >
                      {/* Left: Room Box + Details */}
                      <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                        <div className="h-[52px] min-w-[76px] px-2.5 shrink-0 rounded-[14px] bg-[#1F1F27] border border-white/10 flex flex-col items-center justify-center text-center">
                          <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                            RUANG
                          </span>
                          <span className="text-xs font-extrabold text-white whitespace-nowrap">
                            {item.ruangan || 'LAB'}
                          </span>
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] font-semibold text-zinc-300">
                              {item.prodi || 'Semua Prodi'}
                            </span>
                            {isOngoing && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                                SEDANG BERLANGSUNG
                              </span>
                            )}
                          </div>
                          <h3 className="mt-1 text-sm sm:text-base font-bold text-white group-hover:text-zinc-200 truncate">
                            {item.mapel}
                          </h3>
                          <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                            {item.guru && (
                              <span>👨‍🏫 {item.guru}</span>
                            )}
                            {item.ruangan && (
                              <span>• 📍 {item.ruangan}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Time Capsule */}
                      <div className="shrink-0 self-start sm:self-center">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-mono font-bold ${
                          isOngoing
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            : 'bg-white/5 text-zinc-300 border border-white/10'
                        }`}>
                          <span>⏰</span>
                          <span>{item.jam}</span>
                        </span>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          {/* Right Column: Catatan Akademik & Info */}
          <aside className="space-y-4">
            <div className="rounded-[24px] border border-white/[0.08] bg-[#141418] p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/5 text-base border border-white/10">
                  💡
                </span>
                <div>
                  <h3 className="text-sm font-bold text-white">Catatan Akademik</h3>
                  <p className="text-[11px] text-zinc-400">Ketentuan Kehadiran Perkuliahan</p>
                </div>
              </div>

              <div className="rounded-[16px] border border-white/5 bg-white/[0.03] p-4 text-xs text-zinc-300 leading-relaxed space-y-2.5">
                <p>
                  • <strong>Ketepatan Waktu:</strong> Mahasiswa diwajibkan hadir di ruang kuliah atau lab minimal 10 menit sebelum sesi dimulai.
                </p>
                <p>
                  • <strong>Batas Presensi:</strong> Presensi kehadiran minimal <strong>75%</strong> merupakan syarat mutlak untuk dapat mengikuti Ujian Akhir Semester (UAS).
                </p>
                <p>
                  • <strong>Praktikum Lab:</strong> Sesi praktikum di Laboratorium Komputer wajib mengenakan pakaian rapi, bersepatu, dan membawa KTM.
                </p>
              </div>

              <div className="rounded-[16px] border border-white/5 bg-[#18181D] p-3 text-center">
                <p className="text-[11px] text-zinc-400">
                  Perlu penyesuaian jadwal? Hubungi Ketua Tingkat atau admin jurusan.
                </p>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
