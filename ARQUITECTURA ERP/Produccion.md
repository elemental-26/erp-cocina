# Produccion.md

# Módulo: Producción

## Estado
Planificado. Será uno de los módulos centrales del ERP y trabajará integrado con Calidad, Recetas, Minuta Cíclica, Inventarios y Compras.

## Objetivo

Planificar, controlar y registrar la producción diaria de alimentos, garantizando el cumplimiento de las recetas estandarizadas, la cantidad programada, los tiempos de producción y la trazabilidad del proceso.

---

# Alcance

El módulo permitirá:

- Programar producción por fecha.
- Generar órdenes de producción.
- Asociar la producción a la minuta.
- Calcular cantidades según número de servicios (PAX).
- Registrar producción ejecutada.
- Controlar rendimientos.
- Registrar desperdicios y mermas.
- Consultar histórico de producción.

---

# Flujo del proceso

1. Selección de la minuta.
2. Cálculo automático de preparaciones.
3. Cálculo de insumos requeridos.
4. Generación de orden de producción.
5. Ejecución de la producción.
6. Registro de cantidades reales.
7. Validación de calidad.
8. Cierre de producción.

---

# Pantallas

## Programación
- Fecha.
- Comedor.
- Número de servicios.
- Preparaciones programadas.

## Orden de Producción
- Preparación.
- Cantidad.
- Responsable.
- Hora de inicio.
- Hora de finalización.

## Ejecución
- Cantidad producida.
- Rendimiento.
- Observaciones.
- Incidencias.

## Historial
- Producciones realizadas.
- Búsqueda por fecha.
- Exportación de registros.

---

# Datos utilizados

- Minuta Cíclica.
- Recetas.
- Preparaciones.
- Insumos.
- Personal.
- Áreas.
- Producción.
- Calidad.

---

# Reglas del negocio

1. Toda producción debe originarse en una programación.
2. Las cantidades se calculan automáticamente según el número de PAX.
3. Las recetas oficiales son la única fuente válida para la producción.
4. Toda producción debe quedar asociada a un responsable.
5. Los cambios posteriores deben conservar trazabilidad.

---

# Integraciones

- Calidad.
- Inventarios.
- Compras.
- Costos.
- Indicadores.
- Personal.

---

# Indicadores

- Producciones realizadas.
- Cumplimiento de programación.
- Rendimiento.
- Mermas.
- Desperdicios.
- Tiempo promedio de producción.

---

# Estado de implementación

Implementado:
- Sin implementación funcional.

Pendiente:
- Diseño funcional.
- Modelo de datos.
- Pantallas.
- Integración con Minuta Cíclica.
- Integración con Recetas.
- Integración con Inventarios.
- Integración con Calidad.
