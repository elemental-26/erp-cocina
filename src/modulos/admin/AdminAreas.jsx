import { useState } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";
import { genId } from "../../utils/idGenerator";

export default function AdminAreas({ areas, onAreas, primary }) {
      const [nuevaArea, setNuevaArea] = useState("");
      const [nuevoItem, setNuevoItem] = useState({});
      const [expand, setExpand] = useState(null);
      const [editandoArea, setEditandoArea] = useState(null);
      const [editandoItem, setEditandoItem] = useState(null);
    
      const agregarArea = () => {
        if (!nuevaArea.trim()) return;
        onAreas([...areas, { id: genId(), nombre: nuevaArea.trim(), items: [] }]);
        setNuevaArea("");
      };
      const eliminarArea = (id) => {
        if (confirm("¿Eliminar esta área y todos sus ítems?")) onAreas(areas.filter((a) => a.id !== id));
      };
      const agregarItem = (areaId) => {
        const texto = (nuevoItem[areaId] || "").trim();
        if (!texto) return;
        onAreas(areas.map((a) => a.id === areaId ? { ...a, items: [...a.items, { id: genId(), texto }] } : a));
        setNuevoItem((s) => ({ ...s, [areaId]: "" }));
      };
      const eliminarItem = (areaId, itemId) => {
        onAreas(areas.map((a) => a.id === areaId ? { ...a, items: a.items.filter((i) => i.id !== itemId) } : a));
      };
      const renombrarArea = (areaId, nombre) => {
        onAreas(areas.map((a) => a.id === areaId ? { ...a, nombre } : a));
      };
      const renombrarItem = (areaId, itemId, texto) => {
        onAreas(
          areas.map((a) =>
            a.id === areaId
              ? {
                ...a,
                items: a.items.map((i) =>
                  i.id === itemId
                    ? { ...i, texto }
                    : i
                ),
              }
              : a
          )
        );
      };
    
      return (
        <div className="space-y-2">
          <div className="bg-white rounded-xl p-4 flex gap-2">
            <input value={nuevaArea} onChange={(e) => setNuevaArea(e.target.value)} placeholder="Nueva área…" className="flex-1 border rounded-md px-4 py-2 text-sm" />
            <button onClick={agregarArea} className="px-4 rounded-md font-bold text-white flex items-center gap-1" style={{ background: primary }}><Plus size={16} /></button>
          </div>
    
          {areas.map((a) => (
            <div key={a.id} className="bg-white rounded-xl p-4">
              <div className="flex items-center gap-2">
                <input value={a.nombre} onChange={(e) => renombrarArea(a.id, e.target.value)} className="flex-1 font-bold text-sm border-b border-transparent focus:border-gray-300 outline-none py-1" />
                <button onClick={() => setExpand(expand === a.id ? null : a.id)} className="text-xs font-bold" style={{ color: primary }}>{expand === a.id ? "Ocultar" : `${a.items.length} ítems`}</button>
                <button onClick={() => eliminarArea(a.id)} className="text-red-500"><Trash2 size={16} /></button>
              </div>
              {expand === a.id && (
                <div className="mt-2 space-y-1.5">
                  {a.items.map((it) => (
                    <div
                      key={it.id}
                      className="flex items-center gap-2 text-sm bg-gray-50 rounded-md px-2 py-1.5"
                    >
    
                      {editandoItem === it.id ? (
    
                        <input
                          autoFocus
                          value={it.texto}
                          onChange={(e) =>
                            renombrarItem(a.id, it.id, e.target.value)
                          }
                          className="flex-1 border rounded-md px-2 py-1"
                        />
    
                      ) : (
    
                        <span className="flex-1">{it.texto}</span>
    
                      )}
    
                      <button
                        onClick={() =>
                          setEditandoItem(
                            editandoItem === it.id ? null : it.id
                          )
                        }
                        className="text-blue-500"
                      >
                        <Pencil size={13} />
                      </button>
    
                      <button
                        onClick={() => eliminarItem(a.id, it.id)}
                        className="text-red-400"
                      >
                        <Trash2 size={13} />
                      </button>
    
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <input value={nuevoItem[a.id] || ""} onChange={(e) => setNuevoItem((s) => ({ ...s, [a.id]: e.target.value }))}
                      placeholder="Nuevo ítem…" className="flex-1 border rounded-md px-2 py-1.5 text-sm" />
                    <button onClick={() => agregarItem(a.id)} className="px-2.5 rounded-md text-white" style={{ background: primary }}><Plus size={14} /></button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      );
    }
    