// src/components/EventDetailsModal.jsx
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { X, Clock, Palette } from "lucide-react";
import EventNoteField from "./EventNoteField";
import { EVENT_THEMES } from "../config/themeConfig";
import EmojiPicker from "./EmojiPicker";

export default function EventDetailsModal({
  open,
  event,
  dateKey,
  onClose,
  onSave,
}) {
  // --- Hook'lar HER ZAMAN en üstte ---
  const [draft, setDraft] = useState({
    title: event?.title || "",
    note: event?.note || "",
    time: event?.time || "",
    theme: event?.theme || null,
    emoji: event?.emoji || "",
  });

  const [editingTitle, setEditingTitle] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Modal kutusuna fokus atamak için ref
  const modalRef = useRef(null);

  useEffect(() => {
    if (!event) return;
    setDraft({
      title: event.title || "",
      note: event.note || "",
      time: event.time || "",
      theme: event.theme || null,
      emoji: event.emoji || "",
    });
    setEditingTitle(false);
    setShowEmojiPicker(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event?.id]);

  // Modal açıldığında klavye odağını modal kutusuna taşı
  useEffect(() => {
    if (open && modalRef.current) {
      modalRef.current.focus();
    }
  }, [open, event?.id]);

  // Modal kapalıysa / event yoksa hiçbir şey çizme
  if (!open || !event) return null;

  // --- Yardımcı handler'lar ---

  // Başlık inputu: sadece harf + boşluk, max 16 karakter
  const handleTitleInput = (value) => {
    const cleaned = value.replace(/[^A-Za-zÇĞİÖŞÜçğıöşü\s]/g, "").slice(0, 16);

    setDraft((prev) => ({ ...prev, title: cleaned }));
  };

  // Lokal not değişimi (EventNoteField için)
  const handleLocalNoteChange = (_dateKey, _id, value) => {
    setDraft((prev) => ({ ...prev, note: value }));
  };

  // Saat değişimi
  const handleLocalTimeChange = (e) => {
    const v = (e.target.value || "").slice(0, 5); // HH:mm
    setDraft((prev) => ({ ...prev, time: v }));
  };

  // Tema değişimi
  const handleThemeChange = (key) => {
    setDraft((prev) => ({ ...prev, theme: key }));
  };

  // Kaydet
  const handleSave = () => {
    onSave({
      ...event,
      title: draft.title,
      note: draft.note,
      time: draft.time,
      theme: draft.theme,
      emoji: draft.emoji || event.emoji || "🏷️",
    });
    setShowEmojiPicker(false);
    onClose();
  };

  // İptal
  const handleCancel = () => {
    setShowEmojiPicker(false);
    onClose();
  };

  // Modal içinde klavye kısayolları
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      handleCancel();
    }
  };

  // --- Render ---
  return (
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

      {/* Modal kutusu */}
      <motion.div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        onKeyDown={handleKeyDown}
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
          {/* Emoji kutusu + picker */}
          <div className="shrink-0 relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowEmojiPicker((v) => !v);
              }}
              className="rounded-xl bg-slate-800/60 border border-slate-700 w-16 h-16 flex items-center justify-center text-3xl hover:border-emerald-500/70 hover:bg-slate-800/80 transition-colors"
              title="Emoji değiştir"
            >
              <span>{draft.emoji || event.emoji || "🏷️"}</span>
            </button>

            {showEmojiPicker && (
              <div
                className="absolute z-[92] mt-2 left-1/2 -translate-x-1/2"
                onClick={(e) => e.stopPropagation()}
              >
                <EmojiPicker
                  value={draft.emoji || event.emoji}
                  onChange={(char) => {
                    setDraft((prev) => ({ ...prev, emoji: char }));
                    setShowEmojiPicker(false);
                  }}
                  onClose={() => setShowEmojiPicker(false)}
                />
              </div>
            )}
          </div>

          <div className="flex-1">
            {/* Başlık: tıklayınca edit mode */}
            {editingTitle ? (
              <div className="flex items-center gap-2">
                <input
                  autoFocus
                  value={draft.title}
                  onChange={(e) => handleTitleInput(e.target.value)}
                  onBlur={() => setEditingTitle(false)}
                  maxLength={16}
                  className="w-full max-w-sm bg-slate-800/70 border border-slate-700 rounded-lg px-3 py-2 text-base text-slate-50 focus:outline-none focus:ring-1 focus:ring-emerald-500/60"
                />
              </div>
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

            <div className="mt-1 text-xs uppercase tracking-wide text-slate-400">
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

            {/* Tema */}
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
                      <span className={`w-4 h-4 rounded-full ${t.dotClass}`} />
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
            className="rounded-full px-4 py-2 text-sm bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700/80"
          >
            İptal
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="rounded-full px-5 py-2 text-sm font-semibold bg-emerald-500 text-emerald-950 hover:bg-emerald-400 shadow-md shadow-emerald-500/40"
          >
            Kaydet
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
