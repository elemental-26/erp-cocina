import React, { useState, useEffect, useMemo, useRef } from "react";
import TalentoHumanoView from "./TalentoHumanoModule";
import {
  ClipboardCheck, CheckCircle2, AlertTriangle, XCircle, MinusCircle,
  Settings, Users, BarChart3, ListChecks, LogOut, Plus, Trash2, Pencil,
  Lock, ChevronRight, Download, ShieldCheck, AlertCircle, UserPlus,
  Palette, ImagePlus, X, Save, Building2, Check, Info, KeyRound,
  BriefcaseBusiness, FileText
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

const APP_VERSION = "1.9.0";
const APP_VERSION_DATE = "2026-08-05";
const CREADO_POR = "Faber Solano";
const CHANGELOG = [
  { version: "1.9.0", fecha: APP_VERSION_DATE, cambios: "Rediseño de inspecciones, EPP y evaluaciones con filas operativas tipo bosquejo, y KPIs propios de calidad en analisis." },
  { version: "1.8.0", fecha: APP_VERSION_DATE, cambios: "Panel de firma estabilizado para lapiz o dedo, con bloqueo de desplazamiento mientras se firma." },
  { version: "1.7.0", fecha: APP_VERSION_DATE, cambios: "Inicio en cuadricula de modulos, cabecera interna compacta por modulo y navegacion superior para Calidad." },
  { version: "1.6.0", fecha: "2026-08-05", cambios: "Firmas tactiles extendidas a documentos generados, evidencias desde camara/galeria y opcion de compartir por WhatsApp/Web Share." },
  { version: "1.5.0", fecha: "2026-08-05", cambios: "Modulo de gestion de desviaciones y acciones correctivas con evidencia fotografica, firmas tactiles, documento imprimible y verificacion de eficacia." },
  { version: "1.4.0", fecha: "2026-08-03", cambios: "Impresion de inspecciones y listas de chequeo, evaluacion diferenciada para servicio al cliente, historial superior de evaluaciones y conservacion reforzada de fotografias de colaboradores." },
  { version: "1.3.0", fecha: "2026-08-03", cambios: "Lista EPP independiente en Calidad, llamados de atencion descargables/enviables, reportes individuales y acumulados de talento humano con observaciones, graficas y registro fotografico." },
  { version: "1.2.0", fecha: "2026-07-31", cambios: "Shell ERP global, base unica de personal, modulo de talento humano separado, inspecciones por responsable de area, mejoras tablet/PWA y configuracion visual." },
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

const DEVIATION_TYPES = [
  "Calidad del producto",
  "Cantidad insuficiente",
  "Error de empaque",
  "Temperatura",
  "Presentacion",
  "Inocuidad",
  "Incumplimiento de procedimiento",
  "Atencion al cliente",
  "Infraestructura",
  "Equipos",
  "Otro",
];
const DEVIATION_SERVICES = ["Desayuno", "Almuerzo", "Cena", "Refrigerio", "Evento", "Otro"];
const DEVIATION_SEVERITIES = ["Baja", "Media", "Alta", "Critica"];
const DEVIATION_STATES = ["Abierta", "En proceso", "Cerrada"];
const DEVIATION_EFFECTIVENESS = ["Pendiente", "Si", "Parcialmente", "No"];

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
            title={s.label}
            className={`${compact ? "min-h-12 px-1" : "py-2"} rounded-md border text-[11px] font-semibold tracking-tight transition-all leading-tight flex items-center justify-center`}
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
      className="relative flex items-center justify-center rounded-full overflow-hidden mx-auto"
      style={{
        width: size, height: size, minWidth: size,
        background: `conic-gradient(${color} ${angle}deg, #E7E9EC ${angle}deg)`,
      }}
    >
      <div
        className="absolute rounded-full flex flex-col items-center justify-center border border-dashed text-center px-2"
        style={{ width: size - 24, height: size - 24, background: "#fff", borderColor: color }}
      >
        <span className="text-xl font-black leading-none" style={{ color }}>{Math.round(clamped)}%</span>
        <span className="text-[9px] font-bold uppercase leading-tight mt-1" style={{ color }}>Cumplimiento</span>
      </div>
    </div>
  );
}

function Modal({ title, onClose, children, wide }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className={`bg-white w-full ${wide ? "sm:max-w-3xl" : "sm:max-w-lg"} sm:rounded-xl rounded-t-2xl max-h-[90vh] flex flex-col`}>
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
    <Modal title={`Ingreso · ${usuario.nombre}`} onClose={onClose} wide>
      <div className="max-w-lg mx-auto py-2">
        <p className="text-base text-gray-600 mb-4 text-center">Ingresa tu contraseña para continuar.</p>
        <input
          type="password"
          autoFocus
          value={pw}
          onChange={(e) => { setPw(e.target.value); setErr(false); }}
          onKeyDown={(e) => { if (e.key === "Enter") { pw === usuario.password ? onSuccess() : setErr(true); } }}
          className="w-full border-2 rounded-xl px-4 py-4 text-center text-2xl tracking-widest"
          style={{ borderColor: err ? "#B5333D" : "#D8DCE1" }}
          placeholder="Contraseña"
        />
        {err && <p className="text-sm text-red-600 mt-2 text-center">Contraseña incorrecta, intenta de nuevo.</p>}
        <button
          onClick={() => { if (pw === usuario.password) onSuccess(); else setErr(true); }}
          className="w-full mt-5 py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 text-base"
          style={{ background: "#1F2B3A" }}
        >
          <Lock size={18} /> Ingresar
        </button>
      </div>
    </Modal>
  );
}

/* ---------------------------------- app principal ---------------------------------- */

export default function App() {
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState(null);
   const [areas, setAreas] = useState([]);
  const [eppItems, setEppItems] = useState([]);
  const [personas, setPersonas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [inspecciones, setInspecciones] = useState([]);
  const [hallazgos, setHallazgos] = useState([]);
  const [desviaciones, setDesviaciones] = useState([]);
  const [hrColaboradores, setHrColaboradores] = useState([]);
  const [hrEvaluaciones, setHrEvaluaciones] = useState([]);
  const [hrPlanes, setHrPlanes] = useState([]);
  const [hrCapacitaciones, setHrCapacitaciones] = useState([]);
  const [hrCertificaciones, setHrCertificaciones] = useState([]);

  const [currentUser, setCurrentUser] = useState(null);
  const [activeModule, setActiveModule] = useState("menu");
  const [tab, setTab] = useState("inspeccion");
  const [loginTarget, setLoginTarget] = useState(null);

  useEffect(() => {
    (async () => {
      const [c, a, e, p, u, i, h, d, hc, he, hp, ht, hcert, session] = await Promise.all([
        loadKey("qc_config", null),
        loadKey("qc_areas", null),
        loadKey("qc_epp", null),
        loadKey("qc_personas", []),
        loadKey("qc_usuarios", []),
        loadKey("qc_inspecciones", []),
        loadKey("qc_hallazgos", []),
        loadKey("qc_desviaciones", []),
        loadKey("hr_colaboradores", []),
        loadKey("hr_evaluaciones", []),
        loadKey("hr_planes_mejora", []),
        loadKey("hr_capacitaciones", []),
        loadKey("hr_certificaciones", []),
        loadKey("erp_session_user", null),
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
      const migratedColaboradores = (hc?.length ? hc : finalPersonas.map((per) => ({
        ...per,
        documento: per.documento || "",
        cargo: per.cargo || per.rol || "",
        area: per.area || per.areas?.[0] || "",
        estado: per.estado || "Activo",
      })));
      if (!hc?.length && migratedColaboradores.length) saveKey("hr_colaboradores", migratedColaboradores);
      setConfig(c);
      setAreas(finalAreas);
      setEppItems(finalEpp);
      setPersonas(migratedColaboradores);
      setUsuarios(u || []);
      setInspecciones(i || []);
      setHallazgos(h || []);
      setDesviaciones(d || []);
      setHrColaboradores(migratedColaboradores || []);
      setHrEvaluaciones(he || []);
      setHrPlanes(hp || []);
      setHrCapacitaciones(ht || []);
      setHrCertificaciones(hcert || []);
      if (session && (u || []).some((user) => user.id === session.id)) setCurrentUser(session);
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
    desviaciones: async (v) => { setDesviaciones(v); await saveKey("qc_desviaciones", v); },
    hrColaboradores: async (v) => { setHrColaboradores(v); setPersonas(v); await saveKey("hr_colaboradores", v); await saveKey("qc_personas", v); },
    hrEvaluaciones: async (v) => { setHrEvaluaciones(v); await saveKey("hr_evaluaciones", v); },
    hrPlanes: async (v) => { setHrPlanes(v); await saveKey("hr_planes_mejora", v); },
    hrCapacitaciones: async (v) => { setHrCapacitaciones(v); await saveKey("hr_capacitaciones", v); },
    hrCertificaciones: async (v) => { setHrCertificaciones(v); await saveKey("hr_certificaciones", v); },
  };

  const primary = config?.colorPrimario || "#1F2B3A";
  const accent = config?.colorAccent || "#F2622E";
  const isAdmin = currentUser?.rol === "administrador";
  const activeColaboradores = useMemo(() => hrColaboradores.filter((p) => p.estado !== "Inactivo" && p.estado !== "Retirado"), [hrColaboradores]);

  useEffect(() => {
    if (loading || !config) return;
    saveKey("erp_last_backup", {
      createdAt: todayISO(),
      version: APP_VERSION,
      config,
      areas,
      eppItems,
      usuarios,
      inspecciones,
      hallazgos,
      desviaciones,
      hrColaboradores,
      hrEvaluaciones,
      hrPlanes,
      hrCapacitaciones,
      hrCertificaciones,
    });
  }, [loading, config, areas, eppItems, usuarios, inspecciones, hallazgos, desviaciones, hrColaboradores, hrEvaluaciones, hrPlanes, hrCapacitaciones, hrCertificaciones]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F1F3F4]">
        <div className="text-center">
          <ClipboardCheck className="mx-auto mb-2 animate-pulse" size={36} color="#1F2B3A" />
          <p className="text-sm text-gray-500">Cargando...</p>
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
          saveKey("erp_session_user", adminUsuario);
          setActiveModule("menu");
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
            onSuccess={() => { setCurrentUser(loginTarget); saveKey("erp_session_user", loginTarget); setLoginTarget(null); setActiveModule("menu"); setTab("inspeccion"); }}
          />
        )}
      </LoginScreen>
    );
  }

  return (
    <div
      className="erp-touch min-h-screen flex flex-col relative"
      style={{
        background: config?.appBackground || "#F1F3F4",
        fontFamily: config?.fontFamily || "Inter, sans-serif",
        fontSize: `${config?.fontScale || 125}%`,
        "--erp-font-factor": (config?.fontScale || 125) / 100,
        "--erp-cell-bg": config?.cellBackground || "#FFFFFF",
        "--erp-field-border": `${config?.fieldBorderWidth || 1}px`,
        "--erp-field-padding-y": `${config?.fieldPaddingY || 9}px`,
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Inter:wght@400;500;600;700;800&display=swap');
      `}</style>
      {config?.logo && config?.watermarkLogo !== false && (
        <img src={config.logo} alt="" className="pointer-events-none fixed right-4 bottom-20 z-0 h-40 w-40 object-contain opacity-[0.035]" />
      )}

      <ErpHeader config={config} primary={primary} currentUser={currentUser} isAdmin={isAdmin}
        activeModule={activeModule}
        onHome={() => setActiveModule("menu")}
        onLogout={() => { setCurrentUser(null); saveKey("erp_session_user", null); setActiveModule("menu"); }} />

      <main className="flex-1 overflow-y-auto pb-6 w-full max-w-6xl mx-auto px-3 pt-3 relative z-10">
        {activeModule === "menu" && (
          <ErpModuleLauncher
            isAdmin={isAdmin}
            primary={primary}
            accent={accent}
            onSelect={(moduleId) => {
              setActiveModule(moduleId);
              setTab(moduleId === "calidad" ? "inspeccion" : "dashboard");
            }}
          />
        )}
        {activeModule === "calidad" && (
          <QualityTabs tab={tab} setTab={setTab} primary={primary} isAdmin={isAdmin} />
        )}
        {activeModule === "calidad" && tab === "inspeccion" && (
          <AreaInspectionView
            areas={areas} personas={activeColaboradores}
            currentUser={currentUser} accent={accent} primary={primary}
            onSave={async (insp, nuevosHallazgos) => {
              await persist.inspecciones([insp, ...inspecciones]);
              if (nuevosHallazgos.length) await persist.hallazgos([...nuevosHallazgos, ...hallazgos]);
            }}
          />
        )}
        {activeModule === "calidad" && tab === "epp" && (
          <EppChecklistView
            eppItems={eppItems}
            personas={activeColaboradores}
            currentUser={currentUser}
            primary={primary}
            accent={accent}
            onSave={async (insp, nuevosHallazgos) => {
              await persist.inspecciones([insp, ...inspecciones]);
              if (nuevosHallazgos.length) await persist.hallazgos([...nuevosHallazgos, ...hallazgos]);
            }}
          />
        )}
        {activeModule === "calidad" && isAdmin && tab === "historial" && (
          <HistorialView
            inspecciones={inspecciones} areas={areas} primary={primary}
            onUpdate={(v) => persist.inspecciones(v)}
            onDeleteCascadeHallazgos={(id) => persist.hallazgos(hallazgos.filter((h) => h.inspeccionId !== id))}
          />
        )}
        {activeModule === "calidad" && isAdmin && tab === "analisis" && (
          <AnalisisView inspecciones={inspecciones} hallazgos={hallazgos} desviaciones={desviaciones} primary={primary} accent={accent} />
        )}
        {activeModule === "calidad" && isAdmin && tab === "hallazgos" && (
          <HallazgosView hallazgos={hallazgos} onUpdate={(v) => persist.hallazgos(v)} primary={primary} />
        )}
        {activeModule === "calidad" && isAdmin && tab === "desviaciones" && (
          <DesviacionesView
            desviaciones={desviaciones}
            areas={areas}
            colaboradores={activeColaboradores}
            currentUser={currentUser}
            primary={primary}
            config={config}
            onUpdate={(v) => persist.desviaciones(v)}
          />
        )}
        {activeModule === "talento" && isAdmin && (
          <TalentoHumanoView
            colaboradores={hrColaboradores}
            evaluaciones={hrEvaluaciones}
            planes={hrPlanes}
            capacitaciones={hrCapacitaciones}
            certificaciones={hrCertificaciones}
            usuarios={usuarios}
            areas={areas}
            currentUser={currentUser}
            primary={primary}
            accent={accent}
            config={config}
            onColaboradores={persist.hrColaboradores}
            onEvaluaciones={persist.hrEvaluaciones}
            onPlanes={persist.hrPlanes}
            onCapacitaciones={persist.hrCapacitaciones}
            onCertificaciones={persist.hrCertificaciones}
            onConfig={persist.config}
          />
        )}
        {activeModule === "admin" && isAdmin && (
          <AdminView
            config={config} areas={areas} eppItems={eppItems} personas={hrColaboradores} usuarios={usuarios}
            currentUser={currentUser}
            onConfig={persist.config} onAreas={persist.areas} onEpp={persist.epp}
            onPersonas={persist.hrColaboradores} onUsuarios={persist.usuarios}
            primary={primary}
            backupData={{ config, areas, eppItems, usuarios, inspecciones, hallazgos, desviaciones, hrColaboradores, hrEvaluaciones, hrPlanes, hrCapacitaciones, hrCertificaciones }}
          />
        )}
      </main>

    </div>
  );
}

function ErpHeader({ config, primary, currentUser, isAdmin, activeModule, onHome, onLogout }) {
  const moduleLabel = activeModule === "calidad" ? "Calidad e inspecciones" : activeModule === "talento" ? "Gestión del Talento Humano" : activeModule === "admin" ? "Administración global" : "Inicio";
  const inModule = activeModule !== "menu";
  return (
    <header className="flex items-center justify-between px-4 py-2 text-white sticky top-0 z-30" style={{ background: primary }}>
      <div className="flex items-center gap-2 min-w-0">
        {!inModule && (config.logo ? (
          <img src={config.logo} className="h-7 w-7 object-contain rounded bg-white/10 p-0.5 flex-shrink-0" alt="logo" />
        ) : <ClipboardCheck size={22} />)}
        <div className="min-w-0">
          <p className="font-bold text-sm leading-tight truncate" style={{ fontFamily: "Oswald, sans-serif" }}>{inModule ? moduleLabel : config.nombre}</p>
          <p className="text-[11px] text-white/70 truncate">{inModule ? `${currentUser.nombre}${isAdmin ? " · Admin" : ""}` : `${moduleLabel} · ${currentUser.nombre}${isAdmin ? " · Admin" : ""}`}</p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button onClick={onHome} className="px-2 py-1.5 rounded hover:bg-white/10 text-xs font-bold">Inicio</button>
        <button onClick={onLogout} className="p-1.5 rounded hover:bg-white/10 flex-shrink-0"><LogOut size={18} /></button>
      </div>
    </header>
  );
}

function ErpModuleLauncher({ isAdmin, primary, accent, onSelect }) {
  const modules = [
    { id: "calidad", title: "Calidad e inspecciones", description: "Inspecciones, EPP, hallazgos y desviaciones.", icon: ClipboardCheck, enabled: true, color: accent },
    { id: "talento", title: "Talento humano", description: "Colaboradores, evaluaciones y planes.", icon: BriefcaseBusiness, enabled: isAdmin, color: primary },
    { id: "admin", title: "Administración", description: "Usuarios, temas, logo y backups.", icon: Settings, enabled: isAdmin, color: "#5C6673" },
  ];
  return (
    <div className="py-3 space-y-3">
      <div className="bg-white rounded-xl p-3">
        <h1 className="text-lg font-black text-gray-800" style={{ fontFamily: "Oswald, sans-serif" }}>Módulos del ERP</h1>
        <p className="text-sm text-gray-500 mt-1">Selecciona el área de trabajo.</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {modules.map((module) => {
          const Icon = module.icon;
          return (
            <button
              key={module.id}
              disabled={!module.enabled}
              onClick={() => onSelect(module.id)}
              className="bg-white rounded-xl p-3 min-h-40 border border-transparent hover:border-gray-200 disabled:opacity-45 flex flex-col items-center justify-center text-center gap-2"
            >
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: `${module.color}18` }}>
                <Icon size={34} color={module.color} />
              </div>
              <h2 className="font-black text-gray-800 text-base leading-tight" style={{ fontFamily: "Oswald, sans-serif" }}>{module.title}</h2>
              <p className="text-xs text-gray-500 leading-snug">{module.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ChecklistItemRow({ item, status, observation, evidence, onStatus, onObservation, onEvidence, primary }) {
  return (
    <div className="grid xl:grid-cols-[minmax(230px,1fr)_220px_minmax(260px,1.15fr)_170px] lg:grid-cols-[minmax(220px,1fr)_210px_minmax(240px,1.1fr)_160px] gap-2 items-stretch rounded-xl border border-gray-100 bg-white/70 p-2">
      <div className="rounded-lg bg-gray-50 border border-gray-100 px-3 py-2 flex items-center justify-center min-h-20">
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Item</p>
          <p className="text-sm font-semibold text-gray-700 leading-snug">{item.texto}</p>
        </div>
      </div>
      <div className="rounded-lg bg-gray-50 border border-gray-100 px-2 py-2">
        <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Cumplimiento</p>
        <StatusPicker value={status} onChange={onStatus} compact />
      </div>
      <div className="rounded-lg bg-gray-50 border border-gray-100 px-2 py-2">
        <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Observaciones</p>
        <textarea value={observation || ""} onChange={(event) => onObservation(event.target.value)} rows={2} placeholder="Observaciones del punto verificado" className="w-full border rounded-md px-2 py-1.5 text-sm min-h-20" />
      </div>
      <div className="rounded-lg bg-gray-50 border border-gray-100 px-2 py-2">
        <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Evidencia</p>
        <EvidenceActions onChange={onEvidence} primary={primary} multiple={false} />
        {evidence ? <img src={evidence} alt="" className="mt-2 h-16 w-full object-cover rounded-md border" /> : <div className="mt-2 h-16 rounded-md border border-dashed bg-white flex items-center justify-center text-[10px] text-gray-400">Sin evidencia</div>}
      </div>
    </div>
  );
}

function AreaInspectionView({ areas, personas, currentUser, accent, primary, onSave }) {
  const [areaId, setAreaId] = useState(areas[0]?.id || "");
  const [itemStates, setItemStates] = useState({});
  const [itemNotes, setItemNotes] = useState({});
  const [itemEvidence, setItemEvidence] = useState({});
  const [responsableId, setResponsableId] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [evidencias, setEvidencias] = useState([]);
  const [firmaInspector, setFirmaInspector] = useState("");
  const [firmaResponsable, setFirmaResponsable] = useState("");
  const [saved, setSaved] = useState(false);

  const area = areas.find((a) => a.id === areaId);
  const areaPeople = personas.filter((p) => {
    const assigned = p.areas || (p.area ? [p.area] : []);
    return area?.nombre ? assigned.includes(area.nombre) || !assigned.length : true;
  });
  const responsable = personas.find((p) => p.id === responsableId);
  const answeredCount = area ? area.items.filter((it) => itemStates[it.id]).length : 0;
  const totalItems = area ? area.items.length : 0;
  const allAnswered = totalItems > 0 && answeredCount === totalItems;

  const resetForm = (newAreaId = areas[0]?.id || "") => {
    setAreaId(newAreaId);
    setItemStates({});
    setItemNotes({});
    setItemEvidence({});
    setResponsableId("");
    setObservaciones("");
    setEvidencias([]);
    setFirmaInspector("");
    setFirmaResponsable("");
    setSaved(false);
  };

  const handleEvidence = async (e) => {
    const files = Array.from(e.target.files || []);
    const converted = await Promise.all(files.map((file) => resizeImageToDataUrl(file, 720)));
    setEvidencias((prev) => [...prev, ...converted]);
    e.target.value = "";
  };

  const handleItemEvidence = async (itemId, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const converted = await resizeImageToDataUrl(file, 520);
    setItemEvidence((prev) => ({ ...prev, [itemId]: converted }));
    e.target.value = "";
  };

  const handleSave = async () => {
    if (!allAnswered || !area) return;
    const itemsRes = area.items.map((it) => ({ itemId: it.id, texto: it.texto, estado: itemStates[it.id], observacion: itemNotes[it.id] || "", evidencia: itemEvidence[it.id] || "" }));
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
      responsableId,
      responsableNombre: responsable?.nombre || "",
      responsableFoto: responsable?.foto || null,
      items: itemsRes,
      epp: [],
      observaciones,
      evidencias,
      cumplimientoPct: pct,
    };
    const nuevosHallazgos = itemsRes.filter((i) => i.estado === "no_cumple").map((i) => ({
      id: genId(),
      inspeccionId: insp.id,
      fecha: insp.fecha,
      area: area.nombre,
      descripcion: i.texto,
      responsable: responsable?.nombre || "",
      estado: "abierto",
      fechaCompromiso: "",
      notas: i.observacion || observaciones || "",
    }));
    await onSave(insp, nuevosHallazgos);
    setSaved(true);
  };

  const printBlankChecklist = () => {
    if (!area) return;
    openPrintDocument(`Lista de chequeo - ${area.nombre}`, checklistPrintHtml({
      title: `Lista de chequeo - ${area.nombre}`,
      subtitle: "Formato para inspeccion de area.",
      items: area.items,
      primary,
    }));
  };
  const shareBlankChecklist = async () => {
    if (!area) return;
    await shareDocument({
      filename: `lista-chequeo-${area.nombre.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.html`,
      html: checklistPrintHtml({ title: `Lista de chequeo - ${area.nombre}`, subtitle: "Formato para inspección de área.", items: area.items, primary }),
      title: `Lista de chequeo - ${area.nombre}`,
      text: `Lista de chequeo para ${area.nombre}`,
    });
  };

  if (saved) {
    return (
      <div className="bg-white rounded-xl p-6 text-center mt-6">
        <Check size={40} className="mx-auto mb-2" color="#1E7A46" />
        <h3 className="font-bold text-lg" style={{ fontFamily: "Oswald, sans-serif" }}>Inspeccion guardada</h3>
        <p className="text-sm text-gray-500 mt-1">El registro quedo guardado correctamente.</p>
        <button onClick={() => resetForm()} className="mt-4 px-5 py-2 rounded-md font-bold text-white" style={{ background: primary }}>
          Nueva inspeccion
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-xl p-3">
        <div className="flex flex-col sm:flex-row sm:items-end gap-3">
          <div className="flex-1">
            <h2 className="font-black text-lg text-gray-800" style={{ fontFamily: "Oswald, sans-serif" }}>Inspeccion de area</h2>
            <p className="text-xs text-gray-400">Selecciona el area para cargar sus puntos de verificacion.</p>
          </div>
          <div className="sm:w-80">
            <label className="text-xs font-bold text-gray-500 uppercase">Area</label>
            <select value={areaId} onChange={(e) => resetForm(e.target.value)} className="w-full border rounded-md px-3 py-2 mt-1 font-semibold">
              {areas.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
            </select>
            <button onClick={printBlankChecklist} className="w-full mt-2 px-3 py-2 rounded-md border text-sm font-bold flex items-center justify-center gap-1.5" style={{ borderColor: primary, color: primary }}>
              <FileText size={15} /> Imprimir lista
            </button>
            <button onClick={shareBlankChecklist} className="w-full mt-2 px-3 py-2 rounded-md border text-sm font-bold flex items-center justify-center gap-1.5" style={{ borderColor: primary, color: primary }}>
              <Download size={15} /> WhatsApp
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="bg-white rounded-xl p-3">
          <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1"><Users size={12} /> Responsable del area</label>
          <select value={responsableId} onChange={(e) => setResponsableId(e.target.value)} className="w-full border rounded-md px-3 py-2 mt-1 font-semibold">
            <option value="">Seleccionar responsable</option>
            {areaPeople.map((p) => <option key={p.id} value={p.id}>{p.nombre} · {p.cargo || p.rol || "Personal"}</option>)}
          </select>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-gray-400">{answeredCount}/{totalItems} items evaluados</p>
            <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${totalItems ? (answeredCount / totalItems) * 100 : 0}%`, background: accent }} />
            </div>
          </div>
        </div>

        {area && (
          <div className="bg-white rounded-xl p-3">
            <h3 className="font-bold text-sm mb-2 flex items-center gap-1.5" style={{ fontFamily: "Oswald, sans-serif" }}>
              <ListChecks size={16} /> Puntos de verificacion
            </h3>
            <div className="hidden lg:grid lg:grid-cols-[minmax(220px,1.35fr)_minmax(150px,0.85fr)_minmax(220px,1fr)_minmax(150px,0.8fr)] gap-2 text-[11px] font-bold text-gray-400 uppercase px-1 pb-1">
              <span>Aspecto</span>
              <span>Puntaje</span>
              <span>Observaciones</span>
              <span>Evidencia</span>
            </div>
            <div>
              {area.items.map((it) => (
                <ChecklistItemRow
                  key={it.id}
                  item={it}
                  status={itemStates[it.id]}
                  observation={itemNotes[it.id]}
                  evidence={itemEvidence[it.id]}
                  primary={primary}
                  onStatus={(v) => setItemStates((s) => ({ ...s, [it.id]: v }))}
                  onObservation={(v) => setItemNotes((s) => ({ ...s, [it.id]: v }))}
                  onEvidence={(event) => handleItemEvidence(it.id, event)}
                />
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl p-3 space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase">Observaciones y evidencias</label>
          <textarea value={observaciones} onChange={(e) => setObservaciones(e.target.value)} rows={4}
            className="w-full border-2 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
            style={{ borderColor: "#E2E8F0" }}
            placeholder="Describe hallazgos, condiciones del area o acciones inmediatas..." />
          <EvidenceActions onChange={handleEvidence} primary={primary} />
          {evidencias.length > 0 && <p className="text-xs text-gray-400">{evidencias.length} evidencia(s) adjunta(s)</p>}
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <SignaturePad label="Firma inspector" value={firmaInspector} onChange={setFirmaInspector} />
          <SignaturePad label="Firma responsable del area" value={firmaResponsable} onChange={setFirmaResponsable} />
        </div>

        <button disabled={!allAnswered} onClick={handleSave}
          className="w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 disabled:opacity-40"
          style={{ background: primary }}>
          <Save size={18} /> Guardar inspeccion
        </button>
      </div>
    </div>
  );
}

function EppChecklistView({ eppItems, personas, currentUser, primary, accent, onSave }) {
  const [personaId, setPersonaId] = useState(personas[0]?.id || "");
  const [itemStates, setItemStates] = useState({});
  const [itemNotes, setItemNotes] = useState({});
  const [itemEvidence, setItemEvidence] = useState({});
  const [observaciones, setObservaciones] = useState("");
  const [evidencias, setEvidencias] = useState([]);
  const [firmaInspector, setFirmaInspector] = useState("");
  const [firmaResponsable, setFirmaResponsable] = useState("");
  const [saved, setSaved] = useState(false);

  const persona = personas.find((p) => p.id === personaId);
  const answeredCount = eppItems.filter((it) => itemStates[it.id]).length;
  const totalItems = eppItems.length;
  const allAnswered = totalItems > 0 && answeredCount === totalItems && persona;

  const resetForm = () => {
    setPersonaId(personas[0]?.id || "");
    setItemStates({});
    setItemNotes({});
    setItemEvidence({});
    setObservaciones("");
    setEvidencias([]);
    setFirmaInspector("");
    setFirmaResponsable("");
    setSaved(false);
  };

  const handleEvidence = async (e) => {
    const files = Array.from(e.target.files || []);
    const converted = await Promise.all(files.map((file) => resizeImageToDataUrl(file, 720)));
    setEvidencias((prev) => [...prev, ...converted]);
    e.target.value = "";
  };

  const handleItemEvidence = async (itemId, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const converted = await resizeImageToDataUrl(file, 520);
    setItemEvidence((prev) => ({ ...prev, [itemId]: converted }));
    e.target.value = "";
  };

  const handleSave = async () => {
    if (!allAnswered) return;
    const itemsRes = eppItems.map((it) => ({ itemId: it.id, texto: it.texto, estado: itemStates[it.id], observacion: itemNotes[it.id] || "", evidencia: itemEvidence[it.id] || "" }));
    const noCumpleCount = itemsRes.filter((i) => i.estado === "no_cumple").length;
    const parcialCount = itemsRes.filter((i) => i.estado === "parcial").length;
    const cumpleCount = itemsRes.filter((i) => i.estado === "cumple").length;
    const base = cumpleCount + parcialCount + noCumpleCount;
    const pct = base > 0 ? Math.round(((cumpleCount + parcialCount * 0.5) / base) * 100) : 100;
    const insp = {
      id: genId(),
      tipo: "epp",
      fecha: todayISO(),
      areaId: "",
      areaNombre: persona.area || persona.areas?.[0] || "EPP",
      inspector: currentUser.nombre,
      responsableId: persona.id,
      responsableNombre: persona.nombre,
      items: [],
      epp: [{ personaId: persona.id, personaNombre: persona.nombre, rol: persona.cargo || persona.rol || "", foto: persona.foto || null, items: itemsRes }],
      observaciones,
      evidencias,
      firmaInspector,
      firmaResponsable,
      cumplimientoPct: pct,
    };
    const nuevosHallazgos = itemsRes.filter((i) => i.estado === "no_cumple").map((i) => ({
      id: genId(),
      inspeccionId: insp.id,
      fecha: insp.fecha,
      area: insp.areaNombre,
      descripcion: `EPP - ${i.texto}`,
      responsable: persona.nombre,
      estado: "abierto",
      fechaCompromiso: "",
      notas: i.observacion || observaciones || "",
    }));
    await onSave(insp, nuevosHallazgos);
    setSaved(true);
  };

  const printEppChecklist = () => {
    openPrintDocument("Lista de verificacion EPP", checklistPrintHtml({
      title: "Lista de verificacion EPP",
      subtitle: persona ? `Formato para ${persona.nombre}` : "Formato para verificacion del colaborador.",
      items: eppItems,
      primary,
    }));
  };
  const shareEppChecklist = async () => {
    await shareDocument({
      filename: `lista-epp-${(persona?.nombre || "colaborador").toLowerCase().replace(/[^a-z0-9]+/g, "-")}.html`,
      html: checklistPrintHtml({
        title: "Lista de verificación EPP",
        subtitle: persona ? `Formato para ${persona.nombre}` : "Formato para verificación del colaborador.",
        items: eppItems,
        primary,
      }),
      title: "Lista de verificación EPP",
      text: persona ? `Lista EPP para ${persona.nombre}` : "Lista de verificación EPP",
    });
  };

  if (saved) {
    return (
      <div className="bg-white rounded-xl p-6 text-center mt-6">
        <Check size={40} className="mx-auto mb-2" color="#1E7A46" />
        <h3 className="font-bold text-lg" style={{ fontFamily: "Oswald, sans-serif" }}>Verificacion EPP guardada</h3>
        <p className="text-sm text-gray-500 mt-1">El registro quedo guardado y los incumplimientos pasaron a Hallazgos.</p>
        <button onClick={resetForm} className="mt-4 px-5 py-2 rounded-md font-bold text-white" style={{ background: primary }}>
          Nueva verificacion EPP
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-xl p-3">
        <div className="flex flex-col sm:flex-row sm:items-end gap-3">
          <div className="flex-1">
            <h2 className="font-black text-lg text-gray-800" style={{ fontFamily: "Oswald, sans-serif" }}>Lista de verificacion de EPP</h2>
            <p className="text-xs text-gray-400">Usa los colaboradores activos del modulo de talento humano, sin duplicar personal.</p>
          </div>
          <div className="sm:w-96">
            <label className="text-xs font-bold text-gray-500 uppercase">Colaborador</label>
            <select value={personaId} onChange={(e) => { setPersonaId(e.target.value); setItemStates({}); setItemNotes({}); setItemEvidence({}); }} className="w-full border rounded-md px-3 py-2 mt-1 font-semibold">
              <option value="">Seleccionar colaborador</option>
              {personas.map((p) => <option key={p.id} value={p.id}>{p.nombre} - {p.cargo || p.rol || "Colaborador"}</option>)}
            </select>
            <button onClick={printEppChecklist} className="w-full mt-2 px-3 py-2 rounded-md border text-sm font-bold flex items-center justify-center gap-1.5" style={{ borderColor: primary, color: primary }}>
              <FileText size={15} /> Imprimir lista EPP
            </button>
            <button onClick={shareEppChecklist} className="w-full mt-2 px-3 py-2 rounded-md border text-sm font-bold flex items-center justify-center gap-1.5" style={{ borderColor: primary, color: primary }}>
              <Download size={15} /> WhatsApp
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-3">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-sm flex items-center justify-center gap-1.5" style={{ fontFamily: "Oswald, sans-serif" }}>
            <ShieldCheck size={16} /> Elementos a verificar
          </h3>
          <p className="text-xs text-gray-400">{answeredCount}/{totalItems} items</p>
        </div>
        {eppItems.length === 0 ? (
          <p className="text-sm text-gray-400 py-6">No hay items EPP configurados. Puedes crearlos en Administracion global.</p>
        ) : (
          <>
            <div className="hidden lg:grid lg:grid-cols-[minmax(220px,1.35fr)_minmax(150px,0.85fr)_minmax(220px,1fr)_minmax(150px,0.8fr)] gap-2 text-[11px] font-bold text-gray-400 uppercase px-1 pb-1">
              <span>Aspecto</span>
              <span>Puntaje</span>
              <span>Observaciones</span>
              <span>Evidencia</span>
            </div>
            <div>
              {eppItems.map((it) => (
                <ChecklistItemRow
                  key={it.id}
                  item={it}
                  status={itemStates[it.id]}
                  observation={itemNotes[it.id]}
                  evidence={itemEvidence[it.id]}
                  primary={primary}
                  onStatus={(v) => setItemStates((s) => ({ ...s, [it.id]: v }))}
                  onObservation={(v) => setItemNotes((s) => ({ ...s, [it.id]: v }))}
                  onEvidence={(event) => handleItemEvidence(it.id, event)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="bg-white rounded-xl p-3 space-y-2">
        <label className="text-xs font-bold text-gray-500 uppercase">Observaciones y registro fotografico</label>
        <textarea value={observaciones} onChange={(e) => setObservaciones(e.target.value)} rows={4}
          className="w-full border-2 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
          style={{ borderColor: "#E2E8F0" }}
          placeholder="Describe incumplimientos, reposicion requerida o novedades del EPP..." />
        <EvidenceActions onChange={handleEvidence} primary={primary} />
        {evidencias.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {evidencias.map((src, index) => <img key={index} src={src} alt="" className="h-20 w-full object-cover rounded-md border" />)}
          </div>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <SignaturePad label="Firma inspector" value={firmaInspector} onChange={setFirmaInspector} />
        <SignaturePad label="Firma colaborador / responsable" value={firmaResponsable} onChange={setFirmaResponsable} />
      </div>

      <button disabled={!allAnswered} onClick={handleSave}
        className="w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 disabled:opacity-40"
        style={{ background: primary }}>
        <Save size={18} /> Guardar verificacion EPP
      </button>
    </div>
  );
}

function nextDeviationCode(desviaciones) {
  const max = desviaciones.reduce((acc, d) => {
    const n = Number((d.codigo || "").replace(/\D/g, ""));
    return Number.isFinite(n) ? Math.max(acc, n) : acc;
  }, 0);
  return `DES-${String(max + 1).padStart(6, "0")}`;
}

function SignaturePad({ value, onChange, label }) {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const scrollLock = useRef({ body: "", html: "" });
  const [open, setOpen] = useState(false);

  const getPoint = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * canvas.width,
      y: ((event.clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const lockScroll = () => {
    scrollLock.current = {
      body: document.body.style.overflow,
      html: document.documentElement.style.overscrollBehavior,
    };
    document.body.style.overflow = "hidden";
    document.documentElement.style.overscrollBehavior = "none";
  };

  const unlockScroll = () => {
    document.body.style.overflow = scrollLock.current.body;
    document.documentElement.style.overscrollBehavior = scrollLock.current.html;
  };

  const start = (event) => {
    event.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.setPointerCapture?.(event.pointerId);
    const ctx = canvas.getContext("2d");
    const p = getPoint(event);
    drawing.current = true;
    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  };
  const move = (event) => {
    if (!drawing.current) return;
    event.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const p = getPoint(event);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  };
  const end = (event) => {
    if (!drawing.current) return;
    event?.preventDefault?.();
    canvasRef.current?.releasePointerCapture?.(event?.pointerId);
    drawing.current = false;
  };
  const clear = () => {
    const canvas = canvasRef.current;
    canvas?.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    onChange("");
  };
  const accept = () => {
    const canvas = canvasRef.current;
    if (canvas) onChange(canvas.toDataURL("image/png"));
    setOpen(false);
  };

  useEffect(() => {
    if (!open) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!value) return;
    const img = new Image();
    img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    img.src = value;
  }, [open, value]);

  useEffect(() => {
    if (!open) return undefined;
    lockScroll();
    return () => {
      drawing.current = false;
      unlockScroll();
    };
  }, [open]);

  return (
    <div className="border rounded-xl p-2 bg-gray-50">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-bold text-gray-500 uppercase">{label}</p>
        {value && <button type="button" onClick={clear} className="text-xs font-bold text-red-600">Limpiar</button>}
      </div>
      {value ? (
        <img src={value} alt={label} className="w-full h-24 object-contain bg-white rounded-lg border" />
      ) : (
        <div className="w-full h-24 bg-white rounded-lg border border-dashed flex items-center justify-center text-xs text-gray-400">
          Sin firma
        </div>
      )}
      <button type="button" onClick={() => setOpen(true)} className="w-full mt-2 py-2 rounded-md border text-sm font-bold bg-white">
        Abrir panel de firma
      </button>
      {open && (
        <div className="fixed inset-0 z-[80] bg-black/70 overflow-y-auto overscroll-contain p-3">
          <div className="bg-white rounded-2xl w-full max-w-3xl min-h-fit p-3 shadow-2xl mx-auto my-3">
            <div className="flex items-center justify-between gap-3 mb-2">
              <p className="font-bold text-sm text-gray-700">{label}</p>
              <button type="button" onClick={() => setOpen(false)} className="p-2 rounded-full bg-gray-100"><X size={18} /></button>
            </div>
            <canvas
              ref={canvasRef}
              width={900}
              height={320}
              className="w-full h-[52vh] max-h-80 min-h-56 bg-white rounded-xl border-2 border-gray-200 cursor-crosshair"
              style={{ touchAction: "none", userSelect: "none", overscrollBehavior: "none" }}
              onPointerDown={start}
              onPointerMove={move}
              onPointerUp={end}
              onPointerCancel={end}
              onPointerLeave={end}
            />
            <div className="sticky bottom-0 bg-white grid grid-cols-2 sm:grid-cols-[auto_auto_1fr] gap-2 mt-3 pt-3 border-t border-gray-100">
              <button type="button" onClick={clear} className="py-2 rounded-md border text-sm font-bold text-red-600">Limpiar</button>
              <button type="button" onClick={() => setOpen(false)} className="py-2 rounded-md border text-sm font-bold">Cancelar</button>
              <button type="button" onClick={accept} className="col-span-2 sm:col-auto py-3 px-4 rounded-md text-white text-sm font-black shadow-sm" style={{ background: "#1E7A46" }}>
                Aceptar firma y continuar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EvidenceActions({ onChange, primary, multiple = true }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <label className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md border text-sm font-bold cursor-pointer bg-white" style={{ borderColor: primary, color: primary }}>
        <ImagePlus size={16} /> Tomar foto
        <input type="file" accept="image/*" capture="environment" multiple={multiple} onChange={onChange} className="hidden" />
      </label>
      <label className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md border text-sm font-bold cursor-pointer bg-white" style={{ borderColor: "#CBD5E1", color: "#475569" }}>
        <Download size={16} /> Galeria / archivo
        <input type="file" accept="image/*" multiple={multiple} onChange={onChange} className="hidden" />
      </label>
    </div>
  );
}

function DesviacionesView({ desviaciones, areas, colaboradores, currentUser, primary, config, onUpdate }) {
  const blank = {
    area: areas[0]?.nombre || "",
    servicio: DEVIATION_SERVICES[0],
    comedor: "",
    reportadoPor: currentUser.nombre,
    cargo: "",
    tipo: DEVIATION_TYPES[0],
    descripcion: "",
    causaInmediata: "",
    responsableId: "",
    responsableNombre: "",
    responsabilidad: "",
    gravedad: "Media",
    accionInmediata: "",
    accionCorrectiva: "",
    responsableCierreId: "",
    responsableCierreNombre: "",
    fechaCompromiso: "",
    fechaCierreReal: "",
    estado: "Abierta",
    anotacionCierre: "",
    eficacia: "Pendiente",
    evidencias: [],
    firmaSupervisor: "",
    firmaResponsable: "",
    firmaCliente: "",
  };
  const [form, setForm] = useState(blank);
  const [detalle, setDetalle] = useState(null);
  const codigoPreview = nextDeviationCode(desviaciones);

  const updateField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));
  const selectResponsible = (id, fieldId, fieldName) => {
    const person = colaboradores.find((c) => c.id === id);
    setForm((prev) => ({ ...prev, [fieldId]: id, [fieldName]: person?.nombre || "" }));
  };
  const handleEvidence = async (event) => {
    const files = Array.from(event.target.files || []);
    const converted = await Promise.all(files.map((file) => resizeImageToDataUrl(file, 900)));
    setForm((prev) => ({ ...prev, evidencias: [...prev.evidencias, ...converted] }));
    event.target.value = "";
  };
  const save = () => {
    if (!form.descripcion.trim()) return;
    const record = {
      id: genId(),
      codigo: codigoPreview,
      fecha: todayISO(),
      creadoPor: currentUser.nombre,
      ...form,
      estado: form.eficacia === "No" ? "Abierta" : form.estado,
    };
    onUpdate([record, ...desviaciones]);
    setForm(blank);
  };
  const updateDeviation = (id, patch) => {
    const updated = desviaciones.map((d) => {
      if (d.id !== id) return d;
      const next = { ...d, ...patch };
      if (patch.eficacia === "No") next.estado = "Abierta";
      return next;
    });
    onUpdate(updated);
    if (detalle?.id === id) setDetalle(updated.find((d) => d.id === id));
  };
  const printDeviation = (d) => openPrintDocument(d.codigo, deviationPrintHtml(d, primary, config));
  const shareDeviation = async (d) => {
    await shareDocument({
      filename: `${(d.codigo || "desviacion").toLowerCase()}-${new Date(d.fecha).toISOString().slice(0, 10)}.html`,
      html: deviationPrintHtml(d, primary, config),
      title: `Desviación ${d.codigo}`,
      text: `${d.codigo} · ${d.tipo} · ${d.area}`,
    });
  };

  const abiertas = desviaciones.filter((d) => d.estado !== "Cerrada").length;
  const criticas = desviaciones.filter((d) => d.gravedad === "Critica" || d.gravedad === "Alta").length;

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-xl p-3 grid grid-cols-3 gap-2">
        <div className="bg-gray-50 rounded-lg p-2 text-center">
          <p className="text-xl font-black" style={{ color: primary }}>{desviaciones.length}</p>
          <p className="text-[10px] text-gray-400 uppercase font-bold">Desviaciones</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-2 text-center">
          <p className="text-xl font-black" style={{ color: "#B4750E" }}>{abiertas}</p>
          <p className="text-[10px] text-gray-400 uppercase font-bold">Abiertas</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-2 text-center">
          <p className="text-xl font-black" style={{ color: "#B5333D" }}>{criticas}</p>
          <p className="text-[10px] text-gray-400 uppercase font-bold">Altas/criticas</p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-3 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="font-black text-lg text-gray-800" style={{ fontFamily: "Oswald, sans-serif" }}>Gestion de desviaciones</h2>
            <p className="text-xs text-gray-400">Consecutivo automatico: {codigoPreview}</p>
          </div>
          <Badge color="#B4750E" bg="#FCF1DC">{form.estado}</Badge>
        </div>

        <div className="grid sm:grid-cols-3 gap-2">
          <select value={form.area} onChange={(e) => updateField("area", e.target.value)} className="border rounded-md px-3 py-2 text-sm">
            {areas.map((a) => <option key={a.id} value={a.nombre}>{a.nombre}</option>)}
          </select>
          <select value={form.servicio} onChange={(e) => updateField("servicio", e.target.value)} className="border rounded-md px-3 py-2 text-sm">
            {DEVIATION_SERVICES.map((s) => <option key={s}>{s}</option>)}
          </select>
          <input value={form.comedor} onChange={(e) => updateField("comedor", e.target.value)} placeholder="Comedor" className="border rounded-md px-3 py-2 text-sm" />
          <input value={form.reportadoPor} onChange={(e) => updateField("reportadoPor", e.target.value)} placeholder="Quien la presenta" className="border rounded-md px-3 py-2 text-sm" />
          <input value={form.cargo} onChange={(e) => updateField("cargo", e.target.value)} placeholder="Cargo" className="border rounded-md px-3 py-2 text-sm" />
          <select value={form.tipo} onChange={(e) => updateField("tipo", e.target.value)} className="border rounded-md px-3 py-2 text-sm">
            {DEVIATION_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
          <select value={form.gravedad} onChange={(e) => updateField("gravedad", e.target.value)} className="border rounded-md px-3 py-2 text-sm">
            {DEVIATION_SEVERITIES.map((g) => <option key={g}>{g}</option>)}
          </select>
          <select value={form.responsableId} onChange={(e) => selectResponsible(e.target.value, "responsableId", "responsableNombre")} className="border rounded-md px-3 py-2 text-sm">
            <option value="">Responsable del hallazgo</option>
            {colaboradores.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
          <input value={form.responsabilidad} onChange={(e) => updateField("responsabilidad", e.target.value)} placeholder="Responsabilidad" className="border rounded-md px-3 py-2 text-sm" />
        </div>

        <textarea value={form.descripcion} onChange={(e) => updateField("descripcion", e.target.value)} placeholder="Descripcion de la desviacion" className="w-full border rounded-md px-3 py-2 text-sm" />
        <textarea value={form.causaInmediata} onChange={(e) => updateField("causaInmediata", e.target.value)} placeholder="Causa inmediata" className="w-full border rounded-md px-3 py-2 text-sm" />

        <div className="grid sm:grid-cols-2 gap-2">
          <textarea value={form.accionInmediata} onChange={(e) => updateField("accionInmediata", e.target.value)} placeholder="Accion inmediata: cambio, reposicion, reproceso, descarte..." className="w-full border rounded-md px-3 py-2 text-sm" />
          <textarea value={form.accionCorrectiva} onChange={(e) => updateField("accionCorrectiva", e.target.value)} placeholder="Accion correctiva / plan de cierre" className="w-full border rounded-md px-3 py-2 text-sm" />
          <select value={form.responsableCierreId} onChange={(e) => selectResponsible(e.target.value, "responsableCierreId", "responsableCierreNombre")} className="border rounded-md px-3 py-2 text-sm">
            <option value="">Responsable del cierre</option>
            {colaboradores.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
          <input type="date" value={form.fechaCompromiso} onChange={(e) => updateField("fechaCompromiso", e.target.value)} className="border rounded-md px-3 py-2 text-sm" />
          <input type="date" value={form.fechaCierreReal} onChange={(e) => updateField("fechaCierreReal", e.target.value)} className="border rounded-md px-3 py-2 text-sm" />
          <select value={form.estado} onChange={(e) => updateField("estado", e.target.value)} className="border rounded-md px-3 py-2 text-sm">
            {DEVIATION_STATES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>

        <textarea value={form.anotacionCierre} onChange={(e) => updateField("anotacionCierre", e.target.value)} placeholder="Anotacion y cierre" className="w-full border rounded-md px-3 py-2 text-sm" />
        <select value={form.eficacia} onChange={(e) => updateField("eficacia", e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm">
          {DEVIATION_EFFECTIVENESS.map((s) => <option key={s}>{s}</option>)}
        </select>

        <div className="bg-gray-50 rounded-xl p-3">
          <EvidenceActions onChange={handleEvidence} primary={primary} />
          {form.evidencias.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-3">
              {form.evidencias.map((src, index) => <img key={index} src={src} alt="" className="h-20 w-full object-cover rounded-md border" />)}
            </div>
          )}
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <SignaturePad label="Firma supervisor" value={form.firmaSupervisor} onChange={(v) => updateField("firmaSupervisor", v)} />
          <SignaturePad label="Firma responsable" value={form.firmaResponsable} onChange={(v) => updateField("firmaResponsable", v)} />
        </div>
        <SignaturePad label="Firma cliente o representante del area (opcional)" value={form.firmaCliente} onChange={(v) => updateField("firmaCliente", v)} />

        <button onClick={save} className="w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2" style={{ background: primary }}>
          <Save size={18} /> Guardar desviacion
        </button>
      </div>

      <div className="space-y-2">
        {desviaciones.length === 0 && <p className="text-center text-sm text-gray-400 py-8">Sin desviaciones registradas.</p>}
        {desviaciones.map((d) => (
          <div key={d.id} className="bg-white rounded-xl p-3 border border-gray-100">
            <button onClick={() => setDetalle(d)} className="w-full text-left">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-bold text-sm">{d.codigo} · {d.tipo}</p>
                  <p className="text-xs text-gray-400">{fmtFecha(d.fecha)} · {d.area} · {d.servicio}</p>
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">{d.descripcion}</p>
                </div>
                <Badge color={d.estado === "Cerrada" ? "#1E7A46" : d.gravedad === "Critica" ? "#B5333D" : "#B4750E"} bg={d.estado === "Cerrada" ? "#E4F4EA" : "#FCF1DC"}>{d.estado}</Badge>
              </div>
            </button>
            <div className="flex gap-2 mt-3">
              <button onClick={() => printDeviation(d)} className="flex-1 py-2 rounded-md text-xs font-bold border flex items-center justify-center gap-1.5" style={{ borderColor: primary, color: primary }}>
                <FileText size={13} /> Documento
              </button>
              <button onClick={() => shareDeviation(d)} className="flex-1 py-2 rounded-md text-xs font-bold border flex items-center justify-center gap-1.5" style={{ borderColor: primary, color: primary }}>
                <Download size={13} /> WhatsApp
              </button>
              <button onClick={() => updateDeviation(d.id, { estado: d.estado === "Cerrada" ? "En proceso" : "Cerrada", fechaCierreReal: d.estado === "Cerrada" ? "" : new Date().toISOString().slice(0, 10) })} className="flex-1 py-2 rounded-md text-xs font-bold text-white" style={{ background: primary }}>
                {d.estado === "Cerrada" ? "Reabrir" : "Cerrar"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {detalle && (
        <Modal title={detalle.codigo} onClose={() => setDetalle(null)} wide>
          <div className="space-y-3">
            <div className="grid sm:grid-cols-2 gap-2 text-sm text-gray-600">
              <p><b>Tipo:</b> {detalle.tipo}</p>
              <p><b>Gravedad:</b> {detalle.gravedad}</p>
              <p><b>Area:</b> {detalle.area}</p>
              <p><b>Responsable:</b> {detalle.responsableNombre || "Sin asignar"}</p>
              <p><b>Estado:</b> {detalle.estado}</p>
              <p><b>Eficacia:</b> {detalle.eficacia || "Pendiente"}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs font-bold text-gray-500 uppercase">Descripcion</p>
              <p className="text-sm text-gray-700">{detalle.descripcion}</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-2">
              <select value={detalle.estado} onChange={(e) => updateDeviation(detalle.id, { estado: e.target.value })} className="border rounded-md px-3 py-2 text-sm">
                {DEVIATION_STATES.map((s) => <option key={s}>{s}</option>)}
              </select>
              <select value={detalle.eficacia || "Pendiente"} onChange={(e) => updateDeviation(detalle.id, { eficacia: e.target.value })} className="border rounded-md px-3 py-2 text-sm">
                {DEVIATION_EFFECTIVENESS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            {detalle.evidencias?.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {detalle.evidencias.map((src, index) => <img key={index} src={src} alt="" className="h-20 w-full object-cover rounded-md border" />)}
              </div>
            )}
            <button onClick={() => printDeviation(detalle)} className="w-full py-2.5 rounded-md text-white font-bold flex items-center justify-center gap-2" style={{ background: primary }}>
              <FileText size={15} /> Imprimir / guardar PDF
            </button>
            <button onClick={() => shareDeviation(detalle)} className="w-full py-2.5 rounded-md border font-bold flex items-center justify-center gap-2" style={{ borderColor: primary, color: primary }}>
              <Download size={15} /> Compartir por WhatsApp
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ---------------------------------- setup inicial ---------------------------------- */

function SetupWizard({ onDone }) {
  const [nombre, setNombre] = useState("ERP Cocina Institucional");
  const [adminNombre, setAdminNombre] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [error, setError] = useState("");

  const submit = () => {
    if (!adminNombre.trim()) return setError("Escribe el nombre del administrador.");
    if (pw.length < 4) return setError("La contraseña debe tener al menos 4 caracteres.");
    if (pw !== pw2) return setError("Las contraseñas no coinciden.");
    onDone(
      { nombre: nombre.trim() || "ERP Cocina Institucional", colorPrimario: "#1F2B3A", colorAccent: "#F2622E", logo: null, watermarkLogo: true, fontScale: 125, fontFamily: "Inter, sans-serif", appBackground: "#F1F3F4", cellBackground: "#FFFFFF", fieldBorderWidth: 1, fieldPaddingY: 9 },
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
            <img src={config.logo} alt="logo" className="h-12 w-12 mx-auto mb-3 object-contain rounded bg-white/10 p-1" />
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

function QualityTabs({ tab, setTab, primary, isAdmin }) {
  const items = [
    { id: "inspeccion", label: "Inspección", icon: ListChecks },
    { id: "epp", label: "EPP", icon: ShieldCheck },
    { id: "historial", label: "Historial", icon: ClipboardCheck },
    { id: "analisis", label: "Análisis", icon: BarChart3 },
    { id: "hallazgos", label: "Hallazgos", icon: AlertCircle },
    { id: "desviaciones", label: "Desv.", icon: AlertTriangle },
  ].filter((it) => isAdmin || ["inspeccion", "epp"].includes(it.id));
  return (
    <div className="bg-white rounded-xl p-2 flex gap-1.5 overflow-x-auto mb-3">
      {items.map((it) => {
        const active = tab === it.id;
        const Icon = it.icon;
        return (
          <button
            key={it.id}
            onClick={() => setTab(it.id)}
            className="px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap flex items-center gap-1.5"
            style={{ background: active ? primary : "#F1F3F4", color: active ? "#fff" : "#5C6673" }}
          >
            <Icon size={14} />
            {it.label}
          </button>
        );
      })}
    </div>
  );
}

/* ---------------------------------- inspección ---------------------------------- */

function InspeccionView({ areas, eppItems, personas, currentUser, accent, primary, onSave }) {
  const [areaId, setAreaId] = useState(areas[0]?.id || "");
  const [itemStates, setItemStates] = useState({});
  const [itemNotes, setItemNotes] = useState({});
  const [itemEvidence, setItemEvidence] = useState({});
  const [selectedPersonaIds, setSelectedPersonaIds] = useState([]);
  const [eppStates, setEppStates] = useState({});
  const [observaciones, setObservaciones] = useState("");
  const [saved, setSaved] = useState(false);

  const area = areas.find((a) => a.id === areaId);

  const resetForm = (newAreaId) => {
    setAreaId(newAreaId);
    setItemStates({});
    setItemNotes({});
    setItemEvidence({});
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
    const itemsRes = area.items.map((it) => ({ itemId: it.id, texto: it.texto, estado: itemStates[it.id], observacion: itemNotes[it.id] || "", evidencia: itemEvidence[it.id] || "" }));
    const eppRes = selectedPersonaIds.map((pid) => {
      const p = personas.find((x) => x.id === pid);
      return {
        personaId: pid,
        personaNombre: p?.nombre || "-",
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
          className="w-full border rounded-md px-3 py-2 mt-1 text-sm" placeholder="Notas adicionales sobre esta inspección..." />
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
      Fecha: fmtFecha(i.fecha), Area: i.areaNombre, Inspector: i.inspector,
      "Cumplimiento %": i.cumplimientoPct, Observaciones: i.observaciones || "",
    }));
    const detalleItems = [];
    inspecciones.forEach((i) => i.items.forEach((it) => detalleItems.push({
      Fecha: fmtFecha(i.fecha), Area: i.areaNombre, Item: it.texto, Estado: statusInfo(it.estado).label,
    })));
    const detalleEpp = [];
    inspecciones.forEach((i) => (i.epp || []).forEach((pe) => pe.items.forEach((it) => detalleEpp.push({
      Fecha: fmtFecha(i.fecha), Area: i.areaNombre, Persona: pe.personaNombre, "Item EPP": it.texto, Estado: statusInfo(it.estado).label,
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

  const imprimirDetalle = () => {
    openPrintDocument(`Inspeccion - ${detalle.areaNombre}`, inspectionPrintHtml(detalle, primary));
  };
  const compartirDetalle = async () => {
    await shareDocument({
      filename: `inspeccion-${(detalle.areaNombre || "area").toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${new Date(detalle.fecha).toISOString().slice(0, 10)}.html`,
      html: inspectionPrintHtml(detalle, primary),
      title: `Inspección - ${detalle.areaNombre}`,
      text: `Inspección ${detalle.areaNombre}: ${detalle.cumplimientoPct}% de cumplimiento.`,
    });
  };
  const guardarFirmasDetalle = () => {
    onUpdate(inspecciones.map((i) => i.id === detalle.id ? detalle : i));
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
          {detalle.responsableFoto && (
            <div className="mb-3 flex items-center justify-center gap-3 bg-gray-50 rounded-lg p-2">
              <img src={detalle.responsableFoto} alt="" className="w-14 h-14 rounded-md object-cover border" />
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase">Responsable</p>
                <p className="text-sm font-bold text-gray-700">{detalle.responsableNombre || "Sin responsable"}</p>
              </div>
            </div>
          )}

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

          {detalle.evidencias?.length > 0 && (
            <div className="mt-3">
              <h4 className="font-bold text-sm mb-2" style={{ fontFamily: "Oswald, sans-serif" }}>Registro fotografico</h4>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {detalle.evidencias.map((src, index) => <img key={index} src={src} alt="" className="h-20 w-full object-cover rounded-md border" />)}
              </div>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-3 mt-3">
            <SignaturePad label="Firma inspector" value={detalle.firmaInspector || ""} onChange={(v) => setDetalle({ ...detalle, firmaInspector: v })} />
            <SignaturePad label="Firma responsable" value={detalle.firmaResponsable || ""} onChange={(v) => setDetalle({ ...detalle, firmaResponsable: v })} />
          </div>

          <div className="flex gap-2 mt-4">
            {!editando ? (
              <>
                <button onClick={guardarFirmasDetalle} className="flex-1 py-2 rounded-md font-bold text-sm border flex items-center justify-center gap-1.5" style={{ borderColor: primary, color: primary }}>
                  <Save size={14} /> Firmas
                </button>
                <button onClick={imprimirDetalle} className="flex-1 py-2 rounded-md font-bold text-sm border flex items-center justify-center gap-1.5" style={{ borderColor: primary, color: primary }}>
                  <FileText size={14} /> Imprimir
                </button>
                <button onClick={compartirDetalle} className="flex-1 py-2 rounded-md font-bold text-sm border flex items-center justify-center gap-1.5" style={{ borderColor: primary, color: primary }}>
                  <Download size={14} /> WhatsApp
                </button>
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

function QualityKpiCard({ label, value, detail, tone = "neutral" }) {
  const tones = {
    good: { color: "#1E7A46", bg: "#E4F4EA" },
    warn: { color: "#B4750E", bg: "#FCF1DC" },
    bad: { color: "#B5333D", bg: "#FBE7E8" },
    neutral: { color: "#1F2B3A", bg: "#F1F3F4" },
  };
  const t = tones[tone] || tones.neutral;
  return (
    <div className="rounded-xl p-3 text-center border border-gray-100" style={{ background: t.bg }}>
      <p className="text-[10px] text-gray-500 uppercase font-black leading-tight">{label}</p>
      <p className="text-2xl font-black leading-none mt-2" style={{ color: t.color }}>{value}</p>
      {detail && <p className="text-[11px] text-gray-500 mt-2 leading-tight">{detail}</p>}
    </div>
  );
}

function AnalisisView({ inspecciones, hallazgos, desviaciones = [], primary, accent }) {
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
  const totalHallazgos = abiertos + cerrados;
  const cierrePct = totalHallazgos ? Math.round((cerrados / totalHallazgos) * 100) : 100;
  const inspeccionesArea = inspecciones.filter((i) => i.tipo !== "epp");
  const inspeccionesEpp = inspecciones.filter((i) => i.tipo === "epp");
  const promedioEpp = inspeccionesEpp.length ? Math.round(inspeccionesEpp.reduce((sum, i) => sum + (i.cumplimientoPct || 0), 0) / inspeccionesEpp.length) : 0;
  const conEvidencia = inspecciones.filter((i) => {
    const general = (i.evidencias || []).length > 0;
    const itemEvidence = (i.items || []).some((item) => item.evidencia);
    const eppEvidence = (i.epp || []).some((group) => (group.items || []).some((item) => item.evidencia));
    return general || itemEvidence || eppEvidence;
  }).length;
  const evidenciaPct = inspecciones.length ? Math.round((conEvidencia / inspecciones.length) * 100) : 0;
  const areaCriticas = porArea.filter((a) => a.pct < 75).length;
  const hallazgosPorInspeccion = inspecciones.length ? (hallazgos.length / inspecciones.length).toFixed(1) : "0.0";
  const recurrencias = useMemo(() => {
    const map = {};
    hallazgos.forEach((h) => {
      const key = `${h.responsable || "sin responsable"}|${h.descripcion || ""}`.toLowerCase();
      map[key] = (map[key] || 0) + 1;
    });
    return Object.values(map).filter((total) => total >= 2).length;
  }, [hallazgos]);
  const desviacionesAbiertas = desviaciones.filter((d) => d.estado !== "Cerrada").length;

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-xl p-4 grid sm:grid-cols-[180px_1fr] gap-4 items-center">
        <div className="flex justify-center">
          <StampGauge pct={promedioGeneral} size={156} />
        </div>
        <div className="grid grid-cols-2 gap-2">
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

      <div className="bg-white rounded-xl p-3">
        <h3 className="font-bold text-sm mb-3" style={{ fontFamily: "Oswald, sans-serif" }}>KPI de calidad</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          <QualityKpiCard label="Tasa de cierre" value={`${cierrePct}%`} detail={`${cerrados}/${totalHallazgos || 0} hallazgos`} tone={cierrePct >= 85 ? "good" : cierrePct >= 60 ? "warn" : "bad"} />
          <QualityKpiCard label="Hallazgos por inspección" value={hallazgosPorInspeccion} detail="Promedio operativo" tone={Number(hallazgosPorInspeccion) <= 1 ? "good" : Number(hallazgosPorInspeccion) <= 2 ? "warn" : "bad"} />
          <QualityKpiCard label="Evidencia documentada" value={`${evidenciaPct}%`} detail={`${conEvidencia}/${inspecciones.length || 0} registros`} tone={evidenciaPct >= 80 ? "good" : evidenciaPct >= 50 ? "warn" : "bad"} />
          <QualityKpiCard label="Reincidencias" value={recurrencias} detail="Mismo responsable e incumplimiento" tone={recurrencias === 0 ? "good" : recurrencias <= 2 ? "warn" : "bad"} />
          <QualityKpiCard label="Cumplimiento EPP" value={inspeccionesEpp.length ? `${promedioEpp}%` : "N/A"} detail={`${inspeccionesEpp.length} verificación(es)`} tone={!inspeccionesEpp.length || promedioEpp >= 90 ? "good" : promedioEpp >= 75 ? "warn" : "bad"} />
          <QualityKpiCard label="Inspecciones de área" value={inspeccionesArea.length} detail="Registros operativos" tone="neutral" />
          <QualityKpiCard label="Áreas críticas" value={areaCriticas} detail="Promedio menor a 75%" tone={areaCriticas === 0 ? "good" : areaCriticas <= 2 ? "warn" : "bad"} />
          <QualityKpiCard label="Desviaciones abiertas" value={desviacionesAbiertas} detail={`${desviaciones.length} desviación(es)`} tone={desviacionesAbiertas === 0 ? "good" : desviacionesAbiertas <= 2 ? "warn" : "bad"} />
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

function openPrintDocument(title, html) {
  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 250);
}

const normalizeText = (value = "") => value.toString().trim().toLowerCase();

function hallazgoKey(h) {
  return [normalizeText(h.responsable || "sin responsable"), normalizeText(h.area), normalizeText(h.descripcion)].join("|");
}

function escapeHtml(value = "") {
  return value.toString()
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function downloadTextFile(filename, content, type = "text/html;charset=utf-8") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

async function shareDocument({ filename, html, title, text }) {
  const file = new File([html], filename, { type: "text/html" });
  if (navigator.canShare?.({ files: [file] }) && navigator.share) {
    await navigator.share({ title, text, files: [file] });
    return;
  }
  downloadTextFile(filename, html);
  const message = `${text || title || "Documento generado desde el ERP"}\n\nEl archivo se descargó en la tablet. Adjuntalo desde WhatsApp si el navegador no permite enviarlo automaticamente.`;
  window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
}

function statusRowsHtml(items = []) {
  return items.map((it) => `
    <tr>
      <td>${escapeHtml(it.texto)}</td>
      <td>${escapeHtml(statusInfo(it.estado).label)}</td>
    </tr>
  `).join("");
}

function evidenceHtml(evidencias = []) {
  if (!evidencias.length) return '<div class="box">Sin registro fotografico.</div>';
  return `<div class="photos">${evidencias.map((src) => `<img src="${src}" />`).join("")}</div>`;
}

function checklistPrintHtml({ title, subtitle, items, primary }) {
  const rows = (items || []).map((it) => `
    <tr>
      <td>${escapeHtml(it.texto)}</td>
      <td class="mark"></td>
      <td class="mark"></td>
      <td class="mark"></td>
      <td class="mark"></td>
      <td></td>
    </tr>
  `).join("");
  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8" /><title>${escapeHtml(title)}</title>
<style>
body{font-family:Arial,sans-serif;color:#1f2937;margin:28px;line-height:1.35}
h1{font-size:22px;margin:0 0 4px;text-transform:uppercase}p{margin:0 0 14px}
table{width:100%;border-collapse:collapse;margin-top:14px}th,td{border:1px solid #d1d5db;padding:8px;font-size:12px;vertical-align:top}th{background:#f3f4f6}.mark{width:70px;height:26px}
.header{border-bottom:3px solid ${primary};padding-bottom:10px}.sign{display:grid;grid-template-columns:1fr 1fr;gap:32px;margin-top:52px}.line{border-top:1px solid #111827;text-align:center;padding-top:8px}
</style></head><body>
<div class="header"><h1>${escapeHtml(title)}</h1><p>${escapeHtml(subtitle)}</p></div>
<table><thead><tr><th>Item</th><th>Cumple</th><th>Parcial</th><th>No cumple</th><th>N/A</th><th>Observacion</th></tr></thead><tbody>${rows}</tbody></table>
<div class="sign"><div class="line">Inspector</div><div class="line">Responsable</div></div>
</body></html>`;
}

function inspectionPrintHtml(inspeccion, primary) {
  const eppBlocks = (inspeccion.epp || []).map((pe) => `
    <div class="person">
      ${pe.foto ? `<img src="${pe.foto}" />` : ""}
      <div><h3>${escapeHtml(pe.personaNombre)}</h3><p>${escapeHtml(pe.rol || "")}</p></div>
    </div>
    <table><thead><tr><th>Item EPP</th><th>Estado</th></tr></thead><tbody>${statusRowsHtml(pe.items)}</tbody></table>
  `).join("");
  const signature = (src, label) => src
    ? `<div class="signed"><img src="${src}" /><p>${label}</p></div>`
    : `<div class="line">${label}</div>`;
  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8" /><title>Inspeccion ${escapeHtml(inspeccion.areaNombre)}</title>
<style>
body{font-family:Arial,sans-serif;color:#1f2937;margin:28px;line-height:1.4}
h1{font-size:22px;margin:0 0 4px;text-transform:uppercase}h2{font-size:15px;margin:22px 0 8px}h3{margin:0;font-size:14px}
.header{border-bottom:3px solid ${primary};padding-bottom:10px}.meta,.box{border:1px solid #d1d5db;border-radius:8px;padding:12px;margin:12px 0}.meta{display:grid;grid-template-columns:160px 1fr;gap:6px 14px}.label{font-weight:700;color:#4b5563}
.score{font-size:34px;font-weight:800;color:${(inspeccion.cumplimientoPct || 0) >= 75 ? "#1E7A46" : "#B5333D"}}
table{width:100%;border-collapse:collapse;margin-top:8px}th,td{border:1px solid #ddd;padding:7px;font-size:12px;vertical-align:top}th{background:#f3f4f6}
.photos{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.photos img{width:100%;height:150px;object-fit:cover;border-radius:8px;border:1px solid #ddd}.person{display:flex;gap:10px;align-items:center;margin:12px 0 6px}.person img,.avatar{width:64px;height:64px;object-fit:cover;border-radius:8px;border:1px solid #ddd;margin-right:10px;vertical-align:middle}
.sign{display:grid;grid-template-columns:1fr 1fr;gap:32px;margin-top:52px}.line{border-top:1px solid #111827;text-align:center;padding-top:8px}.signed{border:1px solid #d1d5db;border-radius:8px;padding:8px;text-align:center}.signed img{width:100%;height:80px;object-fit:contain}.signed p{border-top:1px solid #111827;margin:8px 0 0;padding-top:6px}
</style></head><body>
<div class="header"><h1>${inspeccion.tipo === "epp" ? "Verificacion EPP" : "Inspeccion de area"}</h1><p>Registro generado desde el ERP.</p></div>
<div class="meta">
<div class="label">Fecha</div><div>${escapeHtml(fmtFecha(inspeccion.fecha))}</div>
<div class="label">Area</div><div>${escapeHtml(inspeccion.areaNombre || "")}</div>
<div class="label">Inspector</div><div>${escapeHtml(inspeccion.inspector || "")}</div>
<div class="label">Responsable</div><div>${inspeccion.responsableFoto ? `<img class="avatar" src="${inspeccion.responsableFoto}" />` : ""}${escapeHtml(inspeccion.responsableNombre || "")}</div>
</div>
<div class="box"><div class="score">${inspeccion.cumplimientoPct || 0}%</div><p>Cumplimiento registrado</p></div>
${(inspeccion.items || []).length ? `<h2>Puntos de verificacion</h2><table><thead><tr><th>Item</th><th>Estado</th></tr></thead><tbody>${statusRowsHtml(inspeccion.items)}</tbody></table>` : ""}
${eppBlocks ? `<h2>Lista de EPP</h2>${eppBlocks}` : ""}
<h2>Observaciones</h2><div class="box">${escapeHtml(inspeccion.observaciones || "Sin observaciones.")}</div>
<h2>Registro fotografico</h2>${evidenceHtml(inspeccion.evidencias)}
<div class="sign">${signature(inspeccion.firmaInspector, "Inspector")}${signature(inspeccion.firmaResponsable, "Responsable")}</div>
</body></html>`;
}

function deviationPrintHtml(d, primary, config) {
  const photos = d.evidencias?.length
    ? `<div class="photos">${d.evidencias.map((src) => `<img src="${src}" />`).join("")}</div>`
    : '<div class="box">Sin evidencia fotografica.</div>';
  const signature = (src, label) => src
    ? `<div class="signature"><img src="${src}" /><p>${label}</p></div>`
    : `<div class="signature empty"><p>${label}</p></div>`;
  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8" /><title>${escapeHtml(d.codigo)}</title>
<style>
body{font-family:Arial,sans-serif;color:#1f2937;margin:28px;line-height:1.4}
h1{font-size:22px;margin:0 0 4px;text-transform:uppercase}h2{font-size:15px;margin:22px 0 8px}
.header{display:flex;align-items:center;gap:14px;border-bottom:3px solid ${primary};padding-bottom:12px}.logo{width:70px;height:70px;object-fit:contain}
.meta,.box{border:1px solid #d1d5db;border-radius:8px;padding:12px;margin:12px 0}.meta{display:grid;grid-template-columns:170px 1fr;gap:6px 14px}.label{font-weight:700;color:#4b5563}
.badge{display:inline-block;padding:4px 8px;border-radius:6px;background:#f3f4f6;font-weight:700}
.photos{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.photos img{width:100%;height:150px;object-fit:cover;border-radius:8px;border:1px solid #ddd}
.signatures{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:14px}.signature{border:1px solid #d1d5db;border-radius:8px;padding:8px;text-align:center;min-height:120px}.signature img{max-width:100%;height:80px;object-fit:contain}.signature p{border-top:1px solid #111827;margin:8px 0 0;padding-top:6px;font-size:12px}.empty{display:flex;align-items:end;justify-content:center}
table{width:100%;border-collapse:collapse}td{border:1px solid #ddd;padding:7px;font-size:12px}
@media print{body{margin:16mm}.photos img{height:130px}}
</style></head><body>
<div class="header">
  ${config?.logo ? `<img class="logo" src="${config.logo}" />` : ""}
  <div><h1>Gestion de desviaciones y acciones correctivas</h1><p>${escapeHtml(d.codigo)} · Documento generado desde el ERP.</p></div>
</div>
<div class="meta">
<div class="label">Fecha y hora</div><div>${escapeHtml(fmtFecha(d.fecha))}</div>
<div class="label">Tipo de desviacion</div><div>${escapeHtml(d.tipo)}</div>
<div class="label">Gravedad</div><div><span class="badge">${escapeHtml(d.gravedad)}</span></div>
<div class="label">Area</div><div>${escapeHtml(d.area)}</div>
<div class="label">Servicio / comedor</div><div>${escapeHtml(d.servicio)} · ${escapeHtml(d.comedor || "Sin comedor")}</div>
<div class="label">Presentada por</div><div>${escapeHtml(d.reportadoPor)} · ${escapeHtml(d.cargo || "Sin cargo")}</div>
<div class="label">Responsable</div><div>${escapeHtml(d.responsableNombre || "Sin responsable")} · ${escapeHtml(d.responsabilidad || "")}</div>
<div class="label">Estado</div><div>${escapeHtml(d.estado)}</div>
</div>
<h2>Descripcion de la desviacion</h2><div class="box">${escapeHtml(d.descripcion)}</div>
<h2>Causa inmediata</h2><div class="box">${escapeHtml(d.causaInmediata || "Sin registrar.")}</div>
<h2>Accion inmediata</h2><div class="box">${escapeHtml(d.accionInmediata || "Sin registrar.")}</div>
<h2>Plan de cierre</h2>
<table><tbody>
<tr><td><b>Accion correctiva</b></td><td>${escapeHtml(d.accionCorrectiva || "Sin registrar.")}</td></tr>
<tr><td><b>Responsable cierre</b></td><td>${escapeHtml(d.responsableCierreNombre || "Sin asignar")}</td></tr>
<tr><td><b>Fecha compromiso</b></td><td>${escapeHtml(d.fechaCompromiso || "Pendiente")}</td></tr>
<tr><td><b>Fecha real cierre</b></td><td>${escapeHtml(d.fechaCierreReal || "Pendiente")}</td></tr>
<tr><td><b>Anotacion y cierre</b></td><td>${escapeHtml(d.anotacionCierre || "Sin registrar.")}</td></tr>
<tr><td><b>Verificacion de eficacia</b></td><td>${escapeHtml(d.eficacia || "Pendiente")}</td></tr>
</tbody></table>
<h2>Evidencia fotografica</h2>${photos}
<h2>Firmas</h2>
<div class="signatures">
${signature(d.firmaSupervisor, "Supervisor")}
${signature(d.firmaResponsable, "Responsable del hallazgo")}
${signature(d.firmaCliente, "Cliente / representante")}
</div>
</body></html>`;
}

function HallazgosView({ hallazgos, onUpdate, primary }) {
  const [filtro, setFiltro] = useState("todos");
  const [editId, setEditId] = useState(null);
  const [draft, setDraft] = useState(null);
  const [firmaTarget, setFirmaTarget] = useState(null);

  const filtrados = hallazgos.filter((h) => filtro === "todos" || h.estado === filtro);
  const recurrencias = useMemo(() => {
    const counts = {};
    hallazgos.forEach((h) => {
      const key = hallazgoKey(h);
      counts[key] = (counts[key] || 0) + 1;
    });
    return counts;
  }, [hallazgos]);

  const recurrentes = Object.entries(recurrencias).filter(([, total]) => total >= 2).length;

  const startEdit = (h) => { setEditId(h.id); setDraft({ ...h }); };
  const guardar = () => { onUpdate(hallazgos.map((h) => h.id === draft.id ? draft : h)); setEditId(null); };
  const guardarFirmas = () => {
    onUpdate(hallazgos.map((h) => h.id === firmaTarget.id ? firmaTarget : h));
    setFirmaTarget(null);
  };
  const marcarLlamado = (h, total) => {
    const registro = {
      id: genId(),
      fecha: todayISO(),
      recurrencias: total,
      estado: "generado",
    };
    onUpdate(hallazgos.map((item) => item.id === h.id ? {
      ...item,
      llamadoAtencion: registro,
      llamadosAtencion: [registro, ...(item.llamadosAtencion || [])],
    } : item));
    return registro;
  };

  const buildLlamado = (h, total, registro) => {
    const responsable = h.responsable || "Sin responsable asignado";
    const fecha = new Date(registro.fecha).toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "2-digit" });
    const signature = (src, label) => src
      ? `<div class="firma signed"><img src="${src}" /><p>${label}</p></div>`
      : `<div class="firma">${label}</div>`;
    return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>Llamado de atención - ${escapeHtml(responsable)}</title>
  <style>
    body { font-family: Arial, sans-serif; color: #1f2937; margin: 32px; line-height: 1.45; }
    .header { border-bottom: 3px solid ${primary}; padding-bottom: 12px; margin-bottom: 24px; }
    h1 { margin: 0; font-size: 24px; text-transform: uppercase; }
    h2 { font-size: 16px; margin: 24px 0 8px; }
    .box { border: 1px solid #d1d5db; border-radius: 8px; padding: 14px; margin: 12px 0; }
    .grid { display: grid; grid-template-columns: 180px 1fr; gap: 8px 16px; }
    .label { font-weight: 700; color: #4b5563; }
    .warn { color: #991b1b; font-weight: 700; }
    .firmas { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-top: 56px; }
    .firma { border-top: 1px solid #111827; padding-top: 8px; text-align: center; min-height: 90px; }
    .signed { border: 1px solid #d1d5db; border-radius: 8px; padding: 8px; border-top: 1px solid #d1d5db; }
    .signed img { width: 100%; height: 70px; object-fit: contain; }
    .signed p { border-top: 1px solid #111827; margin: 6px 0 0; padding-top: 5px; }
    @media print { body { margin: 18mm; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>Llamado de atención</h1>
    <p>Documento generado desde el ERP de calidad e inspecciones.</p>
  </div>
  <div class="box grid">
    <div class="label">Fecha</div><div>${escapeHtml(fecha)}</div>
    <div class="label">Responsable</div><div>${escapeHtml(responsable)}</div>
    <div class="label">Área</div><div>${escapeHtml(h.area || "Sin área")}</div>
    <div class="label">Repeticiones</div><div class="warn">${total} registro(s) del mismo incumplimiento</div>
    <div class="label">Compromiso</div><div>${escapeHtml(h.fechaCompromiso || "Pendiente por definir")}</div>
  </div>
  <h2>Incumplimiento reportado</h2>
  <div class="box">${escapeHtml(h.descripcion || "Sin descripción")}</div>
  <h2>Observaciones de seguimiento</h2>
  <div class="box">${escapeHtml(h.notas || "Sin notas registradas.")}</div>
  <h2>Acción requerida</h2>
  <p>Se solicita corregir la condición reportada, evitar su repetición y cumplir los compromisos definidos por la empresa.</p>
  <div class="firmas">
    ${signature(h.firmaResponsable, "Responsable")}
    ${signature(h.firmaSupervisor, "Administrador / Inspector")}
  </div>
</body>
</html>`;
  };

  const descargarLlamado = (h, total) => {
    const registro = marcarLlamado(h, total);
    const responsable = (h.responsable || "sin-responsable").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    downloadTextFile(`llamado-atencion-${responsable || "registro"}-${new Date().toISOString().slice(0, 10)}.html`, buildLlamado(h, total, registro));
  };

  const enviarLlamado = async (h, total) => {
    const registro = marcarLlamado(h, total);
    const responsable = h.responsable || "Sin responsable asignado";
    const slug = responsable.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    await shareDocument({
      filename: `llamado-atencion-${slug || "registro"}-${new Date().toISOString().slice(0, 10)}.html`,
      html: buildLlamado(h, total, registro),
      title: `Llamado de atención - ${responsable}`,
      text: `Llamado de atención ${h.area || ""}: ${h.descripcion || ""}`,
    });
  };
  return (
    <div className="space-y-3">
      <div className="bg-white rounded-xl p-3 border" style={{ borderColor: recurrentes ? "#F2C94C" : "#E5E7EB" }}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="font-bold text-sm" style={{ fontFamily: "Oswald, sans-serif" }}>Llamados de atención</h3>
            <p className="text-xs text-gray-500">
              Se habilitan desde cada hallazgo. El sistema marca como repetitivo cuando el mismo responsable repite el mismo incumplimiento 2 o más veces.
            </p>
          </div>
          <Badge color={recurrentes ? "#B4750E" : "#1E7A46"} bg={recurrentes ? "#FCF1DC" : "#E4F4EA"}>
            {recurrentes} repetitivo(s)
          </Badge>
        </div>
      </div>

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
          const totalRecurrencias = recurrencias[hallazgoKey(h)] || 1;
          const puedeLlamado = totalRecurrencias >= 2 || h.estado !== "cerrado";
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
                <div className="mt-2 space-y-2">
                  <p className="text-xs text-gray-500">
                    {h.responsable ? `Responsable: ${h.responsable}` : "Sin responsable asignado"}
                    {h.fechaCompromiso ? ` · Compromiso: ${h.fechaCompromiso}` : ""}
                    {totalRecurrencias >= 2 ? ` · Repetido ${totalRecurrencias} veces` : ""}
                    {h.llamadoAtencion ? ` · Llamado generado` : ""}
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <button onClick={() => startEdit(h)} className="px-3 py-2 rounded-md text-xs font-bold border flex items-center gap-1" style={{ color: primary, borderColor: primary }}>
                      <Pencil size={12} /> Editar
                    </button>
                    <button onClick={() => setFirmaTarget({ ...h })} className="px-3 py-2 rounded-md text-xs font-bold border flex items-center gap-1" style={{ color: primary, borderColor: primary }}>
                      <FileText size={12} /> Firmas
                    </button>
                    <button
                      disabled={!puedeLlamado}
                      onClick={() => descargarLlamado(h, totalRecurrencias)}
                      className="px-3 py-2 rounded-md text-xs font-bold border flex items-center gap-1 disabled:opacity-40"
                      style={{ color: "#B5333D", borderColor: "#F0B8BD", background: "#FFF7F7" }}
                    >
                      <Download size={12} /> Descargar llamado
                    </button>
                    <button
                      disabled={!puedeLlamado}
                      onClick={() => enviarLlamado(h, totalRecurrencias)}
                      className="px-3 py-2 rounded-md text-xs font-bold text-white flex items-center gap-1 disabled:opacity-40"
                      style={{ background: "#B5333D" }}
                    >
                      <AlertTriangle size={12} /> Enviar
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {firmaTarget && (
        <Modal title={`Firmas · ${firmaTarget.responsable || "hallazgo"}`} onClose={() => setFirmaTarget(null)} wide>
          <div className="grid sm:grid-cols-2 gap-3">
            <SignaturePad label="Firma responsable" value={firmaTarget.firmaResponsable || ""} onChange={(v) => setFirmaTarget({ ...firmaTarget, firmaResponsable: v })} />
            <SignaturePad label="Firma supervisor / inspector" value={firmaTarget.firmaSupervisor || ""} onChange={(v) => setFirmaTarget({ ...firmaTarget, firmaSupervisor: v })} />
          </div>
          <button onClick={guardarFirmas} className="w-full mt-3 py-2.5 rounded-md text-white font-bold" style={{ background: primary }}>
            Guardar firmas
          </button>
        </Modal>
      )}
    </div>
  );
}

/* ---------------------------------- administración ---------------------------------- */

function AdminView({ config, areas, eppItems, usuarios, currentUser, onConfig, onAreas, onEpp, onUsuarios, primary, backupData }) {
  const [sub, setSub] = useState("general");

  const subs = [
    { id: "general", label: "General" },
    { id: "areas", label: "Áreas" },
    { id: "epp", label: "EPP" },
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

      {sub === "general" && <AdminGeneral config={config} onConfig={onConfig} primary={primary} backupData={backupData} />}
      {sub === "areas" && <AdminAreas areas={areas} onAreas={onAreas} primary={primary} />}
      {sub === "epp" && <AdminEpp eppItems={eppItems} onEpp={onEpp} primary={primary} />}
      {sub === "usuarios" && <AdminUsuarios usuarios={usuarios} onUsuarios={onUsuarios} currentUser={currentUser} primary={primary} />}
      {sub === "acerca" && <AdminAcercaDe primary={primary} />}
    </div>
  );
}

function AdminGeneral({ config, onConfig, primary, backupData }) {
  const [nombre, setNombre] = useState(config.nombre);
  const [colorPrimario, setColorPrimario] = useState(config.colorPrimario);
  const [colorAccent, setColorAccent] = useState(config.colorAccent);
  const [logo, setLogo] = useState(config.logo);
  const [fontScale, setFontScale] = useState(config.fontScale || 112);
  const [fontFamily, setFontFamily] = useState(config.fontFamily || "Inter, sans-serif");
  const [watermarkLogo, setWatermarkLogo] = useState(config.watermarkLogo !== false);
  const [inactiveStatsMonths, setInactiveStatsMonths] = useState(config.inactiveStatsMonths || 6);
  const [appBackground, setAppBackground] = useState(config.appBackground || "#F1F3F4");
  const [cellBackground, setCellBackground] = useState(config.cellBackground || "#FFFFFF");
  const [fieldBorderWidth, setFieldBorderWidth] = useState(config.fieldBorderWidth || 1);
  const [fieldPaddingY, setFieldPaddingY] = useState(config.fieldPaddingY || 9);
  const [logoError, setLogoError] = useState("");
  const [logoBusy, setLogoBusy] = useState(false);
  const configPayload = (nextLogo = logo) => ({
    ...config,
    nombre,
    colorPrimario,
    colorAccent,
    logo: nextLogo,
    fontScale,
    fontFamily,
    watermarkLogo,
    inactiveStatsMonths,
    appBackground,
    cellBackground,
    fieldBorderWidth,
    fieldPaddingY,
  });

  const handleLogo = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLogoBusy(true);
    setLogoError("");
    try {
      const dataUrl = await resizeImageToDataUrl(file, 320);
      setLogo(dataUrl);
      await onConfig(configPayload(dataUrl));
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
    await onConfig(configPayload(null));
  };

  const guardar = () => onConfig(configPayload());
  const descargarBackup = () => {
    const payload = {
      createdAt: todayISO(),
      version: APP_VERSION,
      ...backupData,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `backup-erp-cocina-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

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

      <div className="grid sm:grid-cols-4 gap-3">
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase">Fondo general</label>
          <input type="color" value={appBackground} onChange={(e) => setAppBackground(e.target.value)} className="w-full h-10 border rounded-md mt-1" />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase">Fondo de celdas</label>
          <input type="color" value={cellBackground} onChange={(e) => setCellBackground(e.target.value)} className="w-full h-10 border rounded-md mt-1" />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase">Borde</label>
          <input type="range" min="1" max="3" value={fieldBorderWidth} onChange={(e) => setFieldBorderWidth(Number(e.target.value))} className="w-full mt-2" />
          <p className="text-[11px] text-gray-400">{fieldBorderWidth}px</p>
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase">Alto de campos</label>
          <input type="range" min="7" max="14" value={fieldPaddingY} onChange={(e) => setFieldPaddingY(Number(e.target.value))} className="w-full mt-2" />
          <p className="text-[11px] text-gray-400">{fieldPaddingY}px</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase">Tamaño de letra</label>
          <input type="range" min="100" max="180" value={fontScale} onChange={(e) => setFontScale(Number(e.target.value))} className="w-full mt-2" />
          <p className="text-[11px] text-gray-400">{fontScale}%</p>
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase">Tipo de letra</label>
          <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)} className="w-full border rounded-md px-3 py-2 mt-1 text-sm">
            <option value="Inter, sans-serif">Inter</option>
            <option value="Arial, sans-serif">Arial</option>
            <option value="'Segoe UI', sans-serif">Segoe UI</option>
            <option value="Roboto, sans-serif">Roboto</option>
            <option value="Verdana, sans-serif">Verdana</option>
            <option value="Tahoma, sans-serif">Tahoma</option>
            <option value="Georgia, serif">Georgia</option>
            <option value="system-ui, sans-serif">Sistema</option>
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm font-semibold mt-5">
          <input type="checkbox" checked={watermarkLogo} onChange={(e) => setWatermarkLogo(e.target.checked)} />
          Logo como marca de agua
        </label>
      </div>

      <div>
        <label className="text-xs font-bold text-gray-500 uppercase">Meses para mantener inactivos en estadisticas</label>
        <input type="number" min="0" max="60" value={inactiveStatsMonths} onChange={(e) => setInactiveStatsMonths(Number(e.target.value))} className="w-full border rounded-md px-3 py-2 mt-1 text-sm" />
      </div>

      <div className="bg-gray-50 rounded-lg p-3">
        <h3 className="font-bold text-sm" style={{ fontFamily: "Oswald, sans-serif" }}>Backup de informacion</h3>
        <p className="text-xs text-gray-500 mt-1">El ERP guarda un respaldo local automatico y tambien puedes descargar una copia JSON para proteger la informacion diligenciada.</p>
        <button onClick={descargarBackup} className="mt-2 px-3 py-2 rounded-md text-xs font-bold border" style={{ borderColor: primary, color: primary }}>
          Descargar backup
        </button>
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
              <ImagePlus size={13} /> {logoBusy ? "Cargando..." : "Subir imagen"}
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
      <div className="bg-white rounded-xl p-3 flex gap-2">
        <input value={nuevaArea} onChange={(e) => setNuevaArea(e.target.value)} placeholder="Nueva área..." className="flex-1 border rounded-md px-3 py-2 text-sm" />
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
                  placeholder="Nuevo ítem..." className="flex-1 border rounded-md px-2 py-1.5 text-sm" />
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
        <input value={nuevo} onChange={(e) => setNuevo(e.target.value)} placeholder="Nuevo ítem de EPP..." className="flex-1 border rounded-md px-2 py-1.5 text-sm" />
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

