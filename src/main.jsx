import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from "./theme/ThemeContext";
import { registerSW } from 'virtual:pwa-register'

const updateSW = registerSW({
  onNeedRefresh() {
    const shouldUpdate = window.confirm(
      "Hay una nueva version del ERP disponible. ¿Quieres actualizar ahora?"
    );
    if (shouldUpdate) updateSW(true);
  },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
