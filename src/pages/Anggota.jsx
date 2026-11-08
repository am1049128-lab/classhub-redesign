import { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { defaultStruktur, initialProdi } from '../data/dummy';
import { safeGet, safeSet } from '../utils/storage';

function OrgNode({ item }) {
  return (
    <div className="group rounded-2xl border border-white/10 bg-[#16161C] p-3.5 sm:p-4 text-center transition-all duration-200 hover:border-white/25 hover:-translate-y-1">
      <div className="mx-auto mb-3 h-14 w-14 sm:h-16 sm:w-16 overflow-hidden rounded-full border-2 border-white/20 bg-[#1C1C22] shadow-lg">
        <img
          src={item.photo}
          alt={item.name}
          width={64}
          height={64}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={event => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(item.name)}`;
          }}
        />
      </div>
      <span className="inline-flex max-w-full rounded-full bg-white text-black px-2.5 py-0.5 text-[10px] font-bold shadow-md">
        {item.role}
      </span>
      <p className="mt-2 break-words text-xs sm:text-sm font-bold text-white leading-tight">{item.name}</p>
    </div>
  );
}

function StructureTree({ struktur }) {
  const leaders = struktur.filter(item => item.level === 1);
  const executors = struktur.filter(item => item.level === 2);

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="grid grid-cols-1 gap-3 sm:mx-auto sm:max-w-lg sm:grid-cols-2 sm:gap-5">
        {leaders.map(item => <OrgNode key={item.id} item={item} />)}
      </div>
      <div className="relative mx-auto my-4 hidden h-8 max-w-lg sm:block" aria-hidden="true">
        <div className="absolute left-1/4 right-1/4 top-0 h-px bg-gradient-to-r from-white/10 via-white/40 to-white/10" />
        <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-white/30" />
        <div className="absolute left-1/4 top-0 h-8 w-px bg-white/20" />
        <div className="absolute right-1/4 top-0 h-8 w-px bg-white/20" />
      </div>
      <div className="mx-auto my-4 h-5 w-px bg-gradient-to-b from-white/40 to-white/10 sm:hidden" aria-hidden="true" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-4 sm:gap-4">
        {executors.map(item => <OrgNode key={item.id} item={item} />)}
      </div>
    </div>
  );
}

export default function Anggota({
  anggotaList = [],
  prodiList = initialProdi,
  selectedProdi = 'Semua',
  setSelectedProdi,
}) {
  const { isDark } = useTheme();
  const [search, setSearch] = useState('');
  const [selectedAnggota, setSelectedAnggota] = useState(null);
  const [struktur, setStruktur] = useState(defaultStruktur);

  useEffect(() => {
    const loadStruktur = () => {
      const saved = safeGet('classhub_struktur_data', null);
      if (!Array.isArray(saved)) {
        safeSet('classhub_struktur_data', defaultStruktur);
        setStruktur(defaultStruktur);
        return;
      }

      const savedById = new Map(saved.map(item => [item?.id, item]));
      setStruktur(defaultStruktur.map(defaultItem => ({
        ...defaultItem,
        ...(savedById.get(defaultItem.id) || {}),
        id: defaultItem.id,
        level: defaultItem.level,
      })));
    };

    loadStruktur();
    window.addEventListener('storage', loadStruktur);
    window.addEventListener('classhub:struktur-updated', loadStruktur);
    return () => {
      window.removeEventListener('storage', loadStruktur);
      window.removeEventListener('classhub:struktur-updated', loadStruktur);
    };
  }, []);

  const activeProdi = selectedProdi || 'Semua';
  const filtered = anggotaList.filter(item => {
    const matchProdi = activeProdi === 'Semua' || (item.prodi && item.prodi.toLowerCase() === activeProdi.toLowerCase());
    const query = search.toLowerCase();
    return matchProdi && (
      item.name.toLowerCase().includes(query) ||
      (item.nickname && item.nickname.toLowerCase().includes(query)) ||
      (item.quote && item.quote.toLowerCase().includes(query))
    );
  });

  const formatTanggalIndo = value => {
    const date = new Date(`${value}T00:00:00`);
    return Number.isFinite(date.getTime())
      ? date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
      : value;
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Header Direktori */}
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white">
              MAHASISWA & SIVITAS
            </span>
            <span className="text-xs text-zinc-500">•</span>
            <span className="text-xs text-zinc-400 font-medium">
              {anggotaList.length} Total Anggota Terdaftar
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Direktori Anggota Per Prodi
          </h1>
          <p className="mt-1 max-w-2xl text-xs sm:text-sm text-zinc-400">
            Temukan dan kenali seluruh mahasiswa di setiap Program Studi Fakultas Teknologi Informasi dan Aktuaria.
          </p>
        </div>
      </div>

      {/* Filter Mood Chips & Search Capsule */}
      <div className="rounded-[22px] border border-white/[0.08] bg-[#141418] p-3.5 sm:p-4.5">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          {/* Mood Chips Prodi */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedProdi?.('Semua')}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold transition-all duration-200 active:scale-95 ${
                activeProdi === 'Semua'
                  ? 'bg-white text-black shadow-md'
                  : 'bg-[#18181D] text-zinc-400 border border-white/5 hover:border-white/15 hover:text-white'
              }`}
            >
              🌟 Semua Prodi ({anggotaList.length})
            </button>
            {prodiList.map(prodi => {
              const count = anggotaList.filter(item => item.prodi?.toLowerCase() === prodi.toLowerCase()).length;
              const isActive = activeProdi.toLowerCase() === prodi.toLowerCase();
              return (
                <button
                  key={prodi}
                  type="button"
                  onClick={() => setSelectedProdi?.(prodi)}
                  className={`flex whitespace-nowrap items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all duration-200 active:scale-95 ${
                    isActive
                      ? 'bg-white text-black shadow-md'
                      : 'bg-[#18181D] text-zinc-400 border border-white/5 hover:border-white/15 hover:text-white'
                  }`}
                >
                  <span>🎓 {prodi}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                      isActive ? 'bg-black/10 text-black' : 'bg-white/10 text-zinc-300'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Input Capsule */}
          <div className="flex items-center gap-2.5 rounded-full border border-white/10 bg-[#18181D] px-4 py-2 text-xs transition-colors focus-within:border-white/30">
            <span className="text-zinc-400 text-sm">🔍</span>
            <input
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder="Cari anggota, NIM, panggilan..."
              className="w-full bg-transparent text-white placeholder-zinc-500 outline-none sm:w-64"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="text-zinc-500 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grid Tracklist & Artist Cards */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-base sm:text-lg font-bold text-white">
            <span>Daftar Mahasiswa:</span>
            <span className="text-zinc-300 font-semibold">{activeProdi}</span>
          </h2>
          <span className="shrink-0 rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs font-semibold text-zinc-300">
            {filtered.length} mahasiswa
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-[24px] border border-white/[0.08] bg-[#141418] p-12 text-center text-zinc-400">
            <span className="mb-3 block text-4xl">🔍</span>
            <p className="font-bold text-white">Tidak ada mahasiswa ditemukan</p>
            <p className="mt-1 text-xs text-zinc-500">Coba ubah kata kunci pencarian atau ganti filter Program Studi.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map(member => (
              <div
                key={member.id}
                onClick={() => setSelectedAnggota(member)}
                className="group relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-[22px] border border-white/[0.08] bg-[#141418] p-4 transition-all duration-200 hover:-translate-y-1 hover:border-white/20 hover:shadow-xl active:scale-95"
              >
                <div>
                  {/* Avatar & Badges */}
                  <div className="flex items-start gap-3.5 mb-3">
                    <div className="relative h-14 w-14 sm:h-16 sm:w-16 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-[#1C1C22]">
                      <img
                        src={member.photo}
                        alt={member.name}
                        width={64}
                        height={64}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={event => {
                          event.currentTarget.onerror = null;
                          event.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(member.name)}`;
                        }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="inline-block rounded-full bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] font-semibold text-zinc-300 truncate max-w-full">
                        {member.prodi || 'FTIA'}
                      </span>
                      <h3 className="mt-1 line-clamp-1 text-sm font-bold text-white group-hover:text-zinc-200">
                        {member.name}
                      </h3>
                      <p className="text-[11px] font-medium text-zinc-400">
                        &quot;{member.nickname || member.name.split(' ')[0]}&quot;
                      </p>
                      {member.nim && member.nim !== '-' && (
                        <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                          NIM: {member.nim}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Lyrics-style quote box */}
                  <div className="min-h-[56px] rounded-[14px] border border-white/5 bg-white/[0.03] p-2.5 text-xs italic text-zinc-300 leading-relaxed break-words line-clamp-3">
                    &ldquo;{member.quote || 'Fokus pada proses, hasil akan mengikuti alurnya.'}&rdquo;
                  </div>
                </div>

                <div className="mt-3.5 flex items-center justify-between border-t border-white/5 pt-2 text-[11px] text-zinc-500">
                  <span>Klik untuk detail</span>
                  <span className="text-zinc-400 font-bold group-hover:translate-x-0.5 transition-transform">→</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Section Struktur Pengurus Kelas */}
      <section className="rounded-[24px] border border-white/[0.08] bg-[#141418] p-5 sm:p-8">
        <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-lg sm:text-xl font-bold text-white">
              <span>🏛️</span> Struktur Pengurus Kelas
            </h2>
            <p className="mt-1 text-xs text-zinc-400">
              Ketua, Wakil Ketua, dan Jajaran Pengurus Angkatan FTIA
            </p>
          </div>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-zinc-300">
            {struktur.length} Pengurus
          </span>
        </div>
        <StructureTree struktur={struktur} />
      </section>

      {/* Modal Detail Anggota (Music Card Lyrics Style) */}
      {selectedAnggota && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-fade-in"
          onClick={() => setSelectedAnggota(null)}
        >
          <div
            className="relative w-full max-w-md rounded-[26px] border border-white/15 bg-[#141418] p-6 sm:p-8 text-center text-white shadow-2xl"
            onClick={event => event.stopPropagation()}
          >
            <button
              onClick={() => setSelectedAnggota(null)}
              aria-label="Tutup detail anggota"
              className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-white/5 text-zinc-400 transition hover:bg-white/10 hover:text-white"
            >
              ✕
            </button>

            <div className="mx-auto h-28 w-28 sm:h-32 sm:w-32 overflow-hidden rounded-2xl border-2 border-white/15 bg-[#1C1C22] shadow-xl">
              <img
                src={selectedAnggota.photo}
                alt={selectedAnggota.name}
                width={128}
                height={128}
                className="h-full w-full object-cover"
              />
            </div>

            <h3 className="mt-4 text-lg sm:text-xl font-bold text-white">
              {selectedAnggota.name}
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-zinc-400">
              {selectedAnggota.nickname
                ? `"${selectedAnggota.nickname.replace(/&quot;/g, '').trim()}"`
                : selectedAnggota.name}
            </p>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              {selectedAnggota.prodi && (
                <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-zinc-300">
                  🎓 {selectedAnggota.prodi}
                </span>
              )}
              {selectedAnggota.nim && selectedAnggota.nim !== '-' && (
                <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-mono text-zinc-300">
                  🎫 NIM: {selectedAnggota.nim}
                </span>
              )}
              {selectedAnggota.birthday && (
                <span className="inline-flex rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs text-amber-300">
                  🎂 {formatTanggalIndo(selectedAnggota.birthday)}
                </span>
              )}
              {selectedAnggota.instagram && (
                <a
                  href={`https://instagram.com/${selectedAnggota.instagram.replace(/^@/, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center rounded-full border border-pink-500/30 bg-pink-500/10 px-3 py-1 text-xs font-semibold text-pink-300 transition hover:bg-pink-500/20"
                >
                  ◎ @{selectedAnggota.instagram.replace(/^@/, '')}
                </a>
              )}
            </div>

            {selectedAnggota.quote && (
              <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-xs sm:text-sm italic text-zinc-200 leading-relaxed">
                &ldquo;{selectedAnggota.quote}&rdquo;
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
