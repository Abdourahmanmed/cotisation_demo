export default function Card({ className = "", children }) {
  return (
    <div
      className={
        "rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_20px_60px_-30px_rgba(0,0,0,0.75)] " +
        className
      }
    >
      {children}
    </div>
  );
}
