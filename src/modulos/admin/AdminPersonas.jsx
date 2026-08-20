import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";

import AreaCheckboxes from "./AreaCheckboxes";
import PersonaEditForm from "./PersonaEditForm";
import { genId } from "../../utils/idGenerator";

export default function AdminPersonas({ personas, areas, onPersonas, primary }) {
  const [form, setForm] = useState({ nombre: "", rol: "", areas: [] });
  const [editId, setEditId] = useState(null);

  const agregar = () => {
    if (!form.nombre.trim()) return;
    onPersonas([...personas, { id: genId(), ...form, nombre: form.nombre.trim() }]);
    setForm({ nombre: "", rol: "", areas: [] });
  };

  const eliminar = (id) => {
    if (confirm("¿Eliminar a esta persona?")) {
      onPersonas(personas.filter((persona) => persona.id !== id));
    }
  };

  const guardarEdicion = (persona) => {
    onPersonas(personas.map((item) => item.id === persona.id ? persona : item));
    setEditId(null);
  };

  return (
    <div className="space-y-2">
      <div className="bg-white rounded-xl p-3 space-y-2">
        <h3 className="font-bold text-sm flex items-center gap-1.5" style={{ fontFamily: "inherit" }}>
          <Plus size={15} /> Agregar personal
        </h3>
        <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Nombre completo" className="w-full border rounded-md px-3 py-2 text-sm" />
        <input value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value })} placeholder="Rol / puesto" className="w-full border rounded-md px-3 py-2 text-sm" />
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase">Áreas asignadas</label>
          <div className="mt-1">
            <AreaCheckboxes areas={areas} value={form.areas} onChange={(value) => setForm({ ...form, areas: value })} />
          </div>
        </div>
        <button onClick={agregar} className="w-full py-2 rounded-md font-bold text-white flex items-center justify-center gap-1.5" style={{ background: primary }}>
          <Plus size={15} /> Agregar
        </button>
      </div>

      {personas.map((persona) => (
        <div key={persona.id} className="bg-white rounded-xl p-3">
          {editId === persona.id ? (
            <PersonaEditForm persona={persona} areas={areas} onSave={guardarEdicion} onCancel={() => setEditId(null)} primary={primary} />
          ) : (
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="font-semibold text-sm">{persona.nombre}</p>
                <p className="text-xs text-gray-400">{persona.rol}{persona.areas?.length ? ` · ${persona.areas.join(", ")}` : ""}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => setEditId(persona.id)} className="text-gray-500" title="Editar" aria-label="Editar"><Pencil size={16} /></button>
                <button onClick={() => eliminar(persona.id)} className="text-red-500" title="Eliminar" aria-label="Eliminar"><Trash2 size={16} /></button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
