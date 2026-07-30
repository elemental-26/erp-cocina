import { useState } from "react";
import { Lock } from "lucide-react";
import Modal from "./Modal";

export default function PasswordModal({
  usuario,
  onSuccess,
  onClose,
}) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState(false);

  return (
    <Modal title={`Ingreso · ${usuario.nombre}`} onClose={onClose}>
      <p className="text-sm text-gray-500 mb-3">
        Ingresa tu contraseña para continuar.
      </p>

      <input
        type="password"
        autoFocus
        value={pw}
        onChange={(e) => {
          setPw(e.target.value);
          setErr(false);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            pw === usuario.password ? onSuccess() : setErr(true);
          }
        }}
        className="w-full border rounded-md px-4 py-2 text-center text-lg tracking-widest"
        style={{ borderColor: err ? "#B5333D" : "#D8DCE1" }}
        placeholder="Contraseña"
      />

      {err && (
        <p className="text-xs text-red-600 mt-1">
          Contraseña incorrecta, intenta de nuevo.
        </p>
      )}

      <button
        onClick={() => {
          if (pw === usuario.password) onSuccess();
          else setErr(true);
        }}
        className="w-full mt-4 py-2.5 rounded-md font-bold text-white flex items-center justify-center gap-2"
        style={{ background: "#1F2B3A" }}
      >
        <Lock size={16} /> Ingresar
      </button>
    </Modal>
  );
}