export default function Badge({ tone = "neutral", children }) {
  const map = {
    neutral: "border-white/10 bg-white/5 text-white/80",
    green: "border-emerald-400/20 bg-emerald-500/10 text-emerald-100",
    yellow: "border-yellow-400/20 bg-yellow-500/10 text-yellow-100",
    red: "border-red-400/20 bg-red-500/10 text-red-100",
    blue: "border-cyan-400/20 bg-cyan-500/10 text-cyan-100",
    purple: "border-fuchsia-400/20 bg-fuchsia-500/10 text-fuchsia-100",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-black ${map[tone]}`}
    >
      {children}
    </span>
  );
}
