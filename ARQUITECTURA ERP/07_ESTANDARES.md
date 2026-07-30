# 07_ESTANDARES.md

# Estándares de Desarrollo del ERP Cocina Institucional

## Objetivo

Definir las reglas técnicas y funcionales que deben seguirse durante el desarrollo del ERP para garantizar consistencia, mantenibilidad y escalabilidad.

## Arquitectura

- Arquitectura modular.
- Un componente = una responsabilidad.
- Separar lógica de negocio de la interfaz.
- Evitar componentes monolíticos.
- Reutilizar componentes antes de crear nuevos.

## Organización del proyecto

- `components/` Componentes reutilizables.
- `layouts/` Estructuras generales de pantalla.
- `services/` Acceso a datos y persistencia.
- `hooks/` Lógica reutilizable.
- `utils/` Funciones auxiliares.
- `styles/` Estilos globales.

## Convenciones

- Nombres de componentes en PascalCase.
- Hooks con prefijo `use`.
- Funciones descriptivas.
- Evitar código duplicado.
- Mantener archivos pequeños y especializados cuando sea posible.

## Git

- Un commit por funcionalidad terminada.
- Mensajes de commit claros.
- No mezclar correcciones con nuevas funcionalidades.

## Calidad

Antes de dar por terminado un Sprint:

- Compila correctamente.
- No rompe funcionalidades existentes.
- Está documentado.
- Fue probado.
- Actualiza `04_ESTADO_DESARROLLO.md`, `05_BACKLOG.md` y `06_BITACORA.md` cuando corresponda.

## Regla principal

Toda decisión de arquitectura debe quedar registrada en `09_DECISIONES.md`. Ninguna decisión importante debe depender únicamente del historial de conversaciones.
