import { useState, useEffect, useRef } from 'react';
import logoFtia from '../assets/logoftia.jpeg';

/* SVG Icons */
function HomeIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function TaskIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

export default function Navbar({
  activePage,
  setActivePage,
  selectedProdi,
  setSelectedProdi,
  prodiList = ['Ilmu Komputer', 'Sistem Informasi', 'Aktuaria'],
}) {
  const [prodiDropdownOpen, setProdiDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProdiDropdownOpen(false);
      }
    }
    if (prodiDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [prodiDropdownOpen]);

  const handleNavClick = (pageId, prodiName = null) => {
    setActivePage(pageId);
    if (prodiName && setSelectedProdi) {
      setSelectedProdi(prodiName);
    }
    setProdiDropdownOpen(false);
  };

  const navItems = [
    { id: 'beranda', label: 'Beranda', Icon: HomeIcon },
    { id: 'prodi', label: 'Prodi & Anggota', Icon: UsersIcon },
    { id: 'jadwal', label: 'Jadwal', Icon: CalendarIcon },
    { id: 'tugas', label: 'Tugas', Icon: TaskIcon },
    { id: 'menfest', label: 'Menfest', Icon: HeartIcon },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-[#09090B]/95 backdrop-blur-md border-b border-white/[0.08] shadow-lg">
      <div className="mx-auto max-w-7xl h-16 sm:h-18 px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-2">
        {/* Kiri: Brand Logo & Kampus */}
        <button
          type="button"
          onClick={() => handleNavClick('beranda')}
          className="flex items-center gap-2.5 shrink-0 group text-left"
          title="Class Hub FTIA"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border border-white/20 bg-[#16161C] shrink-0 shadow-md group-hover:scale-105 transition-transform duration-200">
            <img
              src={logoFtia}
              alt="Logo FTIA"
              className="w-full h-full object-cover"
              width={40}
              height={40}
            />
          </div>
          <div className="hidden sm:flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm sm:text-base text-white tracking-tight leading-tight">
                Class Hub
              </span>
              <span className="text-[10px] font-bold tracking-widest px-1.5 py-0.2 rounded-full bg-white/10 text-white/90 border border-white/15">
                FTIA
              </span>
            </div>
            <span className="text-[10px] text-zinc-400 font-medium leading-tight">
              Univ. Mitra Bangsa
            </span>
          </div>
        </button>

        {/* Tengah: Nav Menu */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {navItems.map((item) => {
            const isActive = activePage === item.id || (item.id === 'prodi' && activePage === 'anggota');

            if (item.id === 'prodi') {
              return (
                <div key={item.id} className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setProdiDropdownOpen((prev) => !prev);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 shrink-0 select-none ${
                      isActive
                        ? 'bg-white text-black shadow-md font-bold'
                        : 'text-zinc-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <item.Icon />
                    <span className="hidden md:inline">{item.label}</span>
                    <span className="md:hidden">Prodi</span>
                    <span className={`text-[10px] transition-transform duration-200 ${prodiDropdownOpen ? 'rotate-180' : ''}`}>
                      ▾
                    </span>
                  </button>

                  {/* Dropdown Menu 4 Pilihan Sesuai Permintaan */}
                  {prodiDropdownOpen && (
                    <div className="absolute left-0 top-full mt-2 w-64 rounded-2xl border border-white/15 bg-[#141418] p-2 shadow-2xl z-[100] text-white animate-fade-in">
                      <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400 border-b border-white/10">
                        Pilih Program Studi
                      </div>
                      <div className="py-1.5 space-y-1">
                        {/* 1. Seluruh Prodi */}
                        <button
                          type="button"
                          onClick={() => handleNavClick('prodi', 'Semua')}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                            selectedProdi === 'Semua' && isActive
                              ? 'bg-white text-black font-bold'
                              : 'text-zinc-200 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <span>🌟</span>
                            <span>Seluruh Prodi</span>
                          </span>
                          <span className="text-[10px] text-zinc-400">Semua</span>
                        </button>

                        {/* 2. Prodi Ilmu Komputer */}
                        <button
                          type="button"
                          onClick={() => handleNavClick('prodi', 'Ilmu Komputer')}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                            selectedProdi?.toLowerCase() === 'ilmu komputer' && isActive
                              ? 'bg-white text-black font-bold'
                              : 'text-zinc-200 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <span>💻</span>
                            <span>Prodi Ilmu Komputer</span>
                          </span>
                          <span className="text-[10px] text-zinc-400">Lihat</span>
                        </button>

                        {/* 3. Prodi Sistem Informasi */}
                        <button
                          type="button"
                          onClick={() => handleNavClick('prodi', 'Sistem Informasi')}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                            selectedProdi?.toLowerCase() === 'sistem informasi' && isActive
                              ? 'bg-white text-black font-bold'
                              : 'text-zinc-200 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <span>📊</span>
                            <span>Prodi Sistem Informasi</span>
                          </span>
                          <span className="text-[10px] text-zinc-400">Lihat</span>
                        </button>

                        {/* 4. Prodi Aktuaria */}
                        <button
                          type="button"
                          onClick={() => handleNavClick('prodi', 'Aktuaria')}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                            selectedProdi?.toLowerCase() === 'aktuaria' && isActive
                              ? 'bg-white text-black font-bold'
                              : 'text-zinc-200 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <span>📈</span>
                            <span>Prodi Aktuaria</span>
                          </span>
                          <span className="text-[10px] text-zinc-400">Lihat</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 shrink-0 ${
                  isActive
                    ? 'bg-white text-black shadow-md font-bold'
                    : 'text-zinc-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <item.Icon />
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Kanan: Tombol Admin Portal Kapsul */}
        <div className="shrink-0">
          <button
            type="button"
            onClick={() => setActivePage('admin')}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-bold border transition-all duration-200 ${
              activePage === 'admin'
                ? 'bg-white text-black border-white shadow-md'
                : 'border-white/15 bg-white/5 text-zinc-300 hover:text-white hover:bg-white/10 hover:border-white/30'
            }`}
            title="Buka FTIA Workspace / Admin Portal"
          >
            <ShieldIcon />
            <span className="hidden md:inline">Admin Portal</span>
            <span className="md:hidden">Admin</span>
          </button>
        </div>
      </div>
    </header>
  );
}
