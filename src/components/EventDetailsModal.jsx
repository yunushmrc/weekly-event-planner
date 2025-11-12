import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { X, Clock, Palette } from "lucide-react";
import EventNoteField from "./EventNoteField";
import { EVENT_THEMES } from "../config/themeConfig";



export default function EventDetailsModal({
  open,
  event,
  dateKey,
  onClose,
  onSave, // (patchedEvent) => void
  onNoteChange, // imzada dursun, içeride local kullanıyoruz
}) {
  if (!open || !event) return null;

  // --- Modal içi LOCAL draft state ---
  const [draft, setDraft] = useState({
    title: event.title || "",
    note: event.note || "",
    time: event.time || "",
    theme: event.theme || null,
  });

  const [editingTitle, setEditingTitle] = useState(false);

  // Modal her açıldığında / event değiştiğinde draft'ı sıfırla
  useEffect(() => {
    setDraft({
      title: event.title || "",
      note: event.note || "",
      time: event.time || "",
      theme: event.theme || null,
    });
    setEditingTitle(false);
  }, [event?.id, open]);

  // Lokal not değişimi
  const handleLocalNoteChange = (_dateKey, _id, value) => {
    setDraft((prev) => ({ ...prev, note: value }));
  };

  // Lokal saat değişimi
  const handleLocalTimeChange = (e) => {
    const v = (e.target.value || "").slice(0, 5); // HH:mm
    setDraft((prev) => ({ ...prev, time: v }));
  };

  // Lokal tema değişimi
  const handleThemeChange = (key) => {
    setDraft((prev) => ({ ...prev, theme: key }));
  };

  const handleTitleInput = (value) => {
    // Sadece harf (Türkçe dahil) ve boşluk, en fazla 16 karakter
    const cleaned = value.replace(/[^A-Za-zÇĞİÖŞÜçğıöşü\s]/g, "").slice(0, 16);

    setDraft((prev) => ({ ...prev, title: cleaned }));
  };

  const handleSave = () => {
    onSave({
      ...event,
      title: draft.title,
      note: draft.note,
      time: draft.time,
      theme: draft.theme,
    });
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[90] flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Arka plan */}
        <div
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={handleCancel}
        />

        {/* Modal */}
        <motion.div
          role="dialog"
          aria-modal="true"
          className="relative z-[91] w-[60vw] max-w-4xl rounded-2xl border border-slate-700 bg-slate-900/95 shadow-2xl shadow-black/60 p-6"
          initial={{ y: 20, scale: 0.98, opacity: 0 }}
          animate={{ y: 0, scale: 1, opacity: 1 }}
          exit={{ y: 20, scale: 0.98, opacity: 0 }}
        >
          {/* Kapat (X) */}
          <button
            onClick={handleCancel}
            className="absolute right-3 top-3 rounded-full p-2 text-slate-300 hover:text-white hover:bg-slate-800/80"
            aria-label="Kapat"
          >
            <X className="w-4 h-4" />
          </button>

          {/* ÜST: Emoji + başlık + tip */}
          <div className="flex items-start gap-4 mb-6">
            <div className="shrink-0 rounded-xl bg-slate-800/60 border border-slate-700 w-20 h-20 flex items-center justify-center text-4xl shadow-inner">
              <span>{event.emoji || "🏷️"}</span>
            </div>

            <div className="flex-1">
              {/* Başlık: tıklayınca edit mode */}
              {editingTitle ? (
                <input
                  autoFocus
                  value={draft.title}
                  onChange={(e) => handleTitleInput(e.target.value)}
                  onBlur={() => setEditingTitle(false)}
                  maxLength={16}
                  className="w-full max-w-sm bg-slate-800/70 border border-slate-700 rounded-lg px-3 py-2 text-base text-slate-50 focus:outline-none focus:ring-1 focus:ring-emerald-500/60"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setEditingTitle(true)}
                  className="text-left"
                  title="İsmi düzenlemek için tıkla"
                >
                  <h2 className="text-xl font-semibold text-slate-50">
                    {draft.title || "Yeni Etkinlik"}
                  </h2>
                </button>
              )}

              <div className="mt-2 text-[11px] uppercase tracking-wide text-slate-500">
                {event.type || "event"}
              </div>
            </div>
          </div>

          {/* İÇERİK: Not + Saat + Tema */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Not */}
            <div>
              <div className="mb-2 text-xs font-medium text-slate-300">Not</div>
              <EventNoteField
                dateKey={dateKey}
                eventId={event.id}
                note={draft.note}
                onNoteChange={handleLocalNoteChange}
              />
              <div className="mt-1 text-[10px] text-slate-500">
                Maks. 30 karakter
              </div>
            </div>

            {/* Saat + Tema */}
            <div className="space-y-5">
              {/* Saat */}
              <div>
                <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-300">
                  <Clock className="w-3.5 h-3.5" /> Tam Saat
                </div>
                <input
                  type="time"
                  value={draft.time || ""}
                  onChange={handleLocalTimeChange}
                  step="60"
                  className="w-40 bg-slate-950/70 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-slate-200 focus:ring-1 focus:ring-emerald-500/60 focus:outline-none"
                />
              </div>

              {/* Tema – sadece renkli dot'lar */}
              <div>
                <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-300">
                  <Palette className="w-3.5 h-3.5" /> Tema
                </div>
                <div className="flex items-center gap-3">
                  {EVENT_THEMES.map((t) => {
                    const selected = draft.theme === t.key;
                    return (
                      <button
                        key={t.key}
                        type="button"
                        onClick={() => handleThemeChange(t.key)}
                        className={`
                          relative flex items-center justify-center 
                          w-7 h-7 rounded-full border 
                          transition-all duration-150
                          ${
                            selected
                              ? "border-emerald-400 ring-2 ring-emerald-400/70 scale-105"
                              : "border-slate-600 hover:border-slate-400"
                          }
                        `}
                        aria-label={t.label}
                        title={t.label}
                      >
                        <span
                          className={`w-4 h-4 rounded-full ${t.dotClass}`}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* ALT: butonlar */}
          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-full px-5 py-2 text-sm bg-slate-800/70 
                border border-slate-700 text-slate-300 
                hover:bg-slate-700/60 active:scale-95 transition-all"
            >
              İptal
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="rounded-full px-6 py-2 text-sm font-semibold
                bg-emerald-500 text-emerald-950 
                hover:bg-emerald-400 
                shadow-lg shadow-emerald-600/30
                active:scale-95 transition-all"
            >
              Kaydet
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
