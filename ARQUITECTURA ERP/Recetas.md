# Recetas.md

# Módulo: Recetas

## Estado
Planificado.

## Objetivo
Administrar las recetas estandarizadas y las fichas técnicas que servirán como base para producción, costos, compras, inventarios y calidad.

---

# Alcance

- Crear y mantener recetas.
- Versionar recetas.
- Definir ingredientes e insumos.
- Registrar procedimiento de elaboración.
- Calcular rendimiento.
- Definir porciones.
- Asociar parámetros de calidad.

---

# Flujo

1. Crear receta.
2. Asociar ingredientes.
3. Definir cantidades y unidades.
4. Registrar procedimiento.
5. Establecer rendimiento y porciones.
6. Publicar versión vigente.
7. Utilizar en producción y minuta.

---

# Pantallas

## Recetas
- Código.
- Nombre.
- Familia.
- Estado.
- Versión.

## Ingredientes
- Insumo.
- Cantidad.
- Unidad.
- Observaciones.

## Procedimiento
- Paso a paso.
- Tiempos.
- Temperaturas.
- Equipos requeridos.

## Ficha Técnica
- Rendimiento.
- Porciones.
- Parámetros de calidad.
- Imagen.
- Historial de versiones.

---

# Datos utilizados

- Insumos.
- Familias.
- Unidades.
- Preparaciones.
- Producción.
- Costos.
- Calidad.

---

# Reglas del negocio

1. Cada receta tendrá un código único.
2. Solo existirá una versión vigente por receta.
3. Toda modificación generará una nueva versión.
4. Las recetas serán la fuente oficial para producción y costos.
5. Los ingredientes se tomarán únicamente del catálogo de insumos.

---

# Integraciones

- Producción.
- Costos.
- Inventarios.
- Compras.
- Minuta Cíclica.
- Calidad.

---

# Indicadores

- Recetas activas.
- Versiones publicadas.
- Rendimiento promedio.
- Costo por receta.
- Cumplimiento de estándares.

---

# Estado de implementación

Implementado:
- Sin implementación funcional.

Pendiente:
- Modelo de datos.
- Editor de recetas.
- Control de versiones.
- Fichas técnicas.
- Integración con Producción, Costos e Inventarios.
