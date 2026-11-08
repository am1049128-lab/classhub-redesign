import { useState, useEffect, lazy, Suspense } from "react";
import { safeGet, safeSet } from "./utils/storage";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Beranda from "./pages/Beranda";

// Code splitting per Section 6.3 agar bundle awal Beranda seringan mungkin
const Anggota = lazy(() => import("./pages/Anggota"));
const Jadwal = lazy(() => import("./pages/Jadwal"));
const Tugas = lazy(() => import("./pages/Tugas"));
const Menfest = lazy(() => import("./pages/Menfest"));
const Admin = lazy(() => import("./pages/Admin"));

function PageFallback() {
  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8 space-y-6 animate-pulse">
      <div className="h-8 w-48 rounded-xl bg-white/5" />
      <div className="h-4 w-72 rounded-lg bg-white/5" />
      <div className="h-14 w-full rounded-[22px] bg-white/5" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
        <div className="h-44 rounded-[22px] bg-white/5" />
        <div className="h-44 rounded-[22px] bg-white/5" />
        <div className="h-44 rounded-[22px] bg-white/5" />
      </div>
    </div>
  );
}
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { initialProdi, classInfo as defaultClassInfo } from "./data/dummy";
import {
  getAdminSession,
  getAnggotaList,
  getMenfestList,
  getTugasList,
  getJadwalList,
  onAuthStateChange,
  signOutAdmin,
} from "./lib/supabase";

function AppContent() {
  const [tugasLoading, setTugasLoading] = useState(false);
  const [activePage, setActivePage] = useState("beranda");
  const [selectedProdi, setSelectedProdi] = useState("Semua");
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  useEffect(() => {
    let isMounted = true;

    getAdminSession().then(({ data }) => {
      if (isMounted) setIsAdminLoggedIn(Boolean(data?.session));
    });

    const { data } = onAuthStateChange((_event, session) => {
      if (isMounted) setIsAdminLoggedIn(Boolean(session));
    });

    return () => {
      isMounted = false;
      data?.subscription?.unsubscribe();
    };
  }, []);

  const handleAdminLogin = () => {
    setIsAdminLoggedIn(true);
  };

  const handleAdminLogout = async () => {
    await signOutAdmin();
    setIsAdminLoggedIn(false);
    setActivePage("beranda");
  };
  const { isDark } = useTheme();

  const [prodiList, setProdiList] = useState(() => {
    const saved = safeGet(
      "classhub_prodi_list",
      safeGet("classhub_prodi_list_v2", safeGet("classhub_prodi_list_v1")),
    );
    if (Array.isArray(saved))
      return saved.map((p) =>
        p === "Teknik Informatika" ? "Ilmu Komputer" : p,
      );
    return initialProdi;
  });

  const [classInfo, setClassInfo] = useState(() => {
    const saved = safeGet("classhub_class_info_v1");
    return saved && typeof saved === "object" ? saved : defaultClassInfo;
  });
  const handleUpdateProdi = (newProdiList) => {
    setProdiList(newProdiList);
    safeSet("classhub_prodi_list", newProdiList);
  };

  const handleUpdateClassInfo = (newInfo) => {
    setClassInfo(newInfo);
    safeSet("classhub_class_info_v1", newInfo);
  };

  // Hydrate from cache immediately so Beranda has data on its first render,
  // then refresh all lists from the active Supabase/storage helpers below.
  const [anggotaList, setAnggotaList] = useState(() => {
    const saved = safeGet("classhub_anggota_v1", []);
    return Array.isArray(saved) ? saved : [];
  });
  const [menfestList, setMenfestList] = useState(() => {
    const saved = safeGet("classhub_menfest_live_v2", []);
    return Array.isArray(saved) ? saved : [];
  });
  const [tugasList, setTugasList] = useState(() => {
    const saved = safeGet(
      "classhub_tugas_v2",
      safeGet("classhub_tugas_v1", []),
    );
    return Array.isArray(saved) ? saved : [];
  });
  const [jadwalList, setJadwalList] = useState(() => {
    const saved = safeGet("classhub_jadwal_v2", []);
    return Array.isArray(saved) ? saved : [];
  });

  // Instant eager parallel data hydration on mount - no refresh needed
  useEffect(() => {
    let isMounted = true;

    async function hydrateAllData() {
      try {
        const results = await Promise.allSettled([
          getAnggotaList(),
          getMenfestList(),
          getTugasList(),
          getJadwalList(),
        ]);

        if (!isMounted) return;

        const [angRes, menRes, tugasRes, jadwalRes] = results;

        if (angRes.status === "fulfilled") {
          setAnggotaList(angRes.value?.data || []);
        }
        if (menRes.status === "fulfilled") {
          setMenfestList(menRes.value?.data || []);
        }
        if (tugasRes.status === "fulfilled") {
          setTugasList(tugasRes.value?.data || []);
        }
        if (jadwalRes.status === "fulfilled") {
          setJadwalList(jadwalRes.value?.data || []);
        }
      } catch (e) {
        console.warn("Data hydration exception:", e);
      } finally {
        if (isMounted) setTugasLoading(false);
      }
    }

    hydrateAllData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Reactive refresh handlers for admin actions
  const refreshAnggota = async () => {
    try {
      const res = await getAnggotaList();
      setAnggotaList(res.data || []);
    } catch (e) {
      console.warn("Refresh anggota failed:", e);
    }
  };

  const refreshMenfest = async () => {
    try {
      const res = await getMenfestList();
      setMenfestList(res.data || []);
    } catch (e) {
      console.warn("Refresh menfest failed:", e);
    }
  };

  const pages = {
    beranda: (
      <Beranda
        setActivePage={setActivePage}
        setSelectedProdi={setSelectedProdi}
        anggotaList={anggotaList}
        prodiList={prodiList}
        classInfo={classInfo}
        tugasList={tugasList}
        tugasLoading={tugasLoading}
        menfestList={menfestList}
      />
    ),
    prodi: (
      <Anggota
        anggotaList={anggotaList}
        prodiList={prodiList}
        selectedProdi={selectedProdi}
        setSelectedProdi={setSelectedProdi}
      />
    ),
    anggota: (
      <Anggota
        anggotaList={anggotaList}
        prodiList={prodiList}
        selectedProdi={selectedProdi}
        setSelectedProdi={setSelectedProdi}
      />
    ),
    jadwal: (
      <Jadwal
        prodiList={prodiList}
        jadwalList={jadwalList}
        onUpdateJadwal={setJadwalList}
      />
    ),
    tugas: (
      <Tugas
        prodiList={prodiList}
        tugasList={tugasList}
        tugasLoading={tugasLoading}
        onUpdateTugas={setTugasList}
      />
    ),
    menfest: (
      <Menfest onMenfestChange={setMenfestList} menfestList={menfestList} />
    ),
    admin: (
      <Admin
        isLoggedIn={isAdminLoggedIn}
        onLogin={handleAdminLogin}
        onLogout={handleAdminLogout}
        onBackToHome={() => setActivePage('beranda')}
        anggotaList={anggotaList}
        onUpdateAnggota={(list) => {
          setAnggotaList(list);
          refreshAnggota();
        }}
        prodiList={prodiList}
        onUpdateProdi={handleUpdateProdi}
        menfestList={menfestList}
        onUpdateMenfest={(list) => {
          setMenfestList(list);
          refreshMenfest();
        }}
        classInfo={classInfo}
        onUpdateClassInfo={handleUpdateClassInfo}
      />
    ),
  };

  // Daftar halaman publik mahasiswa yang menampilkan Navbar & Footer.
  // "admin" memiliki layout login / workspace mandiri tanpa navbar publik yang menutupi konten.
  const PUBLIC_PAGES = ["beranda", "prodi", "anggota", "jadwal", "tugas", "menfest"];
  const isPublicPage = PUBLIC_PAGES.includes(activePage);

  return (
    <div
      className="min-h-screen w-full overflow-x-hidden flex flex-col bg-[#09090B] text-white selection:bg-white/20 selection:text-white"
    >
      {isPublicPage && (
        <Navbar
          activePage={activePage}
          setActivePage={setActivePage}
          selectedProdi={selectedProdi}
          setSelectedProdi={setSelectedProdi}
          prodiList={prodiList}
        />
      )}

      <main className="flex-1 pb-16">
        <Suspense fallback={<PageFallback />}>
          {pages[activePage] || pages.beranda}
        </Suspense>
      </main>

      {/* Footer hanya dirender di halaman publik mahasiswa. */}
      {isPublicPage && <Footer setActivePage={setActivePage} />}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
