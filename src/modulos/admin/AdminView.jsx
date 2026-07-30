import { useState } from "react";

import AdminGeneral from "./AdminGeneral";
import AdminAreas from "./AdminAreas";
import AdminEpp from "./AdminEpp";
import AdminPersonas from "./AdminPersonas";
import AdminUsuarios from "./AdminUsuarios";
import AdminAcercaDe from "./AdminAcercaDe";

export default function AdminView({
  config,
  areas,
  eppItems,
  personas,
  usuarios,
  currentUser,
  onConfig,
  onAreas,
  onEpp,
  onPersonas,
  onUsuarios,
  primary,
}) {const [sub, setSub] = useState("general");

  const subs = [
    { id: "general", label: "General" },
    { id: "areas", label: "Áreas" },
    { id: "epp", label: "EPP" },
    { id: "personas", label: "Personal" },
    { id: "usuarios", label: "Usuarios" },
    { id: "acerca", label: "Acerca de" },
  ];

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-xl p-2 flex gap-1.5 overflow-x-auto">
        {subs.map((s) => (
          <button key={s.id} onClick={() => setSub(s.id)}
            className="4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap"
            style={{ background: sub === s.id ? primary : "#F1F3F4", color: sub === s.id ? "#fff" : "#5C6673" }}>
            {s.label}
          </button>
        ))}
      </div>

      {sub === "general" && <AdminGeneral config={config} onConfig={onConfig} primary={primary} />}
      {sub === "areas" && <AdminAreas areas={areas} onAreas={onAreas} primary={primary} />}
      {sub === "epp" && <AdminEpp eppItems={eppItems} onEpp={onEpp} primary={primary} />}
      {sub === "personas" && <AdminPersonas personas={personas} areas={areas} onPersonas={onPersonas} primary={primary} />}
      {sub === "usuarios" && <AdminUsuarios usuarios={usuarios} onUsuarios={onUsuarios} currentUser={currentUser} primary={primary} />}
      {sub === "acerca" && <AdminAcercaDe primary={primary} />}
    </div>
  );
}