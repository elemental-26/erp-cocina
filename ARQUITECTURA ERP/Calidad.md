# Calidad.md

# Módulo: Calidad

## Estado
Módulo inicial del ERP y núcleo funcional del sistema.

## Objetivo

Administrar y controlar las actividades relacionadas con la verificación de calidad en la operación de cocina institucional mediante listas de chequeo, registros, hallazgos e indicadores.

---

# Alcance

El módulo permite:

- Ejecutar inspecciones.
- Registrar incumplimientos.
- Gestionar hallazgos.
- Registrar observaciones.
- Consultar historial.
- Analizar resultados.
- Administrar parámetros de evaluación.

---

# Usuarios

- Administrador
- Supervisor
- Inspector
- Consulta (futuro)

---

# Pantallas

## Inicio de sesión

Funciones

- Selección de usuario.
- Validación mediante contraseña.
- Control por roles.

---

## Inspección

Funciones

- Selección de área.
- Evaluación por ítems.
- Registro de observaciones.
- Evaluación de EPP.
- Asociación de personal.
- Guardado de inspección.

---

## Historial

Funciones

- Consulta de inspecciones.
- Exportación de registros.
- Búsqueda por fecha.

---

## Hallazgos

Funciones

- Registro automático.
- Seguimiento.
- Estado.
- Observaciones.
- Cierre.

---

## Análisis

Funciones

- Indicadores.
- Tendencias.
- Resultados acumulados.

---

## Administración

Submódulos

- Áreas
- Personal
- Usuarios
- EPP
- Configuración

---

# Datos utilizados

- Configuración
- Usuarios
- Personal
- Áreas
- Ítems de inspección
- EPP
- Inspecciones
- Hallazgos

---

# Reglas del negocio

1. Solo usuarios autenticados pueden ingresar.
2. Solo administradores pueden modificar parámetros.
3. Toda inspección queda registrada.
4. Los hallazgos deben conservar trazabilidad.
5. La información debe persistir entre sesiones.

---

# Integraciones futuras

- Producción
- Inventarios
- Indicadores
- Minuta Cíclica
- Compras
- WhatsApp
- Base de datos PostgreSQL

---

# Estado de implementación

Implementado:
- Autenticación básica.
- Gestión de usuarios.
- Gestión de áreas.
- Gestión de personal.
- Gestión de EPP.
- Registro de inspecciones.
- Historial.
- Hallazgos.
- Indicadores básicos.
- PWA.

Pendiente:
- Refactorización completa.
- Modularización total.
- Persistencia centralizada.
- Sincronización multiusuario.
- Integración con el resto del ERP.
