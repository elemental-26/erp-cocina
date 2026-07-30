import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { genId } from "../../utils/idGenerator";

export default function AdminEpp({ eppItems, onEpp, primary }) {
      const [nuevo, setNuevo] = useState("");
      const agregar = () => {
        if (!nuevo.trim()) return;
        onEpp([...eppItems, { id: genId(), texto: nuevo.trim() }]);
        setNuevo("");
      };
      const eliminar = (id) => onEpp(eppItems.filter((i) => i.id !== id));
      const editar = (id, texto) => onEpp(eppItems.map((i) => i.id === id ? { ...i, texto } : i));
    
      return (
        <div className="bg-white rounded-xl p-4 space-y-1.5">
          {eppItems.map((it) => (
            <div key={it.id} className="flex items-center gap-2 bg-gray-50 rounded-md px-2 py-1.5">
              <input value={it.texto} onChange={(e) => editar(it.id, e.target.value)} className="flex-1 bg-transparent text-sm outline-none" />
              <button onClick={() => eliminar(it.id)} className="text-red-400"><Trash2 size={14} /></button>
            </div>
          ))}
          <div className="flex gap-2 pt-1">
            <input value={nuevo} onChange={(e) => setNuevo(e.target.value)} placeholder="Nuevo ítem de EPP…" className="flex-1 border rounded-md px-2 py-1.5 text-sm" />
            <button onClick={agregar} className="px-2.5 rounded-md text-white" style={{ background: primary }}><Plus size={14} /></button>
          </div>
        </div>
      );
    }
    