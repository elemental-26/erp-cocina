import React, { useState, useEffect, useMemo } from "react";
import TalentoHumanoView from "./TalentoHumanoModule";
import {
  ClipboardCheck, CheckCircle2, AlertTriangle, XCircle, MinusCircle,
  Settings, Users, BarChart3, ListChecks, LogOut, Plus, Trash2, Pencil,
  Lock, ChevronRight, Download, ShieldCheck, AlertCircle, UserPlus,
  Palette, ImagePlus, X, Save, Building2, Check, Info, KeyRound,
  BriefcaseBusiness
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, LineChart, Line
} from "recharts";
import * as XLSX from "xlsx";

/* =========================================================================
   NOTA PARA FUTURA EXTENSIÃ“N (software institucional / mejora continua)
   -------------------------------------------------------------------------
   Este archivo sigue un patrÃ³n repetible que puede usarse como base para
   otros mÃ³dulos de evaluaciÃ³n y mejora continua:

   1. Un "modelo de datos" plano y con nombres genÃ©ricos (config, areas,
      personas, usuarios, inspecciones, hallazgos) guardado con
      window.storage (ver helpers loadKey/saveKey).
   2. Un objeto `persist` en el componente raÃ­z que centraliza cÃ³mo se
      actualiza cada colecciÃ³n (estado + guardado).
   3. Una vista por funciÃ³n del negocio (InspecciÃ³n, Historial, AnÃ¡lisis,
      Hallazgos) + un panel Admin con sub-pestaÃ±as CRUD (Ãreas, EPP,
      Personal, Usuarios).
   Para agregar un nuevo mÃ³dulo de evaluaciÃ³n (ej. auditorÃ­as de seguridad,
   evaluaciÃ³n de proveedores, ciclos PHVA/Kaizen) se puede replicar el mismo
   patrÃ³n: nueva colecciÃ³n + nueva vista + nueva pestaÃ±a en BottomNav/Admin.
   ========================================================================= */

const APP_VERSION = "1.3.0";
const APP_VERSION_DATE = "2026-08-03";
const CREADO_POR = "Faber Solano";
const CHANGELOG = [
  { version: "1.3.0", fecha: APP_VERSION_DATE, cambios: "Lista EPP independiente en Calidad, llamados de atencion descargables/enviables, reportes individuales y acumulados de talento humano con observaciones, graficas y registro fotografico." },
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

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
function todayISO() {
  return new Date().toISOString();
}
function fmtFecha(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" }) +
    " Â· " + d.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
}

function resizeImageToDataUrl(file, maxDim = 320) {
  return new Promise((resolve, reject) => {
    if (!file.type || !file.type.startsWith("image/")) {
      reject(new Error("Selecciona un archivo de imagen vÃ¡lido (PNG, JPG, etc.)."));
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      reject(new Error("La imagen es muy pesada (mÃ¡ximo 8MB)."));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("No se pudo leer el archivo."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("El archivo no parece ser una imagen vÃ¡lida."));
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
  { nombre: "RecepciÃ³n de mercancÃ­a", items: [
    "Temperatura correcta de productos refrigerados/congelados",
    "RevisiÃ³n de fechas de caducidad y empaques",
    "VehÃ­culo de transporte en condiciones higiÃ©nicas",
    "DocumentaciÃ³n y trazabilidad de proveedor completa",
  ]},
  { nombre: "AlmacÃ©n seco", items: [
    "Productos rotulados y con sistema PEPS",
    "Ausencia de plagas o signos de infestaciÃ³n",
    "Productos separados del piso y la pared",
    "Orden y limpieza general del Ã¡rea",
  ]},
  { nombre: "CÃ¡maras frÃ­as y refrigeraciÃ³n", items: [
    "Temperatura de refrigeraciÃ³n dentro de rango (0-4Â°C)",
    "Temperatura de congelaciÃ³n dentro de rango (-18Â°C o menor)",
    "Alimentos crudos separados de cocidos/listos para consumo",
    "Empaques cerrados y rotulados con fecha",
  ]},
  { nombre: "Cocina caliente", items: [
    "Temperatura de cocciÃ³n verificada y registrada",
    "Superficies de trabajo limpias y desinfectadas",
    "Utensilios y tablas de colores segÃºn tipo de alimento",
    "Manejo correcto de aceites y equipos de cocciÃ³n",
  ]},
  { nombre: "Cocina frÃ­a", items: [
    "Cadena de frÃ­o respetada en preparaciÃ³n",
    "Utensilios exclusivos para alimentos listos para consumo",
    "Superficies y equipos limpios y desinfectados",
    "Ausencia de contaminaciÃ³n cruzada",
  ]},
  { nombre: "PanaderÃ­a y reposterÃ­a", items: [
    "Insumos almacenados correctamente y rotulados",
    "Limpieza de hornos y equipos de mezclado",
    "Control de tiempos y temperaturas de horneado",
    "Orden y limpieza del Ã¡rea de trabajo",
  ]},
  { nombre: "Zona de lavado (loza y ollas)", items: [
    "ConcentraciÃ³n correcta de detergente/desinfectante",
    "SeparaciÃ³n de Ã¡reas sucia y limpia",
    "Loza y utensilios secos y almacenados correctamente",
    "Drenajes limpios y sin obstrucciÃ³n",
  ]},
  { nombre: "LÃ­nea de servicio", items: [
    "Temperatura de alimentos en exhibiciÃ³n dentro de rango",
    "Protectores/estornudaderos en buen estado",
    "Utensilios de servicio limpios y exclusivos por preparaciÃ³n",
    "RotulaciÃ³n de alÃ©rgenos visible",
  ]},
  { nombre: "Comedor", items: [
    "Mesas y sillas limpias",
    "Pisos libres de residuos y derrames",
    "Botes de basura tapados y no saturados",
    "SeÃ±alizaciÃ³n de aforo y accesos despejada",
  ]},
  { nombre: "BaÃ±os y vestidores del personal", items: [
    "Disponibilidad de jabÃ³n y toallas/secador",
    "Limpieza general y sin malos olores",
    "Casilleros ordenados y en buen estado",
    "Insumos de higiene personal disponibles",
  ]},
  { nombre: "Manejo de residuos", items: [
    "SeparaciÃ³n de residuos orgÃ¡nicos/inorgÃ¡nicos",
    "Contenedores tapados y en buen estado",
    "Frecuencia de recolecciÃ³n adecuada",
    "Ãrea de residuos limpia y sin fugas",
  ]},
];

const DEFAULT_EPP_RAW = [
  "Cofia o malla cubre cabello",
  "Cubrebocas",
  "Uniforme limpio y en buen estado",
  "Calzado cerrado antiderrapante",
  "Guantes segÃºn la tarea",
  "Delantal",
  "Manos y uÃ±as limpias, sin esmalte",
  "Sin joyerÃ­a (anillos, pulseras, reloj, aretes)",
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

/* ---------------------------------- componentes pequeÃ±os ---------------------------------- */

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
      const [c, a, e, p, u, i, h, hc, he, hp, ht, hcert, session] = await Promise.all([
        loadKey("qc_config", null),
        loadKey("qc_areas", null),
        loadKey("qc_epp", null),
        loadKey("qc_personas", []),
        loadKey("qc_usuarios", []),
        loadKey("qc_inspecciones", []),
        loadKey("qc_hallazgos", []),
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
      // migraciÃ³n: personas antiguas con "area" (texto) -> "areas" (arreglo)
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
      hrColaboradores,
      hrEvaluaciones,
      hrPlanes,
      hrCapacitaciones,
      hrCertificaciones,
    });
  }, [loading, config, areas, eppItems, usuarios, inspecciones, hallazgos, hrColaboradores, hrEvaluaciones, hrPlanes, hrCapacitaciones, hrCertificaciones]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F1F3F4]">
        <div className="text-center">
          <ClipboardCheck className="mx-auto mb-2 animate-pulse" size={36} color="#1F2B3A" />
          <p className="text-sm text-gray-500">Cargandoâ€¦</p>
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
        background: "#F1F3F4",
        fontFamily: config?.fontFamily || "Inter, sans-serif",
        fontSize: `${config?.fontScale || 125}%`,
        "--erp-font-factor": (config?.fontScale || 125) / 100,
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

      <main className={`flex-1 overflow-y-auto ${isAdmin && activeModule === "calidad" ? "pb-20" : "pb-6"} w-full max-w-6xl mx-auto px-3 pt-3 relative z-10`}>
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
          <AnalisisView inspecciones={inspecciones} hallazgos={hallazgos} primary={primary} accent={accent} />
        )}
        {activeModule === "calidad" && isAdmin && tab === "hallazgos" && (
          <HallazgosView hallazgos={hallazgos} onUpdate={(v) => persist.hallazgos(v)} primary={primary} />
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
            backupData={{ config, areas, eppItems, usuarios, inspecciones, hallazgos, hrColaboradores, hrEvaluaciones, hrPlanes, hrCapacitaciones, hrCertificaciones }}
          />
        )}
      </main>

      {activeModule === "calidad" && isAdmin && <BottomNav tab={tab} setTab={setTab} primary={primary} />}
    </div>
  );
}

function ErpHeader({ config, primary, currentUser, isAdmin, activeModule, onHome, onLogout }) {
  const moduleLabel = activeModule === "calidad" ? "Calidad" : activeModule === "talento" ? "Talento Humano" : activeModule === "admin" ? "Administracion" : "Inicio";
  return (
    <header className="flex items-center justify-between px-4 py-2.5 text-white sticky top-0 z-30" style={{ background: primary }}>
      <div className="flex items-center gap-2 min-w-0">
        {config.logo ? (
          <img src={config.logo} className="h-7 w-7 object-contain rounded bg-white/10 p-0.5 flex-shrink-0" alt="logo" />
        ) : (
          <ClipboardCheck size={22} />
        )}
        <div className="min-w-0">
          <p className="font-bold text-sm leading-tight truncate" style={{ fontFamily: "Oswald, sans-serif" }}>{config.nombre}</p>
          <p className="text-[11px] text-white/70 truncate">{moduleLabel} Â· {currentUser.nombre} {isAdmin && "Â· Admin"}</p>
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
    { id: "calidad", title: "Calidad e inspecciones", description: "Inspeccion de areas, historial, analisis, hallazgos y llamados de atencion.", icon: ClipboardCheck, enabled: true },
    { id: "talento", title: "Gestion del Talento Humano", description: "Personal unico, evaluaciones, planes de mejora, certificaciones y capacitaciones.", icon: BriefcaseBusiness, enabled: isAdmin },
    { id: "admin", title: "Administracion global", description: "Usuarios, temas, colores, fuentes, logo, marca de agua, backup y ajustes generales del ERP.", icon: Settings, enabled: isAdmin },
  ];
  return (
    <div className="py-4 space-y-4">
      <div className="bg-white rounded-xl p-4">
        <h1 className="text-xl font-black text-gray-800" style={{ fontFamily: "Oswald, sans-serif" }}>Selecciona un modulo</h1>
        <p className="text-sm text-gray-500 mt-1">El ERP queda organizado por modulos para poder crecer sin convertir cada pantalla en un bloque enorme.</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {modules.map((module) => {
          const Icon = module.icon;
          return (
            <button
              key={module.id}
              disabled={!module.enabled}
              onClick={() => onSelect(module.id)}
              className="bg-white rounded-xl p-4 text-left border border-transparent hover:border-gray-200 disabled:opacity-45"
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ background: module.id === "calidad" ? `${accent}22` : `${primary}18` }}>
                <Icon size={22} color={module.id === "calidad" ? accent : primary} />
              </div>
              <h2 className="font-black text-gray-800 text-base" style={{ fontFamily: "Oswald, sans-serif" }}>{module.title}</h2>
              <p className="text-sm text-gray-500 mt-1">{module.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function AreaInspectionView({ areas, personas, currentUser, accent, primary, onSave }) {
  const [areaId, setAreaId] = useState(areas[0]?.id || "");
  const [itemStates, setItemStates] = useState({});
  const [responsableId, setResponsableId] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [evidencias, setEvidencias] = useState([]);
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
    setResponsableId("");
    setObservaciones("");
    setEvidencias([]);
    setSaved(false);
  };

  const handleEvidence = async (e) => {
    const files = Array.from(e.target.files || []);
    const converted = await Promise.all(files.map((file) => resizeImageToDataUrl(file, 720)));
    setEvidencias((prev) => [...prev, ...converted]);
    e.target.value = "";
  };

  const handleSave = async () => {
    if (!allAnswered || !area) return;
    const itemsRes = area.items.map((it) => ({ itemId: it.id, texto: it.texto, estado: itemStates[it.id] }));
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
      notas: "",
    }));
    await onSave(insp, nuevosHallazgos);
    setSaved(true);
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
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="bg-white rounded-xl p-3">
          <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1"><Users size={12} /> Responsable del area</label>
          <select value={responsableId} onChange={(e) => setResponsableId(e.target.value)} className="w-full border rounded-md px-3 py-2 mt-1 font-semibold">
            <option value="">Seleccionar responsable</option>
            {areaPeople.map((p) => <option key={p.id} value={p.id}>{p.nombre} Â· {p.cargo || p.rol || "Personal"}</option>)}
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

        <div className="bg-white rounded-xl p-3 space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase">Observaciones y evidencias</label>
          <textarea value={observaciones} onChange={(e) => setObservaciones(e.target.value)} rows={4}
            className="w-full border-2 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
            style={{ borderColor: "#E2E8F0" }}
            placeholder="Describe hallazgos, condiciones del area o acciones inmediatas..." />
          <label className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md border text-sm font-bold cursor-pointer" style={{ borderColor: primary, color: primary }}>
            <ImagePlus size={16} /> Camara / archivo
            <input type="file" accept="image/*" capture="environment" multiple onChange={handleEvidence} className="hidden" />
          </label>
          {evidencias.length > 0 && <p className="text-xs text-gray-400">{evidencias.length} evidencia(s) adjunta(s)</p>}
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
  const [observaciones, setObservaciones] = useState("");
  const [evidencias, setEvidencias] = useState([]);
  const [saved, setSaved] = useState(false);

  const persona = personas.find((p) => p.id === personaId);
  const answeredCount = eppItems.filter((it) => itemStates[it.id]).length;
  const totalItems = eppItems.length;
  const allAnswered = totalItems > 0 && answeredCount === totalItems && persona;

  const resetForm = () => {
    setPersonaId(personas[0]?.id || "");
    setItemStates({});
    setObservaciones("");
    setEvidencias([]);
    setSaved(false);
  };

  const handleEvidence = async (e) => {
    const files = Array.from(e.target.files || []);
    const converted = await Promise.all(files.map((file) => resizeImageToDataUrl(file, 720)));
    setEvidencias((prev) => [...prev, ...converted]);
    e.target.value = "";
  };

  const handleSave = async () => {
    if (!allAnswered) return;
    const itemsRes = eppItems.map((it) => ({ itemId: it.id, texto: it.texto, estado: itemStates[it.id] }));
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
      epp: [{ personaId: persona.id, personaNombre: persona.nombre, rol: persona.cargo || persona.rol || "", items: itemsRes }],
      observaciones,
      evidencias,
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
      notas: observaciones || "",
    }));
    await onSave(insp, nuevosHallazgos);
    setSaved(true);
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
            <select value={personaId} onChange={(e) => { setPersonaId(e.target.value); setItemStates({}); }} className="w-full border rounded-md px-3 py-2 mt-1 font-semibold">
              <option value="">Seleccionar colaborador</option>
              {personas.map((p) => <option key={p.id} value={p.id}>{p.nombre} - {p.cargo || p.rol || "Colaborador"}</option>)}
            </select>
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
          <div className="space-y-3">
            {eppItems.map((it) => (
              <div key={it.id} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                <p className="text-sm text-gray-700">{it.texto}</p>
                <StatusPicker value={itemStates[it.id]} onChange={(v) => setItemStates((s) => ({ ...s, [it.id]: v }))} />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl p-3 space-y-2">
        <label className="text-xs font-bold text-gray-500 uppercase">Observaciones y registro fotografico</label>
        <textarea value={observaciones} onChange={(e) => setObservaciones(e.target.value)} rows={4}
          className="w-full border-2 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
          style={{ borderColor: "#E2E8F0" }}
          placeholder="Describe incumplimientos, reposicion requerida o novedades del EPP..." />
        <label className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md border text-sm font-bold cursor-pointer" style={{ borderColor: primary, color: primary }}>
          <ImagePlus size={16} /> Camara / archivo
          <input type="file" accept="image/*" capture="environment" multiple onChange={handleEvidence} className="hidden" />
        </label>
        {evidencias.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {evidencias.map((src, index) => <img key={index} src={src} alt="" className="h-20 w-full object-cover rounded-md border" />)}
          </div>
        )}
      </div>

      <button disabled={!allAnswered} onClick={handleSave}
        className="w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 disabled:opacity-40"
        style={{ background: primary }}>
        <Save size={18} /> Guardar verificacion EPP
      </button>
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
    if (pw.length < 4) return setError("La contraseÃ±a debe tener al menos 4 caracteres.");
    if (pw !== pw2) return setError("Las contraseÃ±as no coinciden.");
    onDone(
      { nombre: nombre.trim() || "ERP Cocina Institucional", colorPrimario: "#1F2B3A", colorAccent: "#F2622E", logo: null, watermarkLogo: true, fontScale: 125, fontFamily: "Inter, sans-serif" },
      { id: genId(), nombre: adminNombre.trim(), password: pw, rol: "administrador" }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1F2B3A] p-4">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@600;700&family=Inter:wght@400;500;600;700&display=swap');`}</style>
      <div className="bg-white rounded-xl w-full max-w-sm p-6">
        <div className="flex items-center gap-2 mb-1">
          <ClipboardCheck color="#F2622E" size={26} />
          <h1 className="text-lg font-black" style={{ fontFamily: "Oswald, sans-serif" }}>ConfiguraciÃ³n inicial</h1>
        </div>
        <p className="text-sm text-gray-500 mb-4">Define el nombre de tu checklist y crea la cuenta de administrador.</p>

        <label className="text-xs font-bold text-gray-500 uppercase">Nombre del checklist</label>
        <input value={nombre} onChange={(e) => setNombre(e.target.value)} className="w-full border rounded-md px-3 py-2 mb-3 mt-1" />

        <label className="text-xs font-bold text-gray-500 uppercase">Nombre del administrador</label>
        <input value={adminNombre} onChange={(e) => setAdminNombre(e.target.value)} className="w-full border rounded-md px-3 py-2 mb-3 mt-1" placeholder="Ej. Jefe de cocina" />

        <label className="text-xs font-bold text-gray-500 uppercase">Crear contraseÃ±a (mÃ­n. 4 caracteres)</label>
        <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} className="w-full border rounded-md px-3 py-2 mb-3 mt-1" />

        <label className="text-xs font-bold text-gray-500 uppercase">Confirmar contraseÃ±a</label>
        <input type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} className="w-full border rounded-md px-3 py-2 mb-1 mt-1" />

        {error && (
          <p className="text-xs text-red-700 mb-2 bg-red-50 border border-red-200 rounded-md px-2.5 py-2 font-semibold">{error}</p>
        )}

        <button onClick={submit} className="w-full mt-3 py-2.5 rounded-md font-bold text-white" style={{ background: "#F2622E" }}>
          Crear checklist
        </button>

        <p className="text-center text-[11px] text-gray-400 mt-4">Creado por {CREADO_POR} Â· v{APP_VERSION}</p>
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

        <p className="text-center text-[11px] text-gray-400 mt-4">Creado por {CREADO_POR} Â· v{APP_VERSION}</p>
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
          <p className="text-[11px] text-white/60 truncate">{currentUser.nombre} {isAdmin && "Â· Admin"}</p>
        </div>
      </div>
      <button onClick={onLogout} className="p-1.5 rounded hover:bg-white/10 flex-shrink-0"><LogOut size={18} /></button>
    </header>
  );
}

function BottomNav({ tab, setTab, primary }) {
  const items = [
    { id: "inspeccion", label: "InspecciÃ³n", icon: ListChecks },
    { id: "epp", label: "EPP", icon: ShieldCheck },
    { id: "historial", label: "Historial", icon: ClipboardCheck },
    { id: "analisis", label: "AnÃ¡lisis", icon: BarChart3 },
    { id: "hallazgos", label: "Hallazgos", icon: AlertCircle },
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

/* ---------------------------------- inspecciÃ³n ---------------------------------- */

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
        personaNombre: p?.nombre || "â€”",
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
          descripcion: `EPP Â· ${pe.personaNombre}: ${i.texto}`, responsable: pe.personaNombre,
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
        <h3 className="font-bold text-lg" style={{ fontFamily: "Oswald, sans-serif" }}>InspecciÃ³n guardada</h3>
        <p className="text-sm text-gray-500 mt-1">El registro quedÃ³ guardado correctamente.</p>
        <button onClick={() => resetForm(areas[0]?.id || "")} className="mt-4 px-5 py-2 rounded-md font-bold text-white" style={{ background: primary }}>
          Nueva inspecciÃ³n
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-xl p-3">
        <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1"><Building2 size={12} /> Ãrea a inspeccionar</label>
        <select value={areaId} onChange={(e) => resetForm(e.target.value)} className="w-full border rounded-md px-3 py-2 mt-1 font-semibold">
          {areas.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
        </select>
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-gray-400">{answeredCount}/{totalItems} Ã­tems evaluados</p>
          <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${totalItems ? (answeredCount / totalItems) * 100 : 0}%`, background: accent }} />
          </div>
        </div>
      </div>

      {area && (
        <div className="bg-white rounded-xl p-3">
          <h3 className="font-bold text-sm mb-2 flex items-center gap-1.5" style={{ fontFamily: "Oswald, sans-serif" }}>
            <ListChecks size={16} /> Puntos de verificaciÃ³n
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
          <ShieldCheck size={16} /> EvaluaciÃ³n de EPP del personal
        </h3>
        {personas.length === 0 ? (
          <p className="text-xs text-gray-400">No hay personal registrado. Un administrador puede agregarlo en la secciÃ³n Admin.</p>
        ) : (
          <>
            <p className="text-xs text-gray-400 mb-2">Selecciona al personal presente para evaluar su equipo de protecciÃ³n.</p>
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
                  <p className="text-sm font-bold mb-1.5">{p?.nombre} <span className="text-xs font-normal text-gray-400">Â· {p?.rol}</span></p>
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
          className="w-full border rounded-md px-3 py-2 mt-1 text-sm" placeholder="Notas adicionales sobre esta inspecciÃ³nâ€¦" />
      </div>

      <button disabled={!allAnswered} onClick={handleSave}
        className="w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 disabled:opacity-40"
        style={{ background: primary }}>
        <Save size={18} /> Guardar inspecciÃ³n
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
    // bookType xlsx: formato estÃ¡ndar compatible con Excel y con Google Sheets (Archivo > Importar, o abrir desde Drive)
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
    if (confirm("Â¿Eliminar esta inspecciÃ³n de forma permanente? TambiÃ©n se eliminarÃ¡n sus hallazgos asociados.")) {
      onUpdate(inspecciones.filter((i) => i.id !== detalle.id));
      onDeleteCascadeHallazgos(detalle.id);
      setDetalle(null);
    }
  };

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-xl p-3 flex flex-col sm:flex-row gap-2 sm:items-center">
        <select value={filtroArea} onChange={(e) => setFiltroArea(e.target.value)} className="border rounded-md px-3 py-2 text-sm flex-1">
          <option value="todas">Todas las Ã¡reas</option>
          {areas.map((a) => <option key={a.id} value={a.nombre}>{a.nombre}</option>)}
        </select>
        <button onClick={exportar} className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-sm font-bold border" style={{ borderColor: primary, color: primary }}>
          <Download size={15} /> Exportar Excel
        </button>
      </div>

      {filtradas.length === 0 && <p className="text-center text-sm text-gray-400 py-8">Sin registros todavÃ­a.</p>}

      <div className="space-y-2">
        {filtradas.map((i) => {
          const st = i.cumplimientoPct >= 90 ? STATUS[0] : i.cumplimientoPct >= 70 ? STATUS[1] : STATUS[2];
          return (
            <button key={i.id} onClick={() => setDetalle(i)} className="w-full bg-white rounded-lg p-3 flex items-center justify-between text-left">
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">{i.areaNombre}</p>
                <p className="text-xs text-gray-400">{fmtFecha(i.fecha)} Â· {i.inspector}</p>
              </div>
              <Badge color={st.color} bg={st.bg}>{i.cumplimientoPct}%</Badge>
            </button>
          );
        })}
      </div>

      {detalle && (
        <Modal title={detalle.areaNombre} onClose={() => { setDetalle(null); setEditando(false); }} wide>
          <p className="text-xs text-gray-400 mb-3">{fmtFecha(detalle.fecha)} Â· Inspector: {detalle.inspector}</p>

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

/* ---------------------------------- anÃ¡lisis ---------------------------------- */

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

      {porArea.length > 0 && (
        <div className="bg-white rounded-xl p-3">
          <h3 className="font-bold text-sm mb-2" style={{ fontFamily: "Oswald, sans-serif" }}>Cumplimiento promedio por Ã¡rea</h3>
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

      {inspecciones.length === 0 && <p className="text-center text-sm text-gray-400 py-8">Realiza inspecciones para ver el anÃ¡lisis acumulado.</p>}
    </div>
  );
}

/* ---------------------------------- hallazgos ---------------------------------- */

const ESTADOS_HALLAZGO = [
  { value: "abierto", label: "Abierto", color: "#B5333D", bg: "#FBE7E8" },
  { value: "en_proceso", label: "En proceso", color: "#B4750E", bg: "#FCF1DC" },
  { value: "cerrado", label: "Cerrado", color: "#1E7A46", bg: "#E4F4EA" },
];

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

function HallazgosView({ hallazgos, onUpdate, primary }) {
  const [filtro, setFiltro] = useState("todos");
  const [editId, setEditId] = useState(null);
  const [draft, setDraft] = useState(null);

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
    .firma { border-top: 1px solid #111827; padding-top: 8px; text-align: center; }
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
    <div class="firma">Responsable</div>
    <div class="firma">Administrador / Inspector</div>
  </div>
</body>
</html>`;
  };

  const descargarLlamado = (h, total) => {
    const registro = marcarLlamado(h, total);
    const responsable = (h.responsable || "sin-responsable").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    downloadTextFile(`llamado-atencion-${responsable || "registro"}-${new Date().toISOString().slice(0, 10)}.html`, buildLlamado(h, total, registro));
  };

  const enviarLlamado = (h, total) => {
    const registro = marcarLlamado(h, total);
    const responsable = h.responsable || "Sin responsable asignado";
    const subject = `Llamado de atención - ${responsable}`;
    const body = [
      "Llamado de atención generado desde el ERP.",
      "",
      `Fecha: ${new Date(registro.fecha).toLocaleDateString("es-CO")}`,
      `Responsable: ${responsable}`,
      `Área: ${h.area || "Sin área"}`,
      `Incumplimiento: ${h.descripcion || "Sin descripción"}`,
      `Repeticiones detectadas: ${total}`,
      `Compromiso: ${h.fechaCompromiso || "Pendiente por definir"}`,
      "",
      `Notas: ${h.notas || "Sin notas registradas."}`,
    ].join("\n");
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
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
                  <p className="text-xs text-gray-400 mt-0.5">{h.area} Â· {fmtFecha(h.fecha)}</p>
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
    </div>
  );
}

/* ---------------------------------- administraciÃ³n ---------------------------------- */

function AdminView({ config, areas, eppItems, usuarios, currentUser, onConfig, onAreas, onEpp, onUsuarios, primary, backupData }) {
  const [sub, setSub] = useState("general");

  const subs = [
    { id: "general", label: "General" },
    { id: "areas", label: "Ãreas" },
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
      await onConfig({ ...config, nombre, colorPrimario, colorAccent, logo: dataUrl, fontScale, fontFamily, watermarkLogo, inactiveStatsMonths });
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
    await onConfig({ ...config, nombre, colorPrimario, colorAccent, logo: null, fontScale, fontFamily, watermarkLogo, inactiveStatsMonths });
  };

  const guardar = () => onConfig({ ...config, nombre, colorPrimario, colorAccent, logo, fontScale, fontFamily, watermarkLogo, inactiveStatsMonths });
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

      <div className="grid sm:grid-cols-3 gap-3">
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase">TamaÃ±o de letra</label>
          <input type="range" min="100" max="150" value={fontScale} onChange={(e) => setFontScale(Number(e.target.value))} className="w-full mt-2" />
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
              <ImagePlus size={13} /> {logoBusy ? "Cargandoâ€¦" : "Subir imagen"}
              <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={handleLogo} className="hidden" disabled={logoBusy} />
            </label>
            {logo && (
              <button onClick={quitarLogo} className="px-3 py-1.5 rounded-md text-xs font-bold border border-red-200 text-red-600 w-fit">Quitar logo</button>
            )}
          </div>
        </div>
        <p className="text-[11px] text-gray-400 mt-1.5">Formatos: PNG, JPG, WEBP o SVG. Se ajusta automÃ¡ticamente y se guarda al instante.</p>
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
    if (confirm("Â¿Eliminar esta Ã¡rea y todos sus Ã­tems?")) onAreas(areas.filter((a) => a.id !== id));
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
        <input value={nuevaArea} onChange={(e) => setNuevaArea(e.target.value)} placeholder="Nueva Ã¡reaâ€¦" className="flex-1 border rounded-md px-3 py-2 text-sm" />
        <button onClick={agregarArea} className="px-3 rounded-md font-bold text-white flex items-center gap-1" style={{ background: primary }}><Plus size={16} /></button>
      </div>

      {areas.map((a) => (
        <div key={a.id} className="bg-white rounded-xl p-3">
          <div className="flex items-center gap-2">
            <input value={a.nombre} onChange={(e) => renombrarArea(a.id, e.target.value)} className="flex-1 font-bold text-sm border-b border-transparent focus:border-gray-300 outline-none py-1" />
            <button onClick={() => setExpand(expand === a.id ? null : a.id)} className="text-xs font-bold" style={{ color: primary }}>{expand === a.id ? "Ocultar" : `${a.items.length} Ã­tems`}</button>
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
                  placeholder="Nuevo Ã­temâ€¦" className="flex-1 border rounded-md px-2 py-1.5 text-sm" />
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
        <input value={nuevo} onChange={(e) => setNuevo(e.target.value)} placeholder="Nuevo Ã­tem de EPPâ€¦" className="flex-1 border rounded-md px-2 py-1.5 text-sm" />
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
      <p className="text-[11px] text-gray-400 mt-1">{value.length}/{max} Ã¡reas seleccionadas</p>
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
    if (confirm("Â¿Eliminar a esta persona?")) onPersonas(personas.filter((p) => p.id !== id));
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
          <label className="text-xs font-bold text-gray-500 uppercase">Ãreas asignadas (mÃ¡x. 3)</label>
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
                <p className="text-xs text-gray-400">{p.rol}{p.areas?.length ? ` Â· ${p.areas.join(", ")}` : ""}</p>
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
        <label className="text-xs font-bold text-gray-500 uppercase">Ãreas asignadas (mÃ¡x. 3)</label>
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
    if (usuarios.length >= MAX_USUARIOS) return setMsg(`Ya alcanzaste el mÃ¡ximo de ${MAX_USUARIOS} usuarios.`);
    if (!form.nombre.trim()) return setMsg("Escribe el nombre del usuario.");
    if (form.password.length < 4) return setMsg("La contraseÃ±a debe tener al menos 4 caracteres.");
    onUsuarios([...usuarios, { id: genId(), nombre: form.nombre.trim(), password: form.password, rol: form.rol }]);
    setForm({ nombre: "", password: "", rol: "usuario" });
    setMsg("");
  };

  const eliminar = (u) => {
    if (u.rol === "administrador" && admins.length <= 1) {
      setMsg("Debe existir al menos un administrador. Crea otro antes de eliminar este.");
      return;
    }
    if (confirm(`Â¿Eliminar el acceso de ${u.nombre}?`)) onUsuarios(usuarios.filter((x) => x.id !== u.id));
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
        <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="ContraseÃ±a (mÃ­n. 4 caracteres)" className="w-full border rounded-md px-3 py-2 text-sm" />
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
                  {u.nombre} {u.id === currentUser.id && <span className="text-[10px] text-gray-400">(tÃº)</span>}
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

      <p className="text-[11px] text-gray-400 px-1">Los usuarios con rol "Usuario" solo pueden ingresar a la pestaÃ±a InspecciÃ³n y no ven Historial, AnÃ¡lisis, Hallazgos ni Admin.</p>
    </div>
  );
}

function UsuarioEditForm({ usuario, onSave, onCancel, primary }) {
  const [u, setU] = useState({ ...usuario, password: usuario.password });
  return (
    <div className="space-y-2">
      <input value={u.nombre} onChange={(e) => setU({ ...u, nombre: e.target.value })} className="w-full border rounded-md px-3 py-2 text-sm" placeholder="Nombre" />
      <input type="password" value={u.password} onChange={(e) => setU({ ...u, password: e.target.value })} className="w-full border rounded-md px-3 py-2 text-sm" placeholder="ContraseÃ±a" />
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
      <p className="text-sm text-gray-400 mb-3">VersiÃ³n actual: <span className="font-bold" style={{ color: primary }}>v{APP_VERSION}</span></p>

      <h4 className="text-xs font-bold text-gray-500 uppercase mb-1.5">Historial de versiones</h4>
      <div className="space-y-2">
        {CHANGELOG.map((c) => (
          <div key={c.version} className="border-l-2 pl-2.5" style={{ borderColor: primary }}>
            <p className="text-sm font-bold">v{c.version} <span className="text-xs font-normal text-gray-400">Â· {c.fecha}</span></p>
            <p className="text-xs text-gray-600">{c.cambios}</p>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-gray-400 mt-3">La versiÃ³n se actualiza cada vez que se realizan ajustes significativos a la aplicaciÃ³n.</p>
    </div>
  );
}

