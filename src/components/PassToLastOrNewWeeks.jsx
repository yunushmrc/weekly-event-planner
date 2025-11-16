// src/components/PassToLastOrNewWeek.jsx
import { useDroppable } from "@dnd-kit/core";

export default function PassToLastOrNewWeek({
  id,        // "week-prev" | "week-next"
  side,      // "left" | "right"
  onClick,   // tıklayınca haftayı değiştir
  children,  // içteki ikon (ChevronLeft/ChevronRight)
}) {
  const { setNodeRef, isOver } = useDroppable({ id });

  const sideClasses = side === "left" ? "left-6" : "right-6";

  return (
    <button
      ref={setNodeRef}
      onClick={onClick}
      className={`
        fixed ${sideClasses} top-1/2 -translate-y-1/2
        inline-flex items-center justify-center
        h-9 w-9 rounded-full border
        border-slate-700 bg-slate-900/90 text-slate-200
        shadow-lg shadow-black/40
        transition-transform transition-colors duration-200
        hover:bg-slate-800
        ${isOver ? "scale-125 bg-emerald-500/90 border-emerald-300 text-emerald-950" : ""}
      `}
    >
      {children}
    </button>
  );
}
