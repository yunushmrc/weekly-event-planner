import "./index.css";
import React, { useState, useEffect } from "react";
import { DndContext, DragOverlay } from "@dnd-kit/core";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { tr } from "date-fns/locale";
import EventCard from "./components/EventCard";
import SortableEventCard from "./components/SortableEventCard";
import { getWeekDates, daysOfWeek } from "./utils/weekUtils";
import DayColumn from "./components/DayColumn";
import { arrayMove } from "@dnd-kit/sortable";
import "./datepicker-theme.css";
import { PlusCircle, ChevronLeft, ChevronRight, Palette } from "lucide-react";
import AlertModal from "./components/AlertModal";
import TrashDropzone from "./components/TrashDropzone";
import EventDetailsModal from "./components/EventDetailsModal";
import { EVENT_THEMES } from "./config/themeConfig";

// Tarihi "2025-11-03" gibi key'e çeviren fonksiyon
const getDateKey = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
};

const defaultData = daysOfWeek.reduce((acc, day) => {
  acc[day] = [];
  return acc;
}, {});

export default function App() {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsCtx, setDetailsCtx] = useState({ dateKey: null, event: null });

  const openDetails = (event, dateKey) => {
    setDetailsCtx({ dateKey, event });
    setDetailsOpen(true);
  };

  const closeDetails = () => {
    setDetailsOpen(false);
    setDetailsCtx({ dateKey: null, event: null });
  };

  // Modal içinden gelen patch'i güncelle
  const saveDetailsPatch = (updated) => {
    const { dateKey, event } = detailsCtx;
    if (!dateKey || !event) return;

    setEventsForDay((prev) => {
      const list = prev[dateKey] || [];
      const idx = list.findIndex((x) => x.id === event.id);
      if (idx === -1) return prev;

      const newList = [...list];
      newList[idx] = { ...newList[idx], ...updated };
      return { ...prev, [dateKey]: newList };
    });
  };
  const [isOverTrash, setIsOverTrash] = useState(false);

  const [alert, setAlert] = useState({ open: false, message: "" });

  const showLimitAlert = () =>
    setAlert({
      open: true,
      message: "Bir güne en fazla 3 event ekleyebilirsin.",
    });
  const [showModal, setShowModal] = useState(false);
  const [newSport, setNewSport] = useState({ name: "", emoji: "" });
  const [events, setEventsForDay] = useState(() => {
    const saved = localStorage.getItem("events");
    return saved ? JSON.parse(saved) : defaultData;
  });
  const [activeEvent, setActiveEvent] = useState(null);
  const [eventType, setEventType] = useState("");
  const [newEventTheme, setNewEventTheme] = useState("emerald");

  const [newEvent, setNewEvent] = useState({
    day: "Pazartesi",
    title: "",
    date: new Date(),
    time: "", // "HH:mm"
  });

  // Hafta kaydırma için: 0 = bu hafta, -1 = bir önceki, +1 = sonraki...
  const [weekOffset, setWeekOffset] = useState(0);
  const weekDates = getWeekDates(weekOffset);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveEvent(null); // overlay'i temizle
    setIsOverTrash(false); // çöp-hover bayrağını sıfırla

    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    // Drag edilen kartın kaynak gün ve id'si
    const sourceDateKey = activeData?.dateKey;
    const activeId = activeData?.id;
    if (!sourceDateKey || !activeId) return;

    // ========= 0) ÇÖP'E BIRAKILDIYSA: SİL ve çık =========
    if (over.id === "trash") {
      setEventsForDay((prev) => {
        const src = prev[sourceDateKey] || [];
        const newSrc = src.filter((e) => e.id !== activeId);
        if (newSrc.length === src.length) return prev; // bulunamadı
        return { ...prev, [sourceDateKey]: newSrc };
      });
      return;
    }

    // ========= 1) ÖN KONTROL: Hedef gün dolu mu? =========
    // (Aynı gün içi sıralamada çalışmaz)
    let preCheckTargetKey = null;
    if (overData?.type === "day" || overData?.type === "event") {
      preCheckTargetKey = overData.dateKey;
    }
    if (preCheckTargetKey && preCheckTargetKey !== sourceDateKey) {
      const targetCount = (events[preCheckTargetKey] || []).length;
      if (targetCount >= 3) {
        showLimitAlert(); // "Bir güne en fazla 3 event ekleyebilirsin."
        return; // bırakmayı iptal et
      }
    }

    // ========= 2) ASIL GÜNCELLEME =========
    setEventsForDay((prev) => {
      const sourceList = prev[sourceDateKey] || [];

      // Kaynak listedeki kartı bul
      const oldIndex = sourceList.findIndex((e) => e.id === activeId);
      if (oldIndex === -1) return prev;
      const item = sourceList[oldIndex];

      // ---- 2A) AYNI GÜN İÇİ SIRALAMA ----
      if (
        overData?.type === "event" &&
        overData.dateKey === sourceDateKey &&
        overData.id !== activeId
      ) {
        const newIndex = sourceList.findIndex((e) => e.id === overData.id);
        if (newIndex === -1 || newIndex === oldIndex) return prev;

        const reordered = arrayMove(sourceList, oldIndex, newIndex);
        return { ...prev, [sourceDateKey]: reordered };
      }

      // ---- 2B) FARKLI GÜNE TAŞIMA ----
      let targetDateKey = sourceDateKey;
      if (overData?.type === "day" || overData?.type === "event") {
        targetDateKey = overData.dateKey;
      }
      if (!targetDateKey || targetDateKey === sourceDateKey) return prev;

      const targetList = prev[targetDateKey] || [];

      // ---- 2C) GÜVENLİK: setState içinde de limit kontrolü ----
      if (targetList.length >= 3) {
        setTimeout(showLimitAlert, 0);
        return prev;
      }

      const newSourceList = sourceList.filter((e) => e.id !== activeId);
      const targetDate = new Date(targetDateKey);

      return {
        ...prev,
        [sourceDateKey]: newSourceList,
        [targetDateKey]: [...targetList, { ...item, date: targetDate }],
      };
    });
  };

  const handleDragStart = (event) => {
    const { active } = event;
    const activeData = active.data.current;

    if (activeData?.type !== "event") return;

    const dayKey = activeData.dateKey;
    const eventId = activeData.id;

    // events: şu an zaten DayColumn'a "events[iso] || []" diye geçtiğin state
    const dayEvents = events[dayKey] || [];
    const item = dayEvents.find((e) => e.id === eventId);

    setActiveEvent(item || null);
  };

  useEffect(() => {
    localStorage.setItem("events", JSON.stringify(events));
  }, [events]);

  const toggleCompleted = (dateKey, id) => {
    setEventsForDay((prev) => ({
      ...prev,
      [dateKey]: prev[dateKey].map((w) =>
        w.id === id ? { ...w, completed: !w.completed } : w
      ),
    }));
  };

  const updateNote = (dateKey, id, note) => {
    {
      setEventsForDay((prev) => ({
        ...prev,
        [dateKey]: prev[dateKey].map((w) => (w.id === id ? { ...w, note } : w)),
      }));
    }
  };
  const handleNewEventNameChange = (value) => {
    const cleaned = value.replace(/[^A-Za-zÇĞİÖŞÜçğıöşü\s]/g, "").slice(0, 16);

    setNewSport((prev) => ({ ...prev, name: cleaned }));
  };

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragOver={(e) => setIsOverTrash(e.over?.id === "trash")}
      onDragEnd={handleDragEnd}
    >
      <div className="relative p-6 flex flex-col items-center bg-black min-h-screen text-white">
        {/* BAŞLIK */}
        <h1 className="text-3xl font-bold mb-6">Event Planner</h1>

        {/* TARİH SEÇİCİ + YENİ EVENT */}
        <div className="flex items-center gap-4 mb-8">
          <DatePicker
            selected={newEvent.date}
            onChange={(date) => {
              setNewEvent({
                ...newEvent,
                date,
                day: daysOfWeek[(date.getDay() + 6) % 7], // Haftayı pazartesiden başlatır
              });
            }}
            locale={tr}
            dateFormat="dd MMMM yyyy"
            className="bg-slate-900 border border-slate-700 rounded-full px-5 py-2 text-sm text-slate-100 text-center shadow-md shadow-black/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
          />

          <button
            onClick={() => {
              setNewEvent((prev) => ({
                ...prev,
                time: "", // 👈 popup açılmadan önce saat temizleniyor
              }));
              setShowModal(true);
            }}
            className="inline-flex items-center gap-2 rounded-full bg-emerald-500 hover:bg-emerald-400 px-5 py-2.5 text-sm font-semibold text-emerald-950 shadow-md shadow-emerald-500/40 transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            Event Ekle
          </button>
        </div>

        {/* HAFTALIK GÖRÜNÜM – TEK GRID */}
        <div className="w-full max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 auto-rows-max gap-6 mt-4">
            {weekDates.map(({ day, dateLabel, iso }) => (
              <DayColumn
                key={iso}
                day={day}
                dateLabel={dateLabel}
                iso={iso}
                eventsForDay={events[iso] || []}
                onToggle={toggleCompleted}
                onNoteChange={updateNote}
                onOpenDetails={openDetails}
              />
            ))}
          </div>
        </div>

        {/* HAFTALAR ARASI GEÇİŞ OKLARI – EKRAN ORTASI, SAĞ/SOL */}
        <button
          onClick={() => setWeekOffset(weekOffset - 1)}
          className="fixed left-6 top-1/2 -translate-y-1/2 inline-flex items-center justify-center h-9 w-9 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 shadow-lg shadow-black/40 transition-colors z-20"
          aria-label="Önceki hafta"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <button
          onClick={() => setWeekOffset(weekOffset + 1)}
          className="fixed right-6 top-1/2 -translate-y-1/2 inline-flex items-center justify-center h-9 w-9 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 shadow-lg shadow-black/40 transition-colors z-20"
          aria-label="Sonraki hafta"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* MODAL */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
            <div className="bg-slate-900/95 p-6 rounded-2xl shadow-2xl border border-slate-700 w-[420px]">
              <h2 className="text-xl font-semibold text-slate-50 mb-4">
                Event Ekle
              </h2>

              <select
                className="w-full bg-gray-800 border border-gray-700 px-3 py-2 rounded mb-3 text-white"
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
              >
                <option value="" disabled hidden>
                  Event Tipleri
                </option>
                <option value="spor">Spor</option>
                <option value="art">Sanat</option>
                <option value="restoran">Restoran</option>
                <option value="ev">Ev</option>
              </select>

              <input
                type="text"
                placeholder="Event Adı"
                className="w-full bg-gray-800 border border-gray-700 px-3 py-2 rounded mb-3 text-white"
                value={newSport.name}
                onChange={(e) => handleNewEventNameChange(e.target.value)}
                maxLength={16}
              />

              <input
                type="text"
                placeholder="Emoji"
                className="w-full bg-gray-800 border border-gray-700 px-3 py-2 rounded mb-4 text-white"
                value={newSport.emoji}
                onChange={(e) =>
                  setNewSport({ ...newSport, emoji: e.target.value })
                }
              />
              {/* Tema seçimi – renkli dot'lar */}
              <div className="mb-4">
                <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-300">
                  <Palette className="w-3.5 h-3.5" /> Tema
                </div>
                <div className="flex items-center gap-3">
                  {EVENT_THEMES.map((t) => {
                    const selected = newEventTheme === t.key;
                    return (
                      <button
                        key={t.key}
                        type="button"
                        onClick={() => setNewEventTheme(t.key)}
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

              <div className="mb-3">
                <label className="block text-xs text-slate-300 mb-1">
                  Saat
                </label>
                <input
                  type="time"
                  value={newEvent.time || ""} // 👈 state’ten oku
                  onChange={(e) =>
                    setNewEvent((prev) => ({
                      ...prev,
                      time: (e.target.value || "").slice(0, 5), // HH:mm
                    }))
                  }
                  step="60"
                  className="w-40 bg-slate-950/70 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-slate-200 focus:ring-1 focus:ring-emerald-500/60 focus:outline-none"
                  required
                />
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => {
                    if (
                      !newSport.name ||
                      !newSport.emoji ||
                      !eventType ||
                      !newEvent.date ||
                      !newEvent.time
                    )
                      return;

                    const dateKey = getDateKey(newEvent.date);

                    // ⛔ Gün başına 3 kart sınırı
                    const currentCount = (events[dateKey] || []).length;
                    if (currentCount >= 3) {
                      setShowModal(false); // istersen kapatma; açık kalsın dersen bu satırı sil
                      showLimitAlert();
                      return;
                    }

                    setEventsForDay((prev) => ({
                      ...prev,
                      [dateKey]: [
                        ...(prev[dateKey] || []),
                        {
                          id: Date.now(),
                          title: newSport.name,
                          emoji: newSport.emoji,
                          type: eventType,
                          completed: false,
                          note: "",
                          date: newEvent.date,
                          time: newEvent.time, // 👈 KAYDA YAZ
                          theme: newEventTheme,
                        },
                      ],
                    }));

                    setNewSport({ name: "", emoji: "" });
                    setEventType("");
                    setNewEventTheme("emerald"); // default'a dön
                    setNewEvent((prev) => ({
                      ...prev,
                      time: "", // 👈 kayıttan sonra da temizle
                    }));
                    setShowModal(false);
                  }}
                  className="rounded-full bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-sm font-medium text-emerald-950"
                >
                  Kaydet
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="rounded-full bg-slate-800 hover:bg-slate-700 px-4 py-2 text-sm font-medium border border-slate-700 text-slate-200"
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <EventDetailsModal
        open={detailsOpen}
        event={detailsCtx.event}
        dateKey={detailsCtx.dateKey}
        onClose={closeDetails}
        onSave={saveDetailsPatch}
        onNoteChange={updateNote}
      />
      <TrashDropzone />

      <AlertModal
        open={alert.open}
        message={alert.message}
        onClose={() => setAlert({ open: false, message: "" })}
      />
      <DragOverlay>
        {activeEvent ? (
          <EventCard
            event={activeEvent}
            dateKey=""
            onToggle={() => {}}
            onNoteChange={() => {}}
            shrink={isOverTrash}
            deletePreview={isOverTrash} // 👈 kırmızı alarm modu
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
