import logoFtia from '../assets/logoftia.jpeg';

export default function Footer({ setActivePage }) {
  const quickLinks = [
    { id: 'beranda', label: 'Beranda', icon: '🏠' },
    { id: 'prodi', label: 'Anggota', icon: '👥' },
    { id: 'jadwal', label: 'Jadwal Kuliah', icon: '📅' },
    { id: 'tugas', label: 'Tugas', icon: '📝' },
    { id: 'menfest', label: 'Menfest', icon: '💌' },
  ];

  return (
    <footer className="mt-16 border-t border-white/10 bg-[#09090B] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          
          {/* Kolom 1: Identitas */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                src={logoFtia}
                alt="Logo FTIA"
                className="h-12 w-12 object-cover rounded-2xl shadow-md ring-1 ring-white/15"
                width={48}
                height={48}
              />
              <div>
                <h3 className="font-extrabold text-lg text-white tracking-tight">
                  Class Hub <span className="text-[#9E9EA9] font-normal text-sm">FTIA</span>
                </h3>
                <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest">
                  Universitas Mitra Bangsa
                </p>
              </div>
            </div>
            <div className="text-xs text-[#9E9EA9] leading-relaxed space-y-1.5 max-w-md">
              <p className="font-semibold text-white/90">Fakultas Teknologi Informasi dan Aktuaria</p>
              <p>
                Platform akademik terpadu untuk mahasiswa FTIA dalam mengelola jadwal kuliah, 
                tugas perkuliahan, direktori per prodi, dan ruang aspirasi kampus.
              </p>
            </div>
          </div>

          {/* Kolom 2: Navigasi Cepat */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#9E9EA9]">
              Navigasi Cepat
            </h4>
            <nav className="grid grid-cols-2 gap-2">
              {quickLinks.map(link => (
                <button
                  key={link.id}
                  type="button"
                  onClick={() => setActivePage?.(link.id)}
                  className="flex items-center gap-2 text-xs font-medium text-[#9E9EA9] hover:text-white hover:bg-white/5 transition-colors text-left p-2.5 rounded-xl border border-transparent hover:border-white/10"
                >
                  <span className="text-sm">{link.icon}</span>
                  <span>{link.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Baris Bawah: Copyright */}
        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#6E6E77]">
          <p>© 2026 ClassHub FTIA UMIBA. All rights reserved.</p>
          <p className="flex items-center gap-1.5 text-[#9E9EA9]">
            <span>✨</span>
            <span>Bersatu, Berprestasi, Bersinar</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
