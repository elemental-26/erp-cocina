export default function StatusPicker({
  STATUS,
  value,
  onChange,
  compactMode,
}) {
  return (
    <div className={`grid grid-cols-4 gap-1.5 ${compactMode ? "" : "mt-2"}`}>
      {STATUS.map((s) => {
        const active = value === s.value;

        return (
          <button
            key={s.value}
            type="button"
            onClick={() => onChange(s.value)}
            className="rounded-md border py-2 text-[11px] font-semibold tracking-tight transition-all leading-tight"
            style={{
              borderColor: active ? s.border : "#D8DCE1",
              background: active ? s.color : "#FFFFFF",
              color: active ? "#FFFFFF" : "#5C6673",
            }}
          >
            {s.short}
          </button>
        );
      })}
    </div>
  );
}
