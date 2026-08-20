import { useState } from "react";
import { Plus, Pencil, Trash2, UserPlus } from "lucide-react";

import Badge from "../../components/common/Badge";
import UsuarioEditForm from "./UsuarioEditForm";
import { genId } from "../../utils/idGenerator";
import { MAX_USUARIOS } from "../../services/appConstants";

export default function AdminUsuarios({
  usuarios,
  onUsuarios,
  currentUser,
  primary,
}) {
    const [form, setForm] = useState({ nombre: "", password: "", rol: "usuario" });
  const [editId, setEditId] = useState(null);
  const [msg, setMsg] = useState("");

  const admins = usuarios.filter((u) => u.rol === "administrador");

  const agregar = () => {
    if (usuarios.length >= MAX_USUARIOS) return setMsg(`Ya alcanzaste el máximo de ${MAX_USUARIOS} usuarios.`);
    if (!form.nombre.trim()) return setMsg("Escribe el nombre del usuario.");
    if (form.password.length < 4) return setMsg("La contraseña debe tener al menos 4 caracteres.");
    onUsuarios([...usuarios, { id: genId(), nombre: form.nombre.trim(), password: form.password, rol: form.rol }]);
    setForm({ nombre: "", password: "", rol: "usuario" });
    setMsg("");
  };

  const eliminar = (u) => {
    if (u.rol === "administrador" && admins.length <= 1) {
      setMsg("Debe existir al menos un administrador. Crea otro antes de eliminar este.");
      return;
    }
    if (confirm(`¿Eliminar el acceso de ${u.nombre}?`)) onUsuarios(usuarios.filter((x) => x.id !== u.id));
  };

  const guardarEdicion = (u) => {
    if (u.rol === "usuario") {
      const quedanAdmins = usuarios.filter((x) => x.rol === "administrador" && x.id !== u.id).length;
      if (quedanAdmins === 0) { setMsg("Debe existir al menos un administrador."); return; }
    }
    onUsuarios(usuarios.map((x) => x.id === u.id ? u : x));
    setEditId(null);
    setMsg("");
  };

  return (
    <div className="space-y-2">
      <div className="bg-white rounded-xl p-4 space-y-2">
        <h3 className="font-bold text-sm flex items-center gap-1.5" style={{ fontFamily: "inherit" }}>
          <UserPlus size={15} /> Agregar usuario ({usuarios.length}/{MAX_USUARIOS})
        </h3>
        <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Nombre" className="w-full border rounded-md px-4 py-2 text-sm" />
        <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Contraseña (mín. 4 caracteres)" className="w-full border rounded-md px-4 py-2 text-sm" />
        <select value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value })} className="w-full border rounded-md px-4 py-2 text-sm">
          <option value="usuario">Usuario (solo hace inspecciones)</option>
          <option value="administrador">Administrador (acceso total)</option>
        </select>
        <button onClick={agregar} disabled={usuarios.length >= MAX_USUARIOS}
          className="w-full py-2 rounded-md font-bold text-white flex items-center justify-center gap-1.5 disabled:opacity-40" style={{ background: primary }}>
          <Plus size={15} /> Agregar usuario
        </button>
        {msg && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-md px-2 py-1.5">{msg}</p>}
      </div>

      {usuarios.map((u) => (
        <div key={u.id} className="bg-white rounded-xl p-4">
          {editId === u.id ? (
            <UsuarioEditForm usuario={u} onSave={guardarEdicion} onCancel={() => setEditId(null)} primary={primary} />
          ) : (
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="font-semibold text-sm flex items-center gap-1.5">
                  {u.nombre} {u.id === currentUser.id && <span className="text-[10px] text-gray-400">(tú)</span>}
                </p>
                <Badge color={u.rol === "administrador" ? "#1F2B3A" : "#5C6673"} bg={u.rol === "administrador" ? "#E9ECEF" : "#F1F3F4"}>
                  {u.rol === "administrador" ? "Administrador" : "Usuario"}
                </Badge>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => setEditId(u.id)} className="text-gray-500"><Pencil size={16} /></button>
                <button onClick={() => eliminar(u)} className="text-red-500"><Trash2 size={16} /></button>
              </div>
            </div>
          )}
        </div>
      ))}

      <p className="text-[11px] text-gray-400 px-1">Los usuarios con rol "Usuario" solo pueden ingresar a la pestaña Inspección y no ven Historial, Análisis, Hallazgos ni Admin.</p>
    </div>
  );
}
