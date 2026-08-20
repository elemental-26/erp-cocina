import React, { useEffect, useMemo, useState } from "react";
import {
  BookOpen, Camera, Download, FileText, ImagePlus, ListChecks,
  Pencil, Plus, Save, Search, Send, Trash2, X
} from "lucide-react";

const tabs = [
  { id: "fichas", label: "Fichas", icon: FileText },
  { id: "insumos", label: "Insumos", icon: ListChecks },
  { id: "preparaciones", label: "Preparaciones", icon: BookOpen },
];

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function slug(value) {
  return String(value || "documento").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function money(value) {
  const n = Number(value || 0);
  return n.toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
}

function pct(value) {
  const n = Number(value || 0);
  return `${Math.round(n * 100)}%`;
}

function resizeImageToDataUrl(file, maxDim = 720) {
  return new Promise((resolve, reject) => {
    if (!file.type?.startsWith("image/")) {
      reject(new Error("Selecciona una imagen válida."));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("No se pudo leer la imagen."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("La imagen no se pudo procesar."));
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
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.76));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function downloadHtml(filename, html) {
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

async function shareHtml(filename, html, title, text) {
  const file = new File([html], filename, { type: "text/html" });
  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    await navigator.share({ title, text, files: [file] });
    return;
  }
  downloadHtml(filename, html);
  window.open(`https://wa.me/?text=${encodeURIComponent(`${text}\nDocumento descargado: ${filename}`)}`, "_blank", "noopener,noreferrer");
}

function scaledAmount(value, basePax, targetPax) {
  const n = Number(value || 0);
  const base = Number(basePax || 0);
  const target = Number(targetPax || base || 0);
  if (!n || !base || !target || base === target) return value || "";
  const scaled = (n * target) / base;
  return Number.isInteger(scaled) ? scaled : Number(scaled.toFixed(2));
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

function fichaHtml({ receta, insumos, config, primary, paxObjetivo }) {
  const costo = calcularCostoReceta(receta, insumos);
  const logo = config?.logo ? `<img src="${config.logo}" style="height:52px;max-width:140px;object-fit:contain" />` : "";
  const foto = receta.foto ? `<img src="${receta.foto}" style="width:100%;height:190px;object-fit:cover;border-radius:10px;border:1px solid #dde1e6" />` : "";
  const origin = config?.nombre || "ERP";
  const font = printFontFamily(config);
  const targetPax = paxObjetivo || receta.pax;
  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>Ficha técnica - ${receta.nombre}</title>
  <style>
    body{font-family:${font};color:#1f2b3a;margin:24px;background:#fff}
    .origin{position:fixed;right:16px;top:12px;font-size:10px;color:#68717d}
    .top{display:flex;justify-content:space-between;gap:16px;align-items:flex-start;border-bottom:3px solid ${primary};padding-bottom:12px}
    h1{margin:0;font-size:24px;text-transform:uppercase}.muted{color:#68717d;font-size:12px}
    .grid{display:grid;grid-template-columns:1fr 220px;gap:14px;margin-top:14px}.box{border:1px solid #dde1e6;border-radius:10px;padding:10px}
    table{width:100%;border-collapse:collapse;margin-top:8px}th,td{border-bottom:1px solid #e7eaee;padding:7px;text-align:left;font-size:12px}th{background:#f4f6f8;text-transform:uppercase}
    .chips{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-top:12px}.chip{border:1px solid #dde1e6;border-radius:8px;padding:8px}
    .sign{height:52px;border-bottom:1px solid #1f2b3a;margin-top:22px}
    ${printWatermarkCss()}
  </style>
</head>
<body>
  ${printWatermarkHtml(config)}
  <div class="print-content">
  <div class="origin">Creado por ${origin}</div>
  <div class="top">
    <div>${logo}</div>
    <div style="text-align:right"><h1>${receta.nombre}</h1><p class="muted">${receta.id} · ${receta.calidad?.codigoFicha || "Ficha técnica"}</p></div>
  </div>
  <div class="chips">
    <div class="chip"><b>Versión</b><br>${receta.version || "1"}</div>
    <div class="chip"><b>Servicio</b><br>${receta.calidad?.servicio || ""}</div>
    <div class="chip"><b>PAX</b><br>${targetPax || ""}</div>
    <div class="chip"><b>Complejidad</b><br>${receta.calidad?.complejidad || ""}</div>
    <div class="chip"><b>Costo por porción</b><br>${money(costo.porcion)}</div>
  </div>
  <div class="grid">
    <div>
      <div class="box"><b>Ingredientes</b><table><thead><tr><th>Insumo</th><th>Cantidad</th><th>Unidad</th><th>Costo</th></tr></thead><tbody>
        ${(receta.ingredientes || []).map((i) => `<tr><td>${i.insumo || ""}</td><td>${scaledAmount(i.cantidad, receta.pax, targetPax)}</td><td>${i.unidad || ""}</td><td>${money(costo.porIngrediente[i.id] || 0)}</td></tr>`).join("")}
      </tbody></table></div>
      <div class="box" style="margin-top:12px"><b>Procedimiento</b><table><thead><tr><th>Paso</th><th>Descripción</th><th>Tiempo</th><th>Temp.</th></tr></thead><tbody>
        ${(receta.procedimiento || []).map((p) => `<tr><td>${p.paso || ""}</td><td>${p.descripcion || ""}</td><td>${p.tiempoMin ? `${p.tiempoMin} min` : ""}</td><td>${p.temperatura || ""}</td></tr>`).join("")}
      </tbody></table></div>
    </div>
    <div>
      ${foto}
      <div class="box" style="margin-top:12px"><b>Calidad</b>
        <p><b>Color:</b> ${receta.calidad?.color || ""}</p>
        <p><b>Textura:</b> ${receta.calidad?.textura || ""}</p>
        <p><b>Sabor:</b> ${receta.calidad?.sabor || ""}</p>
        <p><b>Conservación:</b> ${receta.calidad?.temperaturaConservacion || ""}</p>
        <p><b>Rechazo:</b> ${receta.calidad?.criteriosRechazo || ""}</p>
      </div>
    </div>
  </div>
  <div class="box" style="margin-top:12px"><b>Observaciones generales</b><p>${receta.observacionesGenerales || ""}</p></div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:34px;margin-top:22px"><div><div class="sign"></div><p class="muted">Elaboró</p></div><div><div class="sign"></div><p class="muted">Aprobó</p></div></div>
  </div>
</body>
</html>`;
}

function calcularCostoReceta(receta, insumos) {
  const byId = new Map(insumos.map((item) => [item.id, item]));
  const byName = new Map(insumos.map((item) => [String(item.nombre || "").toLowerCase(), item]));
  const porIngrediente = {};
  const total = (receta.ingredientes || []).reduce((sum, ing) => {
    const insumo = byId.get(ing.insumoId) || byName.get(String(ing.insumo || "").toLowerCase());
    const costoUnitario = Number(insumo?.costoReal || insumo?.costoUnitario || 0);
    const line = Number(ing.cantidad || 0) * costoUnitario;
    porIngrediente[ing.id] = line;
    return sum + line;
  }, 0);
  const pax = Number(receta.pax || 0);
  return { total, porcion: pax ? total / pax : 0, porIngrediente };
}

export default function EstandarizacionCocinaView({
  familias,
  insumos,
  recetas,
  preparaciones,
  mermas,
  onFamilias,
  onInsumos,
  onRecetas,
  onPreparaciones,
  onMermas,
  primary,
  accent,
  config,
  currentUser,
}) {
  const [tab, setTab] = useState("fichas");

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-xl p-2 flex gap-1 overflow-x-auto">
        {tabs.map((item) => {
          const Icon = item.icon;
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className="px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-1.5 whitespace-nowrap"
              style={{ background: active ? primary : "#F4F6F8", color: active ? "#fff" : "#4B5563" }}
            >
              <Icon size={15} /> {item.label}
            </button>
          );
        })}
      </div>

      {tab === "fichas" && (
        <FichasView
          recetas={recetas}
          insumos={insumos}
          onRecetas={onRecetas}
          primary={primary}
          accent={accent}
          config={config}
          currentUser={currentUser}
        />
      )}
      {tab === "insumos" && <InsumosView familias={familias} insumos={insumos} mermas={mermas} onFamilias={onFamilias} onInsumos={onInsumos} onMermas={onMermas} primary={primary} accent={accent} />}
      {tab === "preparaciones" && <PreparacionesView preparaciones={preparaciones} onPreparaciones={onPreparaciones} primary={primary} />}
      {tab === "merma" && <MermaView insumos={insumos} mermas={mermas} onMermas={onMermas} primary={primary} accent={accent} />}
    </div>
  );
}

function FichasView({ recetas, insumos, onRecetas, primary, accent, config, currentUser }) {
  const [query, setQuery] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const [showBrowser, setShowBrowser] = useState(false);
  const [selectedId, setSelectedId] = useState(recetas[0]?.id || "");
  const [editing, setEditing] = useState(false);
  const filtered = useMemo(() => recetas
    .filter((item) => showInactive ? item.activa === false : item.activa !== false)
    .filter((receta) => `${receta.id} ${receta.nombre} ${receta.calidad?.servicio || ""}`.toLowerCase().includes(query.toLowerCase())), [recetas, query, showInactive]);
  const receta = filtered.find((item) => item.id === selectedId) || filtered[0] || null;
  const [paxObjetivo, setPaxObjetivo] = useState(receta?.pax || "");
  const costo = receta ? calcularCostoReceta(receta, insumos) : { total: 0, porcion: 0 };

  useEffect(() => {
    setPaxObjetivo(receta?.pax || "");
  }, [receta?.id, receta?.pax]);

  const updateReceta = (next) => {
    onRecetas(recetas.map((item) => item.id === next.id ? next : item));
  };
  const deleteReceta = () => {
    if (!receta) return;
    const ok = confirm(`¿Eliminar la ficha técnica "${receta.nombre}"? Esta acción solo afecta este registro.`);
    if (!ok) return;
    const remaining = recetas.filter((item) => item.id !== receta.id);
    const nextFiltered = remaining.filter((item) => showInactive ? item.activa === false : item.activa !== false);
    onRecetas(remaining);
    setSelectedId(nextFiltered[0]?.id || "");
    setEditing(false);
  };

  const addReceta = () => {
    const next = {
      id: `REC${String(recetas.length + 1).padStart(3, "0")}`,
      nombre: "Nueva ficha técnica",
      version: "1",
      creadoPor: currentUser?.nombre || "",
      rendimiento: "",
      pax: "",
      pesoPorPax: "",
      foto: "",
      ingredientes: [],
      procedimiento: [],
      calidad: {},
      observacionesGenerales: "",
      activa: true,
    };
    onRecetas([next, ...recetas]);
    setSelectedId(next.id);
    setShowInactive(false);
    setEditing(true);
  };

  const handleFoto = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !receta) return;
    const foto = await resizeImageToDataUrl(file, 760);
    updateReceta({ ...receta, foto });
    event.target.value = "";
  };

  const descargar = () => {
    if (!receta) return;
    downloadHtml(`ficha-tecnica-${slug(receta.nombre)}.html`, fichaHtml({ receta, insumos, config, primary, paxObjetivo }));
  };

  const whatsapp = async () => {
    if (!receta) return;
    await shareHtml(
      `ficha-tecnica-${slug(receta.nombre)}.html`,
      fichaHtml({ receta, insumos, config, primary, paxObjetivo }),
      `Ficha técnica - ${receta.nombre}`,
      `Ficha técnica: ${receta.nombre}`
    );
  };

  if (!receta) {
    return (
      <div className="std-empty-state">
        <p>{showInactive ? "No hay fichas inactivas para mostrar." : "No hay fichas activas cargadas."}</p>
        <div>
          {showInactive && <button onClick={() => setShowInactive(false)} className="std-action-button" style={{ borderColor: primary, color: primary }}>Ver activas</button>}
          <button onClick={addReceta} className="std-action-button primary" style={{ background: primary }}><Plus size={15} /> Crear ficha</button>
        </div>
      </div>
    );
  }

  return (
    <div className="std-fichas-shell">
      <div className="std-toolbar">
        <div className="std-search">
          <Search size={16} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar ficha, código o servicio..." />
        </div>
        <select
          value={receta?.id || ""}
          onChange={(e) => { setSelectedId(e.target.value); setEditing(false); }}
          className="std-select"
        >
          {filtered.map((item) => (
            <option key={item.id} value={item.id}>
              {item.nombre} · {item.id} · {item.calidad?.servicio || "Sin servicio"}{item.activa === false ? " · Inactiva" : ""}
            </option>
          ))}
        </select>
        <button onClick={() => setShowBrowser((v) => !v)} className="std-action-button" style={{ borderColor: primary, color: primary }}>
          {showBrowser ? "Ocultar" : `Lista (${filtered.length})`}
        </button>
        <button onClick={addReceta} className="std-action-button primary" style={{ background: primary }}><Plus size={15} /> Nueva</button>
        <label className="std-inline-check">
          <input type="checkbox" checked={showInactive} onChange={(e) => { setShowInactive(e.target.checked); setSelectedId(""); setEditing(false); }} />
          Inactivas
        </label>
        <span className="std-count">{filtered.length} ficha(s)</span>
        {showBrowser && (
          <div className="std-browser">
            {filtered.map((item) => (
              <button
                key={item.id}
                onClick={() => { setSelectedId(item.id); setEditing(false); setShowBrowser(false); }}
                className="std-browser-row"
                style={{ background: receta.id === item.id ? `${primary}12` : undefined }}
              >
                <span>{item.nombre}</span>
                <small>{item.id}</small>
                <small>{item.calidad?.servicio || "Sin servicio"}</small>
                <b style={{ color: item.activa === false ? "#B5333D" : "#1E7A46" }}>{item.activa === false ? "Inactiva" : "Activa"}</b>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="std-ficha-card">
        <div className="std-photo-panel">
          <div className="std-photo-frame">
            {receta.foto ? <img src={receta.foto} alt="" /> : <Camera size={34} />}
          </div>
          <label className="file-icon-button std-photo-button" title="Insertar imagen" aria-label="Insertar imagen" style={{ color: primary, borderColor: primary }}>
            <ImagePlus size={18} />
            <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFoto} />
          </label>
        </div>

        <div className="std-ficha-main">
          {editing ? (
            <FichaEditForm receta={receta} onChange={updateReceta} insumos={insumos} primary={primary} onClose={() => { setEditing(false); setPaxObjetivo(receta.pax || ""); }} />
          ) : (
            <>
              <div className="std-ficha-header">
                <div>
                  <h2 style={{ fontFamily: "inherit" }}>{receta.nombre}</h2>
                  <p>{receta.id} · Ficha {receta.calidad?.codigoFicha || "sin código"} · Versión {receta.version || "1"}</p>
                </div>
                <div className="std-header-actions">
                  <button onClick={() => setEditing(true)} className="std-action-button" style={{ color: primary, borderColor: primary }}><Pencil size={15} /> Editar</button>
                  <button onClick={deleteReceta} className="std-action-button danger"><Trash2 size={15} /> Eliminar</button>
                </div>
              </div>

              <div className="std-metric-grid">
                <div className="std-metric">
                  <span>PAX objetivo</span>
                  <input type="number" min="1" value={paxObjetivo || receta.pax || ""} onChange={(e) => setPaxObjetivo(e.target.value)} />
                </div>
                <Metric label="Complejidad" value={receta.calidad?.complejidad || "-"} />
                <Metric label="Costo total" value={money(costo.total)} />
                <Metric label="Costo porción" value={money(costo.porcion)} strong color={accent} />
              </div>

              <div className="std-download-actions">
                <button onClick={descargar} className="std-action-button primary" style={{ background: primary }}><Download size={15} /> Descargar</button>
                <button onClick={whatsapp} className="std-action-button success"><Send size={15} /> WhatsApp</button>
              </div>
            </>
          )}
        </div>
      </div>

      {!editing && (
        <div className="std-detail-grid">
          <Section title="Ingredientes">
            <div className="std-table-wrap">
              <table className="std-table">
                <thead><tr><th>Insumo</th><th>Cantidad</th><th>Unidad</th><th>Costo</th></tr></thead>
                  <tbody>
                    {(receta.ingredientes || []).map((ing) => (
                      <tr key={ing.id}>
                        <td><b>{ing.insumo}</b></td>
                        <td>{scaledAmount(ing.cantidad, receta.pax, paxObjetivo)}</td>
                        <td>{ing.unidad}</td>
                        <td>{money(costo.porIngrediente?.[ing.id] || 0)}</td>
                      </tr>
                    ))}
                  </tbody>
              </table>
            </div>
          </Section>

          <Section title="Procedimiento">
            <div className="std-procedure-list">
                {receta.procedimiento.map((paso, index) => (
                  <div key={`${paso.paso}-${index}`} className="std-procedure-row">
                    <b>{paso.paso || index + 1}</b>
                    <span>{paso.descripcion}</span>
                    <small>{paso.tiempoMin ? `${paso.tiempoMin} min` : ""}</small>
                    <small>{paso.temperatura}</small>
                  </div>
                ))}
            </div>
          </Section>

          <Section title="Parámetros de calidad">
            <div className="std-quality-grid">
                {[
                  ["Color", receta.calidad?.color],
                  ["Textura", receta.calidad?.textura],
                  ["Sabor", receta.calidad?.sabor],
                  ["Aroma", receta.calidad?.aroma],
                  ["Cocción", receta.calidad?.temperaturaCoccion],
                  ["Conservación", receta.calidad?.temperaturaConservacion],
                  ["Presentación", receta.calidad?.presentacion],
                  ["Rechazo", receta.calidad?.criteriosRechazo],
                ].map(([label, value]) => <Metric key={label} label={label} value={value || "-"} />)}
            </div>
          </Section>
        </div>
      )}
    </div>
  );
}

function FichaEditForm({ receta, onChange, insumos, primary, onClose }) {
  const set = (patch) => onChange({ ...receta, ...patch });
  const setCalidad = (field, value) => set({ calidad: { ...receta.calidad, [field]: value } });
  const ingredientes = receta.ingredientes || [];
  const procedimiento = receta.procedimiento || [];
  const addIngrediente = () => set({ ingredientes: [...(receta.ingredientes || []), { id: genId(), insumoId: "", insumo: "", cantidad: "", unidad: "" }] });
  const addPaso = () => set({ procedimiento: [...(receta.procedimiento || []), { paso: String((receta.procedimiento || []).length + 1), descripcion: "", tiempoMin: "", temperatura: "", equipo: "", observaciones: "" }] });

  return (
    <div className="std-edit-form">
      <div className="std-edit-header">
        <div>
          <h3 style={{ fontFamily: "inherit" }}>Editar ficha técnica</h3>
          <p>Actualiza datos, ingredientes, procedimiento y parámetros de calidad.</p>
        </div>
        <button onClick={onClose} className="std-save-button" style={{ background: primary }}><Save size={16} /> Guardar</button>
      </div>

      <div className="std-edit-general">
        <Input label="Nombre" value={receta.nombre} onChange={(v) => set({ nombre: v })} />
        <label className="std-form-field">
          <span>Código</span>
          <input value={receta.id} readOnly />
        </label>
        <Input label="Versión" value={receta.version} onChange={(v) => set({ version: v })} />
        <Input label="PAX" type="number" value={receta.pax} onChange={(v) => set({ pax: v })} />
        <Input label="Servicio" value={receta.calidad?.servicio || ""} onChange={(v) => setCalidad("servicio", v)} />
        <Input label="Complejidad" value={receta.calidad?.complejidad || ""} onChange={(v) => setCalidad("complejidad", v)} />
        <label className="std-active-check">
          <input type="checkbox" checked={receta.activa !== false} onChange={(e) => set({ activa: e.target.checked })} />
          Ficha activa
        </label>
      </div>

      <InlineEditor title="Ingredientes" onAdd={addIngrediente} header={["Insumo", "Cantidad", "Unidad", ""]}>
        {ingredientes.map((ing, index) => (
          <div key={ing.id} className="std-edit-ingredient-row">
            <select
              value={ing.insumoId}
              onChange={(e) => {
                const insumo = insumos.find((item) => item.id === e.target.value);
                const next = ingredientes.map((item) => item.id === ing.id ? { ...item, insumoId: e.target.value, insumo: insumo?.nombre || item.insumo, unidad: insumo?.unidad || item.unidad } : item);
                set({ ingredientes: next });
              }}
              className="border rounded-md px-2 py-1.5 text-sm"
            >
              <option value="">{ing.insumo || "Seleccionar insumo"}</option>
              {insumos.map((item) => <option key={item.id} value={item.id}>{item.nombre}</option>)}
            </select>
            <input value={ing.cantidad} onChange={(e) => set({ ingredientes: ingredientes.map((item) => item.id === ing.id ? { ...item, cantidad: e.target.value } : item) })} placeholder="Cant." />
            <input value={ing.unidad} onChange={(e) => set({ ingredientes: ingredientes.map((item) => item.id === ing.id ? { ...item, unidad: e.target.value } : item) })} placeholder="Und." />
            <button onClick={() => set({ ingredientes: ingredientes.filter((_, i) => i !== index) })} className="std-delete-button" title="Eliminar ingrediente" aria-label="Eliminar ingrediente"><Trash2 size={16} /></button>
          </div>
        ))}
      </InlineEditor>

      <InlineEditor title="Procedimiento" onAdd={addPaso} header={["Paso", "Descripción", "Min.", "T°", ""]}>
        {procedimiento.map((paso, index) => (
          <div key={index} className="std-edit-procedure-row">
            <input value={paso.paso} onChange={(e) => set({ procedimiento: procedimiento.map((item, i) => i === index ? { ...item, paso: e.target.value } : item) })} />
            <input value={paso.descripcion} onChange={(e) => set({ procedimiento: procedimiento.map((item, i) => i === index ? { ...item, descripcion: e.target.value } : item) })} placeholder="Descripción" />
            <input value={paso.tiempoMin} onChange={(e) => set({ procedimiento: procedimiento.map((item, i) => i === index ? { ...item, tiempoMin: e.target.value } : item) })} placeholder="Min." />
            <input value={paso.temperatura} onChange={(e) => set({ procedimiento: procedimiento.map((item, i) => i === index ? { ...item, temperatura: e.target.value } : item) })} placeholder="T°" />
            <button onClick={() => set({ procedimiento: procedimiento.filter((_, i) => i !== index) })} className="std-delete-button" title="Eliminar paso" aria-label="Eliminar paso"><Trash2 size={16} /></button>
          </div>
        ))}
      </InlineEditor>

      <div className="std-edit-quality">
        {["color", "textura", "sabor", "aroma", "temperaturaCoccion", "temperaturaConservacion", "presentacion", "criteriosRechazo"].map((field) => (
          <Input key={field} label={field.replace(/([A-Z])/g, " $1")} value={receta.calidad?.[field] || ""} onChange={(v) => setCalidad(field, v)} />
        ))}
      </div>
      <textarea value={receta.observacionesGenerales || ""} onChange={(e) => set({ observacionesGenerales: e.target.value })} className="std-observations" placeholder="Observaciones generales" />
    </div>
  );
}

function InsumosView({ familias, insumos, mermas, onFamilias, onInsumos, onMermas, primary, accent }) {
  const [query, setQuery] = useState("");
  const [showFamilias, setShowFamilias] = useState(false);
  const [newFamilia, setNewFamilia] = useState({ nombre: "", prefijo: "" });
  const [newInsumo, setNewInsumo] = useState({ id: "", nombre: "", familia: familias[0]?.nombre || "General", unidad: "", presentacion: "", valorCompra: "", mermaPct: 0 });
  const [mermaFor, setMermaFor] = useState(null);
  const [mermaForm, setMermaForm] = useState({ fecha: new Date().toISOString().slice(0, 10), teorica: "", real: "" });
  const familiaOptions = familias.length ? familias : [{ id: "general", nombre: "General", prefijo: "GEN" }];
  const filtered = insumos.filter((item) => `${item.id} ${item.nombre} ${item.familia}`.toLowerCase().includes(query.toLowerCase()));
  const update = (id, patch) => {
    onInsumos(insumos.map((item) => {
      if (item.id !== id) return item;
      const next = { ...item, ...patch };
      const costoUnitario = Number(next.presentacion) ? Number(next.valorCompra || 0) / Number(next.presentacion) : Number(next.costoUnitario || 0);
      const merma = Number(next.mermaPct || 0);
      return { ...next, costoUnitario, costoReal: merma < 1 ? costoUnitario / (1 - merma) : costoUnitario };
    }));
  };
  const canAdd = newInsumo.id.trim() && newInsumo.nombre.trim() && newInsumo.familia && newInsumo.unidad.trim() && Number(newInsumo.presentacion) > 0 && Number(newInsumo.valorCompra) > 0;
  const add = () => {
    if (!canAdd) return;
    const costoUnitario = Number(newInsumo.valorCompra) / Number(newInsumo.presentacion);
    const merma = Number(newInsumo.mermaPct || 0);
    onInsumos([{ ...newInsumo, id: newInsumo.id.trim().toUpperCase(), nombre: newInsumo.nombre.trim(), costoUnitario, costoReal: merma < 1 ? costoUnitario / (1 - merma) : costoUnitario, activo: true }, ...insumos]);
    setNewInsumo({ id: "", nombre: "", familia: familiaOptions[0]?.nombre || "General", unidad: "", presentacion: "", valorCompra: "", mermaPct: 0 });
  };
  const saveMerma = () => {
    const insumo = insumos.find((item) => item.id === mermaFor);
    if (!insumo || !mermaForm.teorica) return;
    onMermas([{ id: genId(), fecha: mermaForm.fecha, insumoId: insumo.id, insumo: insumo.nombre, teorica: Number(mermaForm.teorica), real: Number(mermaForm.real || 0) }, ...mermas]);
    setMermaForm({ fecha: new Date().toISOString().slice(0, 10), teorica: "", real: "" });
    setMermaFor(null);
  };
  const addFamilia = () => {
    const nombre = newFamilia.nombre.trim();
    if (!nombre) return;
    const prefijo = (newFamilia.prefijo.trim() || nombre.slice(0, 3)).toUpperCase();
    onFamilias([...familias, { id: slug(nombre), nombre, prefijo }]);
    setNewFamilia({ nombre: "", prefijo: "" });
  };
  const updateFamilia = (id, patch) => {
    const current = familias.find((familia) => familia.id === id);
    if (!current) return;
    const nextNombre = patch.nombre ?? current.nombre;
    const cleanNombre = String(nextNombre || "").trim();
    if (!cleanNombre) return;
    onFamilias(familias.map((familia) => {
      if (familia.id !== id) return familia;
      const prefijo = patch.prefijo ?? familia.prefijo ?? cleanNombre.slice(0, 3).toUpperCase();
      return { ...familia, ...patch, nombre: cleanNombre, prefijo: String(prefijo || "").toUpperCase() };
    }));
    if (cleanNombre !== current.nombre) {
      onInsumos(insumos.map((item) => item.familia === current.nombre ? { ...item, familia: cleanNombre } : item));
      if (newInsumo.familia === current.nombre) setNewInsumo({ ...newInsumo, familia: cleanNombre });
    }
  };
  const deleteFamilia = (familia) => {
    const used = insumos.some((item) => item.familia === familia.nombre);
    if (used) return;
    onFamilias(familias.filter((item) => item.id !== familia.id));
  };

  return (
    <Section title="Insumos base para fichas y costos">
      <div className="std-insumos-shell">
        <div className="std-insumos-toolbar">
          <div className="std-search">
            <Search size={16} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar insumo..." />
          </div>
          <button onClick={() => setShowFamilias((value) => !value)} className="std-action-button" style={{ color: primary, borderColor: primary }}>Familias ({familias.length})</button>
          <span>{filtered.length} insumo(s)</span>
        </div>

        {showFamilias && (
          <div className="std-family-panel">
            <div className="std-family-create">
              <input value={newFamilia.nombre} onChange={(e) => setNewFamilia({ ...newFamilia, nombre: e.target.value })} placeholder="Nueva familia" />
              <input value={newFamilia.prefijo} onChange={(e) => setNewFamilia({ ...newFamilia, prefijo: e.target.value })} placeholder="Prefijo" maxLength={6} />
              <button onClick={addFamilia} disabled={!newFamilia.nombre.trim()} className="std-action-button primary" style={{ background: primary }}><Plus size={15} /> Crear</button>
            </div>
            <div className="std-family-list">
              {familias.map((familia) => {
                const usedCount = insumos.filter((item) => item.familia === familia.nombre).length;
                return (
                  <div key={familia.id} className="std-family-row">
                    <input value={familia.nombre} onChange={(e) => updateFamilia(familia.id, { nombre: e.target.value })} />
                    <input value={familia.prefijo || ""} onChange={(e) => updateFamilia(familia.id, { prefijo: e.target.value })} maxLength={6} />
                    <span>{usedCount} insumo(s)</span>
                    <button onClick={() => deleteFamilia(familia)} disabled={usedCount > 0} className="std-delete-button" title={usedCount > 0 ? "No se puede eliminar una familia en uso" : "Eliminar familia"} aria-label="Eliminar familia"><Trash2 size={16} /></button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="std-insumo-create">
          <input value={newInsumo.id} onChange={(e) => setNewInsumo({ ...newInsumo, id: e.target.value })} placeholder="Código" />
          <input value={newInsumo.nombre} onChange={(e) => setNewInsumo({ ...newInsumo, nombre: e.target.value })} placeholder="Nombre del insumo" />
          <select value={newInsumo.familia} onChange={(e) => setNewInsumo({ ...newInsumo, familia: e.target.value })}>{familiaOptions.map((f) => <option key={f.id}>{f.nombre}</option>)}</select>
          <input value={newInsumo.unidad} onChange={(e) => setNewInsumo({ ...newInsumo, unidad: e.target.value })} placeholder="Unidad" />
          <input type="number" value={newInsumo.presentacion} onChange={(e) => setNewInsumo({ ...newInsumo, presentacion: e.target.value })} placeholder="Present." />
          <input type="number" value={newInsumo.valorCompra} onChange={(e) => setNewInsumo({ ...newInsumo, valorCompra: e.target.value })} placeholder="Compra" />
          <input type="number" step="0.01" value={newInsumo.mermaPct} onChange={(e) => setNewInsumo({ ...newInsumo, mermaPct: e.target.value })} placeholder="Merma" />
          <button onClick={add} disabled={!canAdd} className="std-action-button primary" style={{ background: primary }}><Plus size={15} /> Crear</button>
        </div>
      </div>

      {mermaFor && (
        <div className="std-merma-panel">
          <b>Merma: {insumos.find((item) => item.id === mermaFor)?.nombre}</b>
          <input type="date" value={mermaForm.fecha} onChange={(e) => setMermaForm({ ...mermaForm, fecha: e.target.value })} />
          <input type="number" value={mermaForm.teorica} onChange={(e) => setMermaForm({ ...mermaForm, teorica: e.target.value })} placeholder="Teórica" />
          <input type="number" value={mermaForm.real} onChange={(e) => setMermaForm({ ...mermaForm, real: e.target.value })} placeholder="Real" />
          <button onClick={saveMerma} className="std-action-button primary" style={{ background: accent || primary }}>Guardar</button>
          <button onClick={() => setMermaFor(null)} className="std-action-button">Cerrar</button>
        </div>
      )}

      <div className="std-insumos-table-wrap">
        <div className="std-insumos-table">
          <div className="std-insumos-head">
            <span>Código</span>
            <span>Nombre</span>
            <span>Familia</span>
            <span>Unidad</span>
            <span>Present.</span>
            <span>Compra</span>
            <span>Merma</span>
            <span>Costo real</span>
            <span>Activo</span>
            <span>Control</span>
          </div>
          <div className="std-insumos-body">
            {filtered.map((item) => (
              <div key={item.id} className="std-insumo-row">
                <input value={item.id} onChange={(e) => update(item.id, { id: e.target.value })} />
                <input value={item.nombre} onChange={(e) => update(item.id, { nombre: e.target.value })} />
                <select value={item.familia} onChange={(e) => update(item.id, { familia: e.target.value })}>{familias.map((f) => <option key={f.id}>{f.nombre}</option>)}</select>
                <input value={item.unidad} onChange={(e) => update(item.id, { unidad: e.target.value })} />
                <input type="number" value={item.presentacion || ""} onChange={(e) => update(item.id, { presentacion: e.target.value })} />
                <input type="number" value={item.valorCompra || ""} onChange={(e) => update(item.id, { valorCompra: e.target.value })} />
                <input type="number" step="0.01" value={item.mermaPct || 0} onChange={(e) => update(item.id, { mermaPct: e.target.value })} />
                <strong>{money(item.costoReal)}</strong>
                <label className="std-row-check" title={item.activo !== false ? "Activo" : "Inactivo"}>
                  <input type="checkbox" checked={item.activo !== false} onChange={(e) => update(item.id, { activo: e.target.checked })} />
                </label>
                <button onClick={() => setMermaFor(item.id)} className="std-action-button compact" style={{ borderColor: primary, color: primary }}>Merma</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}

function PreparacionesView({ preparaciones, onPreparaciones, primary }) {
  const [query, setQuery] = useState("");
  const filtered = preparaciones.filter((item) => `${item.codigo} ${item.categoria} ${item.subcategoria} ${item.nombre}`.toLowerCase().includes(query.toLowerCase()));
  const update = (id, patch) => onPreparaciones(preparaciones.map((item) => item.id === id ? { ...item, ...patch } : item));
  const add = () => onPreparaciones([{ id: genId(), codigo: "", categoria: "", subcategoria: "", nombre: "Nueva preparación", estado: "Activo", observaciones: "" }, ...preparaciones]);

  return (
    <Section title="Banco de preparaciones">
      <div className="std-prep-shell">
        <div className="std-prep-toolbar">
          <div className="std-search">
            <Search size={16} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar preparación..." />
          </div>
          <button onClick={add} className="std-action-button primary" style={{ background: primary }}><Plus size={15} /> Agregar</button>
          <span>{filtered.length} preparación(es)</span>
        </div>
      </div>

      <div className="std-prep-table-wrap">
        <div className="std-prep-table">
          <div className="std-prep-head">
            <span>Código</span>
            <span>Preparación</span>
            <span>Categoría</span>
            <span>Subcategoría</span>
            <span>Estado</span>
          </div>
          <div className="std-prep-body">
            {filtered.map((item) => (
              <div key={item.id} className="std-prep-row">
                <input value={item.codigo} onChange={(e) => update(item.id, { codigo: e.target.value })} placeholder="Código" />
                <input value={item.nombre} onChange={(e) => update(item.id, { nombre: e.target.value })} placeholder="Nombre" />
                <input value={item.categoria} onChange={(e) => update(item.id, { categoria: e.target.value })} placeholder="Categoría" />
                <input value={item.subcategoria} onChange={(e) => update(item.id, { subcategoria: e.target.value })} placeholder="Subcategoría" />
                <select value={item.estado} onChange={(e) => update(item.id, { estado: e.target.value })}><option>Activo</option><option>Inactivo</option></select>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}

function MermaView({ insumos, mermas, onMermas, primary, accent }) {
  const [form, setForm] = useState({ fecha: new Date().toISOString().slice(0, 10), insumoId: insumos[0]?.id || "", teorica: "", real: "" });
  const add = () => {
    const insumo = insumos.find((item) => item.id === form.insumoId);
    if (!insumo || !form.teorica) return;
    onMermas([{ id: genId(), ...form, insumo: insumo.nombre, teorica: Number(form.teorica), real: Number(form.real || 0) }, ...mermas]);
    setForm({ ...form, teorica: "", real: "" });
  };
  const totalMerma = mermas.reduce((sum, item) => sum + (Number(item.real || 0) - Number(item.teorica || 0)), 0);
  const base = mermas.reduce((sum, item) => sum + Number(item.teorica || 0), 0);
  return (
    <div className="grid lg:grid-cols-[360px_1fr] gap-3">
      <Section title="Registrar merma">
        <div className="space-y-2">
          <Input label="Fecha" type="date" value={form.fecha} onChange={(v) => setForm({ ...form, fecha: v })} />
          <label className="block text-xs font-bold text-gray-500 uppercase">Insumo</label>
          <select value={form.insumoId} onChange={(e) => setForm({ ...form, insumoId: e.target.value })} className="w-full border rounded-md px-3 py-2 text-sm">{insumos.map((item) => <option key={item.id} value={item.id}>{item.nombre}</option>)}</select>
          <Input label="Cantidad teórica" type="number" value={form.teorica} onChange={(v) => setForm({ ...form, teorica: v })} />
          <Input label="Cantidad real" type="number" value={form.real} onChange={(v) => setForm({ ...form, real: v })} />
          <button onClick={add} className="w-full py-2 rounded-md text-white font-bold" style={{ background: primary }}>Guardar merma</button>
        </div>
      </Section>
      <Section title="Control de merma">
        <div className="grid grid-cols-2 gap-2 mb-3">
          <Metric label="Registros" value={mermas.length} />
          <Metric label="% merma acumulada" value={base ? pct(totalMerma / base) : "0%"} strong color={accent} />
        </div>
        <div className="space-y-1.5">
          {mermas.map((item) => {
            const diff = Number(item.real || 0) - Number(item.teorica || 0);
            return (
              <div key={item.id} className="grid grid-cols-[90px_1fr_90px_34px] gap-2 bg-gray-50 rounded-lg px-3 py-2 text-sm items-center">
                <span>{item.fecha}</span>
                <b>{item.insumo}</b>
                <span style={{ color: diff > 0 ? "#B5333D" : "#1E7A46" }}>{diff.toFixed(2)}</span>
                <button onClick={() => onMermas(mermas.filter((x) => x.id !== item.id))} className="text-red-500"><X size={16} /></button>
              </div>
            );
          })}
        </div>
      </Section>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="std-section">
      <h3 style={{ fontFamily: "inherit" }}>{title}</h3>
      {children}
    </div>
  );
}

function Metric({ label, value, strong, color }) {
  return (
    <div className="metric-card">
      <span>{label}</span>
      <strong style={{ color: color || "#1F2B3A", fontSize: strong ? 18 : undefined }}>{value}</strong>
    </div>
  );
}

function Input({ label, value, onChange, type = "text" }) {
  return (
    <label className="std-form-field">
      <span>{label}</span>
      <input type={type} value={value || ""} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function InlineEditor({ title, onAdd, children, header }) {
  return (
    <div className="std-inline-editor">
      <div className="std-inline-editor-top">
        <p>{title}</p>
        <button onClick={onAdd}><Plus size={13} /> Agregar</button>
      </div>
      {header && (
        <div className={`std-inline-editor-head ${header.length === 4 ? "ingredients" : "procedure"}`}>
          {header.map((item, index) => <span key={`${item}-${index}`}>{item}</span>)}
        </div>
      )}
      <div className="std-inline-editor-body">{children}</div>
    </div>
  );
}
