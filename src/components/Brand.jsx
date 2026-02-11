export default function Brand() {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-emerald-400 to-lime-300 text-slate-950 shadow-glow">
        <span className="text-lg font-black">C</span>
      </div>
      <div>
        <div className="text-lg font-black tracking-tight">Cotisations</div>
        <div className="text-xs text-white/55">Sécurisé • VIP-ready</div>
      </div>
    </div>
  );
}
