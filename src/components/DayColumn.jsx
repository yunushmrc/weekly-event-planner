import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import SortableEventCard from "./SortableEventCard";
import EventCard from "./EventCard";

function DayColumn({
  day,
  dateLabel,
  iso,
  eventsForDay,
  onToggle,
  onNoteChange,
  onOpenDetails,
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: iso,
    data: { type: "day", dateKey: iso },
  });

  const [dayNumber, monthLabel] = dateLabel.split(" "); // "13 Kas" -> ["13","Kas"]

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col rounded-3xl bg-slate-950/80 border border-slate-800/80 px-5 py-4 min-h-[320px] transition-all
        ${
          isOver
            ? "ring-2 ring-emerald-500/70 shadow-lg shadow-emerald-500/30"
            : "hover:border-slate-700"
        }`}
    >
      {/* ÜST: Gün başlığı */}
      <header className="flex flex-col gap-1">
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
      </header>

      {/* EVENT LİSTESİ – her zaman başlığın altında dursun */}
      <div className="mt-4 flex flex-col gap-3">
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
                  onOpenDetails={onOpenDetails}
                />
              </SortableEventCard>
            ))}
          </SortableContext>
        ) : null}
      </div>
    </div>
  );
}

export default DayColumn;
