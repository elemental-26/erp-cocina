import React, { useState, useEffect, useMemo } from "react";
import {
  ClipboardCheck, CheckCircle2, AlertTriangle, XCircle, MinusCircle,
  Settings, Users, BarChart3, ListChecks, LogOut, Plus, Trash2, Pencil,
  Lock, ChevronRight, Download, ShieldCheck, AlertCircle, UserPlus,
  Palette, ImagePlus, X, Save, Building2, Check, Info, KeyRound
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, LineChart, Line
} from "recharts";
import * as XLSX from "xlsx";

/* =========================================================================
   NOTA PARA FUTURA EXTENSIÓN (software institucional / mejora continua)
   -------------------------------------------------------------------------
   Este archivo sigue un patrón repetible que puede usarse como base para
   otros módulos de evaluación y mejora continua:

   1. Un "modelo de datos" plano y con nombres genéricos (config, areas,
      personas, usuarios, inspecciones, hallazgos) guardado con
      window.storage (ver helpers loadKey/saveKey).
   2. Un objeto `persist` en el componente raíz que centraliza cómo se
      actualiza cada colección (estado + guardado).
   3. Una vista por función del negocio (Inspección, Historial, Análisis,
      Hallazgos) + un panel Admin con sub-pestañas CRUD (Áreas, EPP,
      Personal, Usuarios).
   Para agregar un nuevo módulo de evaluación (ej. auditorías de seguridad,
   evaluación de proveedores, ciclos PHVA/Kaizen) se puede replicar el mismo
   patrón: nueva colección + nueva vista + nueva pestaña en BottomNav/Admin.
   ========================================================================= */

const APP_VERSION = "1.1.0";
const CREADO_POR = "Faber Solano";
const CHANGELOG = [
  { version: "1.1.0", fecha: "2026-07-20", cambios: "Cuentas de usuario con contraseña y rol (administrador/usuario), hasta 3 áreas por persona del personal, mejoras en carga de logo, sección Acerca de con control de versión." },
  { version: "1.0.0", fecha: "2026-07-19", cambios: "Versión inicial: checklist por áreas, evaluación de EPP, historial exportable, análisis acumulado y seguimiento de hallazgos." },
];

/* ---------------------------------- utilidades ---------------------------------- */

const STATUS = [
  { value: "cumple", label: "Cumple", short: "Cumple", color: "#1E7A46", bg: "#E4F4EA", border: "#1E7A46" },
  { value: "parcial", label: "Cumple parcial", short: "Parcial", color: "#B4750E", bg: "#FCF1DC", border: "#B4750E" },
  { value: "no_cumple", label: "No cumple", short: "No cumple", color: "#B5333D", bg: "#FBE7E8", border: "#B5333D" },
  { value: "no_aplica", label: "No aplica", short: "N/A", color: "#5C6673", bg: "#EAECEF", border: "#5C6673" },
];
const statusInfo = (v) => STATUS.find((s) => s.value === v) || STATUS[3];

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
function todayISO() {
  return new Date().toISOString();
}
function fmtFecha(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" }) +
    " · " + d.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
}

function resizeImageToDataUrl(file, maxDim = 320) {
  return new Promise((resolve, reject) => {
    if (!file.type || !file.type.startsWith("image/")) {
      reject(new Error("Selecciona un archivo de imagen válido (PNG, JPG, etc.)."));
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      reject(new Error("La imagen es muy pesada (máximo 8MB)."));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("No se pudo leer el archivo."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("El archivo no parece ser una imagen válida."));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          const ratio = Math.min(maxDim / width, maxDim / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/png"));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

const DEFAULT_AREAS_RAW = [
  { nombre: "Recepción de mercancía", items: [
    "Temperatura correcta de productos refrigerados/congelados",
    "Revisión de fechas de caducidad y empaques",
    "Vehículo de transporte en condiciones higiénicas",
    "Documentación y trazabilidad de proveedor completa",
  ]},
  { nombre: "Almacén seco", items: [
    "Productos rotulados y con sistema PEPS",
    "Ausencia de plagas o signos de infestación",
    "Productos separados del piso y la pared",
    "Orden y limpieza general del área",
  ]},
  { nombre: "Cámaras frías y refrigeración", items: [
    "Temperatura de refrigeración dentro de rango (0-4°C)",
    "Temperatura de congelación dentro de rango (-18°C o menor)",
    "Alimentos crudos separados de cocidos/listos para consumo",
    "Empaques cerrados y rotulados con fecha",
  ]},
  { nombre: "Cocina caliente", items: [
    "Temperatura de cocción verificada y registrada",
    "Superficies de trabajo limpias y desinfectadas",
    "Utensilios y tablas de colores según tipo de alimento",
    "Manejo correcto de aceites y equipos de cocción",
  ]},
  { nombre: "Cocina fría", items: [
    "Cadena de frío respetada en preparación",
    "Utensilios exclusivos para alimentos listos para consumo",
    "Superficies y equipos limpios y desinfectados",
    "Ausencia de contaminación cruzada",
  ]},
  { nombre: "Panadería y repostería", items: [
    "Insumos almacenados correctamente y rotulados",
    "Limpieza de hornos y equipos de mezclado",
    "Control de tiempos y temperaturas de horneado",
    "Orden y limpieza del área de trabajo",
  ]},
  { nombre: "Zona de lavado (loza y ollas)", items: [
    "Concentración correcta de detergente/desinfectante",
    "Separación de áreas sucia y limpia",
    "Loza y utensilios secos y almacenados correctamente",
    "Drenajes limpios y sin obstrucción",
  ]},
  { nombre: "Línea de servicio", items: [
    "Temperatura de alimentos en exhibición dentro de rango",
    "Protectores/estornudaderos en buen estado",
    "Utensilios de servicio limpios y exclusivos por preparación",
    "Rotulación de alérgenos visible",
  ]},
  { nombre: "Comedor", items: [
    "Mesas y sillas limpias",
    "Pisos libres de residuos y derrames",
    "Botes de basura tapados y no saturados",
    "Señalización de aforo y accesos despejada",
  ]},
  { nombre: "Baños y vestidores del personal", items: [
    "Disponibilidad de jabón y toallas/secador",
    "Limpieza general y sin malos olores",
    "Casilleros ordenados y en buen estado",
    "Insumos de higiene personal disponibles",
  ]},
  { nombre: "Manejo de residuos", items: [
    "Separación de residuos orgánicos/inorgánicos",
    "Contenedores tapados y en buen estado",
    "Frecuencia de recolección adecuada",
    "Área de residuos limpia y sin fugas",
  ]},
];

const DEFAULT_EPP_RAW = [
  "Cofia o malla cubre cabello",
  "Cubrebocas",
  "Uniforme limpio y en buen estado",
  "Calzado cerrado antiderrapante",
  "Guantes según la tarea",
  "Delantal",
  "Manos y uñas limpias, sin esmalte",
  "Sin joyería (anillos, pulseras, reloj, aretes)",
  "Barba cubierta (si aplica)",
];

const MAX_USUARIOS = 5;
const MAX_AREAS_POR_PERSONA = 3;

/* ---------------------------------- almacenamiento ---------------------------------- */

async function loadKey(key, fallback) {
  try {
    const data = localStorage.getItem(key);

    if (!data) {
      return fallback;
    }

    return JSON.parse(data);
  } catch (e) {
    console.error("Error cargando", key, e);
    return fallback;
  }
}

async function saveKey(key, value) {
  try {
    localStorage.setItem(
      key,
      JSON.stringify(value)
    );

    return true;
  } catch (e) {
    console.error("Error guardando", key, e);
    return false;
  }
}

/* ---------------------------------- componentes pequeños ---------------------------------- */

function StatusPicker({ value, onChange, compact }) {
  return (
    <div className={`grid grid-cols-4 gap-1.5 ${compact ? "" : "mt-2"}`}>
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

function Badge({ children, color, bg }) {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wide"
      style={{ color, background: bg }}
    >
      {children}
    </span>
  );
}

function StampGauge({ pct, size = 128 }) {
  const clamped = Math.max(0, Math.min(100, pct));
  const angle = (clamped / 100) * 360;
  const color = clamped >= 90 ? "#1E7A46" : clamped >= 70 ? "#B4750E" : "#B5333D";
  return (
    <div
      className="relative flex items-center justify-center rounded-full"
      style={{
        width: size, height: size,
        background: `conic-gradient(${color} ${angle}deg, #E7E9EC ${angle}deg)`,
      }}
    >
      <div
        className="absolute rounded-full flex flex-col items-center justify-center border-2 border-dashed"
        style={{ width: size - 18, height: size - 18, background: "#fff", borderColor: color, transform: "rotate(-8deg)" }}
      >
        <span className="text-2xl font-black" style={{ color, transform: "rotate(8deg)" }}>{Math.round(clamped)}%</span>
        <span className="text-[9px] font-bold tracking-widest uppercase" style={{ color, transform: "rotate(8deg)" }}>Cumplimiento</span>
      </div>
    </div>
  );
}

function Modal({ title, onClose, children, wide }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className={`bg-white w-full ${wide ? "sm:max-w-2xl" : "sm:max-w-md"} sm:rounded-lg rounded-t-2xl max-h-[90vh] flex flex-col`}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h3 className="font-bold text-[15px]" style={{ fontFamily: "Oswald, sans-serif" }}>{title}</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100"><X size={20} /></button>
        </div>
        <div className="overflow-y-auto px-4 py-4">{children}</div>
      </div>
    </div>
  );
}

function PasswordModal({ usuario, onSuccess, onClose }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState(false);
  return (
    <Modal title={`Ingreso · ${usuario.nombre}`} onClose={onClose}>
      <p className="text-sm text-gray-500 mb-3">Ingresa tu contraseña para continuar.</p>
      <input
        type="password"
        autoFocus
        value={pw}
        onChange={(e) => { setPw(e.target.value); setErr(false); }}
        onKeyDown={(e) => { if (e.key === "Enter") { pw === usuario.password ? onSuccess() : setErr(true); } }}
        className="w-full border rounded-md px-3 py-2 text-center text-lg tracking-widest"
        style={{ borderColor: err ? "#B5333D" : "#D8DCE1" }}
        placeholder="Contraseña"
      />
      {err && <p className="text-xs text-red-600 mt-1">Contraseña incorrecta, intenta de nuevo.</p>}
      <button
        onClick={() => { if (pw === usuario.password) onSuccess(); else setErr(true); }}
        className="w-full mt-4 py-2.5 rounded-md font-bold text-white flex items-center justify-center gap-2"
        style={{ background: "#1F2B3A" }}
      >
        <Lock size={16} /> Ingresar
      </button>
    </Modal>
  );
}

/* ---------------------------------- app principal ---------------------------------- */

export default function App() {
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState(null); 
  const [eppItems, setEppItems] = useState([]);
  const [personas, setPersonas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [inspecciones, setInspecciones] = useState([]);
  const [hallazgos, setHallazgos] = useState([]);

  const [currentUser, setCurrentUser] = useState(null);
  const [tab, setTab] = useState("inspeccion");
  const [loginTarget, setLoginTarget] = useState(null);

  useEffect(() => {
    (async () => {
      const [c, a, e, p, u, i, h] = await Promise.all([
        loadKey("qc_config", null),
        loadKey("qc_areas", null),
        loadKey("qc_epp", null),
        loadKey("qc_personas", []),
        loadKey("qc_usuarios", []),
        loadKey("qc_inspecciones", []),
        loadKey("qc_hallazgos", []),
      ]);
      let finalAreas = a;
      if (!finalAreas) {
        finalAreas = DEFAULT_AREAS_RAW.map((ar) => ({ id: genId(), nombre: ar.nombre, items: ar.items.map((t) => ({ id: genId(), texto: t })) }));
        saveKey("qc_areas", finalAreas);
      }
      let finalEpp = e;
      if (!finalEpp) {
        finalEpp = DEFAULT_EPP_RAW.map((t) => ({ id: genId(), texto: t }));
        saveKey("qc_epp", finalEpp);
      }
      // migración: personas antiguas con "area" (texto) -> "areas" (arreglo)
      const finalPersonas = (p || []).map((per) => per.areas ? per : { ...per, areas: per.area ? [per.area] : [] });
      setConfig(c);
      setAreas(finalAreas);
      setEppItems(finalEpp);
      setPersonas(finalPersonas);
      setUsuarios(u || []);
      setInspecciones(i || []);
      setHallazgos(h || []);
      setLoading(false);
    })();
  }, []);

  const persist = {
    config: async (v) => { setConfig(v); await saveKey("qc_config", v); },
    areas: async (v) => { setAreas(v); await saveKey("qc_areas", v); },
    epp: async (v) => { setEppItems(v); await saveKey("qc_epp", v); },
    personas: async (v) => { setPersonas(v); await saveKey("qc_personas", v); },
    usuarios: async (v) => { setUsuarios(v); await saveKey("qc_usuarios", v); },
    inspecciones: async (v) => { setInspecciones(v); await saveKey("qc_inspecciones", v); },
    hallazgos: async (v) => { setHallazgos(v); await saveKey("qc_hallazgos", v); },
  };

  const primary = config?.colorPrimario || "#1F2B3A";
  const accent = config?.colorAccent || "#F2622E";
  const isAdmin = currentUser?.rol === "administrador";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F1F3F4]">
        <div className="text-center">
          <ClipboardCheck className="mx-auto mb-2 animate-pulse" size={36} color="#1F2B3A" />
          <p className="text-sm text-gray-500">Cargando…</p>
        </div>
      </div>
    );
  }

  if (!config || usuarios.length === 0) {
    return (
      <SetupWizard
        onDone={(cfg, adminUsuario) => {
          persist.config(cfg);
          persist.usuarios([adminUsuario]);
          setCurrentUser(adminUsuario);
          setTab("inspeccion");
        }}
      />
    );
  }

  if (!currentUser) {
    return (
      <LoginScreen
        config={config}
        usuarios={usuarios}
        onSelectUsuario={(u) => setLoginTarget(u)}
      >
        {loginTarget && (
          <PasswordModal
            usuario={loginTarget}
            onClose={() => setLoginTarget(null)}
            onSuccess={() => { setCurrentUser(loginTarget); setLoginTarget(null); setTab("inspeccion"); }}
          />
        )}
      </LoginScreen>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#F1F3F4", fontFamily: "Inter, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Inter:wght@400;500;600;700;800&display=swap');
      `}</style>

      <Header config={config} primary={primary} currentUser={currentUser} isAdmin={isAdmin}
        onLogout={() => setCurrentUser(null)} />

      <main className={`flex-1 overflow-y-auto ${isAdmin ? "pb-20" : "pb-6"} max-w-3xl w-full mx-auto px-3 pt-3`}>
        {tab === "inspeccion" && (
          <InspeccionView
            areas={areas} eppItems={eppItems} personas={personas}
            currentUser={currentUser} accent={accent} primary={primary}
            onSave={async (insp, nuevosHallazgos) => {
              await persist.inspecciones([insp, ...inspecciones]);
              if (nuevosHallazgos.length) await persist.hallazgos([...nuevosHallazgos, ...hallazgos]);
            }}
          />
        )}
        {isAdmin && tab === "historial" && (
          <HistorialView
            inspecciones={inspecciones} areas={areas} primary={primary}
            onUpdate={(v) => persist.inspecciones(v)}
            onDeleteCascadeHallazgos={(id) => persist.hallazgos(hallazgos.filter((h) => h.inspeccionId !== id))}
          />
        )}
        {isAdmin && tab === "analisis" && (
          <AnalisisView inspecciones={inspecciones} hallazgos={hallazgos} primary={primary} accent={accent} />
        )}
        {isAdmin && tab === "hallazgos" && (
          <HallazgosView hallazgos={hallazgos} onUpdate={(v) => persist.hallazgos(v)} primary={primary} />
        )}
        {isAdmin && tab === "admin" && (
          <AdminView
            config={config} areas={areas} eppItems={eppItems} personas={personas} usuarios={usuarios}
            currentUser={currentUser}
            onConfig={persist.config} onAreas={persist.areas} onEpp={persist.epp}
            onPersonas={persist.personas} onUsuarios={persist.usuarios}
            primary={primary}
          />
        )}
      </main>

      {isAdmin && <BottomNav tab={tab} setTab={setTab} primary={primary} />}
    </div>
  );
}

/* ---------------------------------- setup inicial ---------------------------------- */

function SetupWizard({ onDone }) {
  const [nombre, setNombre] = useState("Control de Calidad de Cocina");
  const [adminNombre, setAdminNombre] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [error, setError] = useState("");

  const submit = () => {
    if (!adminNombre.trim()) return setError("Escribe el nombre del administrador.");
    if (pw.length < 4) return setError("La contraseña debe tener al menos 4 caracteres.");
    if (pw !== pw2) return setError("Las contraseñas no coinciden.");
    onDone(
      { nombre: nombre.trim() || "Control de Calidad de Cocina", colorPrimario: "#1F2B3A", colorAccent: "#F2622E", logo: null },
      { id: genId(), nombre: adminNombre.trim(), password: pw, rol: "administrador" }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1F2B3A] p-4">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@600;700&family=Inter:wght@400;500;600;700&display=swap');`}</style>
      <div className="bg-white rounded-xl w-full max-w-sm p-6">
        <div className="flex items-center gap-2 mb-1">
          <ClipboardCheck color="#F2622E" size={26} />
          <h1 className="text-lg font-black" style={{ fontFamily: "Oswald, sans-serif" }}>Configuración inicial</h1>
        </div>
        <p className="text-sm text-gray-500 mb-4">Define el nombre de tu checklist y crea la cuenta de administrador.</p>

        <label className="text-xs font-bold text-gray-500 uppercase">Nombre del checklist</label>
        <input value={nombre} onChange={(e) => setNombre(e.target.value)} className="w-full border rounded-md px-3 py-2 mb-3 mt-1" />

        <label className="text-xs font-bold text-gray-500 uppercase">Nombre del administrador</label>
        <input value={adminNombre} onChange={(e) => setAdminNombre(e.target.value)} className="w-full border rounded-md px-3 py-2 mb-3 mt-1" placeholder="Ej. Jefe de cocina" />

        <label className="text-xs font-bold text-gray-500 uppercase">Crear contraseña (mín. 4 caracteres)</label>
        <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} className="w-full border rounded-md px-3 py-2 mb-3 mt-1" />

        <label className="text-xs font-bold text-gray-500 uppercase">Confirmar contraseña</label>
        <input type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} className="w-full border rounded-md px-3 py-2 mb-1 mt-1" />

        {error && (
          <p className="text-xs text-red-700 mb-2 bg-red-50 border border-red-200 rounded-md px-2.5 py-2 font-semibold">{error}</p>
        )}

        <button onClick={submit} className="w-full mt-3 py-2.5 rounded-md font-bold text-white" style={{ background: "#F2622E" }}>
          Crear checklist
        </button>

        <p className="text-center text-[11px] text-gray-400 mt-4">Creado por {CREADO_POR} · v{APP_VERSION}</p>
      </div>
    </div>
  );
}

/* ---------------------------------- login ---------------------------------- */

function LoginScreen({ config, usuarios, onSelectUsuario, children }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ background: "#1F2B3A" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@600;700&family=Inter:wght@400;500;600;700&display=swap');`}</style>
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          {config.logo ? (
            <img src={config.logo} alt="logo" className="h-14 mx-auto mb-3 object-contain" />
          ) : (
            <div className="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ background: config.colorAccent || "#F2622E" }}>
              <ClipboardCheck color="#fff" size={28} />
            </div>
          )}
          <h1 className="text-white text-xl font-black" style={{ fontFamily: "Oswald, sans-serif" }}>{config.nombre}</h1>
          <p className="text-gray-300 text-xs mt-1">Selecciona tu usuario para ingresar</p>
        </div>

        <div className="bg-white rounded-xl p-3 space-y-2 max-h-80 overflow-y-auto">
          {usuarios.map((u) => (
            <button key={u.id} onClick={() => onSelectUsuario(u)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-left">
              <span className="flex items-center gap-2 min-w-0">
                <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <KeyRound size={14} className="text-gray-400" />
                </span>
                <span className="font-semibold text-sm truncate">{u.nombre}</span>
              </span>
              <span className="flex items-center gap-2 flex-shrink-0">
                <Badge
                  color={u.rol === "administrador" ? "#1F2B3A" : "#5C6673"}
                  bg={u.rol === "administrador" ? "#E9ECEF" : "#F1F3F4"}
                >
                  {u.rol === "administrador" ? "Administrador" : "Usuario"}
                </Badge>
                <ChevronRight size={18} className="text-gray-300" />
              </span>
            </button>
          ))}
        </div>

        <p className="text-center text-[11px] text-gray-400 mt-4">Creado por {CREADO_POR} · v{APP_VERSION}</p>
      </div>
      {children}
    </div>
  );
}

/* ---------------------------------- header + nav ---------------------------------- */

function Header({ config, primary, currentUser, isAdmin, onLogout }) {
  return (
    <header className="flex items-center justify-between px-4 py-2.5 text-white sticky top-0 z-30" style={{ background: primary }}>
      <div className="flex items-center gap-2 min-w-0">
        {config.logo ? (
          <img src={config.logo} className="h-8 w-8 object-contain rounded bg-white/10 p-0.5" alt="logo" />
        ) : (
          <ClipboardCheck size={22} />
        )}
        <div className="min-w-0">
          <p className="font-bold text-sm leading-tight truncate" style={{ fontFamily: "Oswald, sans-serif" }}>{config.nombre}</p>
          <p className="text-[11px] text-white/60 truncate">{currentUser.nombre} {isAdmin && "· Admin"}</p>
        </div>
      </div>
      <button onClick={onLogout} className="p-1.5 rounded hover:bg-white/10 flex-shrink-0"><LogOut size={18} /></button>
    </header>
  );
}

function BottomNav({ tab, setTab, primary }) {
  const items = [
    { id: "inspeccion", label: "Inspección", icon: ListChecks },
    { id: "historial", label: "Historial", icon: ClipboardCheck },
    { id: "analisis", label: "Análisis", icon: BarChart3 },
    { id: "hallazgos", label: "Hallazgos", icon: AlertCircle },
    { id: "admin", label: "Admin", icon: Settings },
  ];
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex z-30">
      {items.map((it) => {
        const active = tab === it.id;
        const Icon = it.icon;
        return (
          <button key={it.id} onClick={() => setTab(it.id)} className="flex-1 flex flex-col items-center py-2 gap-0.5">
            <Icon size={19} color={active ? primary : "#9AA2AC"} />
            <span className="text-[10px] font-semibold" style={{ color: active ? primary : "#9AA2AC" }}>{it.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

/* ---------------------------------- inspección ---------------------------------- */

function InspeccionView({ areas, eppItems, personas, currentUser, accent, primary, onSave }) {
  const [areaId, setAreaId] = useState(areas[0]?.id || "");
  const [itemStates, setItemStates] = useState({});
  const [selectedPersonaIds, setSelectedPersonaIds] = useState([]);
  const [eppStates, setEppStates] = useState({});
  const [observaciones, setObservaciones] = useState("");
  const [saved, setSaved] = useState(false);

  const area = areas.find((a) => a.id === areaId);

  const resetForm = (newAreaId) => {
    setAreaId(newAreaId);
    setItemStates({});
    setSelectedPersonaIds([]);
    setEppStates({});
    setObservaciones("");
    setSaved(false);
  };

  const togglePersona = (pid) => {
    setSelectedPersonaIds((prev) => prev.includes(pid) ? prev.filter((x) => x !== pid) : [...prev, pid]);
  };

  const answeredCount = area ? area.items.filter((it) => itemStates[it.id]).length : 0;
  const totalItems = area ? area.items.length : 0;
  const allAnswered = totalItems > 0 && answeredCount === totalItems;

  const sugeridas = personas.filter((p) => (p.areas || []).includes(area?.nombre));
  const otras = personas.filter((p) => !(p.areas || []).includes(area?.nombre));

  const handleSave = async () => {
    if (!allAnswered) return;
    const itemsRes = area.items.map((it) => ({ itemId: it.id, texto: it.texto, estado: itemStates[it.id] }));
    const eppRes = selectedPersonaIds.map((pid) => {
      const p = personas.find((x) => x.id === pid);
      return {
        personaId: pid,
        personaNombre: p?.nombre || "—",
        rol: p?.rol || "",
        items: eppItems.map((ei) => ({ itemId: ei.id, texto: ei.texto, estado: eppStates[`${pid}:${ei.id}`] || "no_aplica" })),
      };
    });
    const noCumpleCount = itemsRes.filter((i) => i.estado === "no_cumple").length;
    const parcialCount = itemsRes.filter((i) => i.estado === "parcial").length;
    const cumpleCount = itemsRes.filter((i) => i.estado === "cumple").length;
    const base = cumpleCount + parcialCount + noCumpleCount;
    const pct = base > 0 ? Math.round(((cumpleCount + parcialCount * 0.5) / base) * 100) : 100;

    const insp = {
      id: genId(),
      fecha: todayISO(),
      areaId: area.id,
      areaNombre: area.nombre,
      inspector: currentUser.nombre,
      items: itemsRes,
      epp: eppRes,
      observaciones,
      cumplimientoPct: pct,
    };

    const nuevosHallazgos = [];
    itemsRes.filter((i) => i.estado === "no_cumple").forEach((i) => {
      nuevosHallazgos.push({
        id: genId(), inspeccionId: insp.id, fecha: insp.fecha, area: area.nombre,
        descripcion: i.texto, responsable: "", estado: "abierto", fechaCompromiso: "", notas: "",
      });
    });
    eppRes.forEach((pe) => {
      pe.items.filter((i) => i.estado === "no_cumple").forEach((i) => {
        nuevosHallazgos.push({
          id: genId(), inspeccionId: insp.id, fecha: insp.fecha, area: area.nombre,
          descripcion: `EPP · ${pe.personaNombre}: ${i.texto}`, responsable: pe.personaNombre,
          estado: "abierto", fechaCompromiso: "", notas: "",
        });
      });
    });

    await onSave(insp, nuevosHallazgos);
    setSaved(true);
  };

  if (saved) {
    return (
      <div className="bg-white rounded-xl p-6 text-center mt-6">
        <Check size={40} className="mx-auto mb-2" color="#1E7A46" />
        <h3 className="font-bold text-lg" style={{ fontFamily: "Oswald, sans-serif" }}>Inspección guardada</h3>
        <p className="text-sm text-gray-500 mt-1">El registro quedó guardado correctamente.</p>
        <button onClick={() => resetForm(areas[0]?.id || "")} className="mt-4 px-5 py-2 rounded-md font-bold text-white" style={{ background: primary }}>
          Nueva inspección
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-xl p-3">
        <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1"><Building2 size={12} /> Área a inspeccionar</label>
        <select value={areaId} onChange={(e) => resetForm(e.target.value)} className="w-full border rounded-md px-3 py-2 mt-1 font-semibold">
          {areas.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
        </select>
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-gray-400">{answeredCount}/{totalItems} ítems evaluados</p>
          <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${totalItems ? (answeredCount / totalItems) * 100 : 0}%`, background: accent }} />
          </div>
        </div>
      </div>

      {area && (
        <div className="bg-white rounded-xl p-3">
          <h3 className="font-bold text-sm mb-2 flex items-center gap-1.5" style={{ fontFamily: "Oswald, sans-serif" }}>
            <ListChecks size={16} /> Puntos de verificación
          </h3>
          <div className="space-y-3">
            {area.items.map((it) => (
              <div key={it.id} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                <p className="text-sm text-gray-700">{it.texto}</p>
                <StatusPicker value={itemStates[it.id]} onChange={(v) => setItemStates((s) => ({ ...s, [it.id]: v }))} />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl p-3">
        <h3 className="font-bold text-sm mb-2 flex items-center gap-1.5" style={{ fontFamily: "Oswald, sans-serif" }}>
          <ShieldCheck size={16} /> Evaluación de EPP del personal
        </h3>
        {personas.length === 0 ? (
          <p className="text-xs text-gray-400">No hay personal registrado. Un administrador puede agregarlo en la sección Admin.</p>
        ) : (
          <>
            <p className="text-xs text-gray-400 mb-2">Selecciona al personal presente para evaluar su equipo de protección.</p>
            <div className="flex flex-wrap gap-1.5">
              {[...sugeridas, ...otras].map((p) => {
                const on = selectedPersonaIds.includes(p.id);
                return (
                  <button key={p.id} onClick={() => togglePersona(p.id)}
                    className="px-2.5 py-1.5 rounded-full text-xs font-semibold border"
                    style={{ borderColor: on ? accent : "#D8DCE1", background: on ? accent : "#fff", color: on ? "#fff" : "#5C6673" }}>
                    {p.nombre}
                  </button>
                );
              })}
            </div>

            {selectedPersonaIds.map((pid) => {
              const p = personas.find((x) => x.id === pid);
              return (
                <div key={pid} className="mt-3 border border-gray-100 rounded-lg p-2.5">
                  <p className="text-sm font-bold mb-1.5">{p?.nombre} <span className="text-xs font-normal text-gray-400">· {p?.rol}</span></p>
                  <div className="space-y-2.5">
                    {eppItems.map((ei) => (
                      <div key={ei.id}>
                        <p className="text-xs text-gray-600">{ei.texto}</p>
                        <StatusPicker
                          compact
                          value={eppStates[`${pid}:${ei.id}`]}
                          onChange={(v) => setEppStates((s) => ({ ...s, [`${pid}:${ei.id}`]: v }))}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>

      <div className="bg-white rounded-xl p-3">
        <label className="text-xs font-bold text-gray-500 uppercase">Observaciones generales</label>
        <textarea value={observaciones} onChange={(e) => setObservaciones(e.target.value)} rows={3}
          className="w-full border rounded-md px-3 py-2 mt-1 text-sm" placeholder="Notas adicionales sobre esta inspección…" />
      </div>

      <button disabled={!allAnswered} onClick={handleSave}
        className="w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 disabled:opacity-40"
        style={{ background: primary }}>
        <Save size={18} /> Guardar inspección
      </button>
    </div>
  );
}

/* ---------------------------------- historial ---------------------------------- */

function HistorialView({ inspecciones, areas, primary, onUpdate, onDeleteCascadeHallazgos }) {
  const [filtroArea, setFiltroArea] = useState("todas");
  const [detalle, setDetalle] = useState(null);
  const [editando, setEditando] = useState(false);
  const [draft, setDraft] = useState(null);

  const filtradas = inspecciones.filter((i) => filtroArea === "todas" || i.areaNombre === filtroArea);

  const exportar = () => {
    const resumen = inspecciones.map((i) => ({
      Fecha: fmtFecha(i.fecha), Área: i.areaNombre, Inspector: i.inspector,
      "Cumplimiento %": i.cumplimientoPct, Observaciones: i.observaciones || "",
    }));
    const detalleItems = [];
    inspecciones.forEach((i) => i.items.forEach((it) => detalleItems.push({
      Fecha: fmtFecha(i.fecha), Área: i.areaNombre, Ítem: it.texto, Estado: statusInfo(it.estado).label,
    })));
    const detalleEpp = [];
    inspecciones.forEach((i) => (i.epp || []).forEach((pe) => pe.items.forEach((it) => detalleEpp.push({
      Fecha: fmtFecha(i.fecha), Área: i.areaNombre, Persona: pe.personaNombre, "Ítem EPP": it.texto, Estado: statusInfo(it.estado).label,
    }))));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(resumen), "Inspecciones");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(detalleItems), "Detalle items");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(detalleEpp), "EPP");
    // bookType xlsx: formato estándar compatible con Excel y con Google Sheets (Archivo > Importar, o abrir desde Drive)
    XLSX.writeFile(wb, "registro_calidad_cocina.xlsx", { bookType: "xlsx" });
  };

  const startEdit = () => { setDraft(JSON.parse(JSON.stringify(detalle))); setEditando(true); };

  const saveEdit = () => {
    const cumpleCount = draft.items.filter((i) => i.estado === "cumple").length;
    const parcialCount = draft.items.filter((i) => i.estado === "parcial").length;
    const noCumpleCount = draft.items.filter((i) => i.estado === "no_cumple").length;
    const base = cumpleCount + parcialCount + noCumpleCount;
    draft.cumplimientoPct = base > 0 ? Math.round(((cumpleCount + parcialCount * 0.5) / base) * 100) : 100;
    onUpdate(inspecciones.map((i) => i.id === draft.id ? draft : i));
    setDetalle(draft);
    setEditando(false);
  };

  const eliminar = () => {
    if (confirm("¿Eliminar esta inspección de forma permanente? También se eliminarán sus hallazgos asociados.")) {
      onUpdate(inspecciones.filter((i) => i.id !== detalle.id));
      onDeleteCascadeHallazgos(detalle.id);
      setDetalle(null);
    }
  };

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-xl p-3 flex flex-col sm:flex-row gap-2 sm:items-center">
        <select value={filtroArea} onChange={(e) => setFiltroArea(e.target.value)} className="border rounded-md px-3 py-2 text-sm flex-1">
          <option value="todas">Todas las áreas</option>
          {areas.map((a) => <option key={a.id} value={a.nombre}>{a.nombre}</option>)}
        </select>
        <button onClick={exportar} className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-sm font-bold border" style={{ borderColor: primary, color: primary }}>
          <Download size={15} /> Exportar Excel
        </button>
      </div>

      {filtradas.length === 0 && <p className="text-center text-sm text-gray-400 py-8">Sin registros todavía.</p>}

      <div className="space-y-2">
        {filtradas.map((i) => {
          const st = i.cumplimientoPct >= 90 ? STATUS[0] : i.cumplimientoPct >= 70 ? STATUS[1] : STATUS[2];
          return (
            <button key={i.id} onClick={() => setDetalle(i)} className="w-full bg-white rounded-lg p-3 flex items-center justify-between text-left">
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">{i.areaNombre}</p>
                <p className="text-xs text-gray-400">{fmtFecha(i.fecha)} · {i.inspector}</p>
              </div>
              <Badge color={st.color} bg={st.bg}>{i.cumplimientoPct}%</Badge>
            </button>
          );
        })}
      </div>

      {detalle && (
        <Modal title={detalle.areaNombre} onClose={() => { setDetalle(null); setEditando(false); }} wide>
          <p className="text-xs text-gray-400 mb-3">{fmtFecha(detalle.fecha)} · Inspector: {detalle.inspector}</p>

          <div className="space-y-3">
            {(editando ? draft : detalle).items.map((it, idx) => (
              <div key={it.itemId} className="border-b border-gray-100 pb-2 last:border-0">
                <p className="text-sm text-gray-700">{it.texto}</p>
                {editando ? (
                  <StatusPicker value={it.estado} onChange={(v) => {
                    const copy = { ...draft };
                    copy.items = copy.items.map((x, i2) => i2 === idx ? { ...x, estado: v } : x);
                    setDraft(copy);
                  }} />
                ) : (
                  <Badge color={statusInfo(it.estado).color} bg={statusInfo(it.estado).bg}>{statusInfo(it.estado).label}</Badge>
                )}
              </div>
            ))}
          </div>

          {detalle.epp && detalle.epp.length > 0 && (
            <div className="mt-4">
              <h4 className="font-bold text-sm mb-2" style={{ fontFamily: "Oswald, sans-serif" }}>EPP evaluado</h4>
              {detalle.epp.map((pe) => (
                <div key={pe.personaId} className="mb-2">
                  <p className="text-xs font-bold text-gray-600">{pe.personaNombre}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {pe.items.map((it) => (
                      <Badge key={it.itemId} color={statusInfo(it.estado).color} bg={statusInfo(it.estado).bg}>{it.texto}: {statusInfo(it.estado).short}</Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {detalle.observaciones && (
            <div className="mt-3">
              <h4 className="font-bold text-sm" style={{ fontFamily: "Oswald, sans-serif" }}>Observaciones</h4>
              <p className="text-sm text-gray-600">{detalle.observaciones}</p>
            </div>
          )}

          <div className="flex gap-2 mt-4">
            {!editando ? (
              <>
                <button onClick={startEdit} className="flex-1 py-2 rounded-md font-bold text-sm border flex items-center justify-center gap-1.5" style={{ borderColor: primary, color: primary }}>
                  <Pencil size={14} /> Editar
                </button>
                <button onClick={eliminar} className="flex-1 py-2 rounded-md font-bold text-sm border flex items-center justify-center gap-1.5" style={{ borderColor: "#B5333D", color: "#B5333D" }}>
                  <Trash2 size={14} /> Eliminar
                </button>
              </>
            ) : (
              <button onClick={saveEdit} className="flex-1 py-2 rounded-md font-bold text-white text-sm flex items-center justify-center gap-1.5" style={{ background: primary }}>
                <Save size={14} /> Guardar cambios
              </button>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ---------------------------------- análisis ---------------------------------- */

function AnalisisView({ inspecciones, hallazgos, primary, accent }) {
  const promedioGeneral = useMemo(() => {
    if (!inspecciones.length) return 0;
    return Math.round(inspecciones.reduce((a, i) => a + i.cumplimientoPct, 0) / inspecciones.length);
  }, [inspecciones]);

  const porArea = useMemo(() => {
    const map = {};
    inspecciones.forEach((i) => {
      if (!map[i.areaNombre]) map[i.areaNombre] = { total: 0, count: 0 };
      map[i.areaNombre].total += i.cumplimientoPct;
      map[i.areaNombre].count += 1;
    });
    return Object.entries(map).map(([nombre, v]) => ({ nombre, pct: Math.round(v.total / v.count) }))
      .sort((a, b) => a.pct - b.pct);
  }, [inspecciones]);

  const tendencia = useMemo(() => {
    return [...inspecciones].sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
      .map((i) => ({ fecha: new Date(i.fecha).toLocaleDateString("es-MX", { day: "2-digit", month: "2-digit" }), pct: i.cumplimientoPct }));
  }, [inspecciones]);

  const abiertos = hallazgos.filter((h) => h.estado !== "cerrado").length;
  const cerrados = hallazgos.filter((h) => h.estado === "cerrado").length;

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-xl p-4 flex items-center gap-4">
        <StampGauge pct={promedioGeneral} />
        <div className="flex-1 grid grid-cols-2 gap-2">
          <div className="bg-gray-50 rounded-lg p-2.5 text-center">
            <p className="text-xl font-black" style={{ color: primary }}>{inspecciones.length}</p>
            <p className="text-[10px] text-gray-400 uppercase font-bold">Inspecciones</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-2.5 text-center">
            <p className="text-xl font-black" style={{ color: "#B5333D" }}>{abiertos}</p>
            <p className="text-[10px] text-gray-400 uppercase font-bold">Hallazgos abiertos</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-2.5 text-center col-span-2">
            <p className="text-xl font-black" style={{ color: "#1E7A46" }}>{cerrados}</p>
            <p className="text-[10px] text-gray-400 uppercase font-bold">Hallazgos cerrados</p>
          </div>
        </div>
      </div>

      {porArea.length > 0 && (
        <div className="bg-white rounded-xl p-3">
          <h3 className="font-bold text-sm mb-2" style={{ fontFamily: "Oswald, sans-serif" }}>Cumplimiento promedio por área</h3>
          <ResponsiveContainer width="100%" height={Math.max(180, porArea.length * 34)}>
            <BarChart data={porArea} layout="vertical" margin={{ left: 10, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
              <YAxis type="category" dataKey="nombre" width={130} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="pct" radius={[0, 4, 4, 0]} fill={accent} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {tendencia.length > 1 && (
        <div className="bg-white rounded-xl p-3">
          <h3 className="font-bold text-sm mb-2" style={{ fontFamily: "Oswald, sans-serif" }}>Tendencia de cumplimiento</h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={tendencia}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="fecha" tick={{ fontSize: 10 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Line type="monotone" dataKey="pct" stroke={primary} strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {inspecciones.length === 0 && <p className="text-center text-sm text-gray-400 py-8">Realiza inspecciones para ver el análisis acumulado.</p>}
    </div>
  );
}

/* ---------------------------------- hallazgos ---------------------------------- */

const ESTADOS_HALLAZGO = [
  { value: "abierto", label: "Abierto", color: "#B5333D", bg: "#FBE7E8" },
  { value: "en_proceso", label: "En proceso", color: "#B4750E", bg: "#FCF1DC" },
  { value: "cerrado", label: "Cerrado", color: "#1E7A46", bg: "#E4F4EA" },
];

function HallazgosView({ hallazgos, onUpdate, primary }) {
  const [filtro, setFiltro] = useState("todos");
  const [editId, setEditId] = useState(null);
  const [draft, setDraft] = useState(null);

  const filtrados = hallazgos.filter((h) => filtro === "todos" || h.estado === filtro);

  const startEdit = (h) => { setEditId(h.id); setDraft({ ...h }); };
  const guardar = () => { onUpdate(hallazgos.map((h) => h.id === draft.id ? draft : h)); setEditId(null); };

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-xl p-2 flex gap-1.5 overflow-x-auto">
        {["todos", ...ESTADOS_HALLAZGO.map((e) => e.value)].map((f) => (
          <button key={f} onClick={() => setFiltro(f)}
            className="px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap"
            style={{ background: filtro === f ? primary : "#F1F3F4", color: filtro === f ? "#fff" : "#5C6673" }}>
            {f === "todos" ? "Todos" : ESTADOS_HALLAZGO.find((e) => e.value === f).label}
          </button>
        ))}
      </div>

      {filtrados.length === 0 && <p className="text-center text-sm text-gray-400 py-8">No hay hallazgos en este filtro.</p>}

      <div className="space-y-2">
        {filtrados.map((h) => {
          const st = ESTADOS_HALLAZGO.find((e) => e.value === h.estado);
          const editing = editId === h.id;
          return (
            <div key={h.id} className="bg-white rounded-lg p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{h.descripcion}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{h.area} · {fmtFecha(h.fecha)}</p>
                </div>
                <Badge color={st.color} bg={st.bg}>{st.label}</Badge>
              </div>

              {editing ? (
                <div className="mt-2 space-y-2">
                  <select value={draft.estado} onChange={(e) => setDraft({ ...draft, estado: e.target.value })} className="w-full border rounded-md px-2 py-1.5 text-sm">
                    {ESTADOS_HALLAZGO.map((e) => <option key={e.value} value={e.value}>{e.label}</option>)}
                  </select>
                  <input value={draft.responsable} onChange={(e) => setDraft({ ...draft, responsable: e.target.value })} placeholder="Responsable" className="w-full border rounded-md px-2 py-1.5 text-sm" />
                  <input type="date" value={draft.fechaCompromiso} onChange={(e) => setDraft({ ...draft, fechaCompromiso: e.target.value })} className="w-full border rounded-md px-2 py-1.5 text-sm" />
                  <textarea value={draft.notas} onChange={(e) => setDraft({ ...draft, notas: e.target.value })} placeholder="Notas de seguimiento" rows={2} className="w-full border rounded-md px-2 py-1.5 text-sm" />
                  <button onClick={guardar} className="w-full py-2 rounded-md font-bold text-white text-sm" style={{ background: primary }}>Guardar</button>
                </div>
              ) : (
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-xs text-gray-500">{h.responsable ? `Responsable: ${h.responsable}` : "Sin responsable asignado"}{h.fechaCompromiso ? ` · Compromiso: ${h.fechaCompromiso}` : ""}</p>
                  <button onClick={() => startEdit(h)} className="text-xs font-bold flex items-center gap-1" style={{ color: primary }}>
                    <Pencil size={12} /> Editar
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------------------------- administración ---------------------------------- */

function AdminView({ config, areas, eppItems, personas, usuarios, currentUser, onConfig, onAreas, onEpp, onPersonas, onUsuarios, primary }) {
  const [sub, setSub] = useState("general");

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
            className="px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap"
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

function AdminGeneral({ config, onConfig, primary }) {
  const [nombre, setNombre] = useState(config.nombre);
  const [colorPrimario, setColorPrimario] = useState(config.colorPrimario);
  const [colorAccent, setColorAccent] = useState(config.colorAccent);
  const [logo, setLogo] = useState(config.logo);
  const [logoError, setLogoError] = useState("");
  const [logoBusy, setLogoBusy] = useState(false);

  const handleLogo = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLogoBusy(true);
    setLogoError("");
    try {
      const dataUrl = await resizeImageToDataUrl(file, 320);
      setLogo(dataUrl);
      await onConfig({ ...config, nombre, colorPrimario, colorAccent, logo: dataUrl });
    } catch (err) {
      setLogoError(err.message || "No se pudo cargar la imagen.");
    } finally {
      setLogoBusy(false);
      e.target.value = "";
    }
  };

  const quitarLogo = async () => {
    setLogo(null);
    setLogoError("");
    await onConfig({ ...config, nombre, colorPrimario, colorAccent, logo: null });
  };

  const guardar = () => onConfig({ ...config, nombre, colorPrimario, colorAccent, logo });

  return (
    <div className="bg-white rounded-xl p-3 space-y-3">
      <div>
        <label className="text-xs font-bold text-gray-500 uppercase">Nombre del checklist</label>
        <input value={nombre} onChange={(e) => setNombre(e.target.value)} className="w-full border rounded-md px-3 py-2 mt-1" />
      </div>
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1"><Palette size={12} /> Color primario</label>
          <input type="color" value={colorPrimario} onChange={(e) => setColorPrimario(e.target.value)} className="w-full h-10 border rounded-md mt-1" />
        </div>
        <div className="flex-1">
          <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1"><Palette size={12} /> Color de acento</label>
          <input type="color" value={colorAccent} onChange={(e) => setColorAccent(e.target.value)} className="w-full h-10 border rounded-md mt-1" />
        </div>
      </div>

      <div>
        <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1"><ImagePlus size={12} /> Logo corporativo</label>
        <div className="flex items-center gap-3 mt-1.5">
          <div className="w-16 h-16 rounded-lg border border-dashed border-gray-300 flex items-center justify-center flex-shrink-0 overflow-hidden bg-gray-50">
            {logo ? <img src={logo} className="w-full h-full object-contain" /> : <ImagePlus size={20} className="text-gray-300" />}
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="px-3 py-1.5 rounded-md text-xs font-bold border cursor-pointer inline-flex items-center gap-1.5 w-fit"
              style={{ borderColor: primary, color: primary }}>
              <ImagePlus size={13} /> {logoBusy ? "Cargando…" : "Subir imagen"}
              <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={handleLogo} className="hidden" disabled={logoBusy} />
            </label>
            {logo && (
              <button onClick={quitarLogo} className="px-3 py-1.5 rounded-md text-xs font-bold border border-red-200 text-red-600 w-fit">Quitar logo</button>
            )}
          </div>
        </div>
        <p className="text-[11px] text-gray-400 mt-1.5">Formatos: PNG, JPG, WEBP o SVG. Se ajusta automáticamente y se guarda al instante.</p>
        {logoError && <p className="text-xs text-red-600 mt-1 bg-red-50 border border-red-200 rounded-md px-2 py-1.5">{logoError}</p>}
      </div>

      <button onClick={guardar} className="w-full py-2.5 rounded-md font-bold text-white flex items-center justify-center gap-2" style={{ background: primary }}>
        <Save size={16} /> Guardar cambios
      </button>
    </div>
  );
}

function AdminAreas({ areas, onAreas, primary }) {
  const [nuevaArea, setNuevaArea] = useState("");
  const [nuevoItem, setNuevoItem] = useState({});
  const [expand, setExpand] = useState(null);

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

  return (
    <div className="space-y-2">
      <div className="bg-white rounded-xl p-3 flex gap-2">
        <input value={nuevaArea} onChange={(e) => setNuevaArea(e.target.value)} placeholder="Nueva área…" className="flex-1 border rounded-md px-3 py-2 text-sm" />
        <button onClick={agregarArea} className="px-3 rounded-md font-bold text-white flex items-center gap-1" style={{ background: primary }}><Plus size={16} /></button>
      </div>

      {areas.map((a) => (
        <div key={a.id} className="bg-white rounded-xl p-3">
          <div className="flex items-center gap-2">
            <input value={a.nombre} onChange={(e) => renombrarArea(a.id, e.target.value)} className="flex-1 font-bold text-sm border-b border-transparent focus:border-gray-300 outline-none py-1" />
            <button onClick={() => setExpand(expand === a.id ? null : a.id)} className="text-xs font-bold" style={{ color: primary }}>{expand === a.id ? "Ocultar" : `${a.items.length} ítems`}</button>
            <button onClick={() => eliminarArea(a.id)} className="text-red-500"><Trash2 size={16} /></button>
          </div>
          {expand === a.id && (
            <div className="mt-2 space-y-1.5">
              {a.items.map((it) => (
                <div key={it.id} className="flex items-center gap-2 text-sm bg-gray-50 rounded-md px-2 py-1.5">
                  <span className="flex-1">{it.texto}</span>
                  <button onClick={() => eliminarItem(a.id, it.id)} className="text-red-400"><Trash2 size={13} /></button>
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

function AdminEpp({ eppItems, onEpp, primary }) {
  const [nuevo, setNuevo] = useState("");
  const agregar = () => {
    if (!nuevo.trim()) return;
    onEpp([...eppItems, { id: genId(), texto: nuevo.trim() }]);
    setNuevo("");
  };
  const eliminar = (id) => onEpp(eppItems.filter((i) => i.id !== id));
  const editar = (id, texto) => onEpp(eppItems.map((i) => i.id === id ? { ...i, texto } : i));

  return (
    <div className="bg-white rounded-xl p-3 space-y-1.5">
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

function AreaCheckboxes({ areas, value, onChange, max = MAX_AREAS_POR_PERSONA }) {
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

function AdminPersonas({ personas, areas, onPersonas, primary }) {
  const [form, setForm] = useState({ nombre: "", rol: "", areas: [] });
  const [editId, setEditId] = useState(null);

  const agregar = () => {
    if (!form.nombre.trim()) return;
    onPersonas([...personas, { id: genId(), ...form, nombre: form.nombre.trim() }]);
    setForm({ nombre: "", rol: "", areas: [] });
  };
  const eliminar = (id) => {
    if (confirm("¿Eliminar a esta persona?")) onPersonas(personas.filter((p) => p.id !== id));
  };
  const guardarEdicion = (p) => {
    onPersonas(personas.map((x) => x.id === p.id ? p : x));
    setEditId(null);
  };

  return (
    <div className="space-y-2">
      <div className="bg-white rounded-xl p-3 space-y-2">
        <h3 className="font-bold text-sm flex items-center gap-1.5" style={{ fontFamily: "Oswald, sans-serif" }}><UserPlus size={15} /> Agregar personal</h3>
        <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Nombre completo" className="w-full border rounded-md px-3 py-2 text-sm" />
        <input value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value })} placeholder="Rol / puesto" className="w-full border rounded-md px-3 py-2 text-sm" />
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase">Áreas asignadas (máx. 3)</label>
          <div className="mt-1"><AreaCheckboxes areas={areas} value={form.areas} onChange={(v) => setForm({ ...form, areas: v })} /></div>
        </div>
        <button onClick={agregar} className="w-full py-2 rounded-md font-bold text-white flex items-center justify-center gap-1.5" style={{ background: primary }}><Plus size={15} /> Agregar</button>
      </div>

      {personas.map((p) => (
        <div key={p.id} className="bg-white rounded-xl p-3">
          {editId === p.id ? (
            <PersonaEditForm persona={p} areas={areas} onSave={guardarEdicion} onCancel={() => setEditId(null)} primary={primary} />
          ) : (
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="font-semibold text-sm">{p.nombre}</p>
                <p className="text-xs text-gray-400">{p.rol}{p.areas?.length ? ` · ${p.areas.join(", ")}` : ""}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => setEditId(p.id)} className="text-gray-500"><Pencil size={16} /></button>
                <button onClick={() => eliminar(p.id)} className="text-red-500"><Trash2 size={16} /></button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function PersonaEditForm({ persona, areas, onSave, onCancel, primary }) {
  const [p, setP] = useState({ ...persona, areas: persona.areas || [] });
  return (
    <div className="space-y-2">
      <input value={p.nombre} onChange={(e) => setP({ ...p, nombre: e.target.value })} className="w-full border rounded-md px-3 py-2 text-sm" />
      <input value={p.rol} onChange={(e) => setP({ ...p, rol: e.target.value })} className="w-full border rounded-md px-3 py-2 text-sm" />
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

function AdminUsuarios({ usuarios, onUsuarios, currentUser, primary }) {
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
      <div className="bg-white rounded-xl p-3 space-y-2">
        <h3 className="font-bold text-sm flex items-center gap-1.5" style={{ fontFamily: "Oswald, sans-serif" }}>
          <UserPlus size={15} /> Agregar usuario ({usuarios.length}/{MAX_USUARIOS})
        </h3>
        <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Nombre" className="w-full border rounded-md px-3 py-2 text-sm" />
        <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Contraseña (mín. 4 caracteres)" className="w-full border rounded-md px-3 py-2 text-sm" />
        <select value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value })} className="w-full border rounded-md px-3 py-2 text-sm">
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
        <div key={u.id} className="bg-white rounded-xl p-3">
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

function UsuarioEditForm({ usuario, onSave, onCancel, primary }) {
  const [u, setU] = useState({ ...usuario, password: usuario.password });
  return (
    <div className="space-y-2">
      <input value={u.nombre} onChange={(e) => setU({ ...u, nombre: e.target.value })} className="w-full border rounded-md px-3 py-2 text-sm" placeholder="Nombre" />
      <input type="password" value={u.password} onChange={(e) => setU({ ...u, password: e.target.value })} className="w-full border rounded-md px-3 py-2 text-sm" placeholder="Contraseña" />
      <select value={u.rol} onChange={(e) => setU({ ...u, rol: e.target.value })} className="w-full border rounded-md px-3 py-2 text-sm">
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

function AdminAcercaDe({ primary }) {
  return (
    <div className="bg-white rounded-xl p-4">
      <div className="flex items-center gap-2 mb-1">
        <Info size={18} color={primary} />
        <h3 className="font-bold text-base" style={{ fontFamily: "Oswald, sans-serif" }}>Acerca de este checklist</h3>
      </div>
      <p className="text-sm text-gray-600">Creado por <span className="font-bold">{CREADO_POR}</span></p>
      <p className="text-sm text-gray-400 mb-3">Versión actual: <span className="font-bold" style={{ color: primary }}>v{APP_VERSION}</span></p>

      <h4 className="text-xs font-bold text-gray-500 uppercase mb-1.5">Historial de versiones</h4>
      <div className="space-y-2">
        {CHANGELOG.map((c) => (
          <div key={c.version} className="border-l-2 pl-2.5" style={{ borderColor: primary }}>
            <p className="text-sm font-bold">v{c.version} <span className="text-xs font-normal text-gray-400">· {c.fecha}</span></p>
            <p className="text-xs text-gray-600">{c.cambios}</p>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-gray-400 mt-3">La versión se actualiza cada vez que se realizan ajustes significativos a la aplicación.</p>
    </div>
  );
}
