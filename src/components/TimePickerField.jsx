// src/components/TimePickerField.jsx
import React from "react";

/**
 * value: "HH:mm" veya "" (ör: "18:30")
 * onChange: (timeString) => void
 */
export default function TimePickerField({ value, onChange }) {
  // value'dan saat/dakika çıkar
  let hour = "";
  let minute = "";

  if (value && typeof value === "string" && value.includes(":")) {
    const [h, m] = value.split(":");
    hour = h ?? "";
    minute = m ?? "";
  }

  const handleHourChange = (e) => {
    const newHour = e.target.value;
    if (!newHour) {
      onChange("");
      return;
    }
    const mm = minute || "00";
    onChange(`${newHour}:${mm}`);
  };

  const handleMinuteChange = (e) => {
    const newMinute = e.target.value;
    if (!newMinute) {
      onChange("");
      return;
    }
    const hh = hour || "00";
    onChange(`${hh}:${newMinute}`);
  };

  const hourOptions = Array.from({ length: 24 }, (_, i) =>
    String(i).padStart(2, "0")
  );
  const minuteOptions = ["00", "15", "30", "45"];

  return (
    <div className="inline-flex items-center gap-2 rounded-xl bg-slate-950/60 border border-slate-700/80 px-3 py-2">
      {/* Saat */}
      <select
        value={hour}
        onChange={handleHourChange}
        className="bg-transparent text-sm text-slate-100 focus:outline-none focus:ring-0"
      >
        <option value="">--</option>
        {hourOptions.map((h) => (
          <option key={h} value={h}>
            {h}
          </option>
        ))}
      </select>

      <span className="text-slate-500 text-sm">:</span>

      {/* Dakika */}
      <select
        value={minute}
        onChange={handleMinuteChange}
        className="bg-transparent text-sm text-slate-100 focus:outline-none focus:ring-0"
      >
        <option value="">--</option>
        {minuteOptions.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>
    </div>
  );
}
