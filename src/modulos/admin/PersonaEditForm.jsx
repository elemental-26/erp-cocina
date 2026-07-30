import { useState } from "react";
import AreaCheckboxes from "./AreaCheckboxes";

export default function PersonaEditForm({
  persona,
  areas,
  onSave,
  onCancel,
  primary,
})  {
  const [p, setP] = useState({ ...persona, areas: persona.areas || [] });
  return (
    <div className="space-y-2">
      <input value={p.nombre} onChange={(e) => setP({ ...p, nombre: e.target.value })} className="w-full border rounded-md px-4 py-2 text-sm" />
      <input value={p.rol} onChange={(e) => setP({ ...p, rol: e.target.value })} className="w-full border rounded-md px-4 py-2 text-sm" />
      <div>
        <label className="text-xs font-bold text-gray-500 uppercase">Áreas asignadas (máx. 3)</label>
        <div className="mt-1"><AreaCheckboxes areas={areas} value={p.areas} onChange={(v) => setP({ ...p, areas: v })} /></div>
      </div>
      <div className="flex gap-2">
        <button onClick={() => onSave(p)} className="flex-1 py-2 rounded-md font-bold text-white text-sm" style={{ background: primary }}>Guardar</button>
        <button onClick={onCancel} className="flex-1 py-2 rounded-md font-bold text-sm border">Cancelar</button>
      </div>
    </div>
  );
}
