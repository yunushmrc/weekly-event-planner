import EventNoteField from "./EventNoteField";
import { CheckCircle, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

// Tek noktadan yönetilen event varyantları
const EVENT_VARIANTS = {
  spor: {
    label: "Spor",
    cardClass:
      "bg-gradient-to-br from-emerald-950/60 via-emerald-900/40 to-emerald-800/30 border-emerald-700/60 hover:ring-emerald-500/80",
    chipClass:
      "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30",
  },
  art: {
    label: "Art",
    cardClass:
      "bg-gradient-to-br from-amber-950/60 via-amber-900/40 to-amber-800/30 border-amber-700/60 hover:ring-amber-500/80",
    chipClass: "bg-amber-500/10 text-amber-200 border border-amber-500/30",
  },
  restoran: {
    label: "Restoran",
    cardClass:
      "bg-gradient-to-br from-rose-950/60 via-rose-900/40 to-rose-800/30 border-rose-700/60 hover:ring-rose-500/80",
    chipClass: "bg-rose-500/10 text-rose-200 border border-rose-500/30",
  },
  ev: {
    label: "Ev",
    cardClass:
      "bg-gradient-to-br from-sky-950/60 via-sky-900/40 to-sky-800/30 border-sky-700/60 hover:ring-sky-500/80",
    chipClass: "bg-sky-500/10 text-sky-200 border border-sky-500/30",
  },
};

const DEFAULT_VARIANT = {
  label: "Genel",
  cardClass: "bg-slate-900/70 border-slate-700 hover:ring-slate-500/70",
  chipClass: "bg-slate-700/40 text-slate-200 border border-slate-500/40",
};

function getEventVariant(type) {
  if (!type) return DEFAULT_VARIANT;
  const key = type.toString().trim().toLowerCase(); // " Spor " -> "spor"
  return EVENT_VARIANTS[key] || DEFAULT_VARIANT;
}

function EventCard({ event, dateKey, onToggle, onDelete, onNoteChange }) {
  const variant = getEventVariant(event.type);
  const isCompleted = !!event.completed;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={`${
        variant.cardClass
      } rounded-xl shadow-md border mt-2 p-4 flex flex-col gap-3 min-h-[170px] transition-all hover:ring-1 hover:shadow-lg ${
        isCompleted ? "opacity-70 border-dashed" : ""
      }`}
      onPointerDownCapture={(e) => {
        if (e.target.tagName === "TEXTAREA") {
          e.stopPropagation();
        }
      }}
    >
      {/* ÜST: emoji + başlık + kategori etiketi */}
      <div className="flex flex-col gap-1 w-full">
        <div className="flex items-center gap-2">
          {event.emoji && (
            <span className="text-2xl leading-none">{event.emoji}</span>
          )}
          <span
            className={`text-sm font-semibold transition-colors ${
              isCompleted ? "line-through text-gray-500" : "text-gray-100"
            }`}
          >
            {event.title}
          </span>
        </div>

        {event.type && (
          <span
            className={`self-start text-[10px] px-2 py-0.5 rounded-full font-medium capitalize ${
              variant.chipClass
            } ${isCompleted ? "opacity-70" : ""}`}
          >
            {variant.label}
          </span>
        )}
      </div>

      {/* NOT ALANI – modernleştirilmiş alan */}
      <EventNoteField
        dateKey={dateKey}
        eventId={event.id}
        note={event.note}
        onNoteChange={onNoteChange}
      />

      {/* ALT: Sağda tik + çöp */}
      <div className="flex justify-end items-center gap-2 mt-2">
        <motion.button
          onPointerDownCapture={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onToggle(dateKey, event.id); // her zaman toggle
          }}
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: isCompleted ? 1.03 : 1.07 }}
          className={`transition-all duration-200 ${
            isCompleted
              ? "text-gray-400 hover:text-green-400"
              : "text-green-400 hover:text-green-500"
          }`}
          title={isCompleted ? "Tamamlanmayı geri al" : "Tamamla"}
        >
          {isCompleted ? (
            <CheckCircle size={18} className="opacity-70" />
          ) : (
            <CheckCircle2 size={18} className="opacity-100" />
          )}
        </motion.button>

        <button
          onPointerDownCapture={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onDelete(dateKey, event.id);
          }}
          className="text-red-500 hover:text-red-600 active:scale-95 transition-transform duration-150 focus:outline-none focus:ring-2 focus:ring-red-400/40 rounded-full p-1"
          title="Sil"
        >
          <span className="text-lg">🗑️</span>
        </button>
      </div>
    </motion.div>
  );
}

export default EventCard;
