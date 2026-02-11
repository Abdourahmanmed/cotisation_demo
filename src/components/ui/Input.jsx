export default function Input({ className = "", ...props }) {
  return (
    <input
      {...props}
      className={
        "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none transition " +
        "focus:border-emerald-400/40 focus:bg-white/10 focus:ring-4 focus:ring-emerald-400/10 " +
        className
      }
    />
  );
}
