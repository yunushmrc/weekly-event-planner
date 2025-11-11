import { CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

function EventCard({ event, dateKey, onToggle, onDelete, onNoteChange }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="bg-gray-800 rounded-xl shadow-md border border-gray-700 mt-2 p-3 flex flex-col gap-2 transition-all hover:ring-1 hover:ring-gray-600 hover:shadow-lg"
    >
      {/* ÜST: emoji + başlık + tip */}
      <div className="flex flex-col items-start gap-1">
        <div className="flex items-center gap-2">
          {event.emoji && <span className="text-2xl">{event.emoji}</span>}
          <span
            className={`text-sm font-semibold transition-colors ${
              event.completed
                ? "line-through text-gray-500"
                : "text-gray-100"
            }`}
          >
            {event.title}
          </span>
        </div>

        {event.type && (
          <span className="text-xs text-gray-400 capitalize">
            {event.type}
          </span>
        )}

        {/* NOT ALANI */}
        <textarea
          className="mt-1 w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-xs text-gray-200 focus:ring-1 focus:ring-blue-400 focus:outline-none"
          placeholder="Not ekle..."
          value={event.note || ""}
          onChange={(e) =>
            onNoteChange(dateKey, event.id, e.target.value)
          }
        />
      </div>

      {/* ALT: Sağda tik + çöp */}
      <div className="flex justify-end items-center gap-2 mt-2">
        <button
          onPointerDownCapture={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onToggle(dateKey, event.id);
          }}
          className="text-green-400 hover:text-green-500 active:scale-95 transition-transform duration-150"
          title="Tamamlandı"
        >
          <CheckCircle2 size={18} />
        </button>

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
