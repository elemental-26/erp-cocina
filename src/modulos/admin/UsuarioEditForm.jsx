import { useState } from "react";

export default function UsuarioEditForm({
  usuario,
  onSave,
  onCancel,
  primary,
}) {
    const [u, setU] = useState({ ...usuario, password: usuario.password });
  return (
    <div className="space-y-2">
      <input value={u.nombre} onChange={(e) => setU({ ...u, nombre: e.target.value })} className="w-full border rounded-md px-4 py-2 text-sm" placeholder="Nombre" />
      <input type="password" value={u.password} onChange={(e) => setU({ ...u, password: e.target.value })} className="w-full border rounded-md px-4 py-2 text-sm" placeholder="Contraseña" />
      <select value={u.rol} onChange={(e) => setU({ ...u, rol: e.target.value })} className="w-full border rounded-md px-4 py-2 text-sm">
        <option value="usuario">Usuario (solo hace inspecciones)</option>
        <option value="administrador">Administrador (acceso total)</option>
      </select>
      <div className="flex gap-2">
        <button onClick={() => onSave(u)} className="flex-1 py-2 rounded-md font-bold text-white text-sm" style={{ background: primary }}>Guardar</button>
        <button onClick={onCancel} className="flex-1 py-2 rounded-md font-bold text-sm border">Cancelar</button>
      </div>
    </div>
  );
}