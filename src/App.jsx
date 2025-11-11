import "./index.css";
import React, { useState, useEffect } from "react";
import { DndContext, useDroppable, DragOverlay } from "@dnd-kit/core";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { tr } from "date-fns/locale";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import EventCard from "./components/EventCard";
import SortableEventCard from "./components/SortableEventCard";

const daysOfWeek = [
  "Pazartesi",
  "Salı",
  "Çarşamba",
  "Perşembe",
  "Cuma",
  "Cumartesi",
  "Pazar",
];

// Tarihi "2025-11-03" gibi key'e çeviren fonksiyon
const getDateKey = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
};
// İstediğimiz haftanın günlerini (gün adı + tarih + iso) döndürür
function getWeekDates(weekOffset = 0) {
  const now = new Date();
  const monday = new Date(now);
  monday.setHours(0, 0, 0, 0);

  // Bu haftanın pazartesini bul
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));

  // weekOffset kadar hafta kaydır (negatif = geçmiş, pozitif = gelecek)
  monday.setDate(monday.getDate() + weekOffset * 7);

  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);

    return {
      day: daysOfWeek[i],
      dateLabel: date.toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "short",
      }),
      year: date.getFullYear(),
      iso: date.toISOString().slice(0, 10), // 2025-11-03 gibi
    };
  });
}

const defaultData = daysOfWeek.reduce((acc, day) => {
  acc[day] = [];
  return acc;
}, {});

function DayColumn({
  day,
  dateLabel,
  iso,
  eventsForDay,
  onToggle,
  onDelete,
  onNoteChange,
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: iso,
    data: { type: "day", dateKey: iso },
  });

  const [dayNumber, monthLabel] = dateLabel.split(" "); // "11 Kas" -> ["11", "Kas"]

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col rounded-2xl bg-slate-900/80 border border-slate-800 px-4 py-3 min-h-[260px] transition-all ${
        isOver
          ? "ring-2 ring-blue-500/80 shadow-lg shadow-blue-500/20"
          : "hover:border-slate-700"
      }`}
    >
      <header className="flex items-center justify-between mb-4 gap-2">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium tracking-wide uppercase text-slate-400">
            {day}
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-slate-50">
              {dayNumber}
            </span>
            <span className="rounded-full border border-slate-700 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-300">
              {monthLabel}
            </span>
          </div>
        </div>
      </header>

      {eventsForDay?.length ? (
        <SortableContext
          items={eventsForDay.map((e) => e.id)}
          strategy={verticalListSortingStrategy}
        >
          {eventsForDay.map((e) => (
            <SortableEventCard key={e.id} id={e.id} dateKey={iso}>
              <EventCard
                event={e}
                dateKey={iso}
                onToggle={onToggle}
                onDelete={onDelete}
                onNoteChange={onNoteChange}
              />
            </SortableEventCard>
          ))}
        </SortableContext>
      ) : null}
    </div>
  );
}

export default function App() {
  // Kullanıcının tanımladığı sporlar (örnek başlangıç)
  const [showModal, setShowModal] = useState(false);
  const [newSport, setNewSport] = useState({ name: "", emoji: "" });
  const [events, setEventsForDay] = useState(() => {
    const saved = localStorage.getItem("events");
    return saved ? JSON.parse(saved) : defaultData;
  });
  const [activeEvent, setActiveEvent] = useState(null);
  const [eventType, setEventType] = useState("");

  const [newEvent, setNewEvent] = useState({
    day: "Pazartesi",
    title: "",
    date: new Date(),
  });

  // Hafta kaydırma için: 0 = bu hafta, -1 = bir önceki, +1 = sonraki...
  const [weekOffset, setWeekOffset] = useState(0);
  const weekDates = getWeekDates(weekOffset);
  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveEvent(null); // 👈 drag bitince overlay'i temizle

    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    // Drag edilen event için kaynak gün ve id
    const sourceDateKey = activeData?.dateKey;
    const activeId = activeData?.id;

    if (!sourceDateKey || !activeId) return;

    setEventsForDay((prev) => {
      const sourceList = prev[sourceDateKey] || [];

      // Kaynak listedeki event'i bul
      const oldIndex = sourceList.findIndex((e) => e.id === activeId);
      if (oldIndex === -1) return prev;
      const item = sourceList[oldIndex];

      // ---- 1) AYNI GÜN İÇİNDE SIRALAMA ----
      if (
        overData?.type === "event" && // bir event'in üstüne bırakıldıysa
        overData.dateKey === sourceDateKey && // aynı güne aitse
        overData.id !== activeId // kendisi değilse
      ) {
        const newIndex = sourceList.findIndex((e) => e.id === overData.id);
        if (newIndex === -1 || newIndex === oldIndex) return prev;

        const reordered = arrayMove(sourceList, oldIndex, newIndex);

        return {
          ...prev,
          [sourceDateKey]: reordered,
        };
      }

      // ---- 2) FARKLI GÜNE TAŞIMA ----
      // Hedef günü overData'dan oku (gün kolonuna da, başka günün event'ine de bıraksan aynı)
      let targetDateKey = sourceDateKey;

      if (overData?.type === "day" || overData?.type === "event") {
        targetDateKey = overData.dateKey;
      }

      // Hedef gün yoksa ya da zaten aynı günse: bir şey yapma
      if (!targetDateKey || targetDateKey === sourceDateKey) {
        return prev;
      }

      const newSourceList = sourceList.filter((e) => e.id !== activeId);
      const targetList = prev[targetDateKey] || [];
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

  const deleteEvent = (dateKey, id) => {
    setEventsForDay((prev) => ({
      ...prev,
      [dateKey]: prev[dateKey].filter((w) => w.id !== id),
    }));
  };

  const updateNote = (dateKey, id, note) => {
    setEventsForDay((prev) => ({
      ...prev,
      [dateKey]: prev[dateKey].map((w) => (w.id === id ? { ...w, note } : w)),
    }));
  };

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="p-6 flex flex-col items-center bg-black min-h-screen text-white">
        <div className="flex justify-between items-center w-full max-w-5xl mb-4">
          <button
            onClick={() => setWeekOffset(weekOffset - 1)}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded"
          >
            ← Önceki Haftalar
          </button>

          <h1 className="text-2xl font-bold text-white">
            Event Tracker{" "}
            <span className="text-gray-400 ml-2">{weekDates[0].year}</span>
          </h1>

          <button
            onClick={() => setWeekOffset(weekOffset + 1)}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded"
          >
            Sonraki Haftalar →
          </button>
        </div>
        <h1 className="text-3xl font-bold mb-4">Event Planner</h1>
        {/* Yeni spor ekleme */}
        <div className="flex flex-wrap gap-2 items-center mb-8">
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
            dateFormat="dd MMMM"
            className="bg-gray-800 border border-gray-700 px-3 py-2 rounded text-white w-40 text-center"
          />
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
          >
            ➕ Yeni Event
          </button>
        </div>
        {/* Haftalık görünüm */}
        <div className="p-6 flex flex-col items-center bg-black min-h-screen text-white">
          {/* Haftalık görünüm */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 w-full max-w-5xl mt-6">
            {weekDates.map(({ day, dateLabel, iso }) => (
              <DayColumn
                key={iso}
                day={day}
                dateLabel={dateLabel}
                iso={iso}
                eventsForDay={events[iso] || []}
                onToggle={toggleCompleted}
                onDelete={deleteEvent}
                onNoteChange={updateNote}
              />
            ))}
          </div>

          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
              <div className="bg-gray-900 p-6 rounded-xl shadow-lg w-80">
                <h2 className="text-lg font-semibold mb-3">Yeni Event Ekle</h2>
                <select
                  className="w-full bg-gray-800 border border-gray-700 px-3 py-2 rounded mb-3 text-white"
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                >
                  <option value="" disabled hidden>
                    Select Event
                  </option>
                  <option value="spor">Spor</option>
                  <option value="art">Sanat</option>
                  <option value="restoran">Restoran</option>
                  <option value="ev">Ev</option>
                </select>

                <input
                  type="text"
                  placeholder="Event Adı (Koşu, Film, Akşam Yemeği...)"
                  className="w-full bg-gray-800 border border-gray-700 px-3 py-2 rounded mb-3 text-white"
                  value={newSport.name}
                  onChange={(e) =>
                    setNewSport({ ...newSport, name: e.target.value })
                  }
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

                <div className="flex justify-between">
                  <button
                    onClick={() => {
                      if (
                        !newSport.name ||
                        !newSport.emoji ||
                        !eventType ||
                        !newEvent.date
                      )
                        return;

                      const dateKey = getDateKey(newEvent.date);

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
                          },
                        ],
                      }));

                      setNewSport({ name: "", emoji: "" });
                      setEventType("");
                      setShowModal(false);
                    }}
                    className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
                  >
                    Kaydet
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
                    className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded"
                  >
                    İptal
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        );
      </div>
      <DragOverlay>
        {activeEvent ? (
          <EventCard
            event={activeEvent}
            dateKey="" // overlay'de handlers no-op olduğu için önemli değil
            onToggle={() => {}}
            onDelete={() => {}}
            onNoteChange={() => {}}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
