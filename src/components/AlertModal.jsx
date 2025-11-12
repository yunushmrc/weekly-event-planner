// src/components/AlertModal.jsx
function AlertModal({ open, title = "Uyarı", message, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* arka plan */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* modal */}
      <div className="relative z-[101] w-[92%] max-w-sm rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl shadow-black/60 p-5">
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
        </div>
        <p className="text-sm text-slate-300 mb-5">{message}</p>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="inline-flex items-center rounded-full bg-emerald-500 hover:bg-emerald-400 px-4 py-2 text-sm font-medium text-emerald-950 shadow-md shadow-emerald-500/30 transition-colors"
          >
            Tamam
          </button>
        </div>
      </div>
    </div>
  );
}

export default AlertModal;
