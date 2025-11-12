// src/components/DayColumn.jsx
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import SortableEventCard from "./SortableEventCard";
import EventCard from "./EventCard";

function DayColumn({
  day,
  dateLabel,
  iso,
  eventsForDay,
  onToggle,
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
      className={`flex flex-col w-full rounded-2xl bg-slate-900/80 border border-slate-800 p-4 min-h-[280px] transition-all ${
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
                onNoteChange={onNoteChange}
              />
            </SortableEventCard>
          ))}
        </SortableContext>
      ) : null}
    </div>
  );
}

export default DayColumn;
