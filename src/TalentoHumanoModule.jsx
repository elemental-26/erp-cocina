import React, { useMemo, useState } from "react";
import {
  AlertTriangle, Award, BarChart3, BriefcaseBusiness, CalendarClock,
  ClipboardCheck, Download, FileText, GraduationCap, ImagePlus, Pencil,
  Save, ShieldCheck, Trash2, UserPlus, Users, X,
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, LineChart, Line, PieChart, Pie, Cell,
} from "recharts";
import * as XLSX from "xlsx";

const DEFAULT_TEMPLATE = [
  { group: "Planeacion", items: ["Lectura e interpretacion del menu", "Comprension de instrucciones", "Solicitud correcta de insumos"] },
  { group: "Organizacion", items: ["Mise en place", "Orden del puesto de trabajo", "Limpieza durante el proceso"] },
  { group: "Produccion", items: ["Aprovechamiento de materias primas", "Optimizacion de recursos", "Tecnicas de corte", "Porcionado", "Manipulacion higienica", "Uso correcto de equipos", "Cumplimiento de tiempos", "Calidad del producto", "Sabor", "Temperatura", "Presentacion del plato"] },
  { group: "Competencias", items: ["Escucha instrucciones", "Comunicacion", "Trabajo en equipo", "Actitud", "Responsabilidad", "Iniciativa", "Adaptabilidad"] },
  { group: "Finalizacion", items: ["Limpieza final", "Organizacion del area", "Entrega del puesto"] },
  { group: "Desempeno laboral", performanceOnly: true, items: ["Cumplimiento de metas", "Puntualidad y asistencia", "Servicio al cliente", "Cumplimiento de BPM", "Liderazgo operativo"] },
];

const CERT_TYPES = ["Manipulacion de alimentos", "Examenes medicos", "Curso interno", "Certificacion obligatoria"];
const REVIEW_PERIODS = ["Mensual", "Trimestral", "Semestral", "Anual"];
const PIE_COLORS = ["#1E7A46", "#B4750E", "#B5333D"];

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function todayISO() {
  return new Date().toISOString();
}

function dateOnly(value) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

function fmtFecha(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" });
}

function daysUntil(date) {
  if (!date) return 9999;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target - today) / (1000 * 60 * 60 * 24));
}

function resizeImageToDataUrl(file, maxDim = 420) {
  return new Promise((resolve, reject) => {
    if (!file.type || !file.type.startsWith("image/")) {
      reject(new Error("Selecciona una imagen valida."));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("No se pudo leer la imagen."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Imagen no valida."));
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
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/png"));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function getTemplate(config) {
  return config?.hrTemplate?.length ? config.hrTemplate : DEFAULT_TEMPLATE;
}

function criteriaFor(type, config) {
  return getTemplate(config)
    .filter((section) => type === "desempeno" || !section.performanceOnly)
    .flatMap((section) => section.items.map((text) => ({
      id: genId(),
      group: section.group,
      text,
      score: 3,
      observation: "",
      evidence: null,
    })));
}

function calculateResult(criteria) {
  const total = criteria.reduce((sum, item) => sum + Number(item.score || 0), 0);
  const max = criteria.length * 5;
  const percentage = max ? Math.round((total / max) * 100) : 0;
  const level = percentage >= 95 ? "Excelente"
    : percentage >= 85 ? "Muy bueno"
      : percentage >= 75 ? "Bueno"
        : percentage >= 60 ? "Requiere entrenamiento"
          : "No apto";
  const recommendation = percentage >= 85 ? "Contratar"
    : percentage >= 75 ? "Contratar con entrenamiento"
      : percentage >= 60 ? "Repetir prueba"
        : "No contratar";
  return { total, max, percentage, level, recommendation };
}

function latestEvaluation(colaboradorId, evaluaciones) {
  return evaluaciones
    .filter((e) => e.colaboradorId === colaboradorId)
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))[0];
}

function isActiveCollaborator(colaborador) {
  return colaborador.estado !== "Inactivo" && colaborador.estado !== "Retirado";
}

function includeInStats(colaborador, months = 6) {
  if (isActiveCollaborator(colaborador)) return true;
  if (!colaborador.inactiveDate) return true;
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - months);
  return new Date(colaborador.inactiveDate) >= cutoff;
}

function Badge({ children, color, bg }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wide" style={{ color, background: bg }}>
      {children}
    </span>
  );
}

function Modal({ title, onClose, children, wide }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className={`bg-white w-full ${wide ? "sm:max-w-3xl" : "sm:max-w-md"} sm:rounded-lg rounded-t-2xl max-h-[90vh] flex flex-col`}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h3 className="font-bold text-[15px]" style={{ fontFamily: "Oswald, sans-serif" }}>{title}</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100"><X size={20} /></button>
        </div>
        <div className="overflow-y-auto px-4 py-4">{children}</div>
      </div>
    </div>
  );
}

function StampGauge({ pct, size = 118 }) {
  const clamped = Math.max(0, Math.min(100, pct));
  const angle = (clamped / 100) * 360;
  const color = clamped >= 85 ? "#1E7A46" : clamped >= 60 ? "#B4750E" : "#B5333D";
  return (
    <div className="relative flex items-center justify-center rounded-full" style={{ width: size, height: size, background: `conic-gradient(${color} ${angle}deg, #E7E9EC ${angle}deg)` }}>
      <div className="absolute rounded-full flex flex-col items-center justify-center border-2 border-dashed" style={{ width: size - 18, height: size - 18, background: "#fff", borderColor: color }}>
        <span className="text-2xl font-black" style={{ color }}>{clamped}%</span>
        <span className="text-[9px] font-bold tracking-widest uppercase" style={{ color }}>Resultado</span>
      </div>
    </div>
  );
}

function Metric({ label, value, icon: Icon, primary }) {
  return (
    <div className="bg-white rounded-xl p-3 min-h-[92px] flex flex-col justify-between">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-bold text-gray-400 uppercase leading-tight">{label}</span>
        <Icon size={16} color={primary} />
      </div>
      <p className="text-2xl font-black text-gray-800 leading-none">{value}</p>
    </div>
  );
}

function SimpleList({ title, items, empty }) {
  return (
    <div className="bg-white rounded-xl p-3">
      <h3 className="font-bold text-sm mb-2" style={{ fontFamily: "Oswald, sans-serif" }}>{title}</h3>
      {items.length === 0 ? <p className="text-xs text-gray-400">{empty}</p> : (
        <div className="space-y-1.5">
          {items.map((item) => <p key={item} className="text-xs text-gray-600 bg-gray-50 rounded-md px-2 py-1.5">{item}</p>)}
        </div>
      )}
    </div>
  );
}

export default function TalentoHumanoView({
  colaboradores, evaluaciones, planes, capacitaciones, certificaciones,
  usuarios, areas, currentUser, primary, accent, config,
  onColaboradores, onEvaluaciones, onPlanes, onCapacitaciones, onCertificaciones, onConfig,
}) {
  const [sub, setSub] = useState("dashboard");

  const stats = useMemo(() => {
    const active = colaboradores.filter(isActiveCollaborator);
    const statPeople = colaboradores.filter((c) => includeInStats(c, config?.inactiveStatsMonths || 6));
    const latest = statPeople.map((c) => ({ c, last: latestEvaluation(c.id, evaluaciones) }));
    const evaluated = latest.filter((x) => x.last).length;
    const average = evaluated ? Math.round(latest.reduce((sum, x) => sum + (x.last?.resultado?.percentage || 0), 0) / evaluated) : 0;
    return {
      total: active.length,
      evaluated,
      pending: Math.max(active.length - active.filter((c) => latestEvaluation(c.id, evaluaciones)).length, 0),
      average,
      outstanding: latest.filter((x) => (x.last?.resultado?.percentage || 0) >= 95).length,
      improvement: planes.filter((p) => p.estado !== "Cerrado").length,
      expiring: certificaciones.filter((c) => daysUntil(c.vencimiento) >= 0 && daysUntil(c.vencimiento) <= 30).length,
    };
  }, [colaboradores, evaluaciones, planes, certificaciones]);

  const subs = [
    { id: "dashboard", label: "Dashboard" },
    { id: "colaboradores", label: "Colaboradores" },
    { id: "evaluaciones", label: "Evaluaciones" },
    { id: "planes", label: "Planes" },
    { id: "capacitaciones", label: "Capacitaciones" },
    { id: "indicadores", label: "Indicadores" },
    { id: "plantillas", label: "Plantillas" },
  ];

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-xl p-3">
        <div className="flex items-center gap-2">
          <BriefcaseBusiness size={20} color={primary} />
          <div>
            <h2 className="text-base font-black text-gray-800 m-0" style={{ fontFamily: "Oswald, sans-serif" }}>Gestion del Talento Humano</h2>
            <p className="text-xs text-gray-400">Evaluaciones, competencias, desarrollo y certificaciones.</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-2 flex gap-1.5 overflow-x-auto">
        {subs.map((s) => (
          <button key={s.id} onClick={() => setSub(s.id)} className="px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap" style={{ background: sub === s.id ? primary : "#F1F3F4", color: sub === s.id ? "#fff" : "#5C6673" }}>
            {s.label}
          </button>
        ))}
      </div>

      {sub === "dashboard" && <Dashboard stats={stats} colaboradores={colaboradores} evaluaciones={evaluaciones} planes={planes} certificaciones={certificaciones} primary={primary} accent={accent} />}
      {sub === "colaboradores" && <Colaboradores colaboradores={colaboradores} evaluaciones={evaluaciones} certificaciones={certificaciones} areas={areas} usuarios={usuarios} primary={primary} onColaboradores={onColaboradores} onCertificaciones={onCertificaciones} />}
      {sub === "evaluaciones" && <Evaluaciones colaboradores={colaboradores} evaluaciones={evaluaciones} planes={planes} currentUser={currentUser} primary={primary} config={config} onEvaluaciones={onEvaluaciones} onPlanes={onPlanes} />}
      {sub === "planes" && <Planes planes={planes} colaboradores={colaboradores} primary={primary} onPlanes={onPlanes} />}
      {sub === "capacitaciones" && <Capacitaciones capacitaciones={capacitaciones} colaboradores={colaboradores} primary={primary} onCapacitaciones={onCapacitaciones} />}
      {sub === "indicadores" && <Indicadores colaboradores={colaboradores} evaluaciones={evaluaciones} planes={planes} capacitaciones={capacitaciones} certificaciones={certificaciones} primary={primary} />}
      {sub === "plantillas" && <Plantillas config={config} primary={primary} onConfig={onConfig} />}
    </div>
  );
}

function Dashboard({ stats, colaboradores, evaluaciones, planes, certificaciones, primary, accent }) {
  const byArea = useMemo(() => {
    const map = {};
    evaluaciones.forEach((e) => {
      const col = colaboradores.find((c) => c.id === e.colaboradorId);
      const area = col?.area || "Sin area";
      if (!map[area]) map[area] = { area, total: 0, count: 0 };
      map[area].total += e.resultado?.percentage || 0;
      map[area].count += 1;
    });
    return Object.values(map).map((x) => ({ area: x.area, promedio: Math.round(x.total / x.count) }));
  }, [colaboradores, evaluaciones]);

  const trend = evaluaciones.slice().sort((a, b) => new Date(a.fecha) - new Date(b.fecha)).slice(-10).map((e) => ({ fecha: fmtFecha(e.fecha), promedio: e.resultado?.percentage || 0 }));
  const expiring = certificaciones.filter((c) => daysUntil(c.vencimiento) <= 45).sort((a, b) => daysUntil(a.vencimiento) - daysUntil(b.vencimiento)).slice(0, 5);
  const topPeople = colaboradores.filter(isActiveCollaborator).map((c) => ({ ...c, score: latestEvaluation(c.id, evaluaciones)?.resultado?.percentage || 0 })).filter((c) => c.score >= 85).sort((a, b) => b.score - a.score).slice(0, 5);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Metric label="Colaboradores" value={stats.total} icon={Users} primary={primary} />
        <Metric label="Evaluados" value={stats.evaluated} icon={ClipboardCheck} primary={primary} />
        <Metric label="Pendientes" value={stats.pending} icon={AlertTriangle} primary={primary} />
        <Metric label="Promedio" value={`${stats.average}%`} icon={BarChart3} primary={primary} />
        <Metric label="Destacados" value={stats.outstanding} icon={Award} primary={primary} />
        <Metric label="En mejora" value={stats.improvement} icon={ShieldCheck} primary={primary} />
        <Metric label="Vencimientos" value={stats.expiring} icon={CalendarClock} primary={primary} />
        <Metric label="Evaluaciones" value={evaluaciones.length} icon={FileText} primary={primary} />
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div className="bg-white rounded-xl p-3">
          <h3 className="font-bold text-sm mb-2" style={{ fontFamily: "Oswald, sans-serif" }}>Promedio por area</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byArea}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="area" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="promedio" fill={primary} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white rounded-xl p-3">
          <h3 className="font-bold text-sm mb-2" style={{ fontFamily: "Oswald, sans-serif" }}>Tendencia historica</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="fecha" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Line type="monotone" dataKey="promedio" stroke={accent} strokeWidth={2} dot />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        <SimpleList title="Personal destacado" empty="Sin destacados todavia" items={topPeople.map((p) => `${p.nombre} · ${p.score}%`)} />
        <SimpleList title="Planes activos" empty="Sin planes activos" items={planes.filter((p) => p.estado !== "Cerrado").slice(0, 5).map((p) => `${p.colaboradorNombre} · ${p.estado}`)} />
        <SimpleList title="Certificaciones proximas" empty="Sin alertas" items={expiring.map((c) => `${c.colaboradorNombre} · ${c.tipo} · ${c.vencimiento}`)} />
      </div>
    </div>
  );
}

function Colaboradores({ colaboradores, evaluaciones, certificaciones, areas, usuarios, primary, onColaboradores, onCertificaciones }) {
  const blank = { nombre: "", documento: "", cargo: "", area: areas[0]?.nombre || "", areas: areas[0]?.nombre ? [areas[0].nombre] : [], fechaIngreso: dateOnly(new Date()), estado: "Activo", inactiveDate: "", supervisor: "", foto: null };
  const [form, setForm] = useState(blank);
  const [editId, setEditId] = useState(null);
  const [detail, setDetail] = useState(null);

  const save = () => {
    if (!form.nombre.trim()) return;
    const payload = {
      ...form,
      nombre: form.nombre.trim(),
      documento: form.documento.trim(),
      rol: form.cargo,
      areas: form.area ? [form.area] : [],
      inactiveDate: form.estado === "Inactivo" || form.estado === "Retirado" ? (form.inactiveDate || dateOnly(new Date())) : "",
    };
    if (editId) {
      onColaboradores(colaboradores.map((c) => c.id === editId ? { ...c, ...payload } : c));
      setEditId(null);
    } else {
      onColaboradores([{ id: genId(), ...payload }, ...colaboradores]);
    }
    setForm(blank);
  };

  const startEdit = (colaborador) => {
    setForm({
      nombre: colaborador.nombre || "",
      documento: colaborador.documento || "",
      cargo: colaborador.cargo || colaborador.rol || "",
      area: colaborador.area || colaborador.areas?.[0] || "",
      areas: colaborador.areas || (colaborador.area ? [colaborador.area] : []),
      fechaIngreso: colaborador.fechaIngreso || "",
      estado: colaborador.estado || "Activo",
      inactiveDate: colaborador.inactiveDate || "",
      supervisor: colaborador.supervisor || "",
      foto: colaborador.foto || null,
    });
    setEditId(colaborador.id);
  };

  const handlePhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setForm({ ...form, foto: await resizeImageToDataUrl(file, 320) });
  };

  const archived = colaboradores.filter((c) => !isActiveCollaborator(c));
  const reactivate = (id) => {
    onColaboradores(colaboradores.map((c) => c.id === id ? { ...c, estado: "Activo", inactiveDate: "" } : c));
  };

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-xl p-3 space-y-2">
        <h3 className="font-bold text-sm flex items-center gap-1.5" style={{ fontFamily: "Oswald, sans-serif" }}><UserPlus size={15} /> Base unica de personal</h3>
        <div className="grid sm:grid-cols-2 gap-2">
          <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Nombre completo" className="border rounded-md px-3 py-2 text-sm" />
          <input value={form.documento} onChange={(e) => setForm({ ...form, documento: e.target.value })} placeholder="Documento" className="border rounded-md px-3 py-2 text-sm" />
          <input value={form.cargo} onChange={(e) => setForm({ ...form, cargo: e.target.value })} placeholder="Cargo" className="border rounded-md px-3 py-2 text-sm" />
          <select value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value, areas: e.target.value ? [e.target.value] : [] })} className="border rounded-md px-3 py-2 text-sm">
            <option value="">Sin area</option>
            {areas.map((a) => <option key={a.id} value={a.nombre}>{a.nombre}</option>)}
          </select>
          <input type="date" value={form.fechaIngreso} onChange={(e) => setForm({ ...form, fechaIngreso: e.target.value })} className="border rounded-md px-3 py-2 text-sm" />
          <select value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })} className="border rounded-md px-3 py-2 text-sm">
            <option>Activo</option>
            <option>En entrenamiento</option>
            <option>Inactivo</option>
            <option>Retirado</option>
          </select>
          <select value={form.supervisor} onChange={(e) => setForm({ ...form, supervisor: e.target.value })} className="border rounded-md px-3 py-2 text-sm">
            <option value="">Supervisor</option>
            {usuarios.map((u) => <option key={u.id} value={u.nombre}>{u.nombre}</option>)}
          </select>
          <label className="border rounded-md px-3 py-2 text-sm flex items-center justify-center gap-2 cursor-pointer">
            <ImagePlus size={15} /> {form.foto ? "Cambiar foto" : "Foto opcional"}
            <input type="file" accept="image/*" capture="environment" onChange={handlePhoto} className="hidden" />
          </label>
        </div>
        <div className="flex gap-2">
          <button onClick={save} className="flex-1 py-2 rounded-md font-bold text-white text-sm" style={{ background: primary }}>{editId ? "Guardar cambios" : "Agregar colaborador"}</button>
          {editId && <button onClick={() => { setEditId(null); setForm(blank); }} className="px-3 py-2 rounded-md font-bold text-sm border">Cancelar</button>}
        </div>
      </div>

      {colaboradores.filter(isActiveCollaborator).map((c) => {
        const last = latestEvaluation(c.id, evaluaciones);
        return (
          <div key={c.id} className="bg-white rounded-xl p-3 flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center flex-shrink-0">
              {c.foto ? <img src={c.foto} className="w-full h-full object-cover" alt="" /> : <Users size={20} className="text-gray-300" />}
            </div>
            <button onClick={() => setDetail(c)} className="flex-1 text-left min-w-0">
              <p className="font-bold text-sm truncate">{c.nombre}</p>
              <p className="text-xs text-gray-400 truncate">{c.cargo || c.rol || "Sin cargo"} · {c.area || c.areas?.[0] || "Sin area"} · ID {c.id.slice(0, 8)}</p>
              <p className="text-xs text-gray-500">{last ? `Ultima evaluacion: ${last.resultado.percentage}%` : "Sin evaluaciones"}</p>
            </button>
            <button onClick={() => startEdit(c)} className="text-gray-500"><Pencil size={16} /></button>
            <button
              onClick={() => window.confirm("Inactivar y archivar este colaborador?") && onColaboradores(colaboradores.map((x) => x.id === c.id ? { ...x, estado: "Inactivo", inactiveDate: dateOnly(new Date()) } : x))}
              className="text-red-500"
              title="Inactivar"
            >
              <Trash2 size={16} />
            </button>
          </div>
        );
      })}

      <div className="bg-white rounded-xl p-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-sm" style={{ fontFamily: "Oswald, sans-serif" }}>Archivados</h3>
            <p className="text-xs text-gray-400">Colaboradores inactivos o retirados. Permanecen guardados con su historial.</p>
          </div>
          <Badge color="#5C6673" bg="#EAECEF">{archived.length}</Badge>
        </div>

        {archived.length === 0 ? (
          <p className="text-xs text-gray-400 mt-3">No hay colaboradores archivados.</p>
        ) : (
          <div className="space-y-2 mt-3">
            {archived.map((c) => (
              <div key={c.id} className="border border-gray-100 rounded-lg p-3 flex items-center justify-between gap-3">
                <button onClick={() => setDetail(c)} className="text-left min-w-0 flex-1">
                  <p className="font-bold text-sm truncate">{c.nombre}</p>
                  <p className="text-xs text-gray-400 truncate">
                    {c.estado} · {c.inactiveDate ? `Desde ${c.inactiveDate}` : "Sin fecha"} · {c.cargo || c.rol || "Sin cargo"}
                  </p>
                </button>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => startEdit(c)} className="px-2.5 py-1 rounded-md text-xs font-bold border" style={{ borderColor: primary, color: primary }}>
                    Editar
                  </button>
                  <button onClick={() => reactivate(c.id)} className="px-2.5 py-1 rounded-md text-xs font-bold text-white" style={{ background: primary }}>
                    Reactivar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {detail && (
        <CollaboratorDetail
          colaborador={detail}
          evaluaciones={evaluaciones.filter((e) => e.colaboradorId === detail.id)}
          certificaciones={certificaciones.filter((c) => c.colaboradorId === detail.id)}
          onClose={() => setDetail(null)}
          onAddCert={(cert) => onCertificaciones([{ id: genId(), colaboradorId: detail.id, colaboradorNombre: detail.nombre, ...cert }, ...certificaciones])}
          primary={primary}
        />
      )}
    </div>
  );
}

function CollaboratorDetail({ colaborador, evaluaciones, certificaciones, onClose, onAddCert, primary }) {
  const [cert, setCert] = useState({ tipo: CERT_TYPES[0], vencimiento: "", alertaDias: 30, notas: "" });
  return (
    <Modal title={colaborador.nombre} onClose={onClose} wide>
      <div className="text-sm text-gray-600 space-y-1">
        <p><b>ID:</b> {colaborador.id}</p>
        <p><b>Documento:</b> {colaborador.documento || "Sin documento"}</p>
        <p><b>Cargo:</b> {colaborador.cargo || colaborador.rol || "Sin cargo"}</p>
        <p><b>Area:</b> {colaborador.area || colaborador.areas?.[0] || "Sin area"}</p>
        <p><b>Supervisor:</b> {colaborador.supervisor || "Sin supervisor"}</p>
      </div>

      <h4 className="font-bold text-sm mt-4 mb-2" style={{ fontFamily: "Oswald, sans-serif" }}>Historial de evaluaciones</h4>
      <div className="space-y-2">
        {evaluaciones.length === 0 && <p className="text-xs text-gray-400">Sin evaluaciones registradas.</p>}
        {evaluaciones.slice().sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).map((e) => (
          <div key={e.id} className="border rounded-lg p-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold">{e.tipo === "ingreso" ? "Ingreso" : `Desempeno ${e.periodicidad}`}</p>
              <Badge color={e.resultado.percentage >= 75 ? "#1E7A46" : "#B5333D"} bg={e.resultado.percentage >= 75 ? "#E4F4EA" : "#FBE7E8"}>{e.resultado.percentage}%</Badge>
            </div>
            <p className="text-xs text-gray-400">{fmtFecha(e.fecha)} · {e.resultado.level} · {e.resultado.recommendation}</p>
          </div>
        ))}
      </div>

      <h4 className="font-bold text-sm mt-4 mb-2" style={{ fontFamily: "Oswald, sans-serif" }}>Certificaciones</h4>
      <div className="space-y-2">
        {certificaciones.map((c) => (
          <div key={c.id} className="bg-gray-50 rounded-md px-2 py-1.5 text-xs flex items-center justify-between gap-2">
            <span>{c.tipo} · vence {c.vencimiento}</span>
            <Badge color={daysUntil(c.vencimiento) <= 30 ? "#B4750E" : "#1E7A46"} bg={daysUntil(c.vencimiento) <= 30 ? "#FCF1DC" : "#E4F4EA"}>{daysUntil(c.vencimiento)} dias</Badge>
          </div>
        ))}
        <div className="grid sm:grid-cols-4 gap-2">
          <select value={cert.tipo} onChange={(e) => setCert({ ...cert, tipo: e.target.value })} className="border rounded-md px-2 py-1.5 text-sm">
            {CERT_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
          <input type="date" value={cert.vencimiento} onChange={(e) => setCert({ ...cert, vencimiento: e.target.value })} className="border rounded-md px-2 py-1.5 text-sm" />
          <input value={cert.notas} onChange={(e) => setCert({ ...cert, notas: e.target.value })} placeholder="Notas" className="border rounded-md px-2 py-1.5 text-sm" />
          <button onClick={() => cert.vencimiento && onAddCert(cert)} className="rounded-md text-white text-sm font-bold" style={{ background: primary }}>Agregar</button>
        </div>
      </div>
    </Modal>
  );
}

function Evaluaciones({ colaboradores, evaluaciones, planes, currentUser, primary, config, onEvaluaciones, onPlanes }) {
  const [type, setType] = useState("ingreso");
  const [colaboradorId, setColaboradorId] = useState(colaboradores[0]?.id || "");
  const [periodicidad, setPeriodicidad] = useState(REVIEW_PERIODS[0]);
  const [criteria, setCriteria] = useState(() => criteriaFor("ingreso", config));
  const [generalNotes, setGeneralNotes] = useState("");
  const [saved, setSaved] = useState(null);
  const colaborador = colaboradores.find((c) => c.id === colaboradorId);
  const result = calculateResult(criteria);

  const grouped = getTemplate(config)
    .filter((section) => type === "desempeno" || !section.performanceOnly)
    .map((section) => ({ ...section, criteria: criteria.filter((c) => c.group === section.group) }));

  const changeType = (next) => {
    setType(next);
    setCriteria(criteriaFor(next, config));
  };

  const save = () => {
    if (!colaborador) return;
    const evaluation = {
      id: genId(),
      tipo: type,
      periodicidad: type === "desempeno" ? periodicidad : "Ingreso",
      fecha: todayISO(),
      colaboradorId: colaborador.id,
      colaboradorNombre: colaborador.nombre,
      evaluador: currentUser.nombre,
      criteria,
      resultado: result,
      observaciones: generalNotes,
    };
    onEvaluaciones([evaluation, ...evaluaciones]);
    if (result.percentage < 75) {
      onPlanes([{
        id: genId(),
        evaluationId: evaluation.id,
        colaboradorId: colaborador.id,
        colaboradorNombre: colaborador.nombre,
        hallazgos: criteria.filter((c) => Number(c.score) <= 2).map((c) => `${c.group}: ${c.text}`).join("; ") || "Resultado inferior al limite definido",
        acciones: "Definir entrenamiento y seguimiento operativo.",
        responsable: colaborador.supervisor || currentUser.nombre,
        fechaCompromiso: dateOnly(new Date(Date.now() + 15 * 86400000)),
        fechaCierre: "",
        estado: "Abierto",
        evidencias: [],
      }, ...planes]);
    }
    setSaved(evaluation);
    setCriteria(criteriaFor(type, config));
    setGeneralNotes("");
  };

  const deleteEvaluation = (id) => {
    if (!window.confirm("Eliminar esta evaluacion?")) return;
    onEvaluaciones(evaluaciones.filter((e) => e.id !== id));
    onPlanes(planes.filter((p) => p.evaluationId !== id));
  };

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-xl p-3 space-y-2">
        <div className="grid sm:grid-cols-3 gap-2">
          <select value={type} onChange={(e) => changeType(e.target.value)} className="border rounded-md px-3 py-2 text-sm">
            <option value="ingreso">Evaluacion tecnica de ingreso</option>
            <option value="desempeno">Evaluacion de desempeno</option>
          </select>
          <select value={colaboradorId} onChange={(e) => setColaboradorId(e.target.value)} className="border rounded-md px-3 py-2 text-sm">
            <option value="">Selecciona colaborador</option>
            {colaboradores.filter(isActiveCollaborator).map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
          <select value={periodicidad} onChange={(e) => setPeriodicidad(e.target.value)} disabled={type !== "desempeno"} className="border rounded-md px-3 py-2 text-sm disabled:opacity-40">
            {REVIEW_PERIODS.map((p) => <option key={p}>{p}</option>)}
          </select>
        </div>
        <div className="grid sm:grid-cols-[140px_1fr] gap-3 items-center">
          <StampGauge pct={result.percentage} />
          <div className="text-sm text-gray-600">
            <p><b>Puntaje:</b> {result.total} / {result.max}</p>
            <p><b>Nivel:</b> {result.level}</p>
            <p><b>Recomendacion:</b> {result.recommendation}</p>
          </div>
        </div>
      </div>

      {grouped.map((section) => (
        <div key={section.group} className="bg-white rounded-xl p-3">
          <h3 className="font-bold text-sm mb-2" style={{ fontFamily: "Oswald, sans-serif" }}>{section.group}</h3>
          <div className="space-y-2">
            {section.criteria.map((c) => (
              <CriterionRow key={c.id} criterion={c} onChange={(id, patch) => setCriteria(criteria.map((item) => item.id === id ? { ...item, ...patch } : item))} />
            ))}
          </div>
        </div>
      ))}

      <div className="bg-white rounded-xl p-3 space-y-2">
        <textarea value={generalNotes} onChange={(e) => setGeneralNotes(e.target.value)} rows={3} placeholder="Observaciones generales" className="w-full border rounded-md px-3 py-2 text-sm" />
        <button onClick={save} disabled={!colaborador} className="w-full py-2.5 rounded-md font-bold text-white flex items-center justify-center gap-2 disabled:opacity-40" style={{ background: primary }}>
          <Save size={16} /> Guardar evaluacion
        </button>
        {saved && <p className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-md px-2 py-1.5">Evaluacion guardada para {saved.colaboradorNombre}. {saved.resultado.percentage < 75 ? "Se creo plan de mejora automatico." : ""}</p>}
      </div>

      <div className="bg-white rounded-xl p-3">
        <h3 className="font-bold text-sm mb-2" style={{ fontFamily: "Oswald, sans-serif" }}>Historial de evaluaciones</h3>
        {evaluaciones.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-6">Sin evaluaciones registradas.</p>
        ) : (
          <div className="space-y-2">
            {evaluaciones.slice().sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).map((e) => (
              <div key={e.id} className="border border-gray-100 rounded-lg p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-bold text-sm truncate">{e.colaboradorNombre}</p>
                    <p className="text-xs text-gray-400">{e.tipo === "ingreso" ? "Ingreso" : `Desempeno ${e.periodicidad}`} · {fmtFecha(e.fecha)}</p>
                    <p className="text-xs text-gray-500 mt-1">{e.resultado?.level} · {e.resultado?.recommendation}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <Badge color={(e.resultado?.percentage || 0) >= 75 ? "#1E7A46" : "#B5333D"} bg={(e.resultado?.percentage || 0) >= 75 ? "#E4F4EA" : "#FBE7E8"}>{e.resultado?.percentage || 0}%</Badge>
                    <button onClick={() => deleteEvaluation(e.id)} className="px-2.5 py-1 rounded-md bg-red-500 text-white text-xs font-bold flex items-center gap-1">
                      <Trash2 size={12} /> Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CriterionRow({ criterion, onChange }) {
  const handleEvidence = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    onChange(criterion.id, { evidence: await resizeImageToDataUrl(file, 420) });
  };
  return (
    <div className="border border-gray-100 rounded-lg p-2">
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
        <p className="flex-1 text-sm text-gray-700">{criterion.text}</p>
        <select value={criterion.score} onChange={(e) => onChange(criterion.id, { score: Number(e.target.value) })} className="border rounded-md px-2 py-1.5 text-sm">
          {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>
      <div className="grid sm:grid-cols-[1fr_150px] gap-2 mt-2">
        <input value={criterion.observation} onChange={(e) => onChange(criterion.id, { observation: e.target.value })} placeholder="Observaciones" className="border rounded-md px-2 py-1.5 text-sm" />
        <label className="border rounded-md px-2 py-1.5 text-xs font-bold flex items-center justify-center gap-1 cursor-pointer">
          <ImagePlus size={13} /> Camara / archivo
          <input type="file" accept="image/*" capture="environment" onChange={handleEvidence} className="hidden" />
        </label>
      </div>
    </div>
  );
}

function Planes({ planes, colaboradores, primary, onPlanes }) {
  const update = (id, patch) => onPlanes(planes.map((p) => p.id === id ? { ...p, ...patch } : p));
  return (
    <div className="space-y-2">
      {planes.length === 0 && <p className="text-center text-sm text-gray-400 py-8">Sin planes de mejora.</p>}
      {planes.map((p) => (
        <div key={p.id} className="bg-white rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="font-bold text-sm">{p.colaboradorNombre}</p>
              <p className="text-xs text-gray-400">{colaboradores.find((c) => c.id === p.colaboradorId)?.area || "Sin area"}</p>
            </div>
            <select value={p.estado} onChange={(e) => update(p.id, { estado: e.target.value })} className="border rounded-md px-2 py-1.5 text-xs font-bold">
              <option>Abierto</option>
              <option>En seguimiento</option>
              <option>Cerrado</option>
            </select>
          </div>
          <textarea value={p.hallazgos} onChange={(e) => update(p.id, { hallazgos: e.target.value })} className="w-full border rounded-md px-2 py-1.5 text-sm" rows={2} placeholder="Hallazgos" />
          <textarea value={p.acciones} onChange={(e) => update(p.id, { acciones: e.target.value })} className="w-full border rounded-md px-2 py-1.5 text-sm" rows={2} placeholder="Acciones" />
          <div className="grid sm:grid-cols-3 gap-2">
            <input value={p.responsable} onChange={(e) => update(p.id, { responsable: e.target.value })} placeholder="Responsable" className="border rounded-md px-2 py-1.5 text-sm" />
            <input type="date" value={p.fechaCompromiso} onChange={(e) => update(p.id, { fechaCompromiso: e.target.value })} className="border rounded-md px-2 py-1.5 text-sm" />
            <input type="date" value={p.fechaCierre} onChange={(e) => update(p.id, { fechaCierre: e.target.value, estado: e.target.value ? "Cerrado" : p.estado })} className="border rounded-md px-2 py-1.5 text-sm" />
          </div>
          <button onClick={() => update(p.id, { estado: "Cerrado", fechaCierre: dateOnly(new Date()) })} className="px-3 py-1.5 rounded-md text-xs font-bold text-white" style={{ background: primary }}>Cerrar plan</button>
        </div>
      ))}
    </div>
  );
}

function Capacitaciones({ capacitaciones, colaboradores, primary, onCapacitaciones }) {
  const blank = { nombre: "", tema: "", instructor: "", fecha: dateOnly(new Date()), duracion: "", asistentes: [], evaluacion: "", certificado: "No" };
  const [form, setForm] = useState(blank);
  const toggle = (id) => setForm({ ...form, asistentes: form.asistentes.includes(id) ? form.asistentes.filter((x) => x !== id) : [...form.asistentes, id] });
  const save = () => {
    if (!form.nombre.trim()) return;
    const asistentes = colaboradores.filter((c) => form.asistentes.includes(c.id)).map((c) => ({ id: c.id, nombre: c.nombre }));
    onCapacitaciones([{ id: genId(), ...form, nombre: form.nombre.trim(), asistentes }, ...capacitaciones]);
    setForm(blank);
  };

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-xl p-3 space-y-2">
        <h3 className="font-bold text-sm flex items-center gap-1.5" style={{ fontFamily: "Oswald, sans-serif" }}><GraduationCap size={15} /> Registrar capacitacion</h3>
        <div className="grid sm:grid-cols-2 gap-2">
          <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Nombre de la capacitacion" className="border rounded-md px-3 py-2 text-sm" />
          <input value={form.tema} onChange={(e) => setForm({ ...form, tema: e.target.value })} placeholder="Tema" className="border rounded-md px-3 py-2 text-sm" />
          <input value={form.instructor} onChange={(e) => setForm({ ...form, instructor: e.target.value })} placeholder="Instructor" className="border rounded-md px-3 py-2 text-sm" />
          <input type="date" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} className="border rounded-md px-3 py-2 text-sm" />
          <input value={form.duracion} onChange={(e) => setForm({ ...form, duracion: e.target.value })} placeholder="Duracion" className="border rounded-md px-3 py-2 text-sm" />
          <select value={form.certificado} onChange={(e) => setForm({ ...form, certificado: e.target.value })} className="border rounded-md px-3 py-2 text-sm"><option>No</option><option>Si</option></select>
        </div>
        <textarea value={form.evaluacion} onChange={(e) => setForm({ ...form, evaluacion: e.target.value })} placeholder="Evaluacion de la capacitacion" rows={2} className="w-full border rounded-md px-3 py-2 text-sm" />
        <div className="flex flex-wrap gap-1.5">
          {colaboradores.filter(isActiveCollaborator).map((c) => <button key={c.id} type="button" onClick={() => toggle(c.id)} className="px-2.5 py-1 rounded-full text-xs font-semibold border" style={{ borderColor: form.asistentes.includes(c.id) ? primary : "#D8DCE1", background: form.asistentes.includes(c.id) ? primary : "#fff", color: form.asistentes.includes(c.id) ? "#fff" : "#5C6673" }}>{c.nombre}</button>)}
        </div>
        <button onClick={save} className="w-full py-2 rounded-md font-bold text-white text-sm" style={{ background: primary }}>Guardar capacitacion</button>
      </div>

      {capacitaciones.map((t) => (
        <div key={t.id} className="bg-white rounded-xl p-3">
          <div className="flex items-center justify-between gap-2">
            <div><p className="font-bold text-sm">{t.nombre}</p><p className="text-xs text-gray-400">{t.fecha} · {t.tema} · {t.instructor || "Sin instructor"}</p></div>
            <Badge color={t.certificado === "Si" ? "#1E7A46" : "#5C6673"} bg={t.certificado === "Si" ? "#E4F4EA" : "#EAECEF"}>{t.asistentes.length} asistentes</Badge>
          </div>
          <p className="text-xs text-gray-600 mt-2">{t.asistentes.map((a) => a.nombre).join(", ") || "Sin asistentes"}</p>
        </div>
      ))}
    </div>
  );
}

function Indicadores({ colaboradores, evaluaciones, planes, capacitaciones, certificaciones, primary }) {
  const latest = colaboradores.map((c) => ({ ...c, promedio: latestEvaluation(c.id, evaluaciones)?.resultado?.percentage || 0 })).sort((a, b) => b.promedio - a.promedio);

  const aggregate = (field) => {
    const map = {};
    evaluaciones.forEach((e) => {
      const c = colaboradores.find((x) => x.id === e.colaboradorId);
      const key = c?.[field] || "Sin dato";
      if (!map[key]) map[key] = { nombre: key, total: 0, count: 0 };
      map[key].total += e.resultado?.percentage || 0;
      map[key].count += 1;
    });
    return Object.values(map).map((x) => ({ nombre: x.nombre, promedio: Math.round(x.total / x.count) }));
  };

  const skills = {};
  evaluaciones.forEach((e) => e.criteria.forEach((c) => {
    if (!skills[c.text]) skills[c.text] = { text: c.text, total: 0, count: 0 };
    skills[c.text].total += Number(c.score || 0);
    skills[c.text].count += 1;
  }));
  const skillRanking = Object.values(skills).map((s) => ({ text: s.text, avg: s.total / s.count })).sort((a, b) => a.avg - b.avg);

  const compliance = evaluaciones.reduce((acc, e) => {
    const value = e.resultado?.percentage || 0;
    if (value >= 85) acc.cumple += 1;
    else if (value >= 70) acc.riesgo += 1;
    else acc.noCumple += 1;
    return acc;
  }, { cumple: 0, riesgo: 0, noCumple: 0 });

  const complianceData = [
    { name: "Cumple", value: compliance.cumple },
    { name: "Riesgo", value: compliance.riesgo },
    { name: "No cumple", value: compliance.noCumple },
  ];

  const exportExcel = () => {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(latest.map((c) => ({ Colaborador: c.nombre, Documento: c.documento, Cargo: c.cargo || c.rol, Area: c.area || c.areas?.[0], Supervisor: c.supervisor, Promedio: c.promedio }))), "Ranking");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(evaluaciones.map((e) => ({ Fecha: fmtFecha(e.fecha), Tipo: e.tipo, Periodicidad: e.periodicidad, Colaborador: e.colaboradorNombre, Evaluador: e.evaluador, Puntaje: e.resultado.total, Maximo: e.resultado.max, Porcentaje: e.resultado.percentage, Nivel: e.resultado.level, Recomendacion: e.resultado.recommendation }))), "Evaluaciones");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(planes), "Planes");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(capacitaciones.map((t) => ({ ...t, asistentes: t.asistentes.map((a) => a.nombre).join(", ") }))), "Capacitaciones");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(certificaciones), "Certificaciones");
    XLSX.writeFile(wb, "talento_humano_indicadores.xlsx", { bookType: "xlsx" });
  };

  const exportPdf = () => {
    const rows = latest.map((c) => `<tr><td>${c.nombre}</td><td>${c.cargo || c.rol || ""}</td><td>${c.area || c.areas?.[0] || ""}</td><td>${c.promedio}%</td></tr>`).join("");
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Reporte Talento Humano</title><style>body{font-family:Arial,sans-serif;padding:24px;color:#1f2937}table{width:100%;border-collapse:collapse}td,th{border:1px solid #ddd;padding:8px;font-size:12px}h1{font-size:22px}</style></head><body><h1>Reporte Gestion del Talento Humano</h1><p>Evaluaciones: ${evaluaciones.length} · Planes activos: ${planes.filter((p) => p.estado !== "Cerrado").length}</p><table><thead><tr><th>Colaborador</th><th>Cargo</th><th>Area</th><th>Promedio</th></tr></thead><tbody>${rows}</tbody></table></body></html>`);
    w.document.close();
    w.print();
  };

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-xl p-3 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
        <h3 className="font-bold text-sm" style={{ fontFamily: "Oswald, sans-serif" }}>Indicadores y reportes</h3>
        <div className="flex gap-2">
          <button onClick={exportExcel} className="flex-1 sm:flex-none px-3 py-2 rounded-md text-sm font-bold border flex items-center justify-center gap-1.5" style={{ borderColor: primary, color: primary }}><Download size={15} /> Excel</button>
          <button onClick={exportPdf} className="flex-1 sm:flex-none px-3 py-2 rounded-md text-sm font-bold text-white flex items-center justify-center gap-1.5" style={{ background: primary }}><FileText size={15} /> PDF</button>
        </div>
      </div>

      <div className="bg-white rounded-xl p-3">
        <h3 className="font-bold text-sm mb-2" style={{ fontFamily: "Oswald, sans-serif" }}>Estado de cumplimiento</h3>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={complianceData} dataKey="value" nameKey="name" outerRadius={70} label>
                {complianceData.map((entry, index) => <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <SimpleList title="Promedio por cargo" empty="Sin datos" items={aggregate("cargo").map((x) => `${x.nombre}: ${x.promedio}%`)} />
        <SimpleList title="Promedio por supervisor" empty="Sin datos" items={aggregate("supervisor").map((x) => `${x.nombre}: ${x.promedio}%`)} />
        <SimpleList title="Competencias mas debiles" empty="Sin datos" items={skillRanking.slice(0, 6).map((s) => `${s.text}: ${s.avg.toFixed(1)}/5`)} />
        <SimpleList title="Competencias mas fuertes" empty="Sin datos" items={skillRanking.slice(-6).reverse().map((s) => `${s.text}: ${s.avg.toFixed(1)}/5`)} />
      </div>

      <div className="bg-white rounded-xl p-3">
        <h3 className="font-bold text-sm mb-2" style={{ fontFamily: "Oswald, sans-serif" }}>Ranking de colaboradores</h3>
        <div className="space-y-1.5">
          {latest.map((c, idx) => (
            <div key={c.id} className="flex items-center justify-between bg-gray-50 rounded-md px-2 py-1.5">
              <p className="text-sm font-semibold truncate">{idx + 1}. {c.nombre}</p>
              <Badge color={c.promedio >= 75 ? "#1E7A46" : "#B5333D"} bg={c.promedio >= 75 ? "#E4F4EA" : "#FBE7E8"}>{c.promedio}%</Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Plantillas({ config, primary, onConfig }) {
  const [template, setTemplate] = useState(getTemplate(config));
  const updateItem = (group, index, value) => {
    setTemplate(template.map((section) => section.group === group ? {
      ...section,
      items: section.items.map((item, itemIndex) => itemIndex === index ? value : item),
    } : section));
  };
  const addItem = (group) => {
    setTemplate(template.map((section) => section.group === group ? { ...section, items: [...section.items, "Nuevo aspecto"] } : section));
  };
  const removeItem = (group, index) => {
    setTemplate(template.map((section) => section.group === group ? { ...section, items: section.items.filter((_, itemIndex) => itemIndex !== index) } : section));
  };
  const save = () => onConfig({ ...config, hrTemplate: template });

  return (
    <div className="space-y-3">
      {template.map((section) => (
        <div key={section.group} className="bg-white rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-sm" style={{ fontFamily: "Oswald, sans-serif" }}>{section.group}</h3>
            <button onClick={() => addItem(section.group)} className="px-2 py-1 rounded-md text-xs font-bold border" style={{ borderColor: primary, color: primary }}>Agregar aspecto</button>
          </div>
          <div className="space-y-1.5">
            {section.items.map((item, index) => (
              <div key={`${section.group}-${index}`} className="flex gap-2">
                <input value={item} onChange={(e) => updateItem(section.group, index, e.target.value)} className="flex-1 border rounded-md px-2 py-1.5 text-sm" />
                <button onClick={() => removeItem(section.group, index)} className="text-red-500"><Trash2 size={15} /></button>
              </div>
            ))}
          </div>
        </div>
      ))}
      <button onClick={save} className="w-full py-2.5 rounded-md font-bold text-white" style={{ background: primary }}>Guardar plantilla de evaluacion</button>
    </div>
  );
}
