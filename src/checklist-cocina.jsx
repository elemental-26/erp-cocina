import React, { useState, useEffect, useMemo, useRef } from "react";
import TalentoHumanoView from "./TalentoHumanoModule";
import EstandarizacionCocinaView from "./EstandarizacionCocinaModule";
import { DEFAULT_STD_DATA } from "./data/estandarizacionCocinaData";
import {
  clearCloudSession,
  getCloudSession,
  isCloudConfigReady,
  pullCloudRecords,
  pushCloudRecord,
  pushCloudSnapshot,
  signInCloud,
} from "./services/supabaseSyncService";
import {
  ClipboardCheck, AlertTriangle,
  Settings, Users, BarChart3, ListChecks, LogOut, Plus, Trash2, Pencil,
  Lock, ChevronRight, Download, ShieldCheck, AlertCircle, UserPlus,
  Palette, ImagePlus, X, Save, Building2, Check, Info, KeyRound,
  BriefcaseBusiness, FileText, ChefHat, Home, PackageCheck
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, LineChart, Line, PieChart, Pie, Cell, Legend
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

const APP_VERSION = "2.5.0";
const APP_VERSION_DATE = "2026-08-05";
const CREADO_POR = "Faber Solano";
const CHANGELOG = [
  { version: "2.5.0", fecha: APP_VERSION_DATE, cambios: "Reorganizacion profesional: logos por modulo, evidencias desplegables, fichas activas, insumos validados, merma integrada y origen ERP en documentos." },
  { version: "2.4.0", fecha: APP_VERSION_DATE, cambios: "Modulo de estandarizacion de cocina desde Excel: fichas tecnicas, insumos sin duplicados, preparaciones, merma, fotografia, descarga y WhatsApp." },
  { version: "2.3.0", fecha: APP_VERSION_DATE, cambios: "Edicion inline de colaboradores, fotografia compacta y guardado reforzado para conservar personal y fotos al refrescar la PWA." },
  { version: "2.2.0", fecha: APP_VERSION_DATE, cambios: "Historial protegido contra sobrescritura en tablet, agrupacion por fecha, analisis por periodos con graficas circulares y hasta 3 fotos por item." },
  { version: "2.1.0", fecha: APP_VERSION_DATE, cambios: "Firma con boton fijo visible, evidencia plegable, inspecciones sin fila de encabezados, KPIs en graficas y talento humano con datos/foto en dos zonas." },
  { version: "2.0.0", fecha: APP_VERSION_DATE, cambios: "Inspecciones y EPP compactas en filas horizontales con observaciones desplegables, y KPIs de calidad convertidos en graficos de lectura rapida." },
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

const ERP_MODULES = [
  { id: "calidad", label: "Calidad", description: "Inspecciones, EPP, historial, análisis, hallazgos y desviaciones." },
  { id: "talento", label: "Talento", description: "Colaboradores, evaluaciones, capacitaciones, planes y certificados." },
  { id: "cocina", label: "Fichas", description: "Fichas técnicas, insumos, preparaciones y mermas." },
  { id: "pedidos", label: "Pedidos", description: "Requisiciones consolidadas por servicio, comedor y centro de costo." },
  { id: "admin", label: "Admin", description: "Configuración, usuarios, roles, catálogos y backup." },
];

const ERP_ACTIONS = [
  { id: "view", label: "Ver" },
  { id: "create", label: "Crear" },
  { id: "edit", label: "Editar" },
  { id: "delete", label: "Eliminar" },
  { id: "print", label: "Imprimir" },
  { id: "share", label: "WhatsApp" },
];

function allModulePermissions(value) {
  return ERP_ACTIONS.reduce((acc, action) => ({ ...acc, [action.id]: value }), {});
}

function rolePermissions(moduleIds, value = true) {
  return ERP_MODULES.reduce((acc, module) => ({
    ...acc,
    [module.id]: moduleIds.includes(module.id) ? allModulePermissions(value) : allModulePermissions(false),
  }), {});
}

const DEFAULT_ROLE_PROFILES = {
  administrador: {
    id: "administrador",
    label: "Administrador",
    description: "Acceso total a módulos, usuarios, configuración y reportes.",
    system: true,
    permissions: rolePermissions(ERP_MODULES.map((module) => module.id), true),
  },
  supervisor: {
    id: "supervisor",
    label: "Supervisor",
    description: "Gestiona calidad, inspecciones, hallazgos y desviaciones.",
    permissions: rolePermissions(["calidad", "cocina", "pedidos"], true),
  },
  talento: {
    id: "talento",
    label: "Talento humano",
    description: "Gestiona colaboradores, evaluaciones, capacitación y certificados.",
    permissions: rolePermissions(["talento"], true),
  },
  produccion: {
    id: "produccion",
    label: "Producción",
    description: "Consulta y mantiene fichas, insumos y preparaciones.",
    permissions: rolePermissions(["cocina", "pedidos"], true),
  },
  hse: {
    id: "hse",
    label: "HSE",
    description: "Consulta calidad, EPP, hallazgos y desviaciones.",
    permissions: {
      ...rolePermissions(["calidad"], true),
      talento: allModulePermissions(false),
      cocina: allModulePermissions(false),
      pedidos: allModulePermissions(false),
      admin: allModulePermissions(false),
    },
  },
  consulta: {
    id: "consulta",
    label: "Consulta",
    description: "Solo lectura e impresión de módulos autorizados.",
    permissions: ERP_MODULES.reduce((acc, module) => ({
      ...acc,
      [module.id]: { view: module.id !== "admin", create: false, edit: false, delete: false, print: module.id !== "admin", share: false },
    }), {}),
  },
  usuario: {
    id: "usuario",
    label: "Operario",
    description: "Diligencia inspecciones asignadas. Sin acceso administrativo.",
    permissions: {
      ...rolePermissions(["calidad"], false),
      calidad: { view: true, create: true, edit: false, delete: false, print: false, share: false },
    },
  },
};

function normalizeRoleProfiles(config) {
  const saved = config?.roleProfiles || {};
  const merged = { ...DEFAULT_ROLE_PROFILES, ...saved };
  Object.entries(merged).forEach(([roleId, role]) => {
    merged[roleId] = {
      ...role,
      id: role.id || roleId,
      permissions: ERP_MODULES.reduce((acc, module) => ({
        ...acc,
        [module.id]: { ...allModulePermissions(false), ...(role.permissions?.[module.id] || {}) },
      }), {}),
    };
  });
  return merged;
}

function userRoleId(user) {
  return user?.roleId || user?.rol || "usuario";
}

function canAccess(config, user, moduleId, action = "view") {
  if (!user) return false;
  if (user.rol === "administrador" || userRoleId(user) === "administrador") return true;
  const profiles = normalizeRoleProfiles(config);
  return Boolean(profiles[userRoleId(user)]?.permissions?.[moduleId]?.[action]);
}
const statusInfo = (v) => STATUS.find((s) => s.value === v) || STATUS[3];
const MAX_EVIDENCE_PER_ITEM = 3;

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
function dayKey(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "sin-fecha";
  return d.toISOString().slice(0, 10);
}
function fmtSoloFecha(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Sin fecha";
  return d.toLocaleDateString("es-CO", { weekday: "short", day: "2-digit", month: "short", year: "numeric" });
}
function monthKey(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "sin-mes";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
function yearKey(iso) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "sin-ano" : String(d.getFullYear());
}
function normalizeEvidenceList(value) {
  if (Array.isArray(value)) return value.filter(Boolean).slice(0, MAX_EVIDENCE_PER_ITEM);
  return value ? [value].slice(0, MAX_EVIDENCE_PER_ITEM) : [];
}
function mergeById(newItems, currentItems = []) {
  const map = new Map();
  [...newItems, ...currentItems].forEach((item) => {
    if (item?.id && !map.has(item.id)) map.set(item.id, item);
  });
  return Array.from(map.values()).sort((a, b) => new Date(b.fecha || 0) - new Date(a.fecha || 0));
}
function mergeCollaboratorsById(incoming = [], currentItems = []) {
  const map = new Map();
  currentItems.forEach((item) => {
    if (item?.id) map.set(item.id, item);
  });
  incoming.forEach((item) => {
    if (!item?.id) return;
    const current = map.get(item.id) || {};
    map.set(item.id, {
      ...current,
      ...item,
      foto: item.foto || current.foto || null,
      areas: item.areas || (item.area ? [item.area] : current.areas || []),
    });
  });
  return Array.from(map.values());
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

const STORAGE_DB_NAME = "erp-cocina-storage";
const STORAGE_DB_VERSION = 1;
const STORAGE_STORE = "keyval";
const STORAGE_DB_MARKER = "__erp_indexeddb__:";
const LOCAL_STORAGE_SAFE_LIMIT = 180000;
let activeCloudConfig = null;

function setActiveCloudConfig(config) {
  activeCloudConfig = isCloudConfigReady(config) ? config : null;
}

function openStorageDb() {
  return new Promise((resolve, reject) => {
    if (!("indexedDB" in window)) {
      reject(new Error("IndexedDB no disponible"));
      return;
    }
    const request = indexedDB.open(STORAGE_DB_NAME, STORAGE_DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORAGE_STORE)) db.createObjectStore(STORAGE_STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("No se pudo abrir IndexedDB"));
  });
}

async function idbGet(key) {
  const db = await openStorageDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORAGE_STORE, "readonly");
    const req = tx.objectStore(STORAGE_STORE).get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error || new Error("No se pudo leer IndexedDB"));
    tx.oncomplete = () => db.close();
    tx.onerror = () => db.close();
  });
}

async function idbSet(key, value) {
  const db = await openStorageDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORAGE_STORE, "readwrite");
    const req = tx.objectStore(STORAGE_STORE).put(value, key);
    req.onsuccess = () => resolve(true);
    req.onerror = () => reject(req.error || new Error("No se pudo guardar IndexedDB"));
    tx.oncomplete = () => db.close();
    tx.onerror = () => db.close();
  });
}

async function loadKey(key, fallback) {
  try {
    const data = localStorage.getItem(key);

    if (data?.startsWith(STORAGE_DB_MARKER)) {
      const dbData = await idbGet(key);
      return dbData ? JSON.parse(dbData) : fallback;
    }

    if (data) return JSON.parse(data);

    const dbData = await idbGet(key).catch(() => null);
    return dbData ? JSON.parse(dbData) : fallback;
  } catch (e) {
    console.error("Error cargando", key, e);
    return fallback;
  }
}

async function saveKey(key, value) {
  const serialized = JSON.stringify(value);
  try {
    if (serialized.length > LOCAL_STORAGE_SAFE_LIMIT) {
      await idbSet(key, serialized);
      try {
        localStorage.setItem(key, `${STORAGE_DB_MARKER}${key}`);
      } catch {
        localStorage.removeItem(key);
        localStorage.setItem(key, `${STORAGE_DB_MARKER}${key}`);
      }
      if (activeCloudConfig) pushCloudRecord(activeCloudConfig, key, value).catch((error) => console.warn("Sync pendiente", key, error));
      return true;
    }
    localStorage.setItem(key, serialized);
    idbSet(key, serialized).catch(() => {});
    if (activeCloudConfig) pushCloudRecord(activeCloudConfig, key, value).catch((error) => console.warn("Sync pendiente", key, error));
    return true;
  } catch (e) {
    try {
      await idbSet(key, serialized);
      localStorage.removeItem(key);
      localStorage.setItem(key, `${STORAGE_DB_MARKER}${key}`);
      if (activeCloudConfig) pushCloudRecord(activeCloudConfig, key, value).catch((error) => console.warn("Sync pendiente", key, error));
      return true;
    } catch (dbError) {
      console.error("Error guardando", key, e, dbError);
      return false;
    }
  }
}

/* ---------------------------------- componentes pequeños ---------------------------------- */

function StatusPicker({ value, onChange, compact }) {
  return (
    <div className={`status-picker ${compact ? "status-picker-compact" : ""}`}>
      {STATUS.map((s) => {
        const active = value === s.value;
        return (
          <button
            key={s.value}
            type="button"
            onClick={() => onChange(s.value)}
            title={s.label}
            className={`status-option ${active ? "status-option-active" : ""}`}
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

function _StampGauge({ pct, size = 128 }) {
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
          <h3 className="font-bold text-[15px]" style={{ fontFamily: "inherit" }}>{title}</h3>
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
          onKeyDown={(e) => { if (e.key === "Enter") { if (pw === usuario.password) onSuccess(); else setErr(true); } }}
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
  const [_personas, setPersonas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [inspecciones, setInspecciones] = useState([]);
  const [hallazgos, setHallazgos] = useState([]);
  const [desviaciones, setDesviaciones] = useState([]);
  const [hrColaboradores, setHrColaboradores] = useState([]);
  const [hrEvaluaciones, setHrEvaluaciones] = useState([]);
  const [hrPlanes, setHrPlanes] = useState([]);
  const [hrCapacitaciones, setHrCapacitaciones] = useState([]);
  const [hrCertificaciones, setHrCertificaciones] = useState([]);
  const [stdFamilias, setStdFamilias] = useState([]);
  const [stdInsumos, setStdInsumos] = useState([]);
  const [stdRecetas, setStdRecetas] = useState([]);
  const [stdPreparaciones, setStdPreparaciones] = useState([]);
  const [stdMermas, setStdMermas] = useState([]);
  const [stdRequisiciones, setStdRequisiciones] = useState([]);

  const [currentUser, setCurrentUser] = useState(null);
  const [activeModule, setActiveModule] = useState("menu");
  const [tab, setTab] = useState("inspeccion");
  const [loginTarget, setLoginTarget] = useState(null);

  useEffect(() => {
    (async () => {
      const [c, a, e, p, u, i, h, d, hc, he, hp, ht, hcert, sf, si, sr, sp, sm, sreq, session] = await Promise.all([
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
        loadKey("std_familias", null),
        loadKey("std_insumos", null),
        loadKey("std_recetas", null),
        loadKey("std_preparaciones", null),
        loadKey("std_mermas", []),
        loadKey("std_requisiciones", []),
        loadKey("erp_session_user", null),
      ]);
      const cloudRecords = isCloudConfigReady(c) && getCloudSession()?.access_token ? await pullCloudRecords(c).catch((error) => {
        console.warn("No se pudo cargar Supabase, se usa respaldo local", error);
        return {};
      }) : {};
      const loadedConfig = cloudRecords.qc_config || c;
      setActiveCloudConfig(loadedConfig);
      let finalAreas = cloudRecords.qc_areas || a;
      if (!finalAreas) {
        finalAreas = DEFAULT_AREAS_RAW.map((ar) => ({ id: genId(), nombre: ar.nombre, items: ar.items.map((t) => ({ id: genId(), texto: t })) }));
        saveKey("qc_areas", finalAreas);
      }
      let finalEpp = cloudRecords.qc_epp || e;
      if (!finalEpp) {
        finalEpp = DEFAULT_EPP_RAW.map((t) => ({ id: genId(), texto: t }));
        saveKey("qc_epp", finalEpp);
      }
      // migración: personas antiguas con "area" (texto) -> "areas" (arreglo)
      const finalPersonas = (cloudRecords.qc_personas || p || []).map((per) => per.areas ? per : { ...per, areas: per.area ? [per.area] : [] });
      const cloudColaboradores = cloudRecords.hr_colaboradores;
      const migratedColaboradores = (cloudColaboradores?.length ? cloudColaboradores : hc?.length ? hc : finalPersonas.map((per) => ({
        ...per,
        documento: per.documento || "",
        cargo: per.cargo || per.rol || "",
        area: per.area || per.areas?.[0] || "",
        estado: per.estado || "Activo",
      })));
      if (!hc?.length && migratedColaboradores.length) saveKey("hr_colaboradores", migratedColaboradores);
      setConfig(loadedConfig);
      setAreas(finalAreas);
      setEppItems(finalEpp);
      setPersonas(migratedColaboradores);
      setUsuarios(cloudRecords.qc_usuarios || u || []);
      setInspecciones(cloudRecords.qc_inspecciones || i || []);
      setHallazgos(cloudRecords.qc_hallazgos || h || []);
      setDesviaciones(cloudRecords.qc_desviaciones || d || []);
      setHrColaboradores(migratedColaboradores || []);
      setHrEvaluaciones(cloudRecords.hr_evaluaciones || he || []);
      setHrPlanes(cloudRecords.hr_planes_mejora || hp || []);
      setHrCapacitaciones(cloudRecords.hr_capacitaciones || ht || []);
      setHrCertificaciones(cloudRecords.hr_certificaciones || hcert || []);
      const finalStdFamilias = cloudRecords.std_familias || (sf === null ? DEFAULT_STD_DATA.familias : sf);
      const finalStdInsumos = cloudRecords.std_insumos || (si === null ? DEFAULT_STD_DATA.insumos : si);
      const finalStdRecetas = cloudRecords.std_recetas || (sr === null ? DEFAULT_STD_DATA.recetas : sr);
      const finalStdPreparaciones = cloudRecords.std_preparaciones || (sp === null ? DEFAULT_STD_DATA.preparaciones : sp);
      const finalStdMermas = cloudRecords.std_mermas || sm || [];
      const finalStdRequisiciones = cloudRecords.std_requisiciones || sreq || [];
      setStdFamilias(finalStdFamilias);
      setStdInsumos(finalStdInsumos);
      setStdRecetas(finalStdRecetas);
      setStdPreparaciones(finalStdPreparaciones);
      setStdMermas(finalStdMermas);
      setStdRequisiciones(finalStdRequisiciones);
      if (sf === null) saveKey("std_familias", finalStdFamilias);
      if (si === null) saveKey("std_insumos", finalStdInsumos);
      if (sr === null) saveKey("std_recetas", finalStdRecetas);
      if (sp === null) saveKey("std_preparaciones", finalStdPreparaciones);
      if (session && (u || []).some((user) => user.id === session.id)) setCurrentUser(session);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (config) setActiveCloudConfig(config);
  }, [config]);

  const persist = {
    config: async (v) => { setConfig(v); await saveKey("qc_config", v); },
    areas: async (v) => { setAreas(v); await saveKey("qc_areas", v); },
    epp: async (v) => { setEppItems(v); await saveKey("qc_epp", v); },
    personas: async (v) => { setPersonas(v); await saveKey("qc_personas", v); },
    usuarios: async (v) => { setUsuarios(v); await saveKey("qc_usuarios", v); },
    inspecciones: async (v) => { setInspecciones(v); await saveKey("qc_inspecciones", v); },
    hallazgos: async (v) => { setHallazgos(v); await saveKey("qc_hallazgos", v); },
    desviaciones: async (v) => { setDesviaciones(v); await saveKey("qc_desviaciones", v); },
    hrColaboradores: async (v) => {
      const stored = await loadKey("hr_colaboradores", hrColaboradores);
      const merged = mergeCollaboratorsById(v, stored);
      setHrColaboradores(merged);
      setPersonas(merged);
      await saveKey("hr_colaboradores", merged);
      await saveKey("qc_personas", merged);
    },
    hrEvaluaciones: async (v) => { setHrEvaluaciones(v); await saveKey("hr_evaluaciones", v); },
    hrPlanes: async (v) => { setHrPlanes(v); await saveKey("hr_planes_mejora", v); },
    hrCapacitaciones: async (v) => { setHrCapacitaciones(v); await saveKey("hr_capacitaciones", v); },
    hrCertificaciones: async (v) => { setHrCertificaciones(v); await saveKey("hr_certificaciones", v); },
    stdFamilias: async (v) => { setStdFamilias(v); await saveKey("std_familias", v); },
    stdInsumos: async (v) => { setStdInsumos(v); await saveKey("std_insumos", v); },
    stdRecetas: async (v) => { setStdRecetas(v); await saveKey("std_recetas", v); },
    stdPreparaciones: async (v) => { setStdPreparaciones(v); await saveKey("std_preparaciones", v); },
    stdMermas: async (v) => { setStdMermas(v); await saveKey("std_mermas", v); },
    stdRequisiciones: async (v) => { setStdRequisiciones(v); await saveKey("std_requisiciones", v); },
  };
  const appendInspectionRecord = async (insp, nuevosHallazgos = []) => {
    const storedInspecciones = await loadKey("qc_inspecciones", inspecciones);
    const nextInspecciones = mergeById([insp], storedInspecciones);
    await persist.inspecciones(nextInspecciones);

    if (nuevosHallazgos.length) {
      const storedHallazgos = await loadKey("qc_hallazgos", hallazgos);
      await persist.hallazgos(mergeById(nuevosHallazgos, storedHallazgos));
    }
  };

  const primary = config?.colorPrimario || "#1F2B3A";
  const accent = config?.colorAccent || "#F2622E";
  const isAdmin = currentUser?.rol === "administrador";
  const canOpenAdmin = canAccess(config, currentUser, "admin", "view");
  const canManageQuality = canAccess(config, currentUser, "calidad", "edit") || canAccess(config, currentUser, "calidad", "delete");
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
      stdFamilias,
      stdInsumos,
      stdRecetas,
      stdPreparaciones,
      stdMermas,
      stdRequisiciones,
    });
  }, [loading, config, areas, eppItems, usuarios, inspecciones, hallazgos, desviaciones, hrColaboradores, hrEvaluaciones, hrPlanes, hrCapacitaciones, hrCertificaciones, stdFamilias, stdInsumos, stdRecetas, stdPreparaciones, stdMermas, stdRequisiciones]);

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
        textAlign: config?.textAlign || "center",
        "--erp-font-factor": (config?.fontScale || 125) / 100,
        "--erp-text-align": config?.textAlign || "center",
        "--erp-primary": primary,
        "--erp-accent": accent,
        "--erp-surface": config?.cellBackground || "#FFFFFF",
        "--erp-page": config?.appBackground || "#F1F3F4",
        "--erp-ink": config?.textColor || "#243040",
        "--erp-muted": "#7C8795",
        "--erp-border": "#D8DCE1",
        "--erp-cell-bg": config?.cellBackground || "#FFFFFF",
        "--erp-field-border": `${config?.fieldBorderWidth || 1}px`,
        "--erp-field-padding-y": `${config?.fieldPaddingY || 9}px`,
        color: config?.textColor || "#243040",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
      `}</style>
      {config?.logo && config?.watermarkLogo !== false && (
        <img src={config.logo} alt="" className="erp-watermark" />
      )}

      <ErpHeader config={config} primary={primary} currentUser={currentUser} isAdmin={isAdmin}
        activeModule={activeModule}
        onHome={() => setActiveModule("menu")}
        onLogout={() => { setCurrentUser(null); saveKey("erp_session_user", null); setActiveModule("menu"); }} />

      <main className="flex-1 overflow-y-auto pb-6 w-full max-w-6xl mx-auto px-3 pt-3 relative z-10">
        {activeModule === "menu" && (
          <ErpModuleLauncher
            config={config}
            currentUser={currentUser}
            primary={primary}
            accent={accent}
            onSelect={(moduleId) => {
              setActiveModule(moduleId);
              setTab(moduleId === "calidad" ? "inspeccion" : "dashboard");
            }}
          />
        )}
        {activeModule === "calidad" && (
          <QualityTabs tab={tab} setTab={setTab} primary={primary} isAdmin={canManageQuality} />
        )}
        {activeModule === "calidad" && tab === "inspeccion" && (
          <AreaInspectionView
            areas={areas} personas={activeColaboradores}
            currentUser={currentUser} accent={accent} primary={primary} config={config}
            onSave={appendInspectionRecord}
          />
        )}
        {activeModule === "calidad" && tab === "epp" && (
          <EppChecklistView
            eppItems={eppItems}
            personas={activeColaboradores}
            currentUser={currentUser}
            primary={primary}
            accent={accent}
            config={config}
            onSave={appendInspectionRecord}
          />
        )}
        {activeModule === "calidad" && canManageQuality && tab === "historial" && (
          <HistorialView
            inspecciones={inspecciones} areas={areas} primary={primary} config={config}
            onUpdate={(v) => persist.inspecciones(v)}
            onDeleteCascadeHallazgos={(id) => persist.hallazgos(hallazgos.filter((h) => h.inspeccionId !== id))}
          />
        )}
        {activeModule === "calidad" && canManageQuality && tab === "analisis" && (
          <AnalisisView inspecciones={inspecciones} hallazgos={hallazgos} desviaciones={desviaciones} primary={primary} accent={accent} />
        )}
        {activeModule === "calidad" && canManageQuality && tab === "hallazgos" && (
          <HallazgosView hallazgos={hallazgos} onUpdate={(v) => persist.hallazgos(v)} primary={primary} config={config} />
        )}
        {activeModule === "calidad" && canManageQuality && tab === "desviaciones" && (
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
        {activeModule === "talento" && canAccess(config, currentUser, "talento", "view") && (
          <TalentoHumanoView
            colaboradores={hrColaboradores}
            evaluaciones={hrEvaluaciones}
            planes={hrPlanes}
            capacitaciones={hrCapacitaciones}
            certificaciones={hrCertificaciones}
            inspecciones={inspecciones}
            hallazgos={hallazgos}
            desviaciones={desviaciones}
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
        {activeModule === "cocina" && canAccess(config, currentUser, "cocina", "view") && (
          <EstandarizacionCocinaView
            familias={stdFamilias}
            insumos={stdInsumos}
            recetas={stdRecetas}
            preparaciones={stdPreparaciones}
            mermas={stdMermas}
            requisiciones={stdRequisiciones}
            onFamilias={persist.stdFamilias}
            onInsumos={persist.stdInsumos}
            onRecetas={persist.stdRecetas}
            onPreparaciones={persist.stdPreparaciones}
            onMermas={persist.stdMermas}
            onRequisiciones={persist.stdRequisiciones}
            primary={primary}
            accent={accent}
            config={config}
            currentUser={currentUser}
          />
        )}
        {activeModule === "pedidos" && canAccess(config, currentUser, "pedidos", "view") && (
          <EstandarizacionCocinaView
            familias={stdFamilias}
            insumos={stdInsumos}
            recetas={stdRecetas}
            preparaciones={stdPreparaciones}
            mermas={stdMermas}
            requisiciones={stdRequisiciones}
            onFamilias={persist.stdFamilias}
            onInsumos={persist.stdInsumos}
            onRecetas={persist.stdRecetas}
            onPreparaciones={persist.stdPreparaciones}
            onMermas={persist.stdMermas}
            onRequisiciones={persist.stdRequisiciones}
            primary={primary}
            accent={accent}
            config={config}
            currentUser={currentUser}
            initialTab="requisiciones"
          />
        )}
        {activeModule === "admin" && canOpenAdmin && (
          <AdminView
            config={config} areas={areas} eppItems={eppItems} personas={hrColaboradores} usuarios={usuarios}
            currentUser={currentUser}
            onConfig={persist.config} onAreas={persist.areas} onEpp={persist.epp}
            onPersonas={persist.hrColaboradores} onUsuarios={persist.usuarios}
            primary={primary}
            backupData={{ config, areas, eppItems, usuarios, inspecciones, hallazgos, desviaciones, hrColaboradores, hrEvaluaciones, hrPlanes, hrCapacitaciones, hrCertificaciones, stdFamilias, stdInsumos, stdRecetas, stdPreparaciones, stdMermas, stdRequisiciones }}
          />
        )}
      </main>

    </div>
  );
}

function ErpHeader({ config, primary, currentUser, isAdmin, activeModule, onHome, onLogout }) {
  const moduleLabel = activeModule === "calidad" ? "Calidad e inspecciones" : activeModule === "talento" ? "Gestión del Talento Humano" : activeModule === "cocina" ? "Estandarización de cocina" : activeModule === "pedidos" ? "Requisiciones y pedidos" : activeModule === "admin" ? "Administración global" : "Inicio";
  const inModule = activeModule !== "menu";
  return (
    <header className="erp-header" style={{ background: `linear-gradient(135deg, ${primary}, #152033)` }}>
      <div className="erp-brand">
        <div className="erp-brand-mark">
          {!inModule && config.logo ? (
            <img src={config.logo} alt="logo" />
          ) : (
            <ClipboardCheck size={24} />
          )}
        </div>
        <div style={{ minWidth: 0 }}>
          <p className="erp-brand-title" style={{ fontFamily: "inherit" }}>{inModule ? moduleLabel : config.nombre}</p>
          <p className="erp-brand-meta">{inModule ? `${currentUser.nombre}${isAdmin ? " · Administrador" : ""}` : `${moduleLabel} · ${currentUser.nombre}${isAdmin ? " · Administrador" : ""}`}</p>
        </div>
      </div>
      <div className="erp-header-actions">
        <button onClick={onHome} className="erp-header-button" title="Volver al inicio">
          <Home size={17} />
          <span>Inicio</span>
        </button>
        <button onClick={onLogout} className="erp-header-icon-button" title="Cerrar sesión"><LogOut size={18} /></button>
      </div>
    </header>
  );
}

function ErpModuleLauncher({ config, currentUser, primary, accent, onSelect }) {
  const modules = [
    { id: "calidad", title: "Calidad", action: "Inspeccionar", icon: ClipboardCheck, enabled: canAccess(config, currentUser, "calidad", "view"), color: accent },
    { id: "talento", title: "Talento", action: "Gestionar", icon: BriefcaseBusiness, enabled: canAccess(config, currentUser, "talento", "view"), color: primary },
    { id: "cocina", title: "Fichas", action: "Consultar", icon: ChefHat, enabled: canAccess(config, currentUser, "cocina", "view"), color: "#1E7A46" },
    { id: "pedidos", title: "Pedidos", action: "Solicitar", icon: PackageCheck, enabled: canAccess(config, currentUser, "pedidos", "view"), color: "#B4750E" },
    { id: "admin", title: "Admin", action: "Configurar", icon: Settings, enabled: canAccess(config, currentUser, "admin", "view"), color: "#5C6673" },
  ];
  return (
    <div className="module-launcher">
      <div className="module-launcher-hero">
        <h1 className="module-launcher-title" style={{ fontFamily: "inherit" }}>Módulos del ERP</h1>
        <p className="module-launcher-subtitle">Selecciona el área de trabajo</p>
      </div>
      <div className="module-grid">
        {modules.map((module) => {
          const Icon = module.icon;
          const customLogo = config?.moduleLogos?.[module.id];
          return (
            <button
              key={module.id}
              disabled={!module.enabled}
              onClick={() => onSelect(module.id)}
              className="module-card"
              style={{ borderColor: `${module.color}26` }}
            >
              <div className="module-card-icon" style={{ background: `linear-gradient(145deg, ${module.color}22, ${module.color}0D)` }}>
                {customLogo ? <img src={customLogo} alt="" /> : <Icon size={50} color={module.color} strokeWidth={2.2} />}
              </div>
              <h2 className="module-card-title" style={{ fontFamily: "inherit" }}>{module.title}</h2>
              <span className="module-card-action" style={{ background: module.color }}>{module.action}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ChecklistItemRow({ item, status, observation, evidence, expanded, evidenceExpanded, onToggleObservation, onToggleEvidence, onStatus, onObservation, onEvidence, primary }) {
  const evidenceList = normalizeEvidenceList(evidence);
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(190px, 1fr) minmax(210px, 284px) minmax(118px, 150px) 46px",
        gap: 6,
        alignItems: "center",
        width: "100%",
        minWidth: 0,
        padding: "6px 0",
        borderBottom: "1px solid #EEF1F4",
      }}
    >
      <div style={{ minHeight: 40, display: "flex", alignItems: "center", padding: "0 8px", textAlign: "var(--erp-text-align, left)", minWidth: 0 }}>
        <p style={{ margin: 0, color: "#445064", fontSize: 14, lineHeight: 1.2, fontWeight: 700, textAlign: "inherit", overflowWrap: "anywhere" }}>{item.texto}</p>
      </div>
      <div style={{ minHeight: 40, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <StatusPicker value={status} onChange={onStatus} compact />
      </div>
      <div style={{ minHeight: 40, display: "flex", alignItems: "center" }}>
        <button
          type="button"
          onClick={onToggleObservation}
          style={{
            width: "100%",
            minHeight: 36,
            padding: "0 10px",
            borderRadius: 9,
            border: `1px solid ${expanded ? primary : "#D8DCE1"}`,
            background: "#fff",
            color: "#5C6673",
            fontSize: 13,
            fontWeight: 800,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
          }}
        >
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{observation ? observation : "Observaciones"}</span>
          <ChevronRight size={15} style={{ flexShrink: 0, transform: expanded ? "rotate(90deg)" : "none" }} />
        </button>
      </div>
      <div style={{ minHeight: 44, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <button
          type="button"
          onClick={onToggleEvidence}
          style={{
            width: 42,
            minHeight: 36,
            borderRadius: 9,
            border: `1px solid ${evidenceExpanded ? primary : "#D8DCE1"}`,
            background: "#fff",
            color: "#5C6673",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 3,
          }}
        >
          <ImagePlus size={16} />
          {evidenceList.length > 0 && <span style={{ color: "#1E7A46", fontSize: 11, fontWeight: 900 }}>{evidenceList.length}</span>}
        </button>
      </div>
      {expanded && (
        <div style={{ gridColumn: "1 / -1", padding: "0 8px 4px" }}>
          <textarea
            value={observation || ""}
            onChange={(event) => onObservation(event.target.value)}
            rows={2}
            autoFocus
            placeholder="Escribe la observación de este item"
            style={{
              width: "100%",
              minHeight: 62,
              border: `1px solid ${primary}`,
              borderRadius: 10,
              padding: "8px 10px",
              fontSize: 14,
              boxSizing: "border-box",
            }}
          />
        </div>
      )}
      {evidenceExpanded && (
        <div
          style={{
            gridColumn: "1 / -1",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
            padding: "0 8px 4px",
          }}
        >
          <EvidenceActions onChange={onEvidence} primary={primary} multiple compact />
          <p style={{ margin: 0, color: "#8A94A3", fontSize: 11, fontWeight: 800 }}>{evidenceList.length}/3 fotos</p>
        </div>
      )}
      {evidenceList.length > 0 && (
        <div style={{ gridColumn: "1 / -1", display: "grid", gridTemplateColumns: "repeat(3, 56px)", gap: 6, justifyContent: "end", padding: "0 8px 4px", maxWidth: "100%" }}>
          {evidenceList.map((src, index) => <img key={index} src={src} alt="" style={{ width: 56, height: 42, objectFit: "cover", borderRadius: 7, border: "1px solid #D8DCE1" }} />)}
        </div>
      )}
    </div>
  );
}

function AreaInspectionView({ areas, personas, currentUser, accent, primary, config, onSave }) {
  const [areaId, setAreaId] = useState(areas[0]?.id || "");
  const [itemStates, setItemStates] = useState({});
  const [itemNotes, setItemNotes] = useState({});
  const [itemEvidence, setItemEvidence] = useState({});
  const [expandedNoteId, setExpandedNoteId] = useState("");
  const [expandedEvidenceId, setExpandedEvidenceId] = useState("");
  const [responsableId, setResponsableId] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [evidencias, setEvidencias] = useState([]);
  const [showGeneralEvidence, setShowGeneralEvidence] = useState(false);
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
    setExpandedNoteId("");
    setExpandedEvidenceId("");
    setResponsableId("");
    setObservaciones("");
    setEvidencias([]);
    setShowGeneralEvidence(false);
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
    const files = Array.from(e.target.files || []).slice(0, MAX_EVIDENCE_PER_ITEM);
    if (!files.length) return;
    const converted = await Promise.all(files.map((file) => resizeImageToDataUrl(file, 520)));
    setItemEvidence((prev) => {
      const current = normalizeEvidenceList(prev[itemId]);
      return { ...prev, [itemId]: [...current, ...converted].slice(0, MAX_EVIDENCE_PER_ITEM) };
    });
    e.target.value = "";
  };

  const handleSave = async () => {
    if (!allAnswered || !area) return;
    const itemsRes = area.items.map((it) => ({ itemId: it.id, texto: it.texto, estado: itemStates[it.id], observacion: itemNotes[it.id] || "", evidencia: normalizeEvidenceList(itemEvidence[it.id]) }));
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
      config,
    }));
  };
  const shareBlankChecklist = async () => {
    if (!area) return;
    await shareDocument({
      filename: `lista-chequeo-${area.nombre.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.html`,
      html: checklistPrintHtml({ title: `Lista de chequeo - ${area.nombre}`, subtitle: "Formato para inspección de área.", items: area.items, primary, config }),
      title: `Lista de chequeo - ${area.nombre}`,
      text: `Lista de chequeo para ${area.nombre}`,
    });
  };

  if (saved) {
    return (
      <div className="bg-white rounded-xl p-6 text-center mt-6">
        <Check size={40} className="mx-auto mb-2" color="#1E7A46" />
        <h3 className="font-bold text-lg" style={{ fontFamily: "inherit" }}>Inspeccion guardada</h3>
        <p className="text-sm text-gray-500 mt-1">El registro quedo guardado correctamente.</p>
        <button onClick={() => resetForm()} className="mt-4 px-5 py-2 rounded-md font-bold text-white" style={{ background: primary }}>
          Nueva inspeccion
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-xl p-2 space-y-2">
        <div style={{ display: "grid", gridTemplateColumns: "72px minmax(260px, 1fr) auto auto", gap: 8, alignItems: "center" }}>
          <label className="text-xs font-bold text-gray-500 uppercase">Area</label>
          <select value={areaId} onChange={(e) => resetForm(e.target.value)} className="w-full border rounded-md px-3 py-2 font-semibold">
            {areas.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
          </select>
          <button onClick={printBlankChecklist} className="px-3 py-2 rounded-md border text-sm font-bold flex items-center justify-center gap-1.5" style={{ borderColor: primary, color: primary }}>
            <FileText size={15} /> Imprimir
          </button>
          <button onClick={shareBlankChecklist} className="px-3 py-2 rounded-md border text-sm font-bold flex items-center justify-center gap-1.5" style={{ borderColor: primary, color: primary }}>
            <Download size={15} /> WhatsApp
          </button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "120px minmax(260px, 1fr) 150px", gap: 8, alignItems: "center" }}>
          <label className="text-xs font-bold text-gray-500 uppercase flex items-center justify-center gap-1"><Users size={12} /> Responsable</label>
          <select value={responsableId} onChange={(e) => setResponsableId(e.target.value)} className="w-full border rounded-md px-3 py-2 font-semibold">
            <option value="">Seleccionar responsable</option>
            {areaPeople.map((p) => <option key={p.id} value={p.id}>{p.nombre} - {p.cargo || p.rol || "Personal"}</option>)}
          </select>
          <div className="text-center">
            <p className="text-xs font-bold text-gray-500">{answeredCount}/{totalItems} items</p>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden mt-1">
              <div className="h-full rounded-full" style={{ width: `${totalItems ? (answeredCount / totalItems) * 100 : 0}%`, background: accent }} />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {/*
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
        */}

        {area && (
          <div className="bg-white rounded-xl p-2 overflow-x-auto" style={{ overflowX: "auto" }}>
            <div style={{ width: "100%", minWidth: 0 }}>
              {area.items.map((it) => (
                <ChecklistItemRow
                  key={it.id}
                  item={it}
                  status={itemStates[it.id]}
                  observation={itemNotes[it.id]}
                  evidence={itemEvidence[it.id]}
                  expanded={expandedNoteId === it.id}
                  evidenceExpanded={expandedEvidenceId === it.id}
                  primary={primary}
                  onStatus={(v) => setItemStates((s) => ({ ...s, [it.id]: v }))}
                  onToggleObservation={() => setExpandedNoteId((current) => current === it.id ? "" : it.id)}
                  onToggleEvidence={() => setExpandedEvidenceId((current) => current === it.id ? "" : it.id)}
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
          <button type="button" onClick={() => setShowGeneralEvidence((v) => !v)} className="w-full py-2 rounded-md border text-sm font-bold flex items-center justify-center gap-1.5" style={{ borderColor: primary, color: primary }}>
            <ImagePlus size={15} /> {showGeneralEvidence ? "Ocultar evidencias" : `Adjuntar evidencias${evidencias.length ? ` (${evidencias.length})` : ""}`}
          </button>
          {showGeneralEvidence && (
            <div className="rounded-lg border border-gray-100 p-2">
              <EvidenceActions onChange={handleEvidence} primary={primary} />
              {evidencias.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-2">
                  {evidencias.map((src, index) => <img key={index} src={src} alt="" className="h-16 w-full object-cover rounded-md border" />)}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="signature-grid" style={{ "--signature-columns": 2 }}>
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

function EppChecklistView({ eppItems, personas, currentUser, primary, accent, config, onSave }) {
  const [personaId, setPersonaId] = useState(personas[0]?.id || "");
  const [itemStates, setItemStates] = useState({});
  const [itemNotes, setItemNotes] = useState({});
  const [itemEvidence, setItemEvidence] = useState({});
  const [expandedNoteId, setExpandedNoteId] = useState("");
  const [expandedEvidenceId, setExpandedEvidenceId] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [evidencias, setEvidencias] = useState([]);
  const [showGeneralEvidence, setShowGeneralEvidence] = useState(false);
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
    setExpandedNoteId("");
    setExpandedEvidenceId("");
    setObservaciones("");
    setEvidencias([]);
    setShowGeneralEvidence(false);
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
    const files = Array.from(e.target.files || []).slice(0, MAX_EVIDENCE_PER_ITEM);
    if (!files.length) return;
    const converted = await Promise.all(files.map((file) => resizeImageToDataUrl(file, 520)));
    setItemEvidence((prev) => {
      const current = normalizeEvidenceList(prev[itemId]);
      return { ...prev, [itemId]: [...current, ...converted].slice(0, MAX_EVIDENCE_PER_ITEM) };
    });
    e.target.value = "";
  };

  const handleSave = async () => {
    if (!allAnswered) return;
    const itemsRes = eppItems.map((it) => ({ itemId: it.id, texto: it.texto, estado: itemStates[it.id], observacion: itemNotes[it.id] || "", evidencia: normalizeEvidenceList(itemEvidence[it.id]) }));
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
      config,
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
        config,
      }),
      title: "Lista de verificación EPP",
      text: persona ? `Lista EPP para ${persona.nombre}` : "Lista de verificación EPP",
    });
  };

  if (saved) {
    return (
      <div className="bg-white rounded-xl p-6 text-center mt-6">
        <Check size={40} className="mx-auto mb-2" color="#1E7A46" />
        <h3 className="font-bold text-lg" style={{ fontFamily: "inherit" }}>Verificacion EPP guardada</h3>
        <p className="text-sm text-gray-500 mt-1">El registro quedo guardado y los incumplimientos pasaron a Hallazgos.</p>
        <button onClick={resetForm} className="mt-4 px-5 py-2 rounded-md font-bold text-white" style={{ background: primary }}>
          Nueva verificacion EPP
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-xl p-2">
        <div style={{ display: "grid", gridTemplateColumns: "110px minmax(260px, 1fr) 150px auto auto", gap: 8, alignItems: "center" }}>
          <label className="text-xs font-bold text-gray-500 uppercase">Colaborador</label>
          <select value={personaId} onChange={(e) => { setPersonaId(e.target.value); setItemStates({}); setItemNotes({}); setItemEvidence({}); setExpandedNoteId(""); setExpandedEvidenceId(""); }} className="w-full border rounded-md px-3 py-2 font-semibold">
            <option value="">Seleccionar colaborador</option>
            {personas.map((p) => <option key={p.id} value={p.id}>{p.nombre} - {p.cargo || p.rol || "Colaborador"}</option>)}
          </select>
          <div className="text-center">
            <p className="text-xs font-bold text-gray-500">{answeredCount}/{totalItems} items</p>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden mt-1">
              <div className="h-full rounded-full" style={{ width: `${totalItems ? (answeredCount / totalItems) * 100 : 0}%`, background: accent }} />
            </div>
          </div>
          <button onClick={printEppChecklist} className="px-3 py-2 rounded-md border text-sm font-bold flex items-center justify-center gap-1.5" style={{ borderColor: primary, color: primary }}>
            <FileText size={15} /> Imprimir
          </button>
          <button onClick={shareEppChecklist} className="px-3 py-2 rounded-md border text-sm font-bold flex items-center justify-center gap-1.5" style={{ borderColor: primary, color: primary }}>
            <Download size={15} /> WhatsApp
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl p-2 overflow-x-auto" style={{ overflowX: "auto" }}>
        {eppItems.length === 0 ? (
          <p className="text-sm text-gray-400 py-6">No hay items EPP configurados. Puedes crearlos en Administracion global.</p>
        ) : (
          <>
            <div style={{ width: "100%", minWidth: 0 }}>
              {eppItems.map((it) => (
                <ChecklistItemRow
                  key={it.id}
                  item={it}
                  status={itemStates[it.id]}
                  observation={itemNotes[it.id]}
                  evidence={itemEvidence[it.id]}
                  expanded={expandedNoteId === it.id}
                  evidenceExpanded={expandedEvidenceId === it.id}
                  primary={primary}
                  onStatus={(v) => setItemStates((s) => ({ ...s, [it.id]: v }))}
                  onToggleObservation={() => setExpandedNoteId((current) => current === it.id ? "" : it.id)}
                  onToggleEvidence={() => setExpandedEvidenceId((current) => current === it.id ? "" : it.id)}
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
        <button type="button" onClick={() => setShowGeneralEvidence((v) => !v)} className="w-full py-2 rounded-md border text-sm font-bold flex items-center justify-center gap-1.5" style={{ borderColor: primary, color: primary }}>
          <ImagePlus size={15} /> {showGeneralEvidence ? "Ocultar evidencias" : `Adjuntar evidencias${evidencias.length ? ` (${evidencias.length})` : ""}`}
        </button>
        {showGeneralEvidence && (
          <div className="rounded-lg border border-gray-100 p-2">
            <EvidenceActions onChange={handleEvidence} primary={primary} />
            {evidencias.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-2">
                {evidencias.map((src, index) => <img key={index} src={src} alt="" className="h-16 w-full object-cover rounded-md border" />)}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="signature-grid" style={{ "--signature-columns": 2 }}>
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
  const [open, setOpen] = useState(false);

  const getPoint = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * canvas.width,
      y: ((event.clientY - rect.top) / rect.height) * canvas.height,
    };
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

  return (
    <div className="signature-card">
      <div className="signature-card-header">
        <p className="signature-card-title">{label}</p>
        {value && <button type="button" onClick={clear} className="signature-clear-button">Limpiar</button>}
      </div>
      {value ? (
        <img src={value} alt={label} className="signature-preview-img" />
      ) : (
        <div className="signature-preview-empty">
          Sin firma
        </div>
      )}
      <button type="button" onClick={() => setOpen(true)} className="signature-open-button">
        Abrir panel de firma
      </button>
      {open && (
        <div className="fixed inset-0 z-[80] bg-black/70 p-2 flex items-center justify-center">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[calc(100svh-1rem)] overflow-y-auto p-3 pb-24 shadow-2xl mx-auto">
            <div className="flex items-center justify-between gap-3 mb-2">
              <p className="font-bold text-sm text-gray-700">{label}</p>
              <button type="button" onClick={() => setOpen(false)} className="p-2 rounded-full bg-gray-100"><X size={18} /></button>
            </div>
            <canvas
              ref={canvasRef}
              width={900}
              height={320}
              className="w-full h-[40svh] max-h-56 min-h-40 bg-white rounded-xl border-2 border-gray-200 cursor-crosshair"
              style={{ touchAction: "none", userSelect: "none", overscrollBehavior: "none" }}
              onPointerDown={start}
              onPointerMove={move}
              onPointerUp={end}
              onPointerCancel={end}
              onPointerLeave={end}
            />
            <div className="fixed left-2 right-2 bottom-2 z-[90] bg-white grid grid-cols-2 sm:grid-cols-[auto_auto_1fr] gap-2 p-2 border border-gray-200 rounded-xl shadow-xl max-w-3xl mx-auto">
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

function EvidenceActions({ onChange, primary, multiple = true, compact = false }) {
  return (
    <div className={`flex ${compact ? "gap-1" : "flex-wrap gap-2"} items-center justify-center`}>
      <label title="Tomar foto" aria-label="Tomar foto" className="file-icon-button" style={{ borderColor: primary, color: primary }}>
        <ImagePlus size={compact ? 18 : 17} />
        <input type="file" accept="image/*" capture="environment" multiple={multiple} onChange={onChange} className="hidden" />
      </label>
      <label title="Galeria / archivo" aria-label="Galeria / archivo" className="file-icon-button" style={{ borderColor: "#CBD5E1", color: "#475569" }}>
        <Download size={compact ? 18 : 17} />
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
  const [showEvidenceForm, setShowEvidenceForm] = useState(false);
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
    setShowEvidenceForm(false);
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
    <div className="deviation-shell">
      <div className="deviation-summary-grid">
        <div className="deviation-summary-card"><strong style={{ color: primary }}>{desviaciones.length}</strong><span>Desviaciones</span></div>
        <div className="deviation-summary-card"><strong style={{ color: "#B4750E" }}>{abiertas}</strong><span>Abiertas</span></div>
        <div className="deviation-summary-card"><strong style={{ color: "#B5333D" }}>{criticas}</strong><span>Altas / críticas</span></div>
      </div>

      <div className="deviation-form-card">
        <div className="deviation-form-header">
          <div>
            <h2>Gestión de desviaciones</h2>
            <p>Consecutivo automático: <b>{codigoPreview}</b></p>
          </div>
          <Badge color="#B4750E" bg="#FCF1DC">{form.estado}</Badge>
        </div>

        <div className="deviation-section">
          <div className="deviation-section-title"><h3>Registro</h3><span>Origen y clasificación</span></div>
          <div className="deviation-field-grid">
            <select value={form.area} onChange={(e) => updateField("area", e.target.value)}>{areas.map((a) => <option key={a.id} value={a.nombre}>{a.nombre}</option>)}</select>
            <select value={form.servicio} onChange={(e) => updateField("servicio", e.target.value)}>{DEVIATION_SERVICES.map((s) => <option key={s}>{s}</option>)}</select>
            <input value={form.comedor} onChange={(e) => updateField("comedor", e.target.value)} placeholder="Comedor" />
            <input value={form.reportadoPor} onChange={(e) => updateField("reportadoPor", e.target.value)} placeholder="Quién la presenta" />
            <input value={form.cargo} onChange={(e) => updateField("cargo", e.target.value)} placeholder="Cargo" />
            <select value={form.tipo} onChange={(e) => updateField("tipo", e.target.value)}>{DEVIATION_TYPES.map((t) => <option key={t}>{t}</option>)}</select>
            <select value={form.gravedad} onChange={(e) => updateField("gravedad", e.target.value)}>{DEVIATION_SEVERITIES.map((g) => <option key={g}>{g}</option>)}</select>
            <select value={form.responsableId} onChange={(e) => selectResponsible(e.target.value, "responsableId", "responsableNombre")}>
              <option value="">Responsable del hallazgo</option>
              {colaboradores.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
            <input value={form.responsabilidad} onChange={(e) => updateField("responsabilidad", e.target.value)} placeholder="Responsabilidad" />
          </div>
        </div>

        <div className="deviation-section">
          <div className="deviation-section-title"><h3>Análisis</h3><span>Descripción y acciones</span></div>
          <div className="deviation-text-grid">
            <textarea value={form.descripcion} onChange={(e) => updateField("descripcion", e.target.value)} placeholder="Descripción de la desviación" />
            <textarea value={form.causaInmediata} onChange={(e) => updateField("causaInmediata", e.target.value)} placeholder="Causa inmediata" />
            <textarea value={form.accionInmediata} onChange={(e) => updateField("accionInmediata", e.target.value)} placeholder="Acción inmediata: cambio, reposición, reproceso, descarte..." />
            <textarea value={form.accionCorrectiva} onChange={(e) => updateField("accionCorrectiva", e.target.value)} placeholder="Acción correctiva / plan de cierre" />
          </div>
        </div>

        <div className="deviation-section">
          <div className="deviation-section-title"><h3>Cierre</h3><span>Seguimiento y eficacia</span></div>
          <div className="deviation-field-grid deviation-close-grid">
            <select value={form.responsableCierreId} onChange={(e) => selectResponsible(e.target.value, "responsableCierreId", "responsableCierreNombre")}>
              <option value="">Responsable del cierre</option>
              {colaboradores.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
            <input type="date" value={form.fechaCompromiso} onChange={(e) => updateField("fechaCompromiso", e.target.value)} />
            <input type="date" value={form.fechaCierreReal} onChange={(e) => updateField("fechaCierreReal", e.target.value)} />
            <select value={form.estado} onChange={(e) => updateField("estado", e.target.value)}>{DEVIATION_STATES.map((s) => <option key={s}>{s}</option>)}</select>
            <select value={form.eficacia} onChange={(e) => updateField("eficacia", e.target.value)}>{DEVIATION_EFFECTIVENESS.map((s) => <option key={s}>{s}</option>)}</select>
          </div>
          <textarea className="deviation-full-textarea" value={form.anotacionCierre} onChange={(e) => updateField("anotacionCierre", e.target.value)} placeholder="Anotación y cierre" />
        </div>

        <div className="deviation-evidence-card">
          <button type="button" onClick={() => setShowEvidenceForm((v) => !v)} style={{ borderColor: primary, color: primary }}>
            <ImagePlus size={15} /> {showEvidenceForm ? "Ocultar evidencias" : `Evidencia fotográfica${form.evidencias.length ? ` (${form.evidencias.length})` : ""}`}
          </button>
          {showEvidenceForm && (
            <div className="deviation-evidence-panel">
              <EvidenceActions onChange={handleEvidence} primary={primary} />
              {form.evidencias.length > 0 && (
                <div className="deviation-photo-grid">
                  {form.evidencias.map((src, index) => <img key={index} src={src} alt="" />)}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="signature-grid" style={{ "--signature-columns": 3 }}>
          <SignaturePad label="Firma supervisor" value={form.firmaSupervisor} onChange={(v) => updateField("firmaSupervisor", v)} />
          <SignaturePad label="Firma responsable" value={form.firmaResponsable} onChange={(v) => updateField("firmaResponsable", v)} />
          <SignaturePad label="Firma cliente o representante del área (opcional)" value={form.firmaCliente} onChange={(v) => updateField("firmaCliente", v)} />
        </div>

        <button onClick={save} className="deviation-save-button" style={{ background: primary }}>
          <Save size={18} /> Guardar desviación
        </button>
      </div>

      <div className="deviation-list">
        {desviaciones.length === 0 && <div className="deviation-empty">Sin desviaciones registradas.</div>}
        {desviaciones.map((d) => (
          <div key={d.id} className="deviation-record-card">
            <button onClick={() => setDetalle(d)} className="deviation-record-main">
              <div>
                <p>{d.codigo} · {d.tipo}</p>
                <span>{fmtFecha(d.fecha)} · {d.area} · {d.servicio}</span>
                <em>{d.descripcion}</em>
              </div>
              <Badge color={d.estado === "Cerrada" ? "#1E7A46" : d.gravedad === "Critica" ? "#B5333D" : "#B4750E"} bg={d.estado === "Cerrada" ? "#E4F4EA" : "#FCF1DC"}>{d.estado}</Badge>
            </button>
            <div className="deviation-record-actions">
              <button onClick={() => printDeviation(d)} style={{ borderColor: primary, color: primary }}><FileText size={13} /> Documento</button>
              <button onClick={() => shareDeviation(d)} style={{ borderColor: primary, color: primary }}><Download size={13} /> WhatsApp</button>
              <button onClick={() => updateDeviation(d.id, { estado: d.estado === "Cerrada" ? "En proceso" : "Cerrada", fechaCierreReal: d.estado === "Cerrada" ? "" : new Date().toISOString().slice(0, 10) })} style={{ background: primary, color: "#fff", borderColor: primary }}>
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
      { nombre: nombre.trim() || "ERP Cocina Institucional", colorPrimario: "#1F2B3A", colorAccent: "#F2622E", textColor: "#243040", logo: null, watermarkLogo: true, fontScale: 125, fontFamily: "Inter, sans-serif", textAlign: "center", appBackground: "#F1F3F4", cellBackground: "#FFFFFF", fieldBorderWidth: 1, fieldPaddingY: 9, cloudSync: { enabled: false, url: "", anonKey: "", workspaceId: "" } },
      { id: genId(), nombre: adminNombre.trim(), password: pw, rol: "administrador" }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1F2B3A] p-4">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');`}</style>
      <div className="bg-white rounded-xl w-full max-w-sm p-6">
        <div className="flex items-center gap-2 mb-1">
          <ClipboardCheck color="#F2622E" size={26} />
          <h1 className="text-lg font-black" style={{ fontFamily: "inherit" }}>Configuración inicial</h1>
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
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');`}</style>
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          {config.logo ? (
            <img src={config.logo} alt="logo" className="h-12 w-12 mx-auto mb-3 object-contain rounded bg-white/10 p-1" />
          ) : (
            <div className="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ background: config.colorAccent || "#F2622E" }}>
              <ClipboardCheck color="#fff" size={28} />
            </div>
          )}
          <h1 className="text-white text-xl font-black" style={{ fontFamily: "inherit" }}>{config.nombre}</h1>
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

// eslint-disable-next-line no-unused-vars
function LegacyHeader({ config, primary, currentUser, isAdmin, onLogout }) {
  return (
    <header className="flex items-center justify-between px-4 py-2.5 text-white sticky top-0 z-30" style={{ background: primary }}>
      <div className="flex items-center gap-2 min-w-0">
        {config.logo ? (
          <img src={config.logo} className="h-8 w-8 object-contain rounded bg-white/10 p-0.5" alt="logo" />
        ) : (
          <ClipboardCheck size={22} />
        )}
        <div className="min-w-0">
          <p className="font-bold text-sm leading-tight truncate" style={{ fontFamily: "inherit" }}>{config.nombre}</p>
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

// eslint-disable-next-line no-unused-vars
function LegacyInspeccionView({ areas, eppItems, personas, currentUser, accent, primary, onSave }) {
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
    const itemsRes = area.items.map((it) => ({ itemId: it.id, texto: it.texto, estado: itemStates[it.id], observacion: itemNotes[it.id] || "", evidencia: normalizeEvidenceList(itemEvidence[it.id]) }));
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
        <h3 className="font-bold text-lg" style={{ fontFamily: "inherit" }}>Inspección guardada</h3>
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
          <h3 className="font-bold text-sm mb-2 flex items-center gap-1.5" style={{ fontFamily: "inherit" }}>
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
        <h3 className="font-bold text-sm mb-2 flex items-center gap-1.5" style={{ fontFamily: "inherit" }}>
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

function HistorialView({ inspecciones, areas, primary, config, onUpdate, onDeleteCascadeHallazgos }) {
  const [filtroArea, setFiltroArea] = useState("todas");
  const [expandedDay, setExpandedDay] = useState("");
  const [detalle, setDetalle] = useState(null);
  const [editando, setEditando] = useState(false);
  const [draft, setDraft] = useState(null);

  const filtradas = inspecciones
    .filter((i) => filtroArea === "todas" || i.areaNombre === filtroArea)
    .sort((a, b) => new Date(b.fecha || 0) - new Date(a.fecha || 0));
  const agrupadasPorDia = useMemo(() => {
    const map = {};
    filtradas.forEach((i) => {
      const key = dayKey(i.fecha);
      if (!map[key]) map[key] = [];
      map[key].push(i);
    });
    return Object.entries(map).map(([key, items]) => ({
      key,
      fecha: items[0]?.fecha,
      items,
      promedio: Math.round(items.reduce((sum, i) => sum + (i.cumplimientoPct || 0), 0) / items.length),
    }));
  }, [filtradas]);

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
    openPrintDocument(`Inspeccion - ${detalle.areaNombre}`, inspectionPrintHtml(detalle, primary, config));
  };
  const compartirDetalle = async () => {
    await shareDocument({
      filename: `inspeccion-${(detalle.areaNombre || "area").toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${new Date(detalle.fecha).toISOString().slice(0, 10)}.html`,
      html: inspectionPrintHtml(detalle, primary, config),
      title: `Inspección - ${detalle.areaNombre}`,
      text: `Inspección ${detalle.areaNombre}: ${detalle.cumplimientoPct}% de cumplimiento.`,
    });
  };
  const guardarFirmasDetalle = () => {
    onUpdate(inspecciones.map((i) => i.id === detalle.id ? detalle : i));
  };

  return (
    <div className="quality-history-shell">
      <div className="quality-history-toolbar">
        <select value={filtroArea} onChange={(e) => setFiltroArea(e.target.value)}>
          <option value="todas">Todas las áreas</option>
          {areas.map((a) => <option key={a.id} value={a.nombre}>{a.nombre}</option>)}
        </select>
        <button onClick={exportar} style={{ borderColor: primary, color: primary }}>
          <Download size={15} /> Exportar Excel
        </button>
      </div>

      {filtradas.length === 0 && <div className="quality-history-empty">Sin registros todavía.</div>}

      <div className="quality-history-days">
        {agrupadasPorDia.map((grupo) => {
          const st = grupo.promedio >= 90 ? STATUS[0] : grupo.promedio >= 70 ? STATUS[1] : STATUS[2];
          const open = expandedDay === grupo.key;
          return (
            <div key={grupo.key} className="quality-history-day-card">
              <button onClick={() => setExpandedDay(open ? "" : grupo.key)} className="quality-history-day-header">
                <div>
                  <p>{fmtSoloFecha(grupo.fecha)}</p>
                  <span>{grupo.items.length} inspección(es)</span>
                </div>
                <div className="quality-history-day-meta">
                  <Badge color={st.color} bg={st.bg}>{grupo.promedio}%</Badge>
                  <ChevronRight size={16} className={`text-gray-400 transition-transform ${open ? "rotate-90" : ""}`} />
                </div>
              </button>
              {open && (
                <div className="quality-history-record-grid">
                  {grupo.items.map((i) => {
                    const itemStatus = i.cumplimientoPct >= 90 ? STATUS[0] : i.cumplimientoPct >= 70 ? STATUS[1] : STATUS[2];
                    return (
                      <button key={i.id} onClick={() => setDetalle(i)} className="quality-history-record">
                        <div>
                          <p>{i.tipo === "epp" ? "EPP" : i.areaNombre}</p>
                          <span>{new Date(i.fecha).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })} · {i.inspector}</span>
                        </div>
                        <Badge color={itemStatus.color} bg={itemStatus.bg}>{i.cumplimientoPct}%</Badge>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
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
                {!editando && normalizeEvidenceList(it.evidencia).length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-2">
                    {normalizeEvidenceList(it.evidencia).map((src, index) => <img key={index} src={src} alt="" className="h-16 w-full object-cover rounded-md border" />)}
                  </div>
                )}
              </div>
            ))}
          </div>

          {detalle.epp && detalle.epp.length > 0 && (
            <div className="mt-4">
              <h4 className="font-bold text-sm mb-2" style={{ fontFamily: "inherit" }}>EPP evaluado</h4>
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
              <h4 className="font-bold text-sm" style={{ fontFamily: "inherit" }}>Observaciones</h4>
              <p className="text-sm text-gray-600">{detalle.observaciones}</p>
            </div>
          )}

          {detalle.evidencias?.length > 0 && (
            <div className="mt-3">
              <h4 className="font-bold text-sm mb-2" style={{ fontFamily: "inherit" }}>Registro fotografico</h4>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {detalle.evidencias.map((src, index) => <img key={index} src={src} alt="" className="h-20 w-full object-cover rounded-md border" />)}
              </div>
            </div>
          )}

          <div className="signature-grid" style={{ "--signature-columns": 2, marginTop: 12 }}>
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

function QualityKpiCard({ label, value, detail, tone = "neutral", progress = 0 }) {
  const tones = {
    good: { color: "#1E7A46", bg: "#E4F4EA" },
    warn: { color: "#B4750E", bg: "#FCF1DC" },
    bad: { color: "#B5333D", bg: "#FBE7E8" },
    neutral: { color: "#1F2B3A", bg: "#F1F3F4" },
  };
  const t = tones[tone] || tones.neutral;
  const clamped = Math.max(0, Math.min(100, Number(progress) || 0));
  return (
    <div style={{ background: t.bg, border: "1px solid #EEF1F4", borderRadius: 14, padding: 10, display: "grid", gridTemplateColumns: "68px minmax(0, 1fr)", gap: 10, alignItems: "center", textAlign: "center", boxSizing: "border-box" }}>
      <div style={{ width: 68, height: 68, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto", background: `conic-gradient(${t.color} ${clamped * 3.6}deg, #FFFFFF ${clamped * 3.6}deg)` }}>
        <div style={{ width: 52, height: 52, borderRadius: 999, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ color: t.color, fontSize: 15, lineHeight: 1, fontWeight: 900 }}>{value}</span>
        </div>
      </div>
      <div>
        <p style={{ margin: 0, color: "#667085", fontSize: 11, lineHeight: 1.15, fontWeight: 900, textTransform: "uppercase" }}>{label}</p>
        <div style={{ height: 7, borderRadius: 999, background: "rgba(255,255,255,0.85)", overflow: "hidden", marginTop: 8, border: "1px solid #fff" }}>
          <div style={{ height: "100%", width: `${clamped}%`, background: t.color, borderRadius: 999 }} />
        </div>
        {detail && <p style={{ margin: "7px 0 0", color: "#667085", fontSize: 11, lineHeight: 1.15 }}>{detail}</p>}
      </div>
    </div>
  );
}

function AnalisisView({ inspecciones, hallazgos, desviaciones = [], primary, accent }) {
  const [periodo, setPeriodo] = useState("global");
  const periodLabel = { dia: "Hoy", mes: "Mes", ano: "Año", global: "Global" };
  const inPeriod = (iso) => {
    if (periodo === "global") return true;
    const now = new Date();
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return false;
    if (periodo === "dia") return dayKey(date) === dayKey(now);
    if (periodo === "mes") return monthKey(date) === monthKey(now);
    if (periodo === "ano") return yearKey(date) === yearKey(now);
    return true;
  };
  inspecciones = inspecciones.filter((i) => inPeriod(i.fecha));
  hallazgos = hallazgos.filter((h) => inPeriod(h.fecha));
  desviaciones = desviaciones.filter((d) => inPeriod(d.fecha));

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
    const itemEvidence = (i.items || []).some((item) => normalizeEvidenceList(item.evidencia).length > 0);
    const eppEvidence = (i.epp || []).some((group) => (group.items || []).some((item) => normalizeEvidenceList(item.evidencia).length > 0));
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
  const kpiChartData = [
    { nombre: "Cierre", valor: cierrePct },
    { nombre: "Evidencia", valor: evidenciaPct },
    { nombre: "EPP", valor: inspeccionesEpp.length ? promedioEpp : 0 },
    { nombre: "Cumplimiento", valor: promedioGeneral },
  ];
  const riskChartData = [
    { nombre: "Hallazgos abiertos", valor: abiertos },
    { nombre: "Reincidencias", valor: recurrencias },
    { nombre: "Areas criticas", valor: areaCriticas },
    { nombre: "Desviaciones abiertas", valor: desviacionesAbiertas },
  ];
  const compliancePie = [
    { name: "Cumplimiento", value: promedioGeneral, color: primary },
    { name: "Brecha", value: Math.max(0, 100 - promedioGeneral), color: "#E5E7EB" },
  ];
  const findingsPie = [
    { name: "Cerrados", value: cerrados, color: "#1E7A46" },
    { name: "Abiertos", value: abiertos, color: "#B5333D" },
  ].filter((item) => item.value > 0);
  const evidencePie = [
    { name: "Con evidencia", value: conEvidencia, color: accent },
    { name: "Sin evidencia", value: Math.max(0, inspecciones.length - conEvidencia), color: "#CBD5E1" },
  ].filter((item) => item.value > 0);

  return (
    <div className="analysis-shell">
      <div className="analysis-toolbar">
        <div>
          <h3 className="font-black text-base text-gray-800" style={{ fontFamily: "inherit" }}>Análisis de calidad</h3>
          <p className="text-xs text-gray-400">Vista: {periodLabel[periodo]}</p>
        </div>
        <div className="analysis-periods">
          {["dia", "mes", "ano", "global"].map((option) => (
            <button
              key={option}
              onClick={() => setPeriodo(option)}
              className="px-2 py-2 text-xs font-black border-r last:border-r-0"
              style={{ background: periodo === option ? primary : "#fff", color: periodo === option ? "#fff" : "#4B5563" }}
            >
              {periodLabel[option]}
            </button>
          ))}
        </div>
      </div>

      <div className="analysis-card">
        <div className="analysis-summary-grid">
          <div className="analysis-summary-card">
            <strong style={{ color: primary }}>{inspecciones.length}</strong>
            <span>Inspecciones</span>
          </div>
          <div className="analysis-summary-card">
            <strong style={{ color: "#B5333D" }}>{abiertos}</strong>
            <span>Abiertos</span>
          </div>
          <div className="analysis-summary-card">
            <strong style={{ color: "#1E7A46" }}>{cerrados}</strong>
            <span>Cerrados</span>
          </div>
          <div className="analysis-summary-card">
            <strong style={{ color: accent }}>{evidenciaPct}%</strong>
            <span>Evidencia</span>
          </div>
        </div>

        <div className="analysis-chart-grid" style={{ marginTop: 12 }}>
          <div className="chart-card" style={{ textAlign: "center" }}>
            <p className="chart-card-title">Cumplimiento</p>
            <ResponsiveContainer width="100%" height={190}>
              <PieChart>
                <Pie data={compliancePie} dataKey="value" nameKey="name" innerRadius={48} outerRadius={70} startAngle={90} endAngle={-270}>
                  {compliancePie.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, ""]} />
              </PieChart>
            </ResponsiveContainer>
            <p className="text-3xl font-black -mt-20 mb-12 pointer-events-none" style={{ color: primary }}>{promedioGeneral}%</p>
          </div>
          <div className="chart-card">
            <p className="chart-card-title">Hallazgos</p>
            <ResponsiveContainer width="100%" height={190}>
              <PieChart>
                <Pie data={findingsPie.length ? findingsPie : [{ name: "Sin hallazgos", value: 1, color: "#E5E7EB" }]} dataKey="value" nameKey="name" innerRadius={42} outerRadius={68}>
                  {(findingsPie.length ? findingsPie : [{ name: "Sin hallazgos", value: 1, color: "#E5E7EB" }]).map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={28} iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-card">
            <p className="chart-card-title">Evidencia</p>
            <ResponsiveContainer width="100%" height={190}>
              <PieChart>
                <Pie data={evidencePie.length ? evidencePie : [{ name: "Sin registros", value: 1, color: "#E5E7EB" }]} dataKey="value" nameKey="name" innerRadius={42} outerRadius={68}>
                  {(evidencePie.length ? evidencePie : [{ name: "Sin registros", value: 1, color: "#E5E7EB" }]).map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={28} iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="analysis-wide-grid" style={{ marginTop: 12 }}>
          <div className="chart-card">
            <p className="chart-card-title">Desempeño porcentual</p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={kpiChartData} margin={{ top: 8, right: 14, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="nombre" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(value) => [`${value}%`, "KPI"]} />
                <Bar dataKey="valor" radius={[6, 6, 0, 0]} fill={accent} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-card">
            <p className="chart-card-title">Riesgos abiertos</p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={riskChartData} layout="vertical" margin={{ top: 8, right: 16, left: 24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="nombre" width={120} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="valor" radius={[0, 6, 6, 0]} fill="#B5333D" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="quality-kpi-grid" style={{ marginTop: 12 }}>
          <QualityKpiCard label="Tasa de cierre" value={`${cierrePct}%`} progress={cierrePct} detail={`${cerrados}/${totalHallazgos || 0} hallazgos`} tone={cierrePct >= 85 ? "good" : cierrePct >= 60 ? "warn" : "bad"} />
          <QualityKpiCard label="Hallazgos por inspección" value={hallazgosPorInspeccion} progress={Math.max(0, 100 - Number(hallazgosPorInspeccion) * 30)} detail="Menor es mejor" tone={Number(hallazgosPorInspeccion) <= 1 ? "good" : Number(hallazgosPorInspeccion) <= 2 ? "warn" : "bad"} />
          <QualityKpiCard label="Evidencia documentada" value={`${evidenciaPct}%`} progress={evidenciaPct} detail={`${conEvidencia}/${inspecciones.length || 0} registros`} tone={evidenciaPct >= 80 ? "good" : evidenciaPct >= 50 ? "warn" : "bad"} />
          <QualityKpiCard label="Reincidencias" value={recurrencias} progress={Math.max(0, 100 - recurrencias * 25)} detail="Menor es mejor" tone={recurrencias === 0 ? "good" : recurrencias <= 2 ? "warn" : "bad"} />
          <QualityKpiCard label="Cumplimiento EPP" value={inspeccionesEpp.length ? `${promedioEpp}%` : "N/A"} progress={promedioEpp} detail={`${inspeccionesEpp.length} verificación(es)`} tone={!inspeccionesEpp.length || promedioEpp >= 90 ? "good" : promedioEpp >= 75 ? "warn" : "bad"} />
          <QualityKpiCard label="Inspecciones de área" value={inspeccionesArea.length} progress={Math.min(100, inspeccionesArea.length * 10)} detail="Registros operativos" tone="neutral" />
          <QualityKpiCard label="Áreas críticas" value={areaCriticas} progress={Math.max(0, 100 - areaCriticas * 30)} detail="Menor es mejor" tone={areaCriticas === 0 ? "good" : areaCriticas <= 2 ? "warn" : "bad"} />
          <QualityKpiCard label="Desviaciones abiertas" value={desviacionesAbiertas} progress={Math.max(0, 100 - desviacionesAbiertas * 25)} detail="Menor es mejor" tone={desviacionesAbiertas === 0 ? "good" : desviacionesAbiertas <= 2 ? "warn" : "bad"} />
        </div>
      </div>

      {(porArea.length > 0 || tendencia.length > 1) && (
        <div className="analysis-wide-grid">
          {porArea.length > 0 && (
            <div className="chart-card">
              <h3 className="chart-card-title">Cumplimiento promedio por área</h3>
              <ResponsiveContainer width="100%" height={Math.max(180, Math.min(320, porArea.length * 34))}>
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
            <div className="chart-card">
              <h3 className="chart-card-title">Tendencia de cumplimiento</h3>
              <ResponsiveContainer width="100%" height={220}>
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
  const photos = (value) => {
    const list = normalizeEvidenceList(value);
    if (!list.length) return "Sin evidencia";
    return `<div class="item-photos">${list.map((src) => `<img src="${src}" />`).join("")}</div>`;
  };
  return items.map((it) => `
    <tr>
      <td>${escapeHtml(it.texto)}</td>
      <td>${escapeHtml(statusInfo(it.estado).label)}</td>
      <td>${photos(it.evidencia)}</td>
    </tr>
  `).join("");
}

function evidenceHtml(evidencias = []) {
  if (!evidencias.length) return '<div class="box">Sin registro fotografico.</div>';
  return `<div class="photos">${evidencias.map((src) => `<img src="${src}" />`).join("")}</div>`;
}

function printWatermarkCss() {
  return `.print-watermark{position:fixed;left:50%;top:52%;width:520px;height:520px;object-fit:contain;transform:translate(-50%,-50%);opacity:.055;filter:grayscale(1) contrast(.75);z-index:-1;pointer-events:none}body{position:relative}.print-content{position:relative;z-index:1}`;
}

function printWatermarkHtml(config) {
  return config?.logo && config?.watermarkLogo !== false ? `<img class="print-watermark" src="${config.logo}" />` : "";
}

function printFontFamily(config) {
  return String(config?.fontFamily || "Inter, Arial, sans-serif").replace(/[<>{}]/g, "");
}

function checklistPrintHtml({ title, subtitle, items, primary, config }) {
  const origin = config?.nombre || "ERP";
  const font = printFontFamily(config);
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
body{font-family:${font};color:#1f2937;margin:28px;line-height:1.35}
h1{font-size:22px;margin:0 0 4px;text-transform:uppercase}p{margin:0 0 14px}
table{width:100%;border-collapse:collapse;margin-top:14px}th,td{border:1px solid #d1d5db;padding:8px;font-size:12px;vertical-align:top}th{background:#f3f4f6}.mark{width:70px;height:26px}
.header{border-bottom:3px solid ${primary};padding-bottom:10px}.origin{position:fixed;right:16px;top:12px;font-size:10px;color:#6b7280}.sign{display:grid;grid-template-columns:1fr 1fr;gap:32px;margin-top:52px}.line{border-top:1px solid #111827;text-align:center;padding-top:8px}
${printWatermarkCss()}
</style></head><body>
${printWatermarkHtml(config)}
<div class="print-content">
<div class="origin">Creado por ${escapeHtml(origin)}</div>
<div class="header"><h1>${escapeHtml(title)}</h1><p>${escapeHtml(subtitle)}</p></div>
<table><thead><tr><th>Item</th><th>Cumple</th><th>Parcial</th><th>No cumple</th><th>N/A</th><th>Observacion</th></tr></thead><tbody>${rows}</tbody></table>
<div class="sign"><div class="line">Inspector</div><div class="line">Responsable</div></div>
</div>
</body></html>`;
}

function inspectionPrintHtml(inspeccion, primary, config) {
  const origin = config?.nombre || "ERP";
  const font = printFontFamily(config);
  const eppBlocks = (inspeccion.epp || []).map((pe) => `
    <div class="person">
      ${pe.foto ? `<img src="${pe.foto}" />` : ""}
      <div><h3>${escapeHtml(pe.personaNombre)}</h3><p>${escapeHtml(pe.rol || "")}</p></div>
    </div>
    <table><thead><tr><th>Item EPP</th><th>Estado</th><th>Evidencia</th></tr></thead><tbody>${statusRowsHtml(pe.items)}</tbody></table>
  `).join("");
  const signature = (src, label) => src
    ? `<div class="signed"><img src="${src}" /><p>${label}</p></div>`
    : `<div class="line">${label}</div>`;
  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8" /><title>Inspeccion ${escapeHtml(inspeccion.areaNombre)}</title>
<style>
body{font-family:${font};color:#1f2937;margin:28px;line-height:1.4}
h1{font-size:22px;margin:0 0 4px;text-transform:uppercase}h2{font-size:15px;margin:22px 0 8px}h3{margin:0;font-size:14px}
.header{border-bottom:3px solid ${primary};padding-bottom:10px}.origin{position:fixed;right:16px;top:12px;font-size:10px;color:#6b7280}.meta,.box{border:1px solid #d1d5db;border-radius:8px;padding:12px;margin:12px 0}.meta{display:grid;grid-template-columns:160px 1fr;gap:6px 14px}.label{font-weight:700;color:#4b5563}
.score{font-size:34px;font-weight:800;color:${(inspeccion.cumplimientoPct || 0) >= 75 ? "#1E7A46" : "#B5333D"}}
table{width:100%;border-collapse:collapse;margin-top:8px}th,td{border:1px solid #ddd;padding:7px;font-size:12px;vertical-align:top}th{background:#f3f4f6}
.photos{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.photos img{width:100%;height:150px;object-fit:cover;border-radius:8px;border:1px solid #ddd}.item-photos{display:grid;grid-template-columns:repeat(3,58px);gap:6px}.item-photos img{width:58px;height:48px;object-fit:cover;border-radius:6px;border:1px solid #ddd}.person{display:flex;gap:10px;align-items:center;margin:12px 0 6px}.person img,.avatar{width:64px;height:64px;object-fit:cover;border-radius:8px;border:1px solid #ddd;margin-right:10px;vertical-align:middle}
.sign{display:grid;grid-template-columns:1fr 1fr;gap:32px;margin-top:52px}.line{border-top:1px solid #111827;text-align:center;padding-top:8px}.signed{border:1px solid #d1d5db;border-radius:8px;padding:8px;text-align:center}.signed img{width:100%;height:80px;object-fit:contain}.signed p{border-top:1px solid #111827;margin:8px 0 0;padding-top:6px}
${printWatermarkCss()}
</style></head><body>
${printWatermarkHtml(config)}
<div class="print-content">
<div class="origin">Creado por ${escapeHtml(origin)}</div>
<div class="header"><h1>${inspeccion.tipo === "epp" ? "Verificacion EPP" : "Inspeccion de area"}</h1><p>Registro generado desde ${escapeHtml(origin)}.</p></div>
<div class="meta">
<div class="label">Fecha</div><div>${escapeHtml(fmtFecha(inspeccion.fecha))}</div>
<div class="label">Area</div><div>${escapeHtml(inspeccion.areaNombre || "")}</div>
<div class="label">Inspector</div><div>${escapeHtml(inspeccion.inspector || "")}</div>
<div class="label">Responsable</div><div>${inspeccion.responsableFoto ? `<img class="avatar" src="${inspeccion.responsableFoto}" />` : ""}${escapeHtml(inspeccion.responsableNombre || "")}</div>
</div>
<div class="box"><div class="score">${inspeccion.cumplimientoPct || 0}%</div><p>Cumplimiento registrado</p></div>
${(inspeccion.items || []).length ? `<h2>Puntos de verificacion</h2><table><thead><tr><th>Item</th><th>Estado</th><th>Evidencia</th></tr></thead><tbody>${statusRowsHtml(inspeccion.items)}</tbody></table>` : ""}
${eppBlocks ? `<h2>Lista de EPP</h2>${eppBlocks}` : ""}
<h2>Observaciones</h2><div class="box">${escapeHtml(inspeccion.observaciones || "Sin observaciones.")}</div>
<h2>Registro fotografico</h2>${evidenceHtml(inspeccion.evidencias)}
<div class="sign">${signature(inspeccion.firmaInspector, "Inspector")}${signature(inspeccion.firmaResponsable, "Responsable")}</div>
</div>
</body></html>`;
}

function deviationPrintHtml(d, primary, config) {
  const origin = config?.nombre || "ERP";
  const font = printFontFamily(config);
  const photos = d.evidencias?.length
    ? `<div class="photos">${d.evidencias.map((src) => `<img src="${src}" />`).join("")}</div>`
    : '<div class="box">Sin evidencia fotografica.</div>';
  const signature = (src, label) => src
    ? `<div class="signature"><img src="${src}" /><p>${label}</p></div>`
    : `<div class="signature empty"><p>${label}</p></div>`;
  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8" /><title>${escapeHtml(d.codigo)}</title>
<style>
body{font-family:${font};color:#1f2937;margin:28px;line-height:1.4}
h1{font-size:22px;margin:0 0 4px;text-transform:uppercase}h2{font-size:15px;margin:22px 0 8px}
.origin{position:fixed;right:16px;top:12px;font-size:10px;color:#6b7280}.header{display:flex;align-items:center;gap:14px;border-bottom:3px solid ${primary};padding-bottom:12px}.logo{width:70px;height:70px;object-fit:contain}
.meta,.box{border:1px solid #d1d5db;border-radius:8px;padding:12px;margin:12px 0}.meta{display:grid;grid-template-columns:170px 1fr;gap:6px 14px}.label{font-weight:700;color:#4b5563}
.badge{display:inline-block;padding:4px 8px;border-radius:6px;background:#f3f4f6;font-weight:700}
.photos{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.photos img{width:100%;height:150px;object-fit:cover;border-radius:8px;border:1px solid #ddd}
.signatures{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:14px}.signature{border:1px solid #d1d5db;border-radius:8px;padding:8px;text-align:center;min-height:120px}.signature img{max-width:100%;height:80px;object-fit:contain}.signature p{border-top:1px solid #111827;margin:8px 0 0;padding-top:6px;font-size:12px}.empty{display:flex;align-items:end;justify-content:center}
table{width:100%;border-collapse:collapse}td{border:1px solid #ddd;padding:7px;font-size:12px}
@media print{body{margin:16mm}.photos img{height:130px}}
${printWatermarkCss()}
</style></head><body>
${printWatermarkHtml(config)}
<div class="print-content">
<div class="origin">Creado por ${escapeHtml(origin)}</div>
<div class="header">
  ${config?.logo ? `<img class="logo" src="${config.logo}" />` : ""}
  <div><h1>Gestion de desviaciones y acciones correctivas</h1><p>${escapeHtml(d.codigo)} · Documento generado desde ${escapeHtml(origin)}.</p></div>
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
</div>
</body></html>`;
}

function HallazgosView({ hallazgos, onUpdate, primary, config }) {
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
    const font = printFontFamily(config);
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
    body { font-family: ${font}; color: #1f2937; margin: 32px; line-height: 1.45; }
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
    ${printWatermarkCss()}
  </style>
</head>
<body>
  ${printWatermarkHtml(config)}
  <div class="print-content">
  <div class="header">
    <h1>Llamado de atención</h1>
    <p>Documento generado desde ${escapeHtml(config?.nombre || "ERP de calidad e inspecciones")}.</p>
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
    <div className="attention-shell">
      <div className="attention-header" style={{ borderColor: recurrentes ? "#F2C94C" : "#E5E7EB" }}>
        <div>
          <h3>Llamados de atención</h3>
          <p>
              Se habilitan desde cada hallazgo. El sistema marca como repetitivo cuando el mismo responsable repite el mismo incumplimiento 2 o más veces.
          </p>
        </div>
        <Badge color={recurrentes ? "#B4750E" : "#1E7A46"} bg={recurrentes ? "#FCF1DC" : "#E4F4EA"}>
          {recurrentes} repetitivo(s)
        </Badge>
      </div>

      <div className="attention-filters">
        {["todos", ...ESTADOS_HALLAZGO.map((e) => e.value)].map((f) => (
          <button key={f} onClick={() => setFiltro(f)}
            style={{ background: filtro === f ? primary : "#F1F3F4", color: filtro === f ? "#fff" : "#5C6673" }}>
            {f === "todos" ? "Todos" : ESTADOS_HALLAZGO.find((e) => e.value === f).label}
          </button>
        ))}
      </div>

      {filtrados.length === 0 && <div className="attention-empty">No hay hallazgos en este filtro.</div>}

      <div className="attention-grid">
        {filtrados.map((h) => {
          const st = ESTADOS_HALLAZGO.find((e) => e.value === h.estado);
          const editing = editId === h.id;
          const totalRecurrencias = recurrencias[hallazgoKey(h)] || 1;
          const puedeLlamado = totalRecurrencias >= 2 || h.estado !== "cerrado";
          return (
            <div key={h.id} className="attention-card">
              <div className="attention-card-top">
                <div>
                  <p>{h.descripcion}</p>
                  <span>{h.area} · {fmtFecha(h.fecha)}</span>
                </div>
                <Badge color={st.color} bg={st.bg}>{st.label}</Badge>
              </div>

              {editing ? (
                <div className="attention-edit-form">
                  <select value={draft.estado} onChange={(e) => setDraft({ ...draft, estado: e.target.value })}>
                    {ESTADOS_HALLAZGO.map((e) => <option key={e.value} value={e.value}>{e.label}</option>)}
                  </select>
                  <input value={draft.responsable} onChange={(e) => setDraft({ ...draft, responsable: e.target.value })} placeholder="Responsable" />
                  <input type="date" value={draft.fechaCompromiso} onChange={(e) => setDraft({ ...draft, fechaCompromiso: e.target.value })} />
                  <textarea value={draft.notas} onChange={(e) => setDraft({ ...draft, notas: e.target.value })} placeholder="Notas de seguimiento" rows={2} />
                  <button onClick={guardar} style={{ background: primary }}>Guardar</button>
                </div>
              ) : (
                <div className="attention-card-body">
                  <div className="attention-meta-grid">
                    <span><b>Responsable</b>{h.responsable || "Sin responsable asignado"}</span>
                    <span><b>Compromiso</b>{h.fechaCompromiso || "Pendiente"}</span>
                    <span><b>Repetición</b>{totalRecurrencias >= 2 ? `${totalRecurrencias} veces` : "Sin repetición"}</span>
                    <span><b>Llamado</b>{h.llamadoAtencion ? "Generado" : "Pendiente"}</span>
                  </div>
                  <div className="attention-actions">
                    <button onClick={() => startEdit(h)} style={{ color: primary, borderColor: primary }}>
                      <Pencil size={12} /> Editar
                    </button>
                    <button onClick={() => setFirmaTarget({ ...h })} style={{ color: primary, borderColor: primary }}>
                      <FileText size={12} /> Firmas
                    </button>
                    <button
                      disabled={!puedeLlamado}
                      onClick={() => descargarLlamado(h, totalRecurrencias)}
                      style={{ color: "#B5333D", borderColor: "#F0B8BD", background: "#FFF7F7" }}
                    >
                      <Download size={12} /> Descargar llamado
                    </button>
                    <button
                      disabled={!puedeLlamado}
                      onClick={() => enviarLlamado(h, totalRecurrencias)}
                      style={{ background: "#B5333D", color: "#fff", borderColor: "#B5333D" }}
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
          <div className="signature-grid" style={{ "--signature-columns": 2 }}>
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
    { id: "roles", label: "Roles" },
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
      {sub === "usuarios" && <AdminUsuarios usuarios={usuarios} config={config} onUsuarios={onUsuarios} currentUser={currentUser} primary={primary} />}
      {sub === "roles" && <AdminRoles config={config} onConfig={onConfig} primary={primary} />}
      {sub === "acerca" && <AdminAcercaDe primary={primary} />}
    </div>
  );
}

function AdminGeneral({ config, onConfig, primary, backupData }) {
  const [nombre, setNombre] = useState(config.nombre);
  const [colorPrimario, setColorPrimario] = useState(config.colorPrimario);
  const [colorAccent, setColorAccent] = useState(config.colorAccent);
  const [textColor, setTextColor] = useState(config.textColor || "#243040");
  const [logo, setLogo] = useState(config.logo);
  const [fontScale, setFontScale] = useState(config.fontScale || 112);
  const [fontFamily, setFontFamily] = useState(config.fontFamily || "Inter, sans-serif");
  const [textAlign, setTextAlign] = useState(config.textAlign || "center");
  const [watermarkLogo, setWatermarkLogo] = useState(config.watermarkLogo !== false);
  const [moduleLogos, setModuleLogos] = useState(config.moduleLogos || {});
  const [inactiveStatsMonths, setInactiveStatsMonths] = useState(config.inactiveStatsMonths || 6);
  const [appBackground, setAppBackground] = useState(config.appBackground || "#F1F3F4");
  const [cellBackground, setCellBackground] = useState(config.cellBackground || "#FFFFFF");
  const [fieldBorderWidth, setFieldBorderWidth] = useState(config.fieldBorderWidth || 1);
  const [fieldPaddingY, setFieldPaddingY] = useState(config.fieldPaddingY || 9);
  const [logoError, setLogoError] = useState("");
  const [logoBusy, setLogoBusy] = useState(false);
  const [cloudEnabled, setCloudEnabled] = useState(Boolean(config.cloudSync?.enabled));
  const [cloudUrl, setCloudUrl] = useState(config.cloudSync?.url || "");
  const [cloudAnonKey, setCloudAnonKey] = useState(config.cloudSync?.anonKey || "");
  const [cloudWorkspaceId, setCloudWorkspaceId] = useState(config.cloudSync?.workspaceId || "");
  const [cloudEmail, setCloudEmail] = useState("");
  const [cloudPassword, setCloudPassword] = useState("");
  const [cloudMsg, setCloudMsg] = useState("");
  const palettes = [
    { id: "institucional", label: "Institucional", primary: "#1F2B3A", accent: "#F2622E", text: "#243040", page: "#F1F3F4", cell: "#FFFFFF" },
    { id: "verde", label: "Calidad", primary: "#12372A", accent: "#1E7A46", text: "#20322A", page: "#EEF4F0", cell: "#FFFFFF" },
    { id: "grafito", label: "Grafito", primary: "#20242B", accent: "#64748B", text: "#20242B", page: "#F4F5F7", cell: "#FFFFFF" },
    { id: "azul", label: "Operativo", primary: "#17324D", accent: "#2563EB", text: "#1D2B3A", page: "#EFF5FF", cell: "#FFFFFF" },
  ];
  const applyPalette = (palette) => {
    setColorPrimario(palette.primary);
    setColorAccent(palette.accent);
    setTextColor(palette.text);
    setAppBackground(palette.page);
    setCellBackground(palette.cell);
  };
  const configPayload = (nextLogo = logo) => ({
    ...config,
    nombre,
    colorPrimario,
    colorAccent,
    textColor,
    logo: nextLogo,
    fontScale,
    fontFamily,
    textAlign,
    watermarkLogo,
    moduleLogos,
    inactiveStatsMonths,
    appBackground,
    cellBackground,
    fieldBorderWidth,
    fieldPaddingY,
    cloudSync: {
      ...(config.cloudSync || {}),
      enabled: cloudEnabled,
      url: cloudUrl.trim(),
      anonKey: cloudAnonKey.trim(),
      workspaceId: cloudWorkspaceId.trim(),
    },
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
  const handleModuleLogo = async (moduleId, e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLogoBusy(true);
    setLogoError("");
    try {
      const dataUrl = await resizeImageToDataUrl(file, 220);
      const next = { ...moduleLogos, [moduleId]: dataUrl };
      setModuleLogos(next);
      await onConfig({ ...configPayload(), moduleLogos: next });
    } catch (err) {
      setLogoError(err.message || "No se pudo cargar el logo del modulo.");
    } finally {
      setLogoBusy(false);
      e.target.value = "";
    }
  };
  const quitarModuleLogo = async (moduleId) => {
    const next = { ...moduleLogos };
    delete next[moduleId];
    setModuleLogos(next);
    await onConfig({ ...configPayload(), moduleLogos: next });
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
  const cleanTemplatePayload = ({ blankStandardization = true } = {}) => {
    const cleanConfig = {
      ...configPayload(),
      nombre: nombre.trim() || config.nombre || "ERP Cocina Institucional",
    };
    return {
      createdAt: todayISO(),
      version: APP_VERSION,
      template: "erp-limpio-base",
      config: cleanConfig,
      areas: backupData.areas || [],
      eppItems: backupData.eppItems || [],
      usuarios: [],
      inspecciones: [],
      hallazgos: [],
      desviaciones: [],
      hrColaboradores: [],
      hrEvaluaciones: [],
      hrPlanes: [],
      hrCapacitaciones: [],
      hrCertificaciones: [],
      stdFamilias: blankStandardization ? [] : (backupData.stdFamilias?.length ? backupData.stdFamilias : DEFAULT_STD_DATA.familias),
      stdInsumos: blankStandardization ? [] : (backupData.stdInsumos?.length ? backupData.stdInsumos : DEFAULT_STD_DATA.insumos),
      stdRecetas: blankStandardization ? [] : (backupData.stdRecetas?.length ? backupData.stdRecetas : DEFAULT_STD_DATA.recetas),
      stdPreparaciones: blankStandardization ? [] : (backupData.stdPreparaciones?.length ? backupData.stdPreparaciones : DEFAULT_STD_DATA.preparaciones),
      stdMermas: [],
      stdRequisiciones: [],
    };
  };
  const descargarModoPrueba = () => {
    const payload = {
      ...cleanTemplatePayload({ blankStandardization: true }),
      template: "erp-modo-prueba-sin-datos",
      demo: true,
      nota: "Archivo de datos limpio para entregar el ERP en modo prueba sin información operativa real.",
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `modo-prueba-erp-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const descargarPlantillaLimpia = () => {
    const payload = cleanTemplatePayload({ blankStandardization: true });
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `plantilla-limpia-erp-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const cloudConfigPayload = () => ({
    ...configPayload(),
    cloudSync: {
      enabled: cloudEnabled,
      url: cloudUrl.trim(),
      anonKey: cloudAnonKey.trim(),
      workspaceId: cloudWorkspaceId.trim(),
    },
  });
  const cloudRecordsPayload = () => ({
    qc_config: cloudConfigPayload(),
    qc_areas: backupData.areas || [],
    qc_epp: backupData.eppItems || [],
    qc_personas: backupData.hrColaboradores || [],
    qc_usuarios: backupData.usuarios || [],
    qc_inspecciones: backupData.inspecciones || [],
    qc_hallazgos: backupData.hallazgos || [],
    qc_desviaciones: backupData.desviaciones || [],
    hr_colaboradores: backupData.hrColaboradores || [],
    hr_evaluaciones: backupData.hrEvaluaciones || [],
    hr_planes_mejora: backupData.hrPlanes || [],
    hr_capacitaciones: backupData.hrCapacitaciones || [],
    hr_certificaciones: backupData.hrCertificaciones || [],
    std_familias: backupData.stdFamilias || [],
    std_insumos: backupData.stdInsumos || [],
    std_recetas: backupData.stdRecetas || [],
    std_preparaciones: backupData.stdPreparaciones || [],
    std_mermas: backupData.stdMermas || [],
    std_requisiciones: backupData.stdRequisiciones || [],
  });
  const conectarSupabase = async () => {
    setCloudMsg("Conectando...");
    try {
      const nextConfig = cloudConfigPayload();
      await signInCloud(nextConfig, cloudEmail.trim(), cloudPassword);
      await onConfig(nextConfig);
      setActiveCloudConfig(nextConfig);
      setCloudPassword("");
      setCloudMsg("Conexión activa. Ahora puedes subir o traer datos.");
    } catch (error) {
      setCloudMsg(`No se pudo conectar: ${error.message}`);
    }
  };
  const subirSnapshotCloud = async () => {
    setCloudMsg("Subiendo datos actuales...");
    try {
      const nextConfig = cloudConfigPayload();
      await onConfig(nextConfig);
      await pushCloudSnapshot(nextConfig, cloudRecordsPayload());
      setCloudMsg("Datos actuales subidos a Supabase.");
    } catch (error) {
      setCloudMsg(`No se pudo subir: ${error.message}`);
    }
  };
  const traerSnapshotCloud = async () => {
    const ok = confirm("Esto traerá datos desde Supabase y recargará este equipo. Descarga backup si tienes dudas. ¿Continuar?");
    if (!ok) return;
    setCloudMsg("Descargando datos desde Supabase...");
    try {
      const nextConfig = cloudConfigPayload();
      const records = await pullCloudRecords(nextConfig);
      await Promise.all(Object.entries(records).map(([key, value]) => saveKey(key, value)));
      setCloudMsg("Datos descargados. Recargando...");
      window.location.reload();
    } catch (error) {
      setCloudMsg(`No se pudo descargar: ${error.message}`);
    }
  };
  const desconectarCloud = async () => {
    clearCloudSession();
    const nextConfig = { ...cloudConfigPayload(), cloudSync: { ...cloudConfigPayload().cloudSync, enabled: false } };
    setCloudEnabled(false);
    await onConfig(nextConfig);
    setActiveCloudConfig(nextConfig);
    setCloudMsg("Sincronización desconectada en este equipo.");
  };
  const reiniciarEsteEquipo = async () => {
    const ok = confirm("Esto reinicia SOLO este navegador/tablet: conserva catalogos base, borra registros diligenciados y pedira crear usuario de nuevo. Otras tablets no se afectan. ¿Continuar?");
    if (!ok) return;
    const sure = confirm("Confirma de nuevo. Se descargara un backup antes de limpiar este equipo.");
    if (!sure) return;
    descargarBackup();
    const payload = cleanTemplatePayload({ blankStandardization: false });
    await Promise.all([
      saveKey("qc_config", payload.config),
      saveKey("qc_areas", payload.areas),
      saveKey("qc_epp", payload.eppItems),
      saveKey("qc_personas", []),
      saveKey("qc_usuarios", []),
      saveKey("qc_inspecciones", []),
      saveKey("qc_hallazgos", []),
      saveKey("qc_desviaciones", []),
      saveKey("hr_colaboradores", []),
      saveKey("hr_evaluaciones", []),
      saveKey("hr_planes_mejora", []),
      saveKey("hr_capacitaciones", []),
      saveKey("hr_certificaciones", []),
      saveKey("std_familias", payload.stdFamilias),
      saveKey("std_insumos", payload.stdInsumos),
      saveKey("std_recetas", payload.stdRecetas.map((receta) => ({ ...receta, foto: "" }))),
      saveKey("std_preparaciones", payload.stdPreparaciones),
      saveKey("std_mermas", []),
      saveKey("std_requisiciones", []),
      saveKey("erp_session_user", null),
    ]);
    window.location.reload();
  };

  return (
    <div className="admin-general-shell">
      <div className="admin-card admin-card-wide">
        <div className="admin-card-head">
          <h3 style={{ fontFamily: "inherit" }}>Identidad visual</h3>
          <Palette size={15} />
        </div>
        <div className="admin-name-grid">
          <label>
            <span>Nombre del ERP</span>
            <input value={nombre} onChange={(e) => setNombre(e.target.value)} />
          </label>
          <label className="admin-check-card">
            <input type="checkbox" checked={watermarkLogo} onChange={(e) => setWatermarkLogo(e.target.checked)} />
            <span>Marca de agua activa</span>
          </label>
        </div>
      </div>

      <div className="erp-palette-presets admin-palettes">
        {palettes.map((palette) => (
          <button key={palette.id} type="button" onClick={() => applyPalette(palette)}>
            <span className="erp-palette-swatch">
              <i style={{ background: palette.primary }} />
              <i style={{ background: palette.accent }} />
              <i style={{ background: palette.page }} />
            </span>
            <strong>{palette.label}</strong>
          </button>
        ))}
      </div>

      <div className="admin-settings-grid">
        <label className="admin-color-control">
          <span>Primario</span>
          <input type="color" value={colorPrimario} onChange={(e) => setColorPrimario(e.target.value)} />
        </label>
        <label className="admin-color-control">
          <span>Acento</span>
          <input type="color" value={colorAccent} onChange={(e) => setColorAccent(e.target.value)} />
        </label>
        <label className="admin-color-control">
          <span>Letra</span>
          <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} />
        </label>
        <label className="admin-color-control">
          <span>Fondo ERP</span>
          <input type="color" value={appBackground} onChange={(e) => setAppBackground(e.target.value)} />
        </label>
        <label className="admin-color-control">
          <span>Campos</span>
          <input type="color" value={cellBackground} onChange={(e) => setCellBackground(e.target.value)} />
        </label>
      </div>

      <div className="admin-control-grid">
        <label className="admin-range-control">
          <span>Tamaño de letra <b>{fontScale}%</b></span>
          <input type="range" min="100" max="190" value={fontScale} onChange={(e) => setFontScale(Number(e.target.value))} />
        </label>
        <label className="admin-select-control">
          <span>Tipo de letra</span>
          <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)}>
            <option value="Inter, sans-serif">Inter</option>
            <option value="Arial, sans-serif">Arial</option>
            <option value="'Segoe UI', sans-serif">Segoe UI</option>
            <option value="Roboto, sans-serif">Roboto</option>
            <option value="Verdana, sans-serif">Verdana</option>
            <option value="Tahoma, sans-serif">Tahoma</option>
            <option value="Georgia, serif">Georgia</option>
            <option value="'Trebuchet MS', sans-serif">Trebuchet</option>
            <option value="'Century Gothic', sans-serif">Century Gothic</option>
            <option value="'Gill Sans', sans-serif">Gill Sans</option>
            <option value="system-ui, sans-serif">Sistema</option>
          </select>
        </label>
        <label className="admin-select-control">
          <span>Alineación de textos</span>
          <select value={textAlign} onChange={(e) => setTextAlign(e.target.value)}>
            <option value="center">Centrar</option>
            <option value="left">Alinear a la izquierda</option>
            <option value="justify">Justificar completo</option>
          </select>
        </label>
        <label className="admin-range-control compact">
          <span>Borde <b>{fieldBorderWidth}px</b></span>
          <input type="range" min="1" max="3" value={fieldBorderWidth} onChange={(e) => setFieldBorderWidth(Number(e.target.value))} />
        </label>
        <label className="admin-range-control compact">
          <span>Alto campos <b>{fieldPaddingY}px</b></span>
          <input type="range" min="7" max="14" value={fieldPaddingY} onChange={(e) => setFieldPaddingY(Number(e.target.value))} />
        </label>
        <label className="admin-number-control">
          <span>Inactivos en estadísticas</span>
          <input type="number" min="0" max="60" value={inactiveStatsMonths} onChange={(e) => setInactiveStatsMonths(Number(e.target.value))} />
        </label>
      </div>

      <div className="admin-assets-grid">
        <div className="admin-card admin-card-wide">
          <div className="admin-card-head">
            <h3 style={{ fontFamily: "inherit" }}>Backup de informacion</h3>
            <span>JSON</span>
          </div>
          <p>Descarga una copia completa o una plantilla limpia para compartir sin datos diligenciados.</p>
          <div className="admin-action-row">
            <button onClick={descargarBackup} style={{ borderColor: primary, color: primary }}>Backup</button>
            <button onClick={descargarPlantillaLimpia} style={{ borderColor: primary, color: primary }}>Plantilla limpia</button>
            <button onClick={descargarModoPrueba} style={{ borderColor: primary, color: primary }}>Modo prueba</button>
            <button onClick={reiniciarEsteEquipo} className="danger">Reiniciar equipo</button>
          </div>
          <small>Modo prueba descarga datos limpios para demostraciones. No borra nada. El reinicio solo aplica al navegador actual y descarga un backup antes.</small>
        </div>

        <div className="admin-card admin-card-wide cloud-sync-card">
          <div className="admin-card-head">
            <h3 style={{ fontFamily: "inherit" }}>Sincronización multi-equipo</h3>
            <span>Supabase</span>
          </div>
          <p>Conecta una base central para que tablet, PC y celular trabajen sobre la misma información. No uses la llave service_role en la PWA.</p>
          <div className="cloud-sync-grid">
            <label className="admin-check-card">
              <input type="checkbox" checked={cloudEnabled} onChange={(e) => setCloudEnabled(e.target.checked)} />
              <span>Activar sincronización</span>
            </label>
            <input value={cloudUrl} onChange={(e) => setCloudUrl(e.target.value)} placeholder="Supabase URL" />
            <input value={cloudWorkspaceId} onChange={(e) => setCloudWorkspaceId(e.target.value)} placeholder="Workspace ID" />
            <input value={cloudAnonKey} onChange={(e) => setCloudAnonKey(e.target.value)} placeholder="Anon public key" />
            <input value={cloudEmail} onChange={(e) => setCloudEmail(e.target.value)} placeholder="Correo Supabase Auth" />
            <input type="password" value={cloudPassword} onChange={(e) => setCloudPassword(e.target.value)} placeholder="Contraseña Supabase Auth" />
          </div>
          <div className="admin-action-row">
            <button onClick={conectarSupabase} style={{ borderColor: primary, color: primary }}>Conectar</button>
            <button onClick={subirSnapshotCloud} style={{ borderColor: primary, color: primary }}>Subir datos</button>
            <button onClick={traerSnapshotCloud} style={{ borderColor: primary, color: primary }}>Traer datos</button>
            <button onClick={desconectarCloud} className="danger">Desconectar</button>
          </div>
          <small>{cloudMsg || "Primero crea el proyecto en Supabase, ejecuta el SQL seguro y pega aquí la URL, anon key y workspace."}</small>
        </div>

        <div className="admin-card">
          <div className="admin-card-head">
            <h3 style={{ fontFamily: "inherit" }}>Logo corporativo</h3>
            <ImagePlus size={15} />
          </div>
          <div className="admin-logo-row">
            <div className="admin-logo-preview">
              {logo ? <img src={logo} /> : <ImagePlus size={22} />}
            </div>
            <label
              className="file-icon-button admin-icon-upload"
              title={logoBusy ? "Cargando imagen" : "Subir imagen"}
              aria-label={logoBusy ? "Cargando imagen" : "Subir imagen"}
              style={{ borderColor: primary, color: primary }}
            >
              <ImagePlus size={18} />
              <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={handleLogo} className="hidden" disabled={logoBusy} />
            </label>
            {logo && (
              <button onClick={quitarLogo} className="admin-mini-danger">Quitar</button>
            )}
          </div>
          <small>PNG, JPG, WEBP o SVG. Se ajusta automaticamente.</small>
          {logoError && <small className="error">{logoError}</small>}
        </div>

        <div className="admin-card admin-card-wide">
          <div className="admin-card-head">
            <h3 style={{ fontFamily: "inherit" }}>Logos de modulos</h3>
            <span>Accesos</span>
          </div>
          <div className="admin-module-logo-grid">
          {[
            ["calidad", "Calidad"],
            ["talento", "Talento"],
            ["cocina", "Fichas"],
            ["pedidos", "Pedidos"],
            ["admin", "Admin"],
          ].map(([id, label]) => (
            <div key={id} className="admin-module-logo-card">
              <div className="admin-module-logo-preview">
                {moduleLogos[id] ? <img src={moduleLogos[id]} /> : <ImagePlus size={18} />}
              </div>
              <strong>{label}</strong>
              <label className="file-icon-button admin-icon-upload small" title={`Cambiar logo de ${label}`} aria-label={`Cambiar logo de ${label}`} style={{ borderColor: primary, color: primary }}>
                <ImagePlus size={16} />
                <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={(event) => handleModuleLogo(id, event)} className="hidden" disabled={logoBusy} />
              </label>
              {moduleLogos[id] && <button type="button" onClick={() => quitarModuleLogo(id)} className="admin-mini-danger">Quitar</button>}
            </div>
          ))}
          </div>
        </div>
      </div>

      <button onClick={guardar} className="admin-save-button" style={{ background: primary }}>
        <Save size={16} /> Guardar cambios
      </button>
    </div>
  );
}

function AdminAreas({ areas, onAreas, primary }) {
  const [nuevaArea, setNuevaArea] = useState("");
  const [nuevoItem, setNuevoItem] = useState({});
  const [expand, setExpand] = useState(null);
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
    <div className="admin-panel-shell">
      <div className="admin-panel">
        <div className="admin-panel-head">
          <div>
            <h3 style={{ fontFamily: "inherit" }}>Áreas de inspección</h3>
            <p>{areas.length} área(s) configuradas · edita nombres e ítems desde cada fila</p>
          </div>
          <Badge color={primary} bg={`${primary}14`}>{areas.reduce((sum, a) => sum + a.items.length, 0)} ítems</Badge>
        </div>
        <div className="admin-create-row">
          <input value={nuevaArea} onChange={(e) => setNuevaArea(e.target.value)} placeholder="Nueva área..." />
          <button onClick={agregarArea} style={{ background: primary }}><Plus size={16} /> Agregar</button>
        </div>
      </div>

      <div className="admin-list-grid">
        {areas.map((a) => (
        <div key={a.id} className="admin-list-card">
          <div className="admin-list-row">
            <input value={a.nombre} onChange={(e) => renombrarArea(a.id, e.target.value)} />
            <button onClick={() => setExpand(expand === a.id ? null : a.id)} className="admin-pill-button" style={{ color: primary, borderColor: `${primary}55` }}>{expand === a.id ? "Ocultar" : `${a.items.length} ítems`}</button>
            <button onClick={() => eliminarArea(a.id)} className="admin-icon-danger" title="Eliminar área" aria-label="Eliminar área"><Trash2 size={16} /></button>
          </div>
          {expand === a.id && (
            <div className="admin-item-list">
              {a.items.map((it) => (
                <div key={it.id} className="admin-subitem-row">
                  {editandoItem === it.id ? (
                    <input autoFocus value={it.texto} onChange={(e) => renombrarItem(a.id, it.id, e.target.value)} />
                  ) : (
                    <span>{it.texto}</span>
                  )}
                  <button onClick={() => setEditandoItem(editandoItem === it.id ? null : it.id)} title="Editar ítem" aria-label="Editar ítem"><Pencil size={13} /></button>
                  <button onClick={() => eliminarItem(a.id, it.id)} className="danger" title="Eliminar ítem" aria-label="Eliminar ítem"><Trash2 size={13} /></button>
                </div>
              ))}
              <div className="admin-inline-create">
                <input value={nuevoItem[a.id] || ""} onChange={(e) => setNuevoItem((s) => ({ ...s, [a.id]: e.target.value }))} placeholder="Nuevo ítem..." />
                <button onClick={() => agregarItem(a.id)} style={{ background: primary }}><Plus size={14} /></button>
              </div>
            </div>
          )}
        </div>
      ))}
      </div>
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
    <div className="admin-panel-shell">
      <div className="admin-panel">
        <div className="admin-panel-head">
          <div>
            <h3 style={{ fontFamily: "inherit" }}>Verificación EPP</h3>
            <p>Lista base para inspecciones de elementos de protección personal</p>
          </div>
          <Badge color={primary} bg={`${primary}14`}>{eppItems.length} ítems</Badge>
        </div>
        <div className="admin-create-row">
          <input value={nuevo} onChange={(e) => setNuevo(e.target.value)} placeholder="Nuevo ítem de EPP..." />
          <button onClick={agregar} style={{ background: primary }}><Plus size={16} /> Agregar</button>
        </div>
      </div>

      <div className="admin-compact-list">
        {eppItems.map((it, index) => (
          <div key={it.id} className="admin-epp-row">
            <span>{String(index + 1).padStart(2, "0")}</span>
            <input value={it.texto} onChange={(e) => editar(it.id, e.target.value)} />
            <button onClick={() => eliminar(it.id)} className="admin-icon-danger" title="Eliminar ítem" aria-label="Eliminar ítem"><Trash2 size={14} /></button>
          </div>
        ))}
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

// eslint-disable-next-line no-unused-vars
function LegacyAdminPersonas({ personas, areas, onPersonas, primary }) {
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
        <h3 className="font-bold text-sm flex items-center gap-1.5" style={{ fontFamily: "inherit" }}><UserPlus size={15} /> Agregar personal</h3>
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

function AdminRoles({ config, onConfig, primary }) {
  const [roles, setRoles] = useState(normalizeRoleProfiles(config));
  const [selectedRole, setSelectedRole] = useState("supervisor");
  const roleList = Object.values(roles);
  const selected = roles[selectedRole] || roleList[0];

  const updateRole = (roleId, patch) => {
    setRoles((prev) => ({ ...prev, [roleId]: { ...prev[roleId], ...patch } }));
  };
  const togglePermission = (roleId, moduleId, actionId) => {
    setRoles((prev) => ({
      ...prev,
      [roleId]: {
        ...prev[roleId],
        permissions: {
          ...prev[roleId].permissions,
          [moduleId]: {
            ...prev[roleId].permissions[moduleId],
            [actionId]: !prev[roleId].permissions[moduleId]?.[actionId],
          },
        },
      },
    }));
  };
  const addRole = () => {
    const id = `rol_${Date.now().toString(36)}`;
    const next = {
      id,
      label: "Nuevo rol",
      description: "Define el alcance de este rol.",
      permissions: rolePermissions([], false),
    };
    setRoles((prev) => ({ ...prev, [id]: next }));
    setSelectedRole(id);
  };
  const removeRole = (roleId) => {
    if (roles[roleId]?.system) return;
    if (!confirm("¿Eliminar este rol? Los usuarios asignados deberán actualizarse.")) return;
    const next = { ...roles };
    delete next[roleId];
    setRoles(next);
    setSelectedRole("usuario");
  };
  const save = () => onConfig({ ...config, roleProfiles: roles });

  return (
    <div className="admin-panel-shell">
      <div className="admin-panel">
        <div className="admin-panel-head">
          <div>
            <h3 style={{ fontFamily: "inherit" }}>Roles y permisos</h3>
            <p>Base para multiempresa, sedes, membresías y control de acceso por equipo.</p>
          </div>
          <button type="button" onClick={addRole} className="admin-pill-button" style={{ color: primary, borderColor: `${primary}55` }}>
            <Plus size={14} /> Rol
          </button>
        </div>
        <div className="roles-layout">
          <div className="roles-list">
            {roleList.map((role) => (
              <button key={role.id} type="button" onClick={() => setSelectedRole(role.id)} className={selected?.id === role.id ? "active" : ""}>
                <strong>{role.label}</strong>
                <span>{role.description}</span>
              </button>
            ))}
          </div>
          {selected && (
            <div className="roles-editor">
              <div className="roles-editor-head">
                <input value={selected.label} disabled={selected.system} onChange={(e) => updateRole(selected.id, { label: e.target.value })} />
                {!selected.system && <button type="button" onClick={() => removeRole(selected.id)} className="admin-icon-danger"><Trash2 size={15} /></button>}
              </div>
              <textarea value={selected.description || ""} onChange={(e) => updateRole(selected.id, { description: e.target.value })} rows={2} placeholder="Descripción del rol" />
              <div className="permissions-table">
                <div className="permissions-head">
                  <span>Módulo</span>
                  {ERP_ACTIONS.map((action) => <span key={action.id}>{action.label}</span>)}
                </div>
                {ERP_MODULES.map((module) => (
                  <div key={module.id} className="permissions-row">
                    <div>
                      <strong>{module.label}</strong>
                      <small>{module.description}</small>
                    </div>
                    {ERP_ACTIONS.map((action) => (
                      <label key={action.id} title={`${action.label} ${module.label}`}>
                        <input
                          type="checkbox"
                          checked={Boolean(selected.permissions?.[module.id]?.[action.id])}
                          disabled={selected.id === "administrador"}
                          onChange={() => togglePermission(selected.id, module.id, action.id)}
                        />
                      </label>
                    ))}
                  </div>
                ))}
              </div>
              <p className="admin-help-text">En la fase local esto controla visibilidad. En la fase Supabase se convertirá en seguridad real por empresa, sede y plan contratado.</p>
            </div>
          )}
        </div>
      </div>
      <button onClick={save} className="admin-save-button" style={{ background: primary }}>
        <Save size={16} /> Guardar roles
      </button>
    </div>
  );
}

function AdminUsuarios({ usuarios, config, onUsuarios, currentUser, primary }) {
  const roleProfiles = normalizeRoleProfiles(config);
  const roleOptions = Object.values(roleProfiles);
  const [form, setForm] = useState({ nombre: "", password: "", roleId: "usuario" });
  const [editId, setEditId] = useState(null);
  const [msg, setMsg] = useState("");

  const admins = usuarios.filter((u) => u.rol === "administrador");

  const agregar = () => {
    if (usuarios.length >= MAX_USUARIOS) return setMsg(`Ya alcanzaste el máximo de ${MAX_USUARIOS} usuarios.`);
    if (!form.nombre.trim()) return setMsg("Escribe el nombre del usuario.");
    if (form.password.length < 4) return setMsg("La contraseña debe tener al menos 4 caracteres.");
    onUsuarios([...usuarios, { id: genId(), nombre: form.nombre.trim(), password: form.password, rol: form.roleId === "administrador" ? "administrador" : "usuario", roleId: form.roleId }]);
    setForm({ nombre: "", password: "", roleId: "usuario" });
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
    if (userRoleId(u) !== "administrador") {
      const quedanAdmins = usuarios.filter((x) => x.rol === "administrador" && x.id !== u.id).length;
      if (quedanAdmins === 0) { setMsg("Debe existir al menos un administrador."); return; }
    }
    onUsuarios(usuarios.map((x) => x.id === u.id ? u : x));
    setEditId(null);
    setMsg("");
  };

  return (
    <div className="admin-panel-shell">
      <div className="admin-panel">
        <div className="admin-panel-head">
          <div>
            <h3 style={{ fontFamily: "inherit" }}>Usuarios del ERP</h3>
            <p>{usuarios.length}/{MAX_USUARIOS} accesos creados · conserva al menos un administrador</p>
          </div>
          <Badge color={primary} bg={`${primary}14`}>{admins.length} admin</Badge>
        </div>
        <div className="admin-user-create">
          <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Nombre" />
          <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Contraseña" />
          <select value={form.roleId} onChange={(e) => setForm({ ...form, roleId: e.target.value })}>
          {roleOptions.map((role) => <option key={role.id} value={role.id}>{role.label}</option>)}
        </select>
        <button onClick={agregar} disabled={usuarios.length >= MAX_USUARIOS}
          style={{ background: primary }}>
          <Plus size={15} /> Agregar usuario
        </button>
        </div>
        {msg && <p className="admin-message danger">{msg}</p>}
      </div>

      <div className="admin-user-grid">
        {usuarios.map((u) => (
        <div key={u.id} className="admin-user-card">
          {editId === u.id ? (
            <UsuarioEditForm usuario={u} roleProfiles={roleProfiles} onSave={guardarEdicion} onCancel={() => setEditId(null)} primary={primary} />
          ) : (
            <div className="admin-user-view">
              <div>
                <p>
                  {u.nombre} {u.id === currentUser.id && <span className="text-[10px] text-gray-400">(tú)</span>}
                </p>
                <Badge color={userRoleId(u) === "administrador" ? "#1F2B3A" : "#5C6673"} bg={userRoleId(u) === "administrador" ? "#E9ECEF" : "#F1F3F4"}>
                  {roleProfiles[userRoleId(u)]?.label || userRoleId(u)}
                </Badge>
              </div>
              <div className="admin-row-actions">
                <button onClick={() => setEditId(u.id)}><Pencil size={16} /> Editar</button>
                <button onClick={() => eliminar(u)} className="danger"><Trash2 size={16} /> Eliminar</button>
              </div>
            </div>
          )}
        </div>
      ))}
      </div>

      <p className="admin-help-text">Los permisos visuales se asignan por rol. Al conectar Supabase, estos perfiles se usarán para proteger datos por empresa, sede y membresía.</p>
    </div>
  );
}

function UsuarioEditForm({ usuario, roleProfiles, onSave, onCancel, primary }) {
  const [u, setU] = useState({ ...usuario, password: usuario.password, roleId: userRoleId(usuario) });
  const roleOptions = Object.values(roleProfiles);
  const save = () => onSave({ ...u, rol: u.roleId === "administrador" ? "administrador" : "usuario" });
  return (
    <div className="admin-user-edit">
      <input value={u.nombre} onChange={(e) => setU({ ...u, nombre: e.target.value })} placeholder="Nombre" />
      <input type="password" value={u.password} onChange={(e) => setU({ ...u, password: e.target.value })} placeholder="Contraseña" />
      <select value={u.roleId} onChange={(e) => setU({ ...u, roleId: e.target.value })}>
        {roleOptions.map((role) => <option key={role.id} value={role.id}>{role.label}</option>)}
      </select>
      <div className="admin-row-actions">
        <button onClick={save} style={{ background: primary, color: "#fff", borderColor: primary }}>Guardar</button>
        <button onClick={onCancel}>Cancelar</button>
      </div>
    </div>
  );
}

function AdminAcercaDe({ primary }) {
  return (
    <div className="admin-panel-shell">
      <div className="admin-about-hero" style={{ borderColor: `${primary}44` }}>
        <div className="admin-about-icon" style={{ color: primary, background: `${primary}14` }}>
          <Info size={22} />
        </div>
        <div>
          <h3 style={{ fontFamily: "inherit" }}>Acerca de este ERP</h3>
          <p>Creado por <b>{CREADO_POR}</b></p>
        </div>
        <Badge color={primary} bg={`${primary}14`}>v{APP_VERSION}</Badge>
      </div>

      <div className="admin-panel">
        <div className="admin-panel-head">
          <div>
            <h3 style={{ fontFamily: "inherit" }}>Historial de versiones</h3>
            <p>Registro de mejoras significativas aplicadas a la aplicación</p>
          </div>
          <Badge color="#5C6673" bg="#F1F3F4">{CHANGELOG.length} cambios</Badge>
        </div>
        <div className="admin-changelog-list">
        {CHANGELOG.map((c) => (
          <div key={c.version} className="admin-changelog-row" style={{ borderColor: primary }}>
            <strong>v{c.version}</strong>
            <span>{c.fecha}</span>
            <p>{c.cambios}</p>
          </div>
        ))}
        </div>
      </div>
      <p className="admin-help-text">La versión se actualiza cada vez que se realizan ajustes significativos a la aplicación.</p>
    </div>
  );
}

