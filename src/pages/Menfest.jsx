import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import {
  getMenfestList,
  addMenfest,
  addMenfestReply,
  toggleLikeMenfest,
  isSupabaseConfigured,
} from "../lib/supabase";

const COLOR_OPTIONS = [
  { id: "violet", label: "Ungu / Violet", hex: "#8B5CF6", bg: "bg-violet-500" },
  { id: "electric-blue", label: "Biru Elektrik", hex: "#3B82F6", bg: "bg-blue-500" },
  { id: "cyan", label: "Sky Blue / Cyan", hex: "#06B6D4", bg: "bg-cyan-500" },
  { id: "emerald", label: "Hijau Emerald", hex: "#10B981", bg: "bg-emerald-500" },
  { id: "lime", label: "Lime Neon", hex: "#84CC16", bg: "bg-lime-500" },
  { id: "amber", label: "Kuning Amber", hex: "#F59E0B", bg: "bg-amber-500" },
  { id: "orange", label: "Oranye Sunset", hex: "#F97316", bg: "bg-orange-500" },
  { id: "rose", label: "Merah Rose", hex: "#F43F5E", bg: "bg-rose-500" },
  { id: "magenta", label: "Pink Magenta", hex: "#EC4899", bg: "bg-pink-500" },
  { id: "lavender", label: "Indigo Lavender", hex: "#6366F1", bg: "bg-indigo-500" },
];

const getColorOption = (color) =>
  COLOR_OPTIONS.find((option) => option.id === color) || COLOR_OPTIONS[0];

export default function Menfest({ onMenfestChange }) {
  const { isDark } = useTheme();

  const [menfestList, setMenfestList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSupabase, setIsSupabase] = useState(false);
  const [search, setSearch] = useState("");

  // Form input
  const [toWho, setToWho] = useState("");
  const [sender, setSender] = useState("");
  const [isAnon, setIsAnon] = useState(true);
  const [message, setMessage] = useState("");
  const [selectedColor, setSelectedColor] = useState("violet");
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [expandedReplies, setExpandedReplies] = useState({});
  const [replySender, setReplySender] = useState("");
  const [replyText, setReplyText] = useState("");
  const [replySubmitting, setReplySubmitting] = useState(false);

  // Load menfest
  const loadData = async () => {
    try {
      setLoading(true);
      const res = await getMenfestList();
      const nextList = res.data || [];
      setMenfestList(nextList);
      onMenfestChange?.(nextList);
      setIsSupabase(res.isSupabase || isSupabaseConfigured());
    } catch (err) {
      console.warn("Gagal memuat menfest:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener("classhub:menfest-updated", loadData);
    return () => window.removeEventListener("classhub:menfest-updated", loadData);
  }, []);

  const handleKirim = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      setSubmitting(true);
      const payload = {
        to_who: toWho.trim() || "Semua Orang",
        sender: isAnon ? "Anonim 🎭" : sender.trim() || "Anonim 🎭",
        message: message.trim(),
        color: selectedColor,
      };

      const res = await addMenfest(payload);
      setMenfestList((prev) => {
        const nextList = [res, ...prev];
        onMenfestChange?.(nextList);
        return nextList;
      });

      // Reset form
      setMessage("");
      setToWho("");
      setSender("");
      setIsAnon(true);
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (err) {
      alert("Gagal mengirim Menfest: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (id, currentLikes = 0) => {
    // Optimistic UI update
    setMenfestList((prev) =>
      prev.map((m) => (m.id === id ? { ...m, likes: (m.likes || 0) + 1 } : m)),
    );
    await toggleLikeMenfest(id, currentLikes);
  };

  const handleReplySubmit = async (event, itemId) => {
    event.preventDefault();
    if (!replyText.trim()) return;

    try {
      setReplySubmitting(true);
      const reply = await addMenfestReply(itemId, {
        sender: replySender,
        text: replyText,
      });
      setMenfestList((prev) => {
        const nextList = prev.map((item) =>
          item.id === itemId
            ? {
                ...item,
                replies: [
                  ...(Array.isArray(item.replies) ? item.replies : []),
                  reply,
                ],
              }
            : item,
        );
        onMenfestChange?.(nextList);
        return nextList;
      });
      setReplySender("");
      setReplyText("");
      setReplyingTo(null);
    } catch (error) {
      alert(`Gagal mengirim balasan: ${error.message}`);
    } finally {
      setReplySubmitting(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    alert("Pesan menfest berhasil disalin ke clipboard!");
  };

  const filtered = menfestList.filter(
    (item) =>
      item.message?.toLowerCase().includes(search.toLowerCase()) ||
      item.to_who?.toLowerCase().includes(search.toLowerCase()) ||
      item.sender?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Header & Status Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white">
              💌 MENFEST CAMPUS FEED
            </span>
            <span className="text-xs text-zinc-500">•</span>
            {isSupabase ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Supabase Connected
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-amber-400">
                ⚡ Mode Lokal
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            💌 Menfest & Aspirasi Mahasiswa
          </h1>
          <p className="mt-1 max-w-2xl text-xs sm:text-sm text-zinc-400">
            Kirim pesan anonim, curahan hati, salam apresiasi, atau semangat untuk teman sekelas dan satu fakultas secara aman dan menyenangkan.
          </p>

          {/* 7-Day Auto-Reset Glass Capsule Banner */}
          <div className="mt-3.5 flex items-center gap-3 rounded-[16px] border border-amber-500/25 bg-amber-500/[0.08] p-3 text-xs text-amber-300">
            <span className="text-base shrink-0">⏳</span>
            <p className="font-medium">
              Feed Menfest otomatis di-reset setiap 7 hari agar selalu segar & relevan bagi civitas akademika FTIA.
            </p>
          </div>
        </div>

        {/* Refresh Feed Button */}
        <button
          type="button"
          onClick={loadData}
          disabled={loading}
          className="shrink-0 flex items-center justify-center gap-2 rounded-full border border-white/10 bg-[#141418] px-4 py-2.5 text-xs font-semibold text-zinc-300 transition hover:border-white/20 hover:text-white active:scale-95 disabled:opacity-50"
        >
          <span>🔄</span>
          <span>{loading ? "Memuat..." : "Refresh Feed"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* KOLOM KIRI: FORM KIRIM MENFEST */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-24 rounded-[24px] border border-white/[0.08] bg-[#141418] p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3 border-b border-white/5 pb-3.5">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/5 border border-white/10 text-xl">
                ✍️
              </span>
              <div>
                <h2 className="text-base font-bold text-white">Kirim Pesan Menfest</h2>
                <p className="text-xs text-zinc-400">Identitasmu bisa dibuat anonim</p>
              </div>
            </div>

            {submitSuccess && (
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs text-center font-bold animate-bounce">
                🎉 Menfest kamu berhasil dikirim & diposting ke feed!
              </div>
            )}

            <form onSubmit={handleKirim} className="space-y-4 text-xs">
              {/* Kepada */}
              <div>
                <label className="block mb-1.5 font-bold text-zinc-300">Kepada (To):</label>
                <input
                  type="text"
                  placeholder="Contoh: Teman-teman IF 2026 / Si dia di lab 3"
                  value={toWho}
                  onChange={(e) => setToWho(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#18181D] px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 outline-none transition focus:border-white/30"
                />
              </div>

              {/* Dari / Anonim Toggle */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-zinc-300">Dari (From):</label>
                  <label className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] cursor-pointer text-zinc-300 hover:bg-white/10 transition">
                    <input
                      type="checkbox"
                      checked={isAnon}
                      onChange={(e) => setIsAnon(e.target.checked)}
                      className="rounded accent-white"
                    />
                    <span className="font-semibold">Kirim Anonim 🎭</span>
                  </label>
                </div>

                {!isAnon && (
                  <input
                    type="text"
                    placeholder="Nama pena / inisial kamu..."
                    value={sender}
                    onChange={(e) => setSender(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#18181D] px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 outline-none transition focus:border-white/30"
                  />
                )}
              </div>

              {/* Pilihan Warna Kartu */}
              <div>
                <label className="block mb-2 font-bold text-zinc-300">
                  Warna Aksen Kartu:
                </label>
                <div className="grid grid-cols-5 gap-2.5 max-w-xs mx-auto sm:flex sm:flex-wrap sm:justify-center sm:gap-2 sm:max-w-none">
                  {COLOR_OPTIONS.map((color) => (
                    <button
                      key={color.id}
                      type="button"
                      title={color.label}
                      aria-label={`Pilih ${color.label}`}
                      onClick={() => setSelectedColor(color.id)}
                      className={`h-7 w-7 rounded-full ${color.bg} shadow-md transition-all duration-200 hover:scale-110 ${
                        selectedColor === color.id
                          ? "scale-110 ring-2 ring-white ring-offset-2 ring-offset-[#141418] shadow-lg"
                          : "opacity-60 hover:opacity-100"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Pesan */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-zinc-300">Isi Pesan Menfest *</label>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {message.length}/500
                  </span>
                </div>
                <textarea
                  required
                  rows={4}
                  maxLength={500}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ketik pesan yang ingin kamu sampaikan... Bersikaplah sopan dan saling mendukung sesama mahasiswa! ✨"
                  className="w-full rounded-2xl border border-white/10 bg-[#18181D] px-4 py-3 text-xs text-white placeholder-zinc-500 outline-none resize-none transition focus:border-white/30 leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={submitting || !message.trim()}
                className="w-full py-3 rounded-full font-bold bg-white text-black hover:bg-zinc-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition duration-200 flex items-center justify-center gap-2 shadow-lg"
              >
                <span>🚀</span>
                <span>
                  {submitting ? "Mengirim ke Supabase..." : "Kirim Menfest Sekarang"}
                </span>
              </button>
            </form>
          </div>
        </div>

        {/* KOLOM KANAN: FEED MENFEST */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search Filter Bar */}
          <div className="rounded-[22px] border border-white/[0.08] bg-[#141418] p-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 rounded-full border border-white/10 bg-[#18181D] px-4 py-2 text-xs w-full sm:w-auto transition focus-within:border-white/30">
              <span className="text-zinc-400">🔍</span>
              <input
                type="text"
                placeholder="Cari pesan, penerima, pengirim..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent outline-none text-white placeholder-zinc-500 w-full sm:w-60"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="text-zinc-500 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>
            <span className="text-xs text-zinc-400 font-semibold shrink-0 pr-2 hidden sm:inline">
              {filtered.length} Menfest
            </span>
          </div>

          {/* Menfest Feed Cards (Lyrics / Now Playing Share Aesthetic) */}
          {loading ? (
            <div className="rounded-[24px] border border-white/[0.08] bg-[#141418] py-16 text-center text-zinc-400 space-y-3">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
              <p className="text-xs font-semibold text-zinc-300">Memuat pesan Menfest...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-[24px] border border-white/[0.08] bg-[#141418] p-12 text-center text-zinc-400">
              <span className="text-5xl block mb-3">💌</span>
              <p className="font-bold text-white text-base">Belum ada pesan Menfest</p>
              <p className="mt-1 text-xs text-zinc-500">
                Jadilah yang pertama mengirim pesan di formulir sebelah kiri!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((item) => {
                const accentColor = getColorOption(item.color);
                return (
                  <article
                    key={item.id}
                    className="relative rounded-[22px] border border-white/[0.08] p-5 sm:p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:border-white/20"
                    style={{
                      background: `linear-gradient(145deg, ${accentColor.hex}14 0%, #141418 60%)`,
                      borderLeft: `4px solid ${accentColor.hex}`,
                    }}
                  >
                    {/* Header Info */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className="px-3 py-1 rounded-full text-xs font-bold border"
                          style={{
                            backgroundColor: `${accentColor.hex}18`,
                            borderColor: `${accentColor.hex}40`,
                            color: accentColor.hex,
                          }}
                        >
                          Kepada: {item.to_who}
                        </span>
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/5 text-zinc-300 border border-white/10">
                          Dari: {item.sender}
                        </span>
                      </div>
                      <time className="text-[11px] text-zinc-500 font-medium shrink-0">
                        {item.created_at
                          ? new Date(item.created_at).toLocaleString("id-ID", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })
                          : "Baru saja"}
                      </time>
                    </div>

                    {/* Pesan Menfest (Lyrics Typography) */}
                    <p className="text-sm sm:text-base leading-relaxed my-3 font-semibold break-words text-zinc-100">
                      &ldquo;{item.message}&rdquo;
                    </p>

                    {/* Thread Balasan / Replies */}
                    {(() => {
                      const replies = Array.isArray(item.replies)
                        ? item.replies
                        : [];
                      const isExpanded = Boolean(expandedReplies[item.id]);
                      const visibleReplies =
                        isExpanded || replies.length <= 2
                          ? replies
                          : replies.slice(-2);

                      return (
                        <div className="mt-4 space-y-2 border-l-2 border-white/10 pl-3 sm:pl-4">
                          {visibleReplies.map((reply) => (
                            <div
                              key={reply.id}
                              className="rounded-2xl rounded-tl-sm bg-black/30 border border-white/5 px-3.5 py-2.5"
                            >
                              <div className="flex min-w-0 items-center justify-between gap-2">
                                <span className="truncate text-xs font-bold text-zinc-200">
                                  {reply.sender || "Anonim 🎭"}
                                </span>
                                <time className="shrink-0 text-[10px] text-zinc-500">
                                  {reply.created_at
                                    ? new Date(reply.created_at).toLocaleDateString("id-ID")
                                    : "Baru"}
                                </time>
                              </div>
                              <p className="mt-1 break-words text-xs leading-relaxed text-zinc-300">
                                {reply.text}
                              </p>
                            </div>
                          ))}

                          {replies.length > 2 && (
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedReplies((prev) => ({
                                  ...prev,
                                  [item.id]: !isExpanded,
                                }))
                              }
                              className="px-2 text-xs font-bold text-zinc-400 hover:text-white transition"
                            >
                              {isExpanded
                                ? "Sembunyikan balasan ☝️"
                                : `Lihat ${replies.length - 2} balasan lainnya 👇`}
                            </button>
                          )}
                        </div>
                      );
                    })()}

                    {/* Form Balasan */}
                    {replyingTo === item.id && (
                      <form
                        onSubmit={(event) => handleReplySubmit(event, item.id)}
                        className="mt-3.5 space-y-2.5 rounded-[18px] border border-white/10 bg-[#18181D] p-3.5"
                      >
                        <input
                          type="text"
                          value={replySender}
                          onChange={(event) => setReplySender(event.target.value)}
                          placeholder="Nama pengirim (opsional / Anonim)"
                          className="w-full rounded-xl border border-white/10 bg-[#141418] px-3 py-2 text-xs text-white placeholder-zinc-500 outline-none focus:border-white/30"
                        />
                        <textarea
                          required
                          rows={2}
                          maxLength={500}
                          value={replyText}
                          onChange={(event) => setReplyText(event.target.value)}
                          placeholder="Tulis balasan..."
                          className="w-full resize-none rounded-xl border border-white/10 bg-[#141418] px-3 py-2 text-xs text-white placeholder-zinc-500 outline-none focus:border-white/30"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setReplyingTo(null)}
                            className="rounded-full px-3 py-1.5 text-xs font-semibold text-zinc-400 hover:text-white"
                          >
                            Batal
                          </button>
                          <button
                            type="submit"
                            disabled={replySubmitting || !replyText.trim()}
                            className="rounded-full bg-white px-4 py-1.5 text-xs font-bold text-black hover:bg-zinc-200 disabled:opacity-50"
                          >
                            {replySubmitting ? "Mengirim..." : "Kirim Balasan"}
                          </button>
                        </div>
                      </form>
                    )}

                    {/* Bottom Actions: Like, Reply & Copy */}
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/5 pt-3">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Like Button */}
                        <button
                          type="button"
                          onClick={() => handleLike(item.id, item.likes)}
                          className="flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-bold text-rose-400 transition-all hover:bg-rose-500/20 active:scale-95"
                        >
                          <span>❤️</span>
                          <span>{item.likes || 0}</span>
                        </button>

                        {/* Reply Button */}
                        <button
                          type="button"
                          onClick={() =>
                            setReplyingTo(replyingTo === item.id ? null : item.id)
                          }
                          className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-zinc-300 transition hover:bg-white/10 hover:text-white"
                        >
                          <span>💬</span>
                          <span>
                            Balas{" "}
                            {Array.isArray(item.replies) && item.replies.length > 0
                              ? `(${item.replies.length})`
                              : ""}
                          </span>
                        </button>
                      </div>

                      {/* Copy Button */}
                      <button
                        type="button"
                        onClick={() => handleCopy(item.message)}
                        className="flex items-center gap-1.5 rounded-full border border-white/5 bg-white/[0.03] px-3 py-1.5 text-xs text-zinc-400 hover:bg-white/10 hover:text-white transition"
                        title="Salin isi pesan"
                      >
                        <span>📋</span>
                        <span className="hidden sm:inline">Salin</span>
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
