import { LogOut, ClipboardCheck } from "lucide-react";

export default function Header({
  config,
  primary,
  currentUser,
  isAdmin,
  onLogout,
  compactMode,
  onCompactMode,
}) {
  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between
             px-3 py-1.5 shadow-md border-b border-white/10 text-white"
      style={{ background: primary }}
    >
      <div className="flex items-center gap-2 min-w-0">

        {config.logo ? (
          <img
            src={config.logo}
            alt="Logo"
            className="h-6 w-6 rounded-lg bg-white/10 p-1 object-contain"
          />
        ) : (
          <ClipboardCheck size={28} />
        )}

        <div className="min-w-0">

          <h1
            className="font-bold truncate"
            style={{
              fontFamily: "Oswald, sans-serif",
              fontSize: "22px"
            }}
          >
            {"ERP fenix"}
          </h1>

          <p className="text-xs text-white/80 truncate">
            ERP Institucional . Gestión Operacional
            </p>
            <p className="text-[10px] text-white/60">
                {currentUser.nombre}
                {isAdmin && " • Administrador"}
          </p>

        </div>

      </div>
      <button
        onClick={() => onCompactMode(!compactMode)}
        className="px-2 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition text-xs font-semibold"
      >
        {compactMode ? "📖 Normal" : "📋 Compacto"}
      </button>
      <button
        onClick={onLogout}
        className="p-2 rounded-lg hover:bg-white/15 transition"
        title="Cerrar sesión"
      >
        <LogOut size={20} />
      </button>
    </header>
  );
}