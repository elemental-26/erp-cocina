import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle, Award, BarChart3, CalendarClock,
  ChevronRight, ClipboardCheck, Download, FileText, GraduationCap, ImagePlus, Pencil,
  Save, ShieldCheck, Trash2, UserPlus, Users, X,
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, LineChart, Line, PieChart, Pie, Cell,
} from "recharts";
import * as XLSX from "xlsx";

const DEFAULT_TEMPLATE = [
  { group: "Planeación", items: ["Lectura e interpretación del menú", "Comprensión de instrucciones", "Solicitud correcta de insumos"] },
  { group: "Organización", items: ["Mise en place", "Orden del puesto de trabajo", "Limpieza durante el proceso"] },
  { group: "Producción", items: ["Aprovechamiento de materias primas", "Optimización de recursos", "Técnicas de corte", "Porcionado", "Manipulación higiénica", "Uso correcto de equipos", "Cumplimiento de tiempos", "Calidad del producto", "Sabor", "Temperatura", "Presentación del plato"] },
  { group: "Competencias", items: ["Escucha instrucciones", "Comunicación", "Trabajo en equipo", "Actitud", "Responsabilidad", "Iniciativa", "Adaptabilidad"] },
  { group: "Finalización", items: ["Limpieza final", "Organización del área", "Entrega del puesto"] },
  { group: "Desempeño laboral", performanceOnly: true, items: ["Cumplimiento de metas", "Puntualidad y asistencia", "Servicio al cliente", "Cumplimiento de BPM", "Liderazgo operativo"] },
];

const SERVICE_TEMPLATE = [
  { group: "Atención al cliente", items: ["Saludo y bienvenida", "Escucha activa", "Amabilidad y lenguaje adecuado", "Manejo respetuoso de quejas", "Orientación clara al usuario"] },
  { group: "Operación de servicio", items: ["Conocimiento del menú o portafolio", "Agilidad en la atención", "Orden del punto de servicio", "Presentación personal", "Registro correcto de solicitudes"] },
  { group: "Comunicación", items: ["Comunica novedades a cocina o administración", "Trabajo coordinado con el equipo", "Confirma requerimientos especiales", "Evita discusiones frente al cliente"] },
  { group: "Cumplimiento", items: ["Puntualidad y asistencia", "Cumplimiento de protocolos", "Manejo higiénico durante el servicio", "Cuidado de equipos y elementos asignados"] },
  { group: "Mejora del servicio", performanceOnly: true, items: ["Seguimiento a clientes frecuentes", "Propuesta de mejoras", "Resolución preventiva de novedades", "Cumplimiento de metas de satisfacción"] },
];

const CERT_TYPES = ["Manipulacion de alimentos", "Examenes medicos", "Curso interno", "Certificacion obligatoria"];
const REVIEW_PERIODS = ["Mensual", "Trimestral", "Semestral", "Anual"];
const PIE_COLORS = ["#1E7A46", "#B4750E", "#B5333D"];
const MAX_EVIDENCE_PER_ITEM = 3;

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

function escapeHtml(value = "") {
  return value.toString()
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function storedErpName() {
  try {
    return JSON.parse(localStorage.getItem("qc_config") || "{}")?.nombre || "ERP";
  } catch {
    return "ERP";
  }
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

function evaluationTypeLabel(e) {
  return e.tipo === "ingreso" ? "Ingreso" : `Desempeño ${e.periodicidad || ""}`.trim();
}

function evaluationPercent(e) {
  const raw = e?.resultado?.percentage ?? e?.porcentaje ?? e?.cumplimiento ?? 0;
  const value = Number(raw);
  return Number.isFinite(value) ? Math.round(value) : 0;
}

function evaluationLevel(e) {
  return e?.resultado?.level || e?.nivel || "Sin nivel";
}

function evaluationRecommendation(e) {
  return e?.resultado?.recommendation || e?.recomendacion || "Sin recomendación";
}

function safeFilePart(value, fallback = "registro") {
  return (value || fallback).toString().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || fallback;
}

function normalizeEvidenceList(value) {
  if (Array.isArray(value)) return value.filter(Boolean).slice(0, MAX_EVIDENCE_PER_ITEM);
  return value ? [value].slice(0, MAX_EVIDENCE_PER_ITEM) : [];
}

function evidenceFromEvaluation(e) {
  return (e.criteria || []).flatMap((c) => normalizeEvidenceList(c.evidence).map((src, index) => ({
    title: `${c.group}: ${c.text}${normalizeEvidenceList(c.evidence).length > 1 ? ` (${index + 1})` : ""}`,
    src,
    observation: c.observation || "",
  })));
}

function openPrintDocument(title, html) {
  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 250);
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
  window.open(`https://wa.me/?text=${encodeURIComponent(`${text || title}\n\nEl archivo se descargó en la tablet. Adjuntalo desde WhatsApp si el navegador no permite enviarlo automaticamente.`)}`, "_blank");
}

function SignaturePad({ value, onChange, label }) {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const [open, setOpen] = useState(false);
  const point = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return { x: ((event.clientX - rect.left) / rect.width) * canvas.width, y: ((event.clientY - rect.top) / rect.height) * canvas.height };
  };
  const start = (event) => {
    event.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.setPointerCapture?.(event.pointerId);
    const ctx = canvas.getContext("2d");
    const p = point(event);
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
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    const p = point(event);
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

function CameraCaptureButton({ onCapture }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const stop = () => {
    streamRef.current?.getTracks?.().forEach((track) => track.stop());
    streamRef.current = null;
  };
  const close = () => {
    stop();
    setOpen(false);
    setError("");
  };

  useEffect(() => {
    if (!open) return undefined;
    let cancelled = false;
    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch {
        setError("No se pudo abrir la cámara. Revisa permisos del navegador o usa galería.");
      }
    };
    if (navigator.mediaDevices?.getUserMedia) start();
    else setError("Este navegador no permite cámara directa. Usa galería.");
    return () => {
      cancelled = true;
      stop();
    };
  }, [open]);

  const capture = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const canvas = document.createElement("canvas");
    const maxDim = 420;
    const ratio = Math.min(maxDim / video.videoWidth, maxDim / video.videoHeight, 1);
    canvas.width = Math.round(video.videoWidth * ratio);
    canvas.height = Math.round(video.videoHeight * ratio);
    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
    onCapture(canvas.toDataURL("image/png"));
    close();
  };

  return (
    <>
      <button type="button" className="file-icon-button" title="Tomar foto con cámara" aria-label="Tomar foto con cámara" onClick={() => setOpen(true)}>
        <ImagePlus size={18} />
      </button>
      {open && (
        <div style={{ position: "fixed", inset: 0, zIndex: 90, background: "rgba(15,23,42,0.74)", display: "flex", alignItems: "center", justifyContent: "center", padding: 12 }}>
          <div style={{ width: "min(92vw, 520px)", background: "#fff", borderRadius: 16, padding: 12, boxShadow: "0 24px 70px rgba(0,0,0,0.35)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 900, color: "#243040" }}>Tomar foto</p>
              <button type="button" onClick={close} style={{ border: 0, background: "#F1F3F4", borderRadius: 999, width: 38, height: 38, minHeight: 38, display: "inline-flex", alignItems: "center", justifyContent: "center" }}><X size={18} /></button>
            </div>
            <div style={{ width: "100%", aspectRatio: "4 / 3", background: "#111827", borderRadius: 12, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {error ? <p style={{ color: "#fff", padding: 16, textAlign: "center", fontSize: 14 }}>{error}</p> : <video ref={videoRef} playsInline muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 10 }}>
              <button type="button" onClick={close} style={{ border: "1px solid #D8DCE1", background: "#fff", borderRadius: 10, minHeight: 44, fontWeight: 800 }}>Cancelar</button>
              <button type="button" onClick={capture} disabled={!!error} style={{ border: 0, background: error ? "#9CA3AF" : "#1E7A46", color: "#fff", borderRadius: 10, minHeight: 44, fontWeight: 900 }}>Capturar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function EvidenceActions({ onChange, multiple = false, onCapture }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {onCapture && !multiple ? (
        <CameraCaptureButton onCapture={onCapture} />
      ) : (
        <label className="file-icon-button" title="Tomar foto" aria-label="Tomar foto">
          <ImagePlus size={18} />
          <input type="file" accept="image/*" capture="environment" multiple={multiple} onChange={onChange} className="hidden" />
        </label>
      )}
      <label className="file-icon-button" title="Galeria / archivo" aria-label="Galeria / archivo">
        <Download size={18} />
        <input type="file" accept="image/*" multiple={multiple} onChange={onChange} className="hidden" />
      </label>
    </div>
  );
}

function evaluationHtml(e, colaborador, plan, config) {
  const origin = config?.nombre || storedErpName();
  const font = printFontFamily(config);
  const criteriaRows = (e.criteria || []).map((c) => `
    <tr>
      <td>${escapeHtml(c.group)}</td>
      <td>${escapeHtml(c.text)}</td>
      <td>${escapeHtml(c.score)}</td>
      <td>${escapeHtml(c.observation || "")}</td>
    </tr>
  `).join("");
  const evidence = evidenceFromEvaluation(e).map((ev) => `
    <div class="photo">
      <img src="${ev.src}" />
      <p>${escapeHtml(ev.title)}</p>
      <small>${escapeHtml(ev.observation)}</small>
    </div>
  `).join("");
  const signature = (src, label) => src
    ? `<div class="firma signed"><img src="${src}" /><p>${label}</p></div>`
    : `<div class="firma">${label}</div>`;
  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>Evaluacion - ${escapeHtml(e.colaboradorNombre)}</title>
  <style>
    body{font-family:${font};color:#1f2937;margin:28px;line-height:1.4}
    h1{font-size:22px;margin:0 0 6px;text-transform:uppercase}
    h2{font-size:15px;margin:22px 0 8px}
    .origin{position:fixed;right:16px;top:12px;font-size:10px;color:#6b7280}
    .meta,.box{border:1px solid #d1d5db;border-radius:8px;padding:12px;margin:12px 0}
    .meta{display:grid;grid-template-columns:170px 1fr;gap:6px 14px}
    .label{font-weight:700;color:#4b5563}
    .score{font-size:34px;font-weight:800;color:${evaluationPercent(e) >= 75 ? "#1E7A46" : "#B5333D"}}
    table{width:100%;border-collapse:collapse;margin-top:8px}
    th,td{border:1px solid #ddd;padding:7px;font-size:12px;vertical-align:top}
    th{background:#f3f4f6}
    .photos{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}
    .photo{border:1px solid #ddd;border-radius:8px;padding:8px;break-inside:avoid}
    .photo img{max-width:100%;height:180px;object-fit:cover;border-radius:6px}
    .firmas{display:grid;grid-template-columns:1fr 1fr;gap:32px;margin-top:52px}
    .firma{border-top:1px solid #111827;padding-top:8px;text-align:center;min-height:90px}
    .signed{border:1px solid #d1d5db;border-radius:8px;padding:8px;border-top:1px solid #d1d5db}
    .signed img{width:100%;height:70px;object-fit:contain}
    .signed p{border-top:1px solid #111827;margin:6px 0 0;padding-top:5px}
    @media print{body{margin:16mm}.photo img{height:140px}}
    ${printWatermarkCss()}
  </style>
</head>
<body>
  ${printWatermarkHtml(config)}
  <div class="print-content">
  <div class="origin">Creado por ${escapeHtml(origin)}</div>
  <h1>Evaluacion de talento humano</h1>
  <p>Reporte individual generado desde ${escapeHtml(origin)}.</p>
  <div class="meta">
    <div class="label">Colaborador</div><div>${escapeHtml(e.colaboradorNombre)}</div>
    <div class="label">Documento</div><div>${escapeHtml(colaborador?.documento || "")}</div>
    <div class="label">Cargo</div><div>${escapeHtml(colaborador?.cargo || colaborador?.rol || "")}</div>
    <div class="label">Area</div><div>${escapeHtml(colaborador?.area || colaborador?.areas?.[0] || "")}</div>
    <div class="label">Fecha</div><div>${escapeHtml(fmtFecha(e.fecha))}</div>
    <div class="label">Tipo</div><div>${escapeHtml(evaluationTypeLabel(e))}</div>
    <div class="label">Perfil</div><div>${escapeHtml(e.perfil === "servicio" ? "Servicio al cliente" : "Cocina")}</div>
    <div class="label">Evaluador</div><div>${escapeHtml(e.evaluador || "")}</div>
  </div>
  <div class="box">
    <div class="score">${evaluationPercent(e)}%</div>
    <p><b>Nivel:</b> ${escapeHtml(evaluationLevel(e))}</p>
    <p><b>Recomendacion:</b> ${escapeHtml(evaluationRecommendation(e))}</p>
  </div>
  <h2>Observaciones generales</h2>
  <div class="box">${escapeHtml(e.observaciones || "Sin observaciones generales.")}</div>
  <h2>Detalle de criterios</h2>
  <table><thead><tr><th>Grupo</th><th>Criterio</th><th>Puntaje</th><th>Observacion</th></tr></thead><tbody>${criteriaRows}</tbody></table>
  <h2>Plan de mejora</h2>
  <div class="box">${plan ? `${escapeHtml(plan.hallazgos)}<br><b>Acciones:</b> ${escapeHtml(plan.acciones)}<br><b>Responsable:</b> ${escapeHtml(plan.responsable)}<br><b>Compromiso:</b> ${escapeHtml(plan.fechaCompromiso)}<br><b>Estado:</b> ${escapeHtml(plan.estado)}` : "No aplica."}</div>
  <h2>Registro fotografico</h2>
  ${evidence ? `<div class="photos">${evidence}</div>` : '<div class="box">Sin registro fotografico.</div>'}
  <div class="firmas">${signature(e.firmaColaborador, "Colaborador")}${signature(e.firmaEvaluador, "Evaluador")}</div>
  </div>
</body>
</html>`;
}

function accumulatedHtml(colaborador, evaluaciones, planes, config) {
  const origin = config?.nombre || storedErpName();
  const font = printFontFamily(config);
  const ordered = evaluaciones.slice().sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  const rows = ordered.map((e) => `
    <tr>
      <td>${escapeHtml(fmtFecha(e.fecha))}</td>
      <td>${escapeHtml(evaluationTypeLabel(e))}</td>
      <td>${escapeHtml(e.perfil === "servicio" ? "Servicio al cliente" : "Cocina")}</td>
      <td>${escapeHtml(e.evaluador || "")}</td>
      <td>${evaluationPercent(e)}%</td>
      <td>${escapeHtml(evaluationLevel(e))}</td>
      <td>${escapeHtml(e.observaciones || "")}</td>
    </tr>
  `).join("");
  const planRows = plansForColaborador(planes, colaborador.id).map((p) => `
    <tr><td>${escapeHtml(p.estado)}</td><td>${escapeHtml(p.hallazgos)}</td><td>${escapeHtml(p.acciones)}</td><td>${escapeHtml(p.responsable)}</td><td>${escapeHtml(p.fechaCompromiso)}</td></tr>
  `).join("");
  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8" /><title>Acumulado - ${escapeHtml(colaborador.nombre)}</title>
<style>body{font-family:${font};color:#1f2937;margin:28px;line-height:1.4}.origin{position:fixed;right:16px;top:12px;font-size:10px;color:#6b7280}h1{font-size:22px;margin:0 0 6px;text-transform:uppercase}h2{font-size:15px;margin:22px 0 8px}.box{border:1px solid #d1d5db;border-radius:8px;padding:12px;margin:12px 0}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:7px;font-size:12px;vertical-align:top}th{background:#f3f4f6}${printWatermarkCss()}</style>
</head><body>
${printWatermarkHtml(config)}
<div class="print-content">
<div class="origin">Creado por ${escapeHtml(origin)}</div>
<h1>Reporte acumulado de evaluaciones</h1>
<div class="box"><b>Colaborador:</b> ${escapeHtml(colaborador.nombre)}<br><b>Cargo:</b> ${escapeHtml(colaborador.cargo || colaborador.rol || "")}<br><b>Area:</b> ${escapeHtml(colaborador.area || colaborador.areas?.[0] || "")}<br><b>Total evaluaciones:</b> ${ordered.length}</div>
<h2>Evaluaciones con observaciones</h2>
<table><thead><tr><th>Fecha</th><th>Tipo</th><th>Perfil</th><th>Evaluador</th><th>Resultado</th><th>Nivel</th><th>Observaciones</th></tr></thead><tbody>${rows}</tbody></table>
<h2>Planes de mejora</h2>
${planRows ? `<table><thead><tr><th>Estado</th><th>Hallazgos</th><th>Acciones</th><th>Responsable</th><th>Compromiso</th></tr></thead><tbody>${planRows}</tbody></table>` : '<div class="box">Sin planes de mejora asociados.</div>'}
</div>
</body></html>`;
}

function plansForColaborador(planes, colaboradorId) {
  return (planes || []).filter((p) => p.colaboradorId === colaboradorId);
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

function getEvaluationTemplate(config, profile = "cocina") {
  if (profile === "servicio") return config?.hrServiceTemplate?.length ? config.hrServiceTemplate : SERVICE_TEMPLATE;
  return getTemplate(config);
}

function criteriaFor(type, config, profile = "cocina") {
  return getEvaluationTemplate(config, profile)
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

function normalizePersonName(value = "") {
  return value.toString().trim().toLowerCase();
}

function samePersonName(left, right) {
  const normalizedLeft = normalizePersonName(left);
  return normalizedLeft && normalizedLeft === normalizePersonName(right);
}

function personMatchesRecord(record, colaborador, idKeys = [], nameKeys = []) {
  if (!record || !colaborador) return false;
  if (idKeys.some((key) => record[key] && record[key] === colaborador.id)) return true;
  return nameKeys.some((key) => samePersonName(record[key], colaborador.nombre));
}

function trainingIncludesCollaborator(training, colaborador) {
  return (training?.asistentes || []).some((assistant) => {
    if (typeof assistant === "string") return assistant === colaborador.id || samePersonName(assistant, colaborador.nombre);
    return assistant?.id === colaborador.id || samePersonName(assistant?.nombre, colaborador.nombre);
  });
}

function inspectionIncludesCollaborator(inspeccion, colaborador) {
  if (personMatchesRecord(inspeccion, colaborador, ["responsableId"], ["responsableNombre", "responsable"])) return true;
  return (inspeccion?.epp || []).some((entry) => entry?.personaId === colaborador.id || samePersonName(entry?.personaNombre, colaborador.nombre));
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
    <div style={{ position: "fixed", inset: 0, zIndex: 80, background: "rgba(15,23,42,0.62)", display: "flex", alignItems: "center", justifyContent: "center", padding: 12 }}>
      <div style={{ width: "100%", maxWidth: wide ? 920 : 520, maxHeight: "90svh", background: "#fff", borderRadius: 16, display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 24px 70px rgba(0,0,0,0.35)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "12px 14px", borderBottom: "1px solid #E5E7EB" }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 900, color: "#243040", fontFamily: "inherit" }}>{title}</h3>
          <button onClick={onClose} style={{ border: 0, background: "#F1F3F4", borderRadius: 999, width: 40, height: 40, minHeight: 40, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><X size={20} /></button>
        </div>
        <div style={{ overflowY: "auto", padding: 14 }}>{children}</div>
      </div>
    </div>
  );
}

class DetailErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <Modal title="Detalle no disponible" onClose={this.props.onClose}>
        <div style={{ display: "grid", gap: 12, textAlign: "center" }}>
          <p style={{ margin: 0, color: "#475569", fontSize: 14, fontWeight: 800 }}>
            No fue posible abrir este detalle porque hay un registro antiguo incompleto. La información del colaborador permanece guardada.
          </p>
          <button type="button" onClick={this.props.onClose} style={{ minHeight: 44, border: 0, borderRadius: 12, background: "#1E7A46", color: "#fff", fontSize: 14, fontWeight: 900 }}>
            Volver a colaboradores
          </button>
        </div>
      </Modal>
    );
  }
}

function StampGauge({ pct, size = 118 }) {
  const clamped = Math.max(0, Math.min(100, pct));
  const color = clamped >= 85 ? "#1E7A46" : clamped >= 60 ? "#B4750E" : "#B5333D";
  const flameId = `flameGauge${size}${clamped}`;
  const gradientId = `flameFill${size}${clamped}`;
  const flamePath = "M50 5 C61 22 78 31 78 55 C78 78 64 94 50 98 C35 94 22 79 22 59 C22 43 31 31 42 20 C41 34 51 39 51 49 C60 40 59 23 50 5 Z";
  const y = 104 - (clamped * 0.99);
  return (
    <div style={{ width: size, minWidth: size, height: size, position: "relative", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto" }}>
      <svg viewBox="0 0 100 110" width={size} height={size} aria-hidden="true" style={{ display: "block", filter: "drop-shadow(0 12px 18px rgba(15,23,42,0.14))" }}>
        <defs>
          <clipPath id={flameId}>
            <path d={flamePath} />
          </clipPath>
          <linearGradient id={gradientId} x1="0" x2="0" y1="1" y2="0">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor={clamped >= 85 ? "#48B86F" : clamped >= 60 ? "#F2B84B" : "#E55555"} />
          </linearGradient>
        </defs>
        <path d={flamePath} fill="#F4F6F8" stroke="#D8DCE1" strokeWidth="3" />
        <g clipPath={`url(#${flameId})`}>
          <rect x="0" y={y} width="100" height={110 - y} fill={`url(#${gradientId})`} />
        </g>
        <path d={flamePath} fill="none" stroke={color} strokeWidth="3" />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", paddingTop: 16 }}>
        <span style={{ color, fontSize: size >= 118 ? 24 : 20, lineHeight: 1, fontWeight: 950 }}>{clamped}%</span>
        <span style={{ color, fontSize: 10, lineHeight: 1.1, fontWeight: 900, textTransform: "uppercase", letterSpacing: 0, marginTop: 4 }}>Resultado</span>
      </div>
    </div>
  );
}

function Metric({ label, value, icon: Icon, primary }) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #E6E9EE",
        borderRadius: 14,
        minHeight: 112,
        padding: "14px 10px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        boxShadow: "0 8px 20px rgba(15,23,42,0.06)",
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 999,
          background: `${primary}14`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 8,
        }}
      >
        <Icon size={17} color={primary} />
      </div>
      <p style={{ margin: 0, color: "#243040", fontSize: 30, lineHeight: 1, fontWeight: 900 }}>{value}</p>
      <span style={{ marginTop: 7, color: "#7C8795", fontSize: 13, lineHeight: 1.15, fontWeight: 800, textTransform: "uppercase" }}>{label}</span>
    </div>
  );
}

function SimpleList({ title, items, empty }) {
  return (
    <div className="talent-panel">
      <h3 className="talent-panel-title" style={{ fontFamily: "inherit" }}>{title}</h3>
      {items.length === 0 ? <div className="talent-empty">{empty}</div> : (
        <div className="space-y-1.5">
          {items.map((item) => <p key={item} className="talent-list-item">{item}</p>)}
        </div>
      )}
    </div>
  );
}

function RelatedBlock({ title, count, empty, children }) {
  return (
    <div className="collab-related-card">
      <div className="collab-related-head">
        <h4>{title}</h4>
        <span>{count}</span>
      </div>
      <div className="collab-related-body">
        {count ? children : <em>{empty}</em>}
      </div>
    </div>
  );
}

export default function TalentoHumanoView({
  colaboradores, evaluaciones, planes, capacitaciones, certificaciones,
  inspecciones = [], hallazgos = [], desviaciones = [],
  usuarios, areas, currentUser, primary, accent, config,
  onColaboradores, onEvaluaciones, onPlanes, onCapacitaciones, onCertificaciones, onConfig,
}) {
  const [sub, setSub] = useState("dashboard");

  const stats = useMemo(() => {
    const active = colaboradores.filter(isActiveCollaborator);
    const statPeople = colaboradores.filter((c) => includeInStats(c, config?.inactiveStatsMonths || 6));
    const latest = statPeople.map((c) => ({ c, last: latestEvaluation(c.id, evaluaciones) }));
    const evaluated = latest.filter((x) => x.last).length;
    const average = evaluated ? Math.round(latest.reduce((sum, x) => sum + evaluationPercent(x.last), 0) / evaluated) : 0;
    return {
      total: active.length,
      evaluated,
      pending: Math.max(active.length - active.filter((c) => latestEvaluation(c.id, evaluaciones)).length, 0),
      average,
      outstanding: latest.filter((x) => evaluationPercent(x.last) >= 95).length,
      improvement: planes.filter((p) => p.estado !== "Cerrado").length,
      expiring: certificaciones.filter((c) => daysUntil(c.vencimiento) >= 0 && daysUntil(c.vencimiento) <= 30).length,
    };
  }, [colaboradores, evaluaciones, planes, certificaciones, config?.inactiveStatsMonths]);

  const subs = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "colaboradores", label: "Colaboradores", icon: Users },
    { id: "evaluaciones", label: "Evaluaciones", icon: ClipboardCheck },
    { id: "historial", label: "Historial", icon: FileText },
    { id: "planes", label: "Planes", icon: ShieldCheck },
    { id: "capacitaciones", label: "Capacitaciones", icon: GraduationCap },
    { id: "indicadores", label: "Indicadores", icon: Award },
    { id: "plantillas", label: "Plantillas", icon: Pencil },
  ];

  return (
    <div className="talent-module-shell">
      <div className="talent-tabs">
        {subs.map((s) => {
          const Icon = s.icon;
          const active = sub === s.id;
          return (
          <button key={s.id} onClick={() => setSub(s.id)} className={`talent-tab ${active ? "active" : ""}`} style={active ? { background: primary, borderColor: primary } : undefined}>
            <Icon size={15} />
            <span>{s.label}</span>
          </button>
          );
        })}
      </div>

      {sub === "dashboard" && <Dashboard stats={stats} colaboradores={colaboradores} evaluaciones={evaluaciones} planes={planes} certificaciones={certificaciones} primary={primary} accent={accent} />}
      {sub === "colaboradores" && <Colaboradores colaboradores={colaboradores} evaluaciones={evaluaciones} planes={planes} capacitaciones={capacitaciones} certificaciones={certificaciones} inspecciones={inspecciones} hallazgos={hallazgos} desviaciones={desviaciones} areas={areas} usuarios={usuarios} primary={primary} config={config} onColaboradores={onColaboradores} onCertificaciones={onCertificaciones} />}
      {sub === "evaluaciones" && <Evaluaciones colaboradores={colaboradores} evaluaciones={evaluaciones} planes={planes} currentUser={currentUser} primary={primary} config={config} onEvaluaciones={onEvaluaciones} onPlanes={onPlanes} />}
      {sub === "historial" && <HistorialEvaluaciones colaboradores={colaboradores} evaluaciones={evaluaciones} planes={planes} primary={primary} config={config} onEvaluaciones={onEvaluaciones} onPlanes={onPlanes} />}
      {sub === "planes" && <Planes planes={planes} colaboradores={colaboradores} primary={primary} onPlanes={onPlanes} />}
      {sub === "capacitaciones" && <Capacitaciones capacitaciones={capacitaciones} colaboradores={colaboradores} primary={primary} onCapacitaciones={onCapacitaciones} />}
      {sub === "indicadores" && <Indicadores colaboradores={colaboradores} evaluaciones={evaluaciones} planes={planes} capacitaciones={capacitaciones} certificaciones={certificaciones} primary={primary} config={config} />}
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
      map[area].total += evaluationPercent(e);
      map[area].count += 1;
    });
    return Object.values(map).map((x) => ({ area: x.area, promedio: Math.round(x.total / x.count) }));
  }, [colaboradores, evaluaciones]);

  const trend = evaluaciones.slice().sort((a, b) => new Date(a.fecha) - new Date(b.fecha)).slice(-10).map((e) => ({ fecha: fmtFecha(e.fecha), promedio: evaluationPercent(e) }));
  const expiring = certificaciones.filter((c) => daysUntil(c.vencimiento) <= 45).sort((a, b) => daysUntil(a.vencimiento) - daysUntil(b.vencimiento)).slice(0, 5);
  const topPeople = colaboradores.filter(isActiveCollaborator).map((c) => ({ ...c, score: evaluationPercent(latestEvaluation(c.id, evaluaciones)) })).filter((c) => c.score >= 85).sort((a, b) => b.score - a.score).slice(0, 5);

  return (
    <div className="talent-dashboard">
      <div className="talent-metrics-grid">
        <Metric label="Colaboradores" value={stats.total} icon={Users} primary={primary} />
        <Metric label="Evaluados" value={stats.evaluated} icon={ClipboardCheck} primary={primary} />
        <Metric label="Pendientes" value={stats.pending} icon={AlertTriangle} primary={primary} />
        <Metric label="Promedio" value={`${stats.average}%`} icon={BarChart3} primary={primary} />
        <Metric label="Destacados" value={stats.outstanding} icon={Award} primary={primary} />
        <Metric label="En mejora" value={stats.improvement} icon={ShieldCheck} primary={primary} />
        <Metric label="Vencimientos" value={stats.expiring} icon={CalendarClock} primary={primary} />
        <Metric label="Evaluaciones" value={evaluaciones.length} icon={FileText} primary={primary} />
        <Metric label="Certificados" value={certificaciones.length} icon={Award} primary={primary} />
      </div>

      <div className="talent-chart-grid">
        <div className="talent-panel">
          <h3 className="talent-panel-title" style={{ fontFamily: "inherit" }}>Promedio por área</h3>
          <div style={{ width: "100%", height: 230 }}>
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
        <div className="talent-panel">
          <h3 className="talent-panel-title" style={{ fontFamily: "inherit" }}>Tendencia histórica</h3>
          <div style={{ width: "100%", height: 230 }}>
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

      <div className="talent-list-grid">
        <SimpleList title="Personal destacado" empty="Sin destacados todavia" items={topPeople.map((p) => `${p.nombre} · ${p.score}%`)} />
        <SimpleList title="Planes activos" empty="Sin planes activos" items={planes.filter((p) => p.estado !== "Cerrado").slice(0, 5).map((p) => `${p.colaboradorNombre} · ${p.estado}`)} />
        <SimpleList title="Certificaciones proximas" empty="Sin alertas" items={expiring.map((c) => `${c.colaboradorNombre} · ${c.tipo} · ${c.vencimiento}`)} />
      </div>
    </div>
  );
}

function Colaboradores({ colaboradores, evaluaciones, planes, capacitaciones, certificaciones, inspecciones, hallazgos, desviaciones, areas, usuarios, primary, config, onColaboradores, onCertificaciones }) {
  const blank = { nombre: "", documento: "", cargo: "", area: areas[0]?.nombre || "", areas: areas[0]?.nombre ? [areas[0].nombre] : [], fechaIngreso: dateOnly(new Date()), estado: "Activo", inactiveDate: "", supervisor: "", foto: null };
  const [form, setForm] = useState(blank);
  const [inlineEditId, setInlineEditId] = useState(null);
  const [inlineDraft, setInlineDraft] = useState(null);
  const [detail, setDetail] = useState(null);

  const collaboratorPayload = (source, existing = {}) => ({
    ...existing,
    ...source,
    nombre: (source.nombre || "").trim(),
    documento: (source.documento || "").trim(),
    cargo: source.cargo || source.rol || "",
    rol: source.cargo || source.rol || "",
    area: source.area || source.areas?.[0] || "",
    areas: source.area ? [source.area] : (source.areas || []),
    foto: source.foto || existing.foto || null,
    inactiveDate: source.estado === "Inactivo" || source.estado === "Retirado" ? (source.inactiveDate || dateOnly(new Date())) : "",
  });

  const save = () => {
    if (!form.nombre.trim()) return;
    const payload = collaboratorPayload(form);
    onColaboradores([{ id: genId(), ...payload }, ...colaboradores]);
    setForm(blank);
  };

  const draftFromCollaborator = (colaborador) => ({
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

  const startInlineEdit = (colaborador) => {
    setInlineDraft(draftFromCollaborator(colaborador));
    setInlineEditId(colaborador.id);
  };

  const cancelInlineEdit = () => {
    setInlineEditId(null);
    setInlineDraft(null);
  };

  const saveInlineEdit = (colaborador) => {
    if (!inlineDraft?.nombre?.trim()) return;
    const payload = collaboratorPayload(inlineDraft, colaborador);
    onColaboradores(colaboradores.map((c) => c.id === colaborador.id ? { ...c, ...payload } : c));
    cancelInlineEdit();
  };

  const handlePhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setForm({ ...form, foto: await resizeImageToDataUrl(file, 320) });
  };
  const handleInlinePhoto = async (e) => {
    const file = e.target.files[0];
    if (!file || !inlineDraft) return;
    setInlineDraft({ ...inlineDraft, foto: await resizeImageToDataUrl(file, 280) });
    e.target.value = "";
  };

  const archived = colaboradores.filter((c) => !isActiveCollaborator(c));
  const reactivate = (id) => {
    onColaboradores(colaboradores.map((c) => c.id === id ? { ...c, estado: "Activo", inactiveDate: "" } : c));
  };

  return (
    <div className="collab-shell">
      <div className="collab-form-card">
        <h3 className="collab-section-title"><UserPlus size={15} /> Base única de personal</h3>
        <div className="collab-form-layout">
          <div className="collab-field-grid">
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
            <select value={form.supervisor} onChange={(e) => setForm({ ...form, supervisor: e.target.value })} className="border rounded-md px-3 py-2 text-sm sm:col-span-2">
              <option value="">Supervisor</option>
              {usuarios.map((u) => <option key={u.id} value={u.nombre}>{u.nombre}</option>)}
            </select>
          </div>
          <div className="collab-photo-panel">
            <p>Foto del colaborador</p>
            <div className="collab-photo-preview">
              {form.foto ? <img src={form.foto} alt="" className="w-full h-full object-cover" /> : <Users size={34} className="text-gray-300" />}
            </div>
            <div className="collab-photo-actions">
              <EvidenceActions onChange={handlePhoto} onCapture={(dataUrl) => setForm({ ...form, foto: dataUrl })} />
            </div>
            {form.foto && <button type="button" onClick={() => setForm({ ...form, foto: null })} className="w-full mt-2 text-xs font-bold text-red-600">Quitar foto</button>}
          </div>
        </div>
        <div className="collab-form-actions">
          <button onClick={save} style={{ background: primary }}>Agregar colaborador</button>
        </div>
      </div>

      <div className="collab-list">
      {colaboradores.filter(isActiveCollaborator).map((c) => {
        const editing = inlineEditId === c.id && inlineDraft;
        return (
          <div key={c.id} className="collab-card">
            {editing ? (
              <div className="collab-edit-row">
                <div className="collab-edit-photo">
                  {inlineDraft.foto ? <img src={inlineDraft.foto} className="w-full h-full object-cover" alt="" /> : <Users size={22} className="text-gray-300" />}
                </div>
                <div className="collab-edit-fields">
                  <input value={inlineDraft.nombre} onChange={(e) => setInlineDraft({ ...inlineDraft, nombre: e.target.value })} placeholder="Nombre completo" className="border rounded-md px-2 py-1.5 text-sm" />
                  <input value={inlineDraft.documento} onChange={(e) => setInlineDraft({ ...inlineDraft, documento: e.target.value })} placeholder="Documento" className="border rounded-md px-2 py-1.5 text-sm" />
                  <input value={inlineDraft.cargo} onChange={(e) => setInlineDraft({ ...inlineDraft, cargo: e.target.value })} placeholder="Cargo" className="border rounded-md px-2 py-1.5 text-sm" />
                  <select value={inlineDraft.area} onChange={(e) => setInlineDraft({ ...inlineDraft, area: e.target.value, areas: e.target.value ? [e.target.value] : [] })} className="border rounded-md px-2 py-1.5 text-sm">
                    <option value="">Sin area</option>
                    {areas.map((a) => <option key={a.id} value={a.nombre}>{a.nombre}</option>)}
                  </select>
                  <input type="date" value={inlineDraft.fechaIngreso} onChange={(e) => setInlineDraft({ ...inlineDraft, fechaIngreso: e.target.value })} className="border rounded-md px-2 py-1.5 text-sm" />
                  <select value={inlineDraft.estado} onChange={(e) => setInlineDraft({ ...inlineDraft, estado: e.target.value })} className="border rounded-md px-2 py-1.5 text-sm">
                    <option>Activo</option>
                    <option>En entrenamiento</option>
                    <option>Inactivo</option>
                    <option>Retirado</option>
                  </select>
                  <select value={inlineDraft.supervisor} onChange={(e) => setInlineDraft({ ...inlineDraft, supervisor: e.target.value })} className="border rounded-md px-2 py-1.5 text-sm">
                    <option value="">Supervisor</option>
                    {usuarios.map((u) => <option key={u.id} value={u.nombre}>{u.nombre}</option>)}
                  </select>
                  <div className="collab-inline-photo-tools">
                    <EvidenceActions onChange={handleInlinePhoto} onCapture={(dataUrl) => setInlineDraft((prev) => prev ? { ...prev, foto: dataUrl } : prev)} />
                    {inlineDraft.foto && <button type="button" onClick={() => setInlineDraft({ ...inlineDraft, foto: null })} className="text-xs font-bold text-red-600">Quitar</button>}
                  </div>
                </div>
                <div className="collab-edit-actions">
                  <button onClick={() => saveInlineEdit(c)} style={{ background: primary, color: "#fff", borderColor: primary }}><Save size={14} /> Guardar</button>
                  <button onClick={cancelInlineEdit}>Cancelar</button>
                </div>
              </div>
            ) : (
              <div className="collab-card-view">
                <div className="collab-avatar">
                  {c.foto ? <img src={c.foto} className="w-full h-full object-cover" alt="" /> : <Users size={20} className="text-gray-300" />}
                </div>
                <button type="button" onClick={() => setDetail(c)} className="collab-main-button" title="Ver hoja de vida laboral">
                  <p>{c.nombre}</p>
                  <span>{c.cargo || c.rol || "Sin cargo"} · {c.area || c.areas?.[0] || "Sin área"}</span>
                </button>
                <button onClick={() => startInlineEdit(c)} className="collab-icon-button" title="Editar"><Pencil size={16} /></button>
                <button
                  onClick={() => window.confirm("Inactivar y archivar este colaborador?") && onColaboradores(colaboradores.map((x) => x.id === c.id ? { ...x, estado: "Inactivo", inactiveDate: dateOnly(new Date()) } : x))}
                  className="collab-icon-button danger"
                  title="Inactivar"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          </div>
        );
      })}
      </div>

      <div className="collab-archive-section">
        <div className="collab-archive-header">
          <div>
            <h3>Archivados</h3>
            <p>Colaboradores inactivos o retirados. Permanecen guardados con su historial.</p>
          </div>
          <Badge color="#5C6673" bg="#EAECEF">{archived.length}</Badge>
        </div>

        {archived.length === 0 ? (
          <div className="collab-empty">No hay colaboradores archivados.</div>
        ) : (
          <div className="collab-archived-list">
            {archived.map((c) => {
              const editing = inlineEditId === c.id && inlineDraft;
              return (
                <div key={c.id} className="collab-archived-card">
                  {editing ? (
                    <div className="collab-edit-row">
                      <div className="collab-edit-photo">
                        {inlineDraft.foto ? <img src={inlineDraft.foto} className="w-full h-full object-cover" alt="" /> : <Users size={20} className="text-gray-300" />}
                      </div>
                      <div className="collab-edit-fields">
                        <input value={inlineDraft.nombre} onChange={(e) => setInlineDraft({ ...inlineDraft, nombre: e.target.value })} placeholder="Nombre completo" />
                        <input value={inlineDraft.documento} onChange={(e) => setInlineDraft({ ...inlineDraft, documento: e.target.value })} placeholder="Documento" />
                        <input value={inlineDraft.cargo} onChange={(e) => setInlineDraft({ ...inlineDraft, cargo: e.target.value })} placeholder="Cargo" />
                        <select value={inlineDraft.area} onChange={(e) => setInlineDraft({ ...inlineDraft, area: e.target.value, areas: e.target.value ? [e.target.value] : [] })}>
                          <option value="">Sin area</option>
                          {areas.map((a) => <option key={a.id} value={a.nombre}>{a.nombre}</option>)}
                        </select>
                        <select value={inlineDraft.estado} onChange={(e) => setInlineDraft({ ...inlineDraft, estado: e.target.value })}>
                          <option>Activo</option>
                          <option>En entrenamiento</option>
                          <option>Inactivo</option>
                          <option>Retirado</option>
                        </select>
                        <div className="collab-inline-photo-tools">
                          <EvidenceActions onChange={handleInlinePhoto} onCapture={(dataUrl) => setInlineDraft((prev) => prev ? { ...prev, foto: dataUrl } : prev)} />
                        </div>
                      </div>
                      <div className="collab-edit-actions">
                        <button onClick={() => saveInlineEdit(c)} style={{ background: primary }}><Save size={14} /> Guardar</button>
                        <button onClick={cancelInlineEdit}>Cancelar</button>
                      </div>
                    </div>
                  ) : (
                    <div className="collab-archived-view">
                      <button type="button" onClick={() => setDetail(c)} className="collab-main-button" title="Ver hoja de vida laboral">
                        <p>{c.nombre}</p>
                        <span>
                          {c.estado} · {c.inactiveDate ? `Desde ${c.inactiveDate}` : "Sin fecha"} · {c.cargo || c.rol || "Sin cargo"}
                        </span>
                      </button>
                      <div className="collab-archived-actions">
                        <button onClick={() => startInlineEdit(c)} style={{ borderColor: primary, color: primary }}>
                          Editar
                        </button>
                        <button onClick={() => reactivate(c.id)} style={{ background: primary }}>
                          Reactivar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {detail && (
        <DetailErrorBoundary key={detail.id} onClose={() => setDetail(null)}>
          <CollaboratorDetail
            colaborador={detail}
            evaluaciones={evaluaciones.filter((e) => e.colaboradorId === detail.id)}
            planes={planesForColaborador(planes, detail.id)}
            capacitaciones={capacitaciones.filter((t) => trainingIncludesCollaborator(t, detail))}
            certificaciones={certificaciones.filter((c) => c.colaboradorId === detail.id)}
            inspecciones={inspecciones.filter((i) => inspectionIncludesCollaborator(i, detail))}
            hallazgos={hallazgos.filter((h) => personMatchesRecord(h, detail, ["responsableId"], ["responsable", "responsableNombre"]))}
            desviaciones={desviaciones.filter((d) => personMatchesRecord(d, detail, ["responsableId", "responsableCierreId", "reportadoPorId"], ["responsableNombre", "responsable", "responsableCierre", "reportadoPor", "quienPresenta"]))}
            onClose={() => setDetail(null)}
            onAddCert={(cert) => onCertificaciones([{ id: genId(), colaboradorId: detail.id, colaboradorNombre: detail.nombre, ...cert }, ...certificaciones])}
            primary={primary}
            config={config}
          />
        </DetailErrorBoundary>
      )}
    </div>
  );
}

function collaboratorLaborHtml({ colaborador, evaluaciones, planes, capacitaciones, certificaciones, inspecciones, hallazgos, desviaciones, config }) {
  const rows = (items, render, empty = "Sin registros") => (
    items.length ? items.map(render).join("") : `<tr><td colspan="4">${empty}</td></tr>`
  );
  return `
<html><head><title>Hoja de vida laboral - ${escapeHtml(colaborador.nombre)}</title><style>
${printWatermarkCss()}
body{font-family:${printFontFamily(config)};padding:24px;color:#243040;background:#fff}
h1{font-size:24px;margin:0 0 6px}h2{font-size:15px;margin:20px 0 8px;color:#1F2B3A}
.print-content{position:relative;z-index:1}.header{display:flex;gap:16px;align-items:center;border-bottom:3px solid #1F2B3A;padding-bottom:14px}
.photo{width:96px;height:96px;border:1px solid #D8DCE1;border-radius:14px;object-fit:cover;background:#F1F3F4}
.meta{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:12px}.box{border:1px solid #E5E7EB;border-radius:10px;padding:8px;background:#F8FAFC;font-size:12px}.box b{display:block;font-size:10px;text-transform:uppercase;color:#7C8795;margin-bottom:3px}
table{width:100%;border-collapse:collapse;margin-top:8px}th,td{border:1px solid #E5E7EB;padding:7px;font-size:11px;vertical-align:top;text-align:left}th{background:#F1F3F4;color:#475569;text-transform:uppercase;font-size:10px}
</style></head><body>${printWatermarkHtml(config)}<div class="print-content">
<div class="header">${colaborador.foto ? `<img class="photo" src="${colaborador.foto}" />` : `<div class="photo"></div>`}<div><h1>Hoja de vida laboral</h1><p>${escapeHtml(colaborador.nombre || "Sin nombre")}</p><p>${escapeHtml(storedErpName())}</p></div></div>
<div class="meta">
<div class="box"><b>Documento</b>${escapeHtml(colaborador.documento || "Sin documento")}</div>
<div class="box"><b>Cargo</b>${escapeHtml(colaborador.cargo || colaborador.rol || "Sin cargo")}</div>
<div class="box"><b>Área</b>${escapeHtml(colaborador.area || colaborador.areas?.[0] || "Sin área")}</div>
<div class="box"><b>Estado</b>${escapeHtml(colaborador.estado || "Activo")}</div>
<div class="box"><b>Ingreso</b>${escapeHtml(colaborador.fechaIngreso || "Sin fecha")}</div>
<div class="box"><b>Supervisor</b>${escapeHtml(colaborador.supervisor || "Sin supervisor")}</div>
</div>
<h2>Evaluaciones</h2><table><thead><tr><th>Fecha</th><th>Tipo</th><th>Resultado</th><th>Observaciones</th></tr></thead><tbody>${rows(evaluaciones, (e) => `<tr><td>${fmtFecha(e.fecha)}</td><td>${escapeHtml(evaluationTypeLabel(e))}</td><td>${evaluationPercent(e)}%</td><td>${escapeHtml(e.observaciones || evaluationRecommendation(e))}</td></tr>`)}</tbody></table>
<h2>Planes de mejora</h2><table><thead><tr><th>Estado</th><th>Hallazgo</th><th>Acción</th><th>Compromiso</th></tr></thead><tbody>${rows(planes, (p) => `<tr><td>${escapeHtml(p.estado || "")}</td><td>${escapeHtml(p.hallazgos || "")}</td><td>${escapeHtml(p.acciones || "")}</td><td>${escapeHtml(p.fechaCompromiso || "")}</td></tr>`)}</tbody></table>
<h2>Capacitaciones</h2><table><thead><tr><th>Fecha</th><th>Nombre</th><th>Instructor</th><th>Certifica</th></tr></thead><tbody>${rows(capacitaciones, (t) => `<tr><td>${escapeHtml(t.fecha || "")}</td><td>${escapeHtml(t.nombre || "")}</td><td>${escapeHtml(t.instructor || "")}</td><td>${escapeHtml(t.certificado || "No")}</td></tr>`)}</tbody></table>
<h2>Certificaciones</h2><table><thead><tr><th>Tipo</th><th>Vencimiento</th><th>Días</th><th>Notas</th></tr></thead><tbody>${rows(certificaciones, (c) => `<tr><td>${escapeHtml(c.tipo || "")}</td><td>${escapeHtml(c.vencimiento || "")}</td><td>${daysUntil(c.vencimiento)}</td><td>${escapeHtml(c.notas || "")}</td></tr>`)}</tbody></table>
<h2>Inspecciones relacionadas</h2><table><thead><tr><th>Fecha</th><th>Tipo/área</th><th>Cumplimiento</th><th>Observaciones</th></tr></thead><tbody>${rows(inspecciones, (i) => `<tr><td>${fmtFecha(i.fecha)}</td><td>${escapeHtml(i.tipo === "epp" ? "EPP" : i.areaNombre || "Inspección")}</td><td>${Number(i.cumplimientoPct || 0)}%</td><td>${escapeHtml(i.observaciones || "")}</td></tr>`)}</tbody></table>
<h2>Hallazgos y llamados de atención</h2><table><thead><tr><th>Fecha</th><th>Estado</th><th>Descripción</th><th>Notas</th></tr></thead><tbody>${rows(hallazgos, (h) => `<tr><td>${fmtFecha(h.fecha)}</td><td>${escapeHtml(h.estado || "")}</td><td>${escapeHtml(h.descripcion || "")}</td><td>${escapeHtml(h.notas || "")}</td></tr>`)}</tbody></table>
<h2>Desviaciones</h2><table><thead><tr><th>Fecha</th><th>Estado</th><th>Tipo</th><th>Descripción</th></tr></thead><tbody>${rows(desviaciones, (d) => `<tr><td>${fmtFecha(d.fecha)}</td><td>${escapeHtml(d.estado || "")}</td><td>${escapeHtml(d.tipo || d.tipoDesviacion || "")}</td><td>${escapeHtml(d.descripcion || d.anotacion || "")}</td></tr>`)}</tbody></table>
</div></body></html>`;
}

function CollaboratorDetail({ colaborador, evaluaciones, planes, capacitaciones = [], certificaciones, inspecciones = [], hallazgos = [], desviaciones = [], onClose, onAddCert, primary, config }) {
  const [cert, setCert] = useState({ tipo: CERT_TYPES[0], vencimiento: "", alertaDias: 30, notas: "" });
  const orderedEvaluaciones = evaluaciones.slice().sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  const chartData = evaluaciones.slice().sort((a, b) => new Date(a.fecha) - new Date(b.fecha)).map((e) => ({
    fecha: fmtFecha(e.fecha),
    resultado: evaluationPercent(e),
  }));
  const latest = orderedEvaluaciones[0];
  const average = evaluaciones.length
    ? Math.round(evaluaciones.reduce((sum, e) => sum + evaluationPercent(e), 0) / evaluaciones.length)
    : 0;
  const openIndividual = (e) => openPrintDocument(`Evaluacion - ${e.colaboradorNombre || colaborador.nombre}`, evaluationHtml(e, colaborador, planes.find((p) => p.evaluationId === e.id), config));
  const openAccumulated = () => openPrintDocument(`Acumulado - ${colaborador.nombre}`, accumulatedHtml(colaborador, evaluaciones, planes, config));
  const shareIndividual = async (e) => {
    const personName = e.colaboradorNombre || colaborador.nombre || "colaborador";
    await shareDocument({
      filename: `evaluacion-${safeFilePart(personName)}-${safeFilePart(fmtFecha(e.fecha), "fecha")}.html`,
      html: evaluationHtml(e, colaborador, planes.find((p) => p.evaluationId === e.id), config),
      title: `Evaluacion - ${personName}`,
      text: `Evaluacion ${personName}: ${evaluationPercent(e)}%`,
    });
  };
  const shareAccumulated = async () => {
    await shareDocument({
      filename: `acumulado-${colaborador.nombre.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.html`,
      html: accumulatedHtml(colaborador, evaluaciones, planes, config),
      title: `Acumulado - ${colaborador.nombre}`,
      text: `Reporte acumulado de evaluaciones de ${colaborador.nombre}`,
    });
  };
  const openLaborProfile = () => openPrintDocument(`Hoja de vida laboral - ${colaborador.nombre}`, collaboratorLaborHtml({
    colaborador,
    evaluaciones,
    planes,
    capacitaciones,
    certificaciones,
    inspecciones,
    hallazgos,
    desviaciones,
    config,
  }));

  return (
    <Modal title={colaborador.nombre} onClose={onClose} wide>
      <div className="collab-detail-profile">
        <div className="collab-detail-photo">
          {colaborador.foto ? <img src={colaborador.foto} alt="" /> : <Users size={34} />}
        </div>
        <div className="collab-detail-info">
          <p><b>ID</b>{colaborador.id}</p>
          <p><b>Documento</b>{colaborador.documento || "Sin documento"}</p>
          <p><b>Cargo</b>{colaborador.cargo || colaborador.rol || "Sin cargo"}</p>
          <p><b>Área</b>{colaborador.area || colaborador.areas?.[0] || "Sin área"}</p>
          <p><b>Supervisor</b>{colaborador.supervisor || "Sin supervisor"}</p>
        </div>
      </div>

      <div className="collab-detail-analytics">
        <div className="collab-detail-score">
          <span>Promedio individual</span>
          <strong style={{ color: average >= 75 ? "#1E7A46" : "#B5333D" }}>{average}%</strong>
          <small>{evaluaciones.length} evaluación(es)</small>
          {latest && <Badge color={evaluationPercent(latest) >= 75 ? "#1E7A46" : "#B5333D"} bg={evaluationPercent(latest) >= 75 ? "#E4F4EA" : "#FBE7E8"}>Ultima {evaluationPercent(latest)}%</Badge>}
        </div>
        <div className="collab-detail-chart">
          {chartData.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="fecha" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Line type="monotone" dataKey="resultado" stroke={primary} strokeWidth={3} dot />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-400 py-14 text-center">Sin datos para graficar.</p>
          )}
        </div>
      </div>

      <button
        onClick={openAccumulated}
        disabled={!evaluaciones.length}
        className="collab-detail-primary-action"
        style={{ background: primary }}
      >
        <FileText size={15} /> Descargar PDF acumulado con observaciones
      </button>
      <button
        onClick={shareAccumulated}
        disabled={!evaluaciones.length}
        className="collab-detail-secondary-action"
        style={{ borderColor: primary, color: primary }}
      >
        <Download size={15} /> Enviar acumulado por WhatsApp
      </button>
      <button
        onClick={openLaborProfile}
        className="collab-detail-secondary-action"
        style={{ borderColor: primary, color: primary }}
      >
        <FileText size={15} /> Imprimir hoja de vida laboral
      </button>

      <div className="collab-related-grid">
        <RelatedBlock title="Inspecciones" count={inspecciones.length} empty="Sin inspecciones relacionadas">
          {inspecciones.slice(0, 6).map((i) => (
            <p key={i.id}>{fmtFecha(i.fecha)} · {i.tipo === "epp" ? "EPP" : i.areaNombre || "Inspección"} · {Number(i.cumplimientoPct || 0)}%</p>
          ))}
        </RelatedBlock>
        <RelatedBlock title="Capacitaciones" count={capacitaciones.length} empty="Sin capacitaciones">
          {capacitaciones.slice(0, 6).map((t) => (
            <p key={t.id}>{t.fecha || "Sin fecha"} · {t.nombre || "Capacitación"} · {t.certificado === "Si" ? "Certifica" : "Registro"}</p>
          ))}
        </RelatedBlock>
        <RelatedBlock title="Hallazgos y llamados" count={hallazgos.length} empty="Sin llamados ni hallazgos">
          {hallazgos.slice(0, 6).map((h) => (
            <p key={h.id}>{fmtFecha(h.fecha)} · {h.estado || "Abierto"} · {h.descripcion || "Hallazgo"}</p>
          ))}
        </RelatedBlock>
        <RelatedBlock title="Desviaciones" count={desviaciones.length} empty="Sin desviaciones">
          {desviaciones.slice(0, 6).map((d) => (
            <p key={d.id}>{fmtFecha(d.fecha)} · {d.estado || "Abierta"} · {d.tipo || d.tipoDesviacion || "Desviación"}</p>
          ))}
        </RelatedBlock>
      </div>

      <h4 className="font-bold text-sm mt-4 mb-2" style={{ fontFamily: "inherit" }}>Historial de evaluaciones</h4>
      <div className="space-y-2">
        {evaluaciones.length === 0 && <p className="text-xs text-gray-400">Sin evaluaciones registradas.</p>}
        {orderedEvaluaciones.map((e) => {
          const evidence = evidenceFromEvaluation(e);
          const plan = planes.find((p) => p.evaluationId === e.id);
          const pct = evaluationPercent(e);
          return (
            <div key={e.id} className="border rounded-lg p-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold">{evaluationTypeLabel(e)}</p>
                <Badge color={pct >= 75 ? "#1E7A46" : "#B5333D"} bg={pct >= 75 ? "#E4F4EA" : "#FBE7E8"}>{pct}%</Badge>
              </div>
              <p className="text-xs text-gray-400">{fmtFecha(e.fecha)} · {evaluationLevel(e)} · {evaluationRecommendation(e)}</p>
              <div className="mt-2 bg-gray-50 rounded-md p-2">
                <p className="text-xs font-bold text-gray-500 uppercase">Observaciones</p>
                <p className="text-sm text-gray-600">{e.observaciones || "Sin observaciones generales."}</p>
              </div>
              {plan && (
                <div className="mt-2 bg-orange-50 border border-orange-100 rounded-md p-2">
                  <p className="text-xs font-bold text-orange-700 uppercase">Plan de mejora</p>
                  <p className="text-sm text-gray-700">{plan.hallazgos}</p>
                  <p className="text-xs text-gray-500 mt-1">{plan.acciones} · Responsable: {plan.responsable} · Estado: {plan.estado}</p>
                </div>
              )}
              {evidence.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs font-bold text-gray-500 uppercase mb-1">Registro fotografico</p>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {evidence.map((ev, index) => <img key={index} src={ev.src} alt="" title={ev.title} className="h-20 w-full object-cover rounded-md border" />)}
                  </div>
                </div>
              )}
              <button onClick={() => openIndividual(e)} className="mt-2 w-full py-2 rounded-md text-xs font-bold border flex items-center justify-center gap-1" style={{ color: primary, borderColor: primary }}>
                <Download size={13} /> Descargar PDF individual
              </button>
              <button onClick={() => shareIndividual(e)} className="mt-2 w-full py-2 rounded-md text-xs font-bold border flex items-center justify-center gap-1" style={{ color: primary, borderColor: primary }}>
                <Download size={13} /> Enviar por WhatsApp
              </button>
            </div>
          );
        })}
      </div>

      <h4 className="font-bold text-sm mt-4 mb-2" style={{ fontFamily: "inherit" }}>Certificaciones</h4>
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

function HistorialEvaluaciones({ colaboradores, evaluaciones, planes, primary, config, onEvaluaciones, onPlanes }) {
  const [colaboradorId, setColaboradorId] = useState("todos");
  const [perfil, setPerfil] = useState("todos");
  const [expandedMonth, setExpandedMonth] = useState("");
  const filtradas = evaluaciones
    .filter((e) => colaboradorId === "todos" || e.colaboradorId === colaboradorId)
    .filter((e) => perfil === "todos" || (e.perfil || "cocina") === perfil)
    .slice()
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  const groupedByMonth = useMemo(() => {
    const map = {};
    filtradas.forEach((e) => {
      const date = new Date(e.fecha);
      const key = Number.isNaN(date.getTime()) ? "sin-fecha" : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (!map[key]) map[key] = { key, fecha: e.fecha, items: [] };
      map[key].items.push(e);
    });
    return Object.values(map).sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  }, [filtradas]);
  const monthLabel = (iso) => {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "Sin fecha";
    return date.toLocaleDateString("es-CO", { month: "long", year: "numeric" });
  };

  const deleteEvaluation = (id) => {
    if (!window.confirm("Eliminar esta evaluacion?")) return;
    onEvaluaciones(evaluaciones.filter((e) => e.id !== id));
    onPlanes(planes.filter((p) => p.evaluationId !== id));
  };

  const openEvaluationReport = (e) => {
    const person = colaboradores.find((c) => c.id === e.colaboradorId);
    const plan = planes.find((p) => p.evaluationId === e.id);
    openPrintDocument(`Evaluacion - ${e.colaboradorNombre}`, evaluationHtml(e, person, plan, config));
  };
  const shareEvaluationReport = async (e) => {
    const person = colaboradores.find((c) => c.id === e.colaboradorId);
    const plan = planes.find((p) => p.evaluationId === e.id);
    const personName = e.colaboradorNombre || person?.nombre || "colaborador";
    await shareDocument({
      filename: `evaluacion-${safeFilePart(personName)}.html`,
      html: evaluationHtml(e, person, plan, config),
      title: `Evaluacion - ${personName}`,
      text: `Evaluacion ${personName}: ${evaluationPercent(e)}%`,
    });
  };
  return (
    <div className="hr-history-shell">
      <div className="hr-history-toolbar">
        <div>
          <h3>Historial de evaluaciones</h3>
          <p>{filtradas.length} registro(s) encontrados</p>
        </div>
        <div className="hr-history-filters">
          <select value={colaboradorId} onChange={(e) => setColaboradorId(e.target.value)}>
            <option value="todos">Todos los colaboradores</option>
            {colaboradores.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
          <select value={perfil} onChange={(e) => setPerfil(e.target.value)}>
            <option value="todos">Todos los perfiles</option>
            <option value="cocina">Cocina</option>
            <option value="servicio">Servicio al cliente</option>
          </select>
        </div>
      </div>

      {filtradas.length === 0 ? (
        <div className="hr-history-empty">Sin evaluaciones registradas.</div>
      ) : (
        <div className="hr-history-months">
          {groupedByMonth.map((group) => {
            const open = expandedMonth === group.key;
            const average = Math.round(group.items.reduce((sum, e) => sum + evaluationPercent(e), 0) / group.items.length);
            return (
              <div key={group.key} className="hr-history-month-card">
                <button onClick={() => setExpandedMonth(open ? "" : group.key)} className="hr-history-month-header">
                  <div>
                    <p>{monthLabel(group.fecha)}</p>
                    <span>{group.items.length} evaluación(es)</span>
                  </div>
                  <div className="hr-history-month-meta">
                    <Badge color={average >= 75 ? "#1E7A46" : "#B5333D"} bg={average >= 75 ? "#E4F4EA" : "#FBE7E8"}>{average}%</Badge>
                    <ChevronRight size={16} className={`text-gray-400 transition-transform ${open ? "rotate-90" : ""}`} />
                  </div>
                </button>
                {open && (
                  <div className="hr-history-records">
                    {group.items.map((e) => (
                      <div key={e.id} className="hr-history-record">
                        <div className="hr-history-record-info">
                          <p>{e.colaboradorNombre}</p>
                          <span>{evaluationTypeLabel(e)} · {e.perfil === "servicio" ? "Servicio al cliente" : "Cocina"} · {fmtFecha(e.fecha)}</span>
                          <em>{evaluationLevel(e)} · {evaluationRecommendation(e)}</em>
                          {e.observaciones && <small>{e.observaciones}</small>}
                        </div>
                        <div className="hr-history-record-actions">
                          <Badge color={evaluationPercent(e) >= 75 ? "#1E7A46" : "#B5333D"} bg={evaluationPercent(e) >= 75 ? "#E4F4EA" : "#FBE7E8"}>{evaluationPercent(e)}%</Badge>
                          <button onClick={() => openEvaluationReport(e)} style={{ color: primary, borderColor: primary }}><FileText size={12} /> PDF</button>
                          <button onClick={() => shareEvaluationReport(e)} style={{ color: primary, borderColor: primary }}><Download size={12} /> WhatsApp</button>
                          <button onClick={() => deleteEvaluation(e.id)} className="danger"><Trash2 size={12} /> Eliminar</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
function Evaluaciones({ colaboradores, evaluaciones, planes, currentUser, primary, config, onEvaluaciones, onPlanes }) {
  const [type, setType] = useState("ingreso");
  const [profile, setProfile] = useState("cocina");
  const [colaboradorId, setColaboradorId] = useState(colaboradores[0]?.id || "");
  const [periodicidad, setPeriodicidad] = useState(REVIEW_PERIODS[0]);
  const [criteria, setCriteria] = useState(() => criteriaFor("ingreso", config, "cocina"));
  const [generalNotes, setGeneralNotes] = useState("");
  const [firmaColaborador, setFirmaColaborador] = useState("");
  const [firmaEvaluador, setFirmaEvaluador] = useState("");
  const [expandedCriterionId, setExpandedCriterionId] = useState("");
  const [saved, setSaved] = useState(null);
  const colaborador = colaboradores.find((c) => c.id === colaboradorId);
  const result = calculateResult(criteria);

  const grouped = getEvaluationTemplate(config, profile)
    .filter((section) => type === "desempeno" || !section.performanceOnly)
    .map((section) => ({ ...section, criteria: criteria.filter((c) => c.group === section.group) }));

  const changeType = (next) => {
    setType(next);
    setCriteria(criteriaFor(next, config, profile));
  };

  const changeProfile = (next) => {
    setProfile(next);
    setCriteria(criteriaFor(type, config, next));
  };

  const save = () => {
    if (!colaborador) return;
    const evaluation = {
      id: genId(),
      tipo: type,
      periodicidad: type === "desempeno" ? periodicidad : "Ingreso",
      perfil: profile,
      fecha: todayISO(),
      colaboradorId: colaborador.id,
      colaboradorNombre: colaborador.nombre,
      evaluador: currentUser.nombre,
      criteria,
      resultado: result,
      observaciones: generalNotes,
      firmaColaborador,
      firmaEvaluador,
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
    setCriteria(criteriaFor(type, config, profile));
    setGeneralNotes("");
    setFirmaColaborador("");
    setFirmaEvaluador("");
    setExpandedCriterionId("");
  };

  const deleteEvaluation = (id) => {
    if (!window.confirm("Eliminar esta evaluacion?")) return;
    onEvaluaciones(evaluaciones.filter((e) => e.id !== id));
    onPlanes(planes.filter((p) => p.evaluationId !== id));
  };

  const openEvaluationReport = (e) => {
    const person = colaboradores.find((c) => c.id === e.colaboradorId);
    const plan = planes.find((p) => p.evaluationId === e.id);
    openPrintDocument(`Evaluacion - ${e.colaboradorNombre}`, evaluationHtml(e, person, plan, config));
  };
  const shareEvaluationReport = async (e) => {
    const person = colaboradores.find((c) => c.id === e.colaboradorId);
    const plan = planes.find((p) => p.evaluationId === e.id);
    const personName = e.colaboradorNombre || person?.nombre || "colaborador";
    await shareDocument({
      filename: `evaluacion-${safeFilePart(personName)}.html`,
      html: evaluationHtml(e, person, plan, config),
      title: `Evaluacion - ${personName}`,
      text: `Evaluacion ${personName}: ${evaluationPercent(e)}%`,
    });
  };

  return (
    <div className="evaluation-shell">
      <div className="evaluation-top">
        <div className="evaluation-filters">
          <select value={type} onChange={(e) => changeType(e.target.value)} className="border rounded-md px-3 py-2 text-sm">
            <option value="ingreso">Evaluación técnica de ingreso</option>
            <option value="desempeno">Evaluación de desempeño</option>
          </select>
          <select value={profile} onChange={(e) => changeProfile(e.target.value)} className="border rounded-md px-3 py-2 text-sm">
            <option value="cocina">Perfil cocina</option>
            <option value="servicio">Perfil servicio al cliente</option>
          </select>
          <select value={colaboradorId} onChange={(e) => setColaboradorId(e.target.value)} className="border rounded-md px-3 py-2 text-sm">
            <option value="">Selecciona colaborador</option>
            {colaboradores.filter(isActiveCollaborator).map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
          <select value={periodicidad} onChange={(e) => setPeriodicidad(e.target.value)} disabled={type !== "desempeno"} className="border rounded-md px-3 py-2 text-sm disabled:opacity-40">
            {REVIEW_PERIODS.map((p) => <option key={p}>{p}</option>)}
          </select>
        </div>
        <div className="evaluation-result-card">
          <StampGauge pct={result.percentage} />
          <div className="evaluation-result-lines">
            <div className="evaluation-info-pill"><span>Puntaje</span><strong>{result.total} / {result.max}</strong></div>
            <div className="evaluation-info-pill"><span>Nivel</span><strong>{result.level}</strong></div>
            <div className="evaluation-info-pill"><span>Recomendación</span><strong>{result.recommendation}</strong></div>
          </div>
        </div>
      </div>

      {grouped.map((section) => (
        <div key={section.group} className="evaluation-section">
          <div className="evaluation-section-title">
            <h3>{section.group}</h3>
            <span>{section.criteria.length} aspectos</span>
          </div>
          <div className="evaluation-rows">
            {section.criteria.map((c) => (
              <CriterionRow
                key={c.id}
                criterion={c}
                expanded={expandedCriterionId === c.id}
                onToggleObservation={() => setExpandedCriterionId((current) => current === c.id ? "" : c.id)}
                onChange={(id, patch) => setCriteria(criteria.map((item) => item.id === id ? { ...item, ...patch } : item))}
              />
            ))}
          </div>
        </div>
      ))}

      <div className="evaluation-section">
        <textarea value={generalNotes} onChange={(e) => setGeneralNotes(e.target.value)} rows={3} placeholder="Observaciones generales" className="w-full border rounded-md px-3 py-2 text-sm" />
        <div className="signature-grid" style={{ "--signature-columns": 2 }}>
          <SignaturePad label="Firma colaborador" value={firmaColaborador} onChange={setFirmaColaborador} />
          <SignaturePad label="Firma evaluador" value={firmaEvaluador} onChange={setFirmaEvaluador} />
        </div>
        <button onClick={save} disabled={!colaborador} className="w-full py-2.5 rounded-md font-bold text-white flex items-center justify-center gap-2 disabled:opacity-40" style={{ background: primary }}>
          <Save size={16} /> Guardar evaluacion
        </button>
        {saved && <p className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-md px-2 py-1.5">Evaluacion guardada para {saved.colaboradorNombre}. {evaluationPercent(saved) < 75 ? "Se creo plan de mejora automatico." : ""}</p>}
      </div>

      <div className="evaluation-section">
        <div className="evaluation-section-title">
          <h3>Historial de evaluaciones</h3>
          <span>{evaluaciones.length} registros</span>
        </div>
        {evaluaciones.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-6">Sin evaluaciones registradas.</p>
        ) : (
          <div className="evaluation-history-list">
            {evaluaciones.slice().sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).map((e) => (
              <div key={e.id} className="evaluation-history-row">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-bold text-sm truncate">{e.colaboradorNombre}</p>
                    <p className="text-xs text-gray-400">{evaluationTypeLabel(e)} · {e.perfil === "servicio" ? "Servicio al cliente" : "Cocina"} · {fmtFecha(e.fecha)}</p>
                    <p className="text-xs text-gray-500 mt-1">{evaluationLevel(e)} · {evaluationRecommendation(e)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <Badge color={evaluationPercent(e) >= 75 ? "#1E7A46" : "#B5333D"} bg={evaluationPercent(e) >= 75 ? "#E4F4EA" : "#FBE7E8"}>{evaluationPercent(e)}%</Badge>
                    <button onClick={() => openEvaluationReport(e)} className="px-2.5 py-1 rounded-md border text-xs font-bold flex items-center gap-1" style={{ color: primary, borderColor: primary }}>
                      <FileText size={12} /> PDF
                    </button>
                    <button onClick={() => shareEvaluationReport(e)} className="px-2.5 py-1 rounded-md border text-xs font-bold flex items-center gap-1" style={{ color: primary, borderColor: primary }}>
                      <Download size={12} /> WhatsApp
                    </button>
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

function CriterionRow({ criterion, expanded, onToggleObservation, onChange }) {
  const handleEvidence = async (e) => {
    const files = Array.from(e.target.files || []).slice(0, MAX_EVIDENCE_PER_ITEM);
    if (!files.length) return;
    const converted = await Promise.all(files.map((file) => resizeImageToDataUrl(file, 420)));
    onChange(criterion.id, { evidence: [...normalizeEvidenceList(criterion.evidence), ...converted].slice(0, MAX_EVIDENCE_PER_ITEM) });
    e.target.value = "";
  };
  const evidenceList = normalizeEvidenceList(criterion.evidence);
  const scoreColors = {
    1: "#B5333D",
    2: "#D97706",
    3: "#64748B",
    4: "#1D4ED8",
    5: "#1E7A46",
  };
  return (
    <div className="evaluation-criterion-row">
      <div className="evaluation-aspect-cell">
        <span>Aspecto</span>
        <strong>{criterion.text}</strong>
      </div>
      <div className="evaluation-score-cell">
        <span>Puntaje</span>
        <div className="evaluation-score-buttons">
          {[1, 2, 3, 4, 5].map((n) => {
            const active = Number(criterion.score) === n;
            return (
              <button
                key={n}
                type="button"
                onClick={() => onChange(criterion.id, { score: n })}
                className="evaluation-score-button"
                style={{ borderColor: active ? scoreColors[n] : "#D8DCE1", background: active ? scoreColors[n] : "#FFFFFF", color: active ? "#FFFFFF" : "#5C6673" }}
              >
                {n}
              </button>
            );
          })}
        </div>
      </div>
      <div className="evaluation-compact-cell">
        <button type="button" onClick={onToggleObservation} className="evaluation-inline-toggle">
          <span className="truncate">{criterion.observation || "Observaciones"}</span>
          <ChevronRight size={15} className={`flex-shrink-0 transition-transform ${expanded ? "rotate-90" : ""}`} />
        </button>
      </div>
      <div className="evaluation-evidence-cell">
        <EvidenceActions onChange={handleEvidence} multiple />
        <span>{evidenceList.length}/3</span>
      </div>
      {expanded && (
        <div className="evaluation-row-expander">
          <textarea value={criterion.observation} onChange={(e) => onChange(criterion.id, { observation: e.target.value })} rows={2} autoFocus placeholder="Observaciones del aspecto evaluado" />
        </div>
      )}
      {evidenceList.length > 0 && (
        <div className="evaluation-evidence-strip">
          {evidenceList.map((src, index) => <img key={index} src={src} alt="" />)}
        </div>
      )}
    </div>
  );
}

function Planes({ planes, colaboradores, primary, onPlanes }) {
  const update = (id, patch) => onPlanes(planes.map((p) => p.id === id ? { ...p, ...patch } : p));
  const [openFolder, setOpenFolder] = useState("Abierto");
  const folders = [
    { id: "Abierto", label: "Abiertos", hint: "Requieren acción", color: "#B5333D", items: planes.filter((p) => p.estado === "Abierto") },
    { id: "En seguimiento", label: "En proceso", hint: "Con seguimiento", color: "#B4750E", items: planes.filter((p) => p.estado === "En seguimiento") },
    { id: "Cerrado", label: "Cerrados", hint: "Finalizados", color: "#1E7A46", items: planes.filter((p) => p.estado === "Cerrado") },
  ];
  return (
    <div className="plans-shell">
      <div className="plans-summary">
        {folders.map((folder) => {
          const open = openFolder === folder.id;
          return (
            <button
              key={folder.id}
              type="button"
              onClick={() => setOpenFolder(open ? "" : folder.id)}
              className={`plans-folder ${open ? "active" : ""}`}
              style={open ? { borderColor: folder.color, boxShadow: `0 12px 26px ${folder.color}22` } : undefined}
            >
              <span className="plans-folder-icon" style={{ color: folder.color, background: `${folder.color}14` }}><ShieldCheck size={18} /></span>
              <span className="plans-folder-text">
                <strong>{folder.label}</strong>
                <small>{folder.hint}</small>
              </span>
              <em style={{ color: folder.color }}>{folder.items.length}</em>
            </button>
          );
        })}
      </div>

      {planes.length === 0 && <div className="plans-empty">Sin planes de mejora.</div>}

      {folders.map((folder) => {
        const open = openFolder === folder.id;
        if (!open) return null;
        return (
          <div key={folder.id} className="plans-board">
            <div className="plans-board-header">
              <div>
                <h3>{folder.label}</h3>
                <p>{folder.items.length} plan(es) en esta carpeta</p>
              </div>
              <Badge color={folder.color} bg={`${folder.color}16`}>{folder.items.length}</Badge>
            </div>

            {folder.items.length === 0 ? (
              <div className="plans-empty">Sin planes en esta carpeta.</div>
            ) : (
              <div className="plans-grid">
                {folder.items.map((p) => {
                  const person = colaboradores.find((c) => c.id === p.colaboradorId);
                  return (
                    <div key={p.id} className="plans-card">
                      <div className="plans-card-header">
                        <div>
                          <p>{p.colaboradorNombre || person?.nombre || "Sin colaborador"}</p>
                          <span>{person?.area || person?.areas?.[0] || "Sin área"}</span>
                        </div>
                        <select value={p.estado} onChange={(e) => update(p.id, { estado: e.target.value })}>
                          <option>Abierto</option>
                          <option>En seguimiento</option>
                          <option>Cerrado</option>
                        </select>
                      </div>

                      <div className="plans-text-grid">
                        <label>
                          <span>Hallazgo</span>
                          <textarea value={p.hallazgos || ""} onChange={(e) => update(p.id, { hallazgos: e.target.value })} rows={2} placeholder="Hallazgos" />
                        </label>
                        <label>
                          <span>Acción</span>
                          <textarea value={p.acciones || ""} onChange={(e) => update(p.id, { acciones: e.target.value })} rows={2} placeholder="Acciones" />
                        </label>
                      </div>

                      <div className="plans-fields">
                        <label>
                          <span>Responsable</span>
                          <input value={p.responsable || ""} onChange={(e) => update(p.id, { responsable: e.target.value })} placeholder="Responsable" />
                        </label>
                        <label>
                          <span>Compromiso</span>
                          <input type="date" value={p.fechaCompromiso || ""} onChange={(e) => update(p.id, { fechaCompromiso: e.target.value })} />
                        </label>
                        <label>
                          <span>Cierre</span>
                          <input type="date" value={p.fechaCierre || ""} onChange={(e) => update(p.id, { fechaCierre: e.target.value, estado: e.target.value ? "Cerrado" : p.estado })} />
                        </label>
                      </div>

                      <div className="plans-actions">
                        <button type="button" onClick={() => update(p.id, { estado: "En seguimiento" })} disabled={p.estado === "En seguimiento"}>Seguimiento</button>
                        <button type="button" onClick={() => update(p.id, { estado: "Cerrado", fechaCierre: dateOnly(new Date()) })} style={{ background: primary, borderColor: primary, color: "#fff" }}>
                          Cerrar plan
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Capacitaciones({ capacitaciones, colaboradores, primary, onCapacitaciones }) {
  const blank = { nombre: "", tema: "", instructor: "", fecha: dateOnly(new Date()), duracion: "", asistentes: [], evaluacion: "", certificado: "No" };
  const [form, setForm] = useState(blank);
  const [editingId, setEditingId] = useState("");
  const [expandedTraining, setExpandedTraining] = useState("");
  const toggle = (id) => setForm({ ...form, asistentes: form.asistentes.includes(id) ? form.asistentes.filter((x) => x !== id) : [...form.asistentes, id] });
  const save = () => {
    if (!form.nombre.trim()) return;
    const asistentes = colaboradores.filter((c) => form.asistentes.includes(c.id)).map((c) => ({ id: c.id, nombre: c.nombre }));
    if (editingId) {
      onCapacitaciones(capacitaciones.map((t) => t.id === editingId ? { ...t, ...form, nombre: form.nombre.trim(), asistentes, updatedAt: todayISO() } : t));
      setEditingId("");
    } else {
      onCapacitaciones([{ id: genId(), ...form, nombre: form.nombre.trim(), asistentes }, ...capacitaciones]);
    }
    setForm(blank);
  };
  const edit = (training) => {
    setEditingId(training.id);
    setForm({
      nombre: training.nombre || "",
      tema: training.tema || "",
      instructor: training.instructor || "",
      fecha: training.fecha || dateOnly(new Date()),
      duracion: training.duracion || "",
      asistentes: (training.asistentes || []).map((a) => a.id),
      evaluacion: training.evaluacion || "",
      certificado: training.certificado || "No",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const cancelEdit = () => {
    setEditingId("");
    setForm(blank);
  };

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-xl p-3 space-y-2">
        <h3 className="font-bold text-sm flex items-center gap-1.5" style={{ fontFamily: "inherit" }}><GraduationCap size={15} /> {editingId ? "Editar capacitacion" : "Registrar capacitacion"}</h3>
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
        <div className="grid sm:grid-cols-[1fr_auto] gap-2">
          <button onClick={save} className="w-full py-2 rounded-md font-bold text-white text-sm" style={{ background: primary }}>{editingId ? "Actualizar capacitacion" : "Guardar capacitacion"}</button>
          {editingId && <button onClick={cancelEdit} className="px-4 py-2 rounded-md border text-sm font-bold">Cancelar</button>}
        </div>
      </div>

      {capacitaciones.map((t) => {
        const open = expandedTraining === t.id;
        return (
          <div key={t.id} className="bg-white rounded-xl overflow-hidden">
            <button type="button" onClick={() => setExpandedTraining(open ? "" : t.id)} className="w-full p-3 flex items-center justify-between gap-2 text-left">
              <div className="min-w-0">
                <p className="font-bold text-sm truncate">{t.nombre}</p>
                <p className="text-xs text-gray-400">{t.fecha} · {t.asistentes.length} asistentes</p>
              </div>
              <Badge color={t.certificado === "Si" ? "#1E7A46" : "#5C6673"} bg={t.certificado === "Si" ? "#E4F4EA" : "#EAECEF"}>{t.certificado === "Si" ? "Certifica" : "Registro"}</Badge>
            </button>
            {open && (
              <div className="border-t border-gray-100 p-3 text-sm text-gray-600 space-y-2">
                <p><b>Tema:</b> {t.tema || "Sin tema"}</p>
                <p><b>Instructor:</b> {t.instructor || "Sin instructor"}</p>
                <p><b>Duracion:</b> {t.duracion || "Sin duracion"}</p>
                <p><b>Evaluacion:</b> {t.evaluacion || "Sin evaluacion registrada"}</p>
                <p><b>Asistentes:</b> {t.asistentes.map((a) => a.nombre).join(", ") || "Sin asistentes"}</p>
                <button type="button" onClick={() => edit(t)} className="px-2.5 py-1 rounded-md border text-xs font-bold" style={{ color: primary, borderColor: primary }}>Editar capacitación</button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Indicadores({ colaboradores, evaluaciones, planes, capacitaciones, certificaciones, primary, config }) {
  const latest = colaboradores.map((c) => ({ ...c, promedio: evaluationPercent(latestEvaluation(c.id, evaluaciones)) })).sort((a, b) => b.promedio - a.promedio);

  const aggregate = (field) => {
    const map = {};
    evaluaciones.forEach((e) => {
      const c = colaboradores.find((x) => x.id === e.colaboradorId);
      const key = c?.[field] || "Sin dato";
      if (!map[key]) map[key] = { nombre: key, total: 0, count: 0 };
      map[key].total += evaluationPercent(e);
      map[key].count += 1;
    });
    return Object.values(map).map((x) => ({ nombre: x.nombre, promedio: Math.round(x.total / x.count) }));
  };

  const skills = {};
  evaluaciones.forEach((e) => (e.criteria || []).forEach((c) => {
    if (!skills[c.text]) skills[c.text] = { text: c.text, total: 0, count: 0 };
    skills[c.text].total += Number(c.score || 0);
    skills[c.text].count += 1;
  }));
  const skillRanking = Object.values(skills).map((s) => ({ text: s.text, avg: s.total / s.count })).sort((a, b) => a.avg - b.avg);

  const compliance = evaluaciones.reduce((acc, e) => {
    const value = evaluationPercent(e);
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
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(evaluaciones.map((e) => ({ Fecha: fmtFecha(e.fecha), Tipo: e.tipo, Periodicidad: e.periodicidad, Colaborador: e.colaboradorNombre, Evaluador: e.evaluador, Puntaje: e.resultado?.total || 0, Maximo: e.resultado?.max || 0, Porcentaje: evaluationPercent(e), Nivel: evaluationLevel(e), Recomendacion: evaluationRecommendation(e) }))), "Evaluaciones");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(planes), "Planes");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(capacitaciones.map((t) => ({ ...t, asistentes: t.asistentes.map((a) => a.nombre).join(", ") }))), "Capacitaciones");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(certificaciones), "Certificaciones");
    XLSX.writeFile(wb, "talento_humano_indicadores.xlsx", { bookType: "xlsx" });
  };

  const exportPdf = () => {
    const rows = latest.map((c) => `<tr><td>${c.nombre}</td><td>${c.cargo || c.rol || ""}</td><td>${c.area || c.areas?.[0] || ""}</td><td>${c.promedio}%</td></tr>`).join("");
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Reporte Talento Humano</title><style>body{font-family:${printFontFamily(config)};padding:24px;color:#1f2937}table{width:100%;border-collapse:collapse}td,th{border:1px solid #ddd;padding:8px;font-size:12px}h1{font-size:22px}</style></head><body><h1>Reporte Gestion del Talento Humano</h1><p>Evaluaciones: ${evaluaciones.length} · Planes activos: ${planes.filter((p) => p.estado !== "Cerrado").length}</p><table><thead><tr><th>Colaborador</th><th>Cargo</th><th>Area</th><th>Promedio</th></tr></thead><tbody>${rows}</tbody></table></body></html>`);
    w.document.close();
    w.print();
  };

  const reportCards = [
    { title: "Promedio por cargo", items: aggregate("cargo").map((x) => `${x.nombre}: ${x.promedio}%`) },
    { title: "Promedio por supervisor", items: aggregate("supervisor").map((x) => `${x.nombre}: ${x.promedio}%`) },
    { title: "Competencias más débiles", items: skillRanking.slice(0, 6).map((s) => `${s.text}: ${s.avg.toFixed(1)}/5`) },
    { title: "Competencias más fuertes", items: skillRanking.slice(-6).reverse().map((s) => `${s.text}: ${s.avg.toFixed(1)}/5`) },
  ];

  return (
    <div className="indicators-shell">
      <div className="indicators-top">
        <div className="indicators-actions-card">
          <div>
            <h3>Indicadores y reportes</h3>
            <p>{evaluaciones.length} evaluaciones · {planes.filter((p) => p.estado !== "Cerrado").length} planes activos</p>
          </div>
          <div className="indicators-actions">
            <button onClick={exportExcel} style={{ borderColor: primary, color: primary }}><Download size={15} /> Excel</button>
            <button onClick={exportPdf} style={{ background: primary, color: "#fff", borderColor: primary }}><FileText size={15} /> PDF</button>
          </div>
        </div>

        <div className="indicators-chart-card">
          <div className="indicators-card-title">
            <h3>Estado de cumplimiento</h3>
            <span>{evaluaciones.length} registros</span>
          </div>
          <div className="indicators-chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={complianceData} dataKey="value" nameKey="name" innerRadius={42} outerRadius={70} paddingAngle={2}>
                  {complianceData.map((entry, index) => <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="indicators-legend">
            {complianceData.map((item, index) => (
              <span key={item.name}><i style={{ background: PIE_COLORS[index % PIE_COLORS.length] }} /> {item.name}: {item.value}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="indicators-report-grid">
        {reportCards.map((card) => (
          <div key={card.title} className="indicators-mini-card">
            <div className="indicators-card-title">
              <h3>{card.title}</h3>
              <span>{card.items.length}</span>
            </div>
            {card.items.length ? (
              <div className="indicators-list">
                {card.items.map((item) => <p key={item}>{item}</p>)}
              </div>
            ) : (
              <div className="indicators-empty">Sin datos</div>
            )}
          </div>
        ))}
      </div>

      <div className="indicators-ranking-card">
        <div className="indicators-card-title">
          <h3>Ranking de colaboradores</h3>
          <span>{latest.length} colaboradores</span>
        </div>
        <div className="indicators-ranking-list">
          {latest.map((c, idx) => (
            <div key={c.id} className="indicators-ranking-row">
              <p>{idx + 1}. {c.nombre}</p>
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
            <h3 className="font-bold text-sm" style={{ fontFamily: "inherit" }}>{section.group}</h3>
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
