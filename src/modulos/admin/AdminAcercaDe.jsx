import {
  APP_VERSION,
  CREADO_POR,
  CHANGELOG,
} from "../../services/appConstants";

export default function AdminAcercaDe({ primary }) {
  return (
    <div className="bg-white rounded-xl p-4">
      <h3
        className="font-bold text-base"
        style={{ fontFamily: "inherit" }}
      >
        Acerca del ERP
      </h3>
      <p className="text-sm text-gray-600 mt-1">
        Creado por <span className="font-bold">{CREADO_POR}</span>
      </p>
      <p className="text-sm text-gray-400 mb-3">
        Version actual: <span className="font-bold" style={{ color: primary }}>v{APP_VERSION}</span>
      </p>

      <div className="space-y-2">
        {CHANGELOG.map((item) => (
          <div key={item.version} className="border-l-2 pl-2.5" style={{ borderColor: primary }}>
            <p className="text-sm font-bold">
              v{item.version} <span className="text-xs font-normal text-gray-400">· {item.fecha}</span>
            </p>
            <p className="text-xs text-gray-600">{item.cambios}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
