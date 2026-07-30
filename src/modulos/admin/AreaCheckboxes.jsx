import { MAX_AREAS_POR_PERSONA } from "../../services/appConstants";

export default function AreaCheckboxes({
  areas,
  value,
  onChange,
  max = MAX_AREAS_POR_PERSONA,
}) {
  const toggle = (nombre) => {
    if (value.includes(nombre)) onChange(value.filter((v) => v !== nombre));
    else if (value.length < max) onChange([...value, nombre]);
  };
  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        {areas.map((a) => {
          const on = value.includes(a.nombre);
          const disabled = !on && value.length >= max;
          return (
            <button key={a.id} type="button" disabled={disabled} onClick={() => toggle(a.nombre)}
              className="px-2.5 py-1 rounded-full text-xs font-semibold border disabled:opacity-40"
              style={{ borderColor: on ? "#1F2B3A" : "#D8DCE1", background: on ? "#1F2B3A" : "#fff", color: on ? "#fff" : "#5C6673" }}>
              {a.nombre}
            </button>
          );
        })}
      </div>
      <p className="text-[11px] text-gray-400 mt-1">{value.length}/{max} áreas seleccionadas</p>
    </div>
  );
}