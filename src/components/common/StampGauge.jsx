export default function StampGauge({ pct, size = 128 }) {
  const clamped = Math.max(0, Math.min(100, pct));
  const angle = (clamped / 100) * 360;
  const color = clamped >= 90 ? "#1E7A46" : clamped >= 70 ? "#B4750E" : "#B5333D";
  return (
    <div
      className="relative flex items-center justify-center rounded-full"
      style={{
        width: size, height: size, borderRadius: "50%",
        background: `conic-gradient(${color} ${angle}deg, #E7E9EC ${angle}deg)`,
      }}
    >
      <div
        className="absolute rounded-full flex flex-col items-center justify-center border-2 border-dashed"
        style={{ width: size - 18, height: size - 18, background: "#fff", borderColor: color, transform: "rotate(-8deg)" }}
      >
        <span className="text-2xl font-black" style={{ color, transform: "rotate(8deg)" }}>{Math.round(clamped)}%</span>
        <span className="text-[9px] font-bold tracking-widest uppercase" style={{ color, transform: "rotate(8deg)" }}>Cumplimiento</span>
      </div>
    </div>
  );
}
