import { useState } from "react";
import { ImagePlus, Save } from "lucide-react";

import { resizeImageToDataUrl } from "../../utils/imageUtils";

export default function AdminGeneral({
  config,
  onConfig,
  primary,
}) {const [nombre, setNombre] = useState(config.nombre);
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
    <div className="bg-white rounded-xl p-4 space-y-3">
      <div>
        <label className="text-xs font-bold text-gray-500 uppercase">Nombre del checklist</label>
        <input value={nombre} onChange={(e) => setNombre(e.target.value)} className="w-full border rounded-md px-4 py-2 mt-1" />
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
            <label className="px-4 py-1.5 rounded-md text-xs font-bold border cursor-pointer inline-flex items-center gap-1.5 w-fit"
              style={{ borderColor: primary, color: primary }}>
              <ImagePlus size={13} /> {logoBusy ? "Cargando…" : "Subir imagen"}
              <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={handleLogo} className="hidden" disabled={logoBusy} />
            </label>
            {logo && (
              <button onClick={quitarLogo} className="px-4 py-1.5 rounded-md text-xs font-bold border border-red-200 text-red-600 w-fit">Quitar logo</button>
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