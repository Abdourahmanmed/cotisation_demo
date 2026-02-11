export default function SectionTitle({ title, subtitle, right }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <div className="text-sm font-black text-white/90">{title}</div>
        {subtitle ? (
          <div className="mt-1 text-xs text-white/50">{subtitle}</div>
        ) : null}
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
  );
}
