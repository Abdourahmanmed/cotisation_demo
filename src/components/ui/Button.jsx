export function PrimaryButton({ loading, className = "", children, ...props }) {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={
        "relative inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-black text-slate-950 transition " +
        "bg-gradient-to-r from-emerald-400 to-lime-300 hover:brightness-110 active:brightness-95 " +
        "disabled:cursor-not-allowed disabled:opacity-70 ring-1 ring-white/10 shadow-glow " +
        className
      }
    >
      {loading ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950/40 border-t-slate-950" />
          <span>Chargement...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

export function GhostButton({ className = "", children, ...props }) {
  return (
    <button
      {...props}
      className={
        "inline-flex w-full items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-extrabold text-white/90 transition " +
        "hover:bg-white/10 active:bg-white/5 " +
        className
      }
    >
      {children}
    </button>
  );
}
