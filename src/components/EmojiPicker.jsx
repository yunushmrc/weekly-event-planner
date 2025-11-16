// src/components/EmojiPicker.jsx
import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Sparkles, Smile } from "lucide-react";
import emojiData from "../data/emojiSet.json";

// JSON key -> ekranda görünen kategori adı
const CATEGORY_LABELS = {
  recent: "Son Kullanılanlar",
  people: "İfadeler",
  sports: "Spor",
  activities: "Aktiviteler",
  food: "Yiyecek & İçecek",
  home: "Ev & Günlük",
  places: "Mekanlar",
  objects: "Objeler",
  symbols: "Semboller",
};

const RECENT_STORAGE_KEY = "eventPlanner_recentEmojis";

// Küçük yardımcı: localStorage güvenli okuma/yazma
function loadRecentFromStorage() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveRecentToStorage(list) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(list));
  } catch {
    // sessiz geç
  }
}

/**
 * EmojiPicker
 *
 * Props:
 *  - value?: string          → mevcut seçili emoji (önizleme için)
 *  - onChange(emoji: string) → kullanıcı bir emoji seçtiğinde çağrılır
 *  - onClose?()              → X butonuna veya dışarı tıklamada kullanılabilir (şimdilik parent'ta ayarlarsın)
 *  - className?: string      → pozisyon/stil override için
 */
export default function EmojiPicker({
  value,
  onChange,
  onClose,
  className = "",
}) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("people");
  const [recent, setRecent] = useState([]);

  // İlk açılışta recent oku
  useEffect(() => {
    setRecent(loadRecentFromStorage());
  }, []);

  // Kategorileri JSON'dan üret
  const categories = useMemo(() => {
    const baseKeys = Object.keys(emojiData); // people, sports, ...
    const withRecent = recent.length ? ["recent", ...baseKeys] : baseKeys;
    return withRecent;
  }, [recent]);

  // Aktif kategoriye göre liste
  const currentList = useMemo(() => {
    // Arama varsa: tüm emojiler arasında filtrele
    if (search.trim()) {
      const term = search.trim().toLowerCase();
      const all = Object.values(emojiData).flatMap((arr) => arr);
      return all.filter(
        (e) =>
          e.name.toLowerCase().includes(term) ||
          (e.char && e.char.toString().includes(term))
      );
    }

    // Arama yoksa: seçili kategoriyi göster
    if (activeCategory === "recent") {
      return recent;
    }

    return emojiData[activeCategory] || [];
  }, [search, activeCategory, recent]);

  const handleSelect = (emojiObj) => {
    const char = emojiObj.char || "";
    if (!char) return;

    // OnChange'i tetikle
    onChange?.(char);

    // Recent listesi güncelle (en başa ekle, uniq tut, max 20)
    setRecent((prev) => {
      const filtered = prev.filter((e) => e.char !== char);
      const next = [{ char, name: emojiObj.name }, ...filtered].slice(0, 20);
      saveRecentToStorage(next);
      return next;
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 4 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 4 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        className={`rounded-2xl border border-slate-700 bg-slate-900/95 shadow-2xl shadow-black/60 p-4 
          w-[360px] max-h-[420px] flex flex-col ${className}`}
      >
        {/* Üst bar: başlık + kapat + mevcut emoji preview */}
        <div className="flex items-center justify-between mb-3 gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-semibold text-slate-100">
              Emoji Seç
            </span>
          </div>

          <div className="flex items-center gap-2">
            {value && (
              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-slate-800 border border-slate-600 text-lg">
                {value}
              </div>
            )}
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 transition-colors"
                aria-label="Kapat"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Arama kutusu */}
        <div className="relative mb-3">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Ara (movie, run, burger...)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-full pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/70"
          />
        </div>

        {/* Kategori sekmeleri */}
        <div className="flex items-center gap-1 mb-3 overflow-x-auto emoji-scroll-x">
          {categories.map((key) => {
            const isActive = key === activeCategory;
            const label = CATEGORY_LABELS[key] || key;

            // küçük ikon (sadece görsel dokunuş, çok önemli değil)
            const Icon =
              key === "people"
                ? Smile
                : key === "sports"
                ? Sparkles
                : key === "recent"
                ? Search
                : null;

            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setActiveCategory(key);
                  setSearch(""); // kategori değişince aramayı temizle
                }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] whitespace-nowrap transition-all border ${
                  isActive
                    ? "bg-emerald-500/15 border-emerald-400 text-emerald-100"
                    : "bg-slate-900/70 border-slate-700 text-slate-400 hover:bg-slate-800/80"
                }`}
              >
                {Icon && <Icon className="w-3 h-3" />}
                <span>{label}</span>
              </button>
            );
          })}
        </div>
        {/* Emoji grid'i – sadece dikey scroll, yatay bar yok */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden pr-1 pb-1 mt-1 rounded-xl bg-slate-950/60 emoji-scroll">
          {currentList.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-500">
              Hiç emoji bulunamadı.
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1.5 place-items-center">
              {currentList.map((e) => (
                <motion.button
                  key={`${e.char}-${e.name}`}
                  type="button"
                  onClick={() => handleSelect(e)}
                  whileHover={{ scale: 1.12 }}
                  whileTap={{ scale: 0.9 }}
                  className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-900/60 hover:bg-slate-800 border border-slate-700/80 text-lg"
                  title={e.name}
                >
                  {e.char}
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
