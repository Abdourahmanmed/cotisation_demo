export default function Drawer({
  open,
  onClose,
  title,
  subtitle,
  children,
  right,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* panel */}
      <div className="absolute right-0 top-0 h-full w-full max-w-xl border-l border-white/10 bg-slate-950/70 p-5 shadow-[0_20px_80px_-30px_rgba(0,0,0,0.9)] backdrop-blur-xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-lg font-black text-white/95">{title}</div>
            {subtitle ? (
              <div className="mt-1 text-sm text-white/55">{subtitle}</div>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            {right}
            <button
              onClick={onClose}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-black text-white/80 hover:bg-white/10"
            >
              Fermer
            </button>
          </div>
        </div>

        <div className="mt-5 h-[calc(100vh-110px)] overflow-auto pr-1">
          {children}
        </div>
      </div>
    </div>
  );
}
