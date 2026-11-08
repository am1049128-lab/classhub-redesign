import { useState, useEffect, useCallback } from 'react';
import { initialProdi } from '../data/dummy';
import { useTheme } from '../context/ThemeContext';
import { getTugasList } from '../lib/supabase';

const isValidDeadline = value => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T23:59:59`);
  return Number.isFinite(date.getTime()) && date.toISOString().startsWith(value);
};

export default function Tugas({ prodiList = initialProdi, tugasList: initialTugas, tugasLoading, onUpdateTugas }) {
  const { isDark } = useTheme();

  const [tugasList, setTugasList] = useState(Array.isArray(initialTugas) && initialTugas.length > 0 ? initialTugas : []);
  const [loading, setLoading] = useState(false);
  const [isCloud, setIsCloud] = useState(false);
  const [filterStatus, setFilterStatus] = useState('Semua');
  const [filterProdi, setFilterProdi] = useState('Semua');

  // Fetch tugas dari Supabase / localStorage
  const fetchTugas = useCallback(async () => {
    setLoading(true);
    try {
      const { data, isSupabase } = await getTugasList();
      if (Array.isArray(data)) {
        setTugasList(data);
        onUpdateTugas?.(data);
      }
      setIsCloud(isSupabase);
    } catch (err) {
      console.warn('Gagal fetch tugas:', err);
    } finally {
      setLoading(false);
    }
  }, [onUpdateTugas]);

  useEffect(() => {
    if (Array.isArray(initialTugas) && initialTugas.length > 0) {
      setTugasList(initialTugas);
    } else {
      fetchTugas();
    }
  }, [initialTugas, fetchTugas]);

  const filteredTugas = tugasList.filter(t => {
    const matchStatus = filterStatus === 'Semua' || t.status === filterStatus;
    const matchProdi = filterProdi === 'Semua' || t.prodi === filterProdi || t.prodi === 'Semua';
    return matchStatus && matchProdi;
  });

  const countBelum = tugasList.filter(t => t.status === 'Belum').length;
  const countProses = tugasList.filter(t => t.status === 'Proses').length;
  const countSelesai = tugasList.filter(t => t.status === 'Selesai').length;

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white">
              TASK MANAGER
            </span>
            <span className="text-xs text-zinc-500">•</span>
            <span className="text-xs text-zinc-400 font-medium">Deadline & Penugasan Kuliah</span>
            {isCloud && (
              <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                ☁️ Cloud
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            📝 Daftar Tugas Kuliah
          </h1>
          <p className="mt-1 max-w-2xl text-xs sm:text-sm text-zinc-400">
            Kelola tugas perkuliahan, praktikum, dan deadline per program studi Fakultas Teknologi Informasi dan Aktuaria.
          </p>
        </div>
      </div>

      {/* Top 3 Summary Cards (Music Library Counters) */}
      <div className="grid grid-cols-3 gap-3 sm:gap-5">
        {/* Belum Selesai */}
        <div
          onClick={() => setFilterStatus(filterStatus === 'Belum' ? 'Semua' : 'Belum')}
          className={`cursor-pointer rounded-[22px] border p-4 sm:p-5 text-center transition-all duration-200 hover:-translate-y-1 active:scale-95 ${
            filterStatus === 'Belum'
              ? 'border-rose-500 bg-rose-500/10 shadow-lg shadow-rose-500/10'
              : 'border-white/[0.08] bg-[#141418] hover:border-white/20'
          }`}
        >
          <p className="text-2xl sm:text-4xl font-black text-rose-400">{countBelum}</p>
          <p className="mt-1 text-xs sm:text-sm font-bold text-zinc-300">📌 Belum</p>
          <span className="mt-1 block text-[10px] text-zinc-500">Tugas harus dikerjakan</span>
        </div>

        {/* Sedang Proses */}
        <div
          onClick={() => setFilterStatus(filterStatus === 'Proses' ? 'Semua' : 'Proses')}
          className={`cursor-pointer rounded-[22px] border p-4 sm:p-5 text-center transition-all duration-200 hover:-translate-y-1 active:scale-95 ${
            filterStatus === 'Proses'
              ? 'border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/10'
              : 'border-white/[0.08] bg-[#141418] hover:border-white/20'
          }`}
        >
          <p className="text-2xl sm:text-4xl font-black text-amber-400">{countProses}</p>
          <p className="mt-1 text-xs sm:text-sm font-bold text-zinc-300">⏳ Proses</p>
          <span className="mt-1 block text-[10px] text-zinc-500">Sedang berlangsung</span>
        </div>

        {/* Sudah Selesai */}
        <div
          onClick={() => setFilterStatus(filterStatus === 'Selesai' ? 'Semua' : 'Selesai')}
          className={`cursor-pointer rounded-[22px] border p-4 sm:p-5 text-center transition-all duration-200 hover:-translate-y-1 active:scale-95 ${
            filterStatus === 'Selesai'
              ? 'border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/10'
              : 'border-white/[0.08] bg-[#141418] hover:border-white/20'
          }`}
        >
          <p className="text-2xl sm:text-4xl font-black text-emerald-400">{countSelesai}</p>
          <p className="mt-1 text-xs sm:text-sm font-bold text-zinc-300">✅ Selesai</p>
          <span className="mt-1 block text-[10px] text-zinc-500">Telah dikumpulkan</span>
        </div>
      </div>

      {/* Filter Bar: Mood Chips + Dropdown Prodi */}
      <div className="rounded-[22px] border border-white/[0.08] bg-[#141418] p-3.5 sm:p-4.5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          {/* Status Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {['Semua', 'Belum', 'Proses', 'Selesai'].map(st => {
              const isActive = filterStatus === st;
              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => setFilterStatus(st)}
                  className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-all duration-200 active:scale-95 ${
                    isActive
                      ? 'bg-white text-black shadow-md'
                      : 'bg-[#18181D] text-zinc-400 border border-white/5 hover:border-white/15 hover:text-white'
                  }`}
                >
                  {st}
                </button>
              );
            })}
          </div>

          {/* Prodi Select */}
          <div className="flex items-center gap-2 text-xs w-full sm:w-auto">
            <span className="text-zinc-400 font-semibold shrink-0">Filter Prodi:</span>
            <select
              value={filterProdi}
              onChange={e => setFilterProdi(e.target.value)}
              className="w-full sm:w-auto rounded-full border border-white/10 bg-[#18181D] px-4 py-2 text-xs text-white outline-none transition focus:border-white/30"
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

      {/* Loading State */}
      {(loading || tugasLoading) && (
        <div className="rounded-[24px] border border-white/[0.08] bg-[#141418] py-16 text-center text-zinc-400 space-y-3">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
          <p className="text-xs font-semibold text-zinc-300">Memuat daftar tugas...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !tugasLoading && filteredTugas.length === 0 && (
        <div className="rounded-[24px] border border-white/[0.08] bg-[#141418] p-12 text-center text-zinc-400">
          <span className="mb-3 block text-5xl">🎉</span>
          <p className="font-bold text-white text-base">Tidak ada tugas dengan kriteria ini!</p>
          <p className="mt-1 text-xs text-zinc-500">
            Semua tugas sudah diselesaikan atau belum ada penugasan baru pada kategori ini.
          </p>
        </div>
      )}

      {/* Task Cards Grid (Music Collection Style) */}
      {!loading && !tugasLoading && filteredTugas.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTugas.map(t => {
            const deadlineValue = String(t.deadline || '');
            const isValidDate = isValidDeadline(deadlineValue)
              || (deadlineValue.includes('T') && Number.isFinite(new Date(deadlineValue).getTime()));
            const deadlineDate = isValidDate
              ? new Date(deadlineValue + (deadlineValue.includes('T') ? '' : 'T23:59:59'))
              : null;
            const timestamp = deadlineDate?.getTime();
            const diffDays = isValidDate ? Math.ceil((timestamp - Date.now()) / 86400000) : null;
            const isExpired = isValidDate && diffDays < 0 && t.status !== 'Selesai';
            const isUrgent = isValidDate && !isExpired && diffDays <= 1 && t.status !== 'Selesai';

            return (
              <div
                key={t.id}
                className={`group relative flex flex-col justify-between rounded-[22px] border p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl active:scale-95 ${
                  isUrgent
                    ? 'border-rose-500/40 bg-rose-500/[0.04]'
                    : 'border-white/[0.08] bg-[#141418] hover:border-white/20'
                }`}
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="rounded-full bg-white/5 border border-white/10 px-2.5 py-0.5 text-[10px] font-bold text-zinc-300 truncate max-w-[160px]">
                      {t.prodi || 'Semua Prodi'}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        t.status === 'Selesai'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : t.status === 'Proses'
                            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                            : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {t.status || 'Belum'}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-zinc-400 mb-1">{t.mapel}</p>
                  <h3 className="text-base font-bold text-white leading-snug group-hover:text-zinc-200">
                    {t.judul}
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed mt-2 line-clamp-3">
                    {t.deskripsi}
                  </p>

                  {t.guru && (
                    <p className="mt-2 text-[11px] text-zinc-500">👨‍🏫 {t.guru}</p>
                  )}
                </div>

                {/* Deadline & Status Footer */}
                <div className="mt-5 border-t border-white/5 pt-3.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span>⏰</span>
                    <span
                      className={`font-semibold ${
                        isExpired
                          ? 'text-rose-400'
                          : isUrgent
                            ? 'text-amber-400'
                            : 'text-zinc-400'
                      }`}
                    >
                      {isValidDate
                        ? deadlineDate.toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : 'Format tanggal tidak valid'}
                      {isValidDate && (
                        <span>
                          {isExpired
                            ? ' (Lewat)'
                            : isUrgent
                              ? ' (Besok!)'
                              : ` (${Math.max(0, diffDays)} hari lagi)`}
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
