export default function Select({ className = "", children, ...props }) {
  return (
    <div className="relative">
      <select
        {...props}
        className={
          "w-full appearance-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition " +
          "focus:border-emerald-400/40 focus:bg-white/10 focus:ring-4 focus:ring-emerald-400/10 " +
          className
        }
      >
        {children}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-white/50">
        ▾
      </div>
    </div>
  );
}
