import { useState, useEffect } from "react";

function EventNoteField({ dateKey, eventId, note, onNoteChange }) {
  const [value, setValue] = useState(note || "");

  useEffect(() => {
    setValue(note || "");
  }, [note, eventId]);

  const handleChange = (e) => {
    setValue(e.target.value);
  };

  const handleBlur = () => {
    if (value !== note) {
      onNoteChange(dateKey, eventId, value);
    }
  };

  const handleKeyDown = (e) => {
    // Space: dnd-kit klavye drag'ine gitmesin
    if (e.key === " " || e.code === "Space") {
      e.stopPropagation();
    }
    // Enter: yeni satır oluşturmasın, scroll olmasın
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <textarea
      className="mt-2 w-full bg-gray-950/70 border border-gray-700/80 rounded-lg px-2.5 py-2 text-xs text-gray-200 placeholder:text-gray-500 focus:ring-1 focus:ring-emerald-500/60 focus:border-emerald-500/40 focus:outline-none resize-none overflow-hidden"
      placeholder="Not ekle..."
      value={value}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      maxLength={15}
      rows={2}
      onPointerDownCapture={(e) => e.stopPropagation()}
      onPointerMove={(e) => e.stopPropagation()}
      onPointerUp={(e) => e.stopPropagation()}
    />
  );
}

export default EventNoteField;
