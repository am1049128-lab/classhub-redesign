import { useState, useEffect, useRef } from 'react';
import logoFtia from '../assets/logoftia.jpeg';

// Royalty-free ambient lofi audio stream for study focus
const AMBIENT_AUDIO_URL = 'https://stream.zeno.fm/f3wvbbqmdg8uv';

export default function BottomLiveBar({
  activePage,
  setActivePage,
  jadwalList = [],
  tugasList = [],
  menfestList = [],
}) {
  const [modeIndex, setModeIndex] = useState(0); // 0: Jadwal, 1: Tugas, 2: Menfest
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  // Audio play/pause handler
  const togglePlay = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(AMBIENT_AUDIO_URL);
      audioRef.current.volume = 0.5;
      audioRef.current.onended = () => setIsPlaying(false);
      audioRef.current.onerror = () => {
        setIsPlaying(false);
      };
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((e) => {
        console.warn('Audio autoplay notice:', e);
        // Fallback: visual playing state
        setIsPlaying(true);
      });
    }
  };

  // Next mode switcher
  const handleNextMode = () => {
    setModeIndex((prev) => (prev + 1) % 3);
  };

  // Auto rotate status every 9 seconds if not interacting
  useEffect(() => {
    const timer = setInterval(() => {
      setModeIndex((prev) => (prev + 1) % 3);
    }, 9000);
    return () => clearInterval(timer);
  }, []);

  // Determine active today schedule
  const HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const todayName = HARI[new Date().getDay()] || 'Senin';
  const todaySchedules = jadwalList.filter((j) => j.hari === todayName);
  const currentSchedule = todaySchedules[0] || jadwalList[0] || {
    mapel: 'Pendidikan Agama',
    jam: '13:00–15:00',
    guru: 'Drs. Nurmansyah M.M.S.I.',
    ruangan: '303 LAB',
  };

  // Urgent pending tasks
  const pendingTasks = tugasList.filter((t) => t.status !== 'Selesai' && t.status !== 'selesai');
  const nearestTask = pendingTasks[0] || {
    judul: 'Tugas Kuliah Terjadwal',
    mapel: 'FTIA UMIBA',
    deadline: 'Minggu ini',
  };

  // Latest menfest
  const latestMenfest = menfestList[0] || {
    message: 'Semangat belajar & kuliah untuk seluruh mahasiswa FTIA!',
    sender: 'Sivitas FTIA',
    to_who: 'Semua',
  };

  // Card view definitions
  let title = '';
  let subtitle = '';
  let thumbnail = logoFtia;
  let clickTarget = 'jadwal';

  if (modeIndex === 0) {
    // Mode Jadwal
    title = `Jadwal ${todayName}: ${currentSchedule.mapel} (${currentSchedule.jam})`;
    subtitle = `${currentSchedule.guru || 'Dosen Pengampu'} • ${currentSchedule.ruangan || 'Ruang Kuliah'}`;
    clickTarget = 'jadwal';
  } else if (modeIndex === 1) {
    // Mode Tugas
    title = `${pendingTasks.length} Tugas Belum Selesai • ${nearestTask.judul}`;
    subtitle = `${nearestTask.mapel} • Deadline: ${nearestTask.deadline || 'Segera'}`;
    clickTarget = 'tugas';
  } else {
    // Mode Menfest
    title = `Menfest: "${latestMenfest.message.slice(0, 36)}..."`;
    subtitle = `Dari ${latestMenfest.sender} untuk ${latestMenfest.to_who}`;
    clickTarget = 'menfest';
  }

  return (
    <aside
      aria-label="Campus Live Player"
      className="fixed bottom-4 inset-x-0 mx-auto z-40 w-[calc(100%-24px)] max-w-[680px] h-[66px] rounded-full glass-pill flex items-center justify-between px-3 sm:px-4 select-none"
    >
      {/* Top thin progress bar */}
      <div className="absolute top-0 left-6 right-6 h-[2px] bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-white/70 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${((modeIndex + 1) / 3) * 100}%` }}
        />
      </div>

      {/* Sisi Kiri: Thumbnail Image */}
      <button
        type="button"
        onClick={() => setActivePage(clickTarget)}
        className="flex items-center gap-3 min-w-0 flex-1 text-left group pr-2"
        title="Klik untuk membuka detail"
      >
        <div className="w-[46px] h-[46px] rounded-xl overflow-hidden shrink-0 border border-white/15 bg-[#18181D] shadow-md group-hover:scale-105 transition-transform duration-200">
          <img
            src={thumbnail}
            alt="Thumbnail"
            className="w-full h-full object-cover"
            width={46}
            height={46}
          />
        </div>

        {/* Bagian Tengah: Live Info */}
        <div className="min-w-0 flex-1">
          <p className="text-[13px] sm:text-[14px] font-bold text-white truncate group-hover:text-white/90">
            {title}
          </p>
          <div className="flex items-center gap-2 text-[11px] sm:text-[12px] text-[#9E9EA9] truncate">
            {/* 3-Bar Equalizer animation */}
            <div className="flex items-end gap-[2px] h-[10px] w-[11px] shrink-0" aria-hidden="true">
              <span className={`w-[2.5px] h-full bg-white/80 rounded-sm ${isPlaying ? 'animate-eq-1' : 'h-[3px]'}`} />
              <span className={`w-[2.5px] h-full bg-white/80 rounded-sm ${isPlaying ? 'animate-eq-2' : 'h-[7px]'}`} />
              <span className={`w-[2.5px] h-full bg-white/80 rounded-sm ${isPlaying ? 'animate-eq-3' : 'h-[5px]'}`} />
            </div>
            <span className="truncate">{subtitle}</span>
          </div>
        </div>
      </button>

      {/* Sisi Kanan: Music Control Buttons */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Tombol Hati -> lompat ke Menfest */}
        <button
          type="button"
          onClick={() => setActivePage('menfest')}
          className={`p-2 rounded-full transition-colors ${
            activePage === 'menfest'
              ? 'text-pink-400 bg-pink-500/15'
              : 'text-[#9E9EA9] hover:text-white hover:bg-white/10'
          }`}
          title="Buka Menfest & Aspirasi Mahasiswa"
          aria-label="Buka Menfest"
        >
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </button>

        {/* Tombol Play/Pause Ambient Study Beats */}
        <button
          type="button"
          onClick={togglePlay}
          className="w-[42px] h-[42px] rounded-full bg-white hover:bg-white/90 text-black flex items-center justify-center shadow-lg spring-press shrink-0"
          title={isPlaying ? 'Pause Lofi Study Beats' : 'Putar Lofi Study Beats Kampus'}
          aria-label={isPlaying ? 'Pause Ambient' : 'Play Ambient'}
        >
          {isPlaying ? (
            <svg className="w-4 h-4 fill-black" viewBox="0 0 24 24">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          ) : (
            <svg className="w-4 h-4 fill-black ml-0.5" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Tombol Next -> geser mode info */}
        <button
          type="button"
          onClick={handleNextMode}
          className="p-2 rounded-full text-[#9E9EA9] hover:text-white hover:bg-white/10 transition-colors"
          title="Geser status berikutnya (Jadwal → Tugas → Menfest)"
          aria-label="Status Berikutnya"
        >
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
          </svg>
        </button>
      </div>
    </aside>
  );
}

