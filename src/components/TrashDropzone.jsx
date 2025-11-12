// src/components/TrashDropzone.jsx
import { useDroppable } from "@dnd-kit/core";
import { Trash2 } from "lucide-react";

export default function TrashDropzone() {
  const { isOver, setNodeRef } = useDroppable({ id: "trash", data: { type: "trash" } });

  return (
    <div
      ref={setNodeRef}
      className={`fixed left-1/2 -translate-x-1/2 bottom-6 z-30
                  rounded-full border bg-slate-900/90 border-slate-700
                  shadow-xl shadow-black/40 transition-all
                  flex items-center justify-center
                  ${isOver ? "h-14 w-14 scale-110 ring-2 ring-rose-500/60" : "h-12 w-12"}
                 `}
    >
      <Trash2 className={`transition-transform ${isOver ? "scale-110 text-rose-400" : "text-slate-300"}`} />
    </div>
  );
}
