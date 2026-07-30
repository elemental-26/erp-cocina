# 02_ARQUITECTURA.md

# Arquitectura del ERP Cocina Institucional

## Objetivo de la arquitectura
Mantener una estructura modular, escalable y desacoplada que permita evolucionar desde una PWA local hacia un ERP empresarial multiusuario.

## Arquitectura actual
- Frontend: React + Vite.
- Aplicación: Progressive Web App (PWA).
- Persistencia inicial: almacenamiento local y transición planificada hacia Google Sheets como repositorio operativo.
- Control de versiones: Git + GitHub.
- Despliegue: Netlify.

## Arquitectura objetivo
- Frontend React modular.
- API de servicios.
- Base de datos PostgreSQL.
- Autenticación por usuarios y roles.
- Sincronización entre dispositivos.
- Aplicación Android derivada de la misma base de código.

## Principios de diseño
- Un componente por responsabilidad.
- Reutilización de componentes.
- Separación entre lógica de negocio y presentación.
- Datos centralizados.
- Preparado para crecimiento sin reescribir módulos existentes.

## Módulos previstos
- Calidad.
- Producción.
- Minuta cíclica.
- Recetas.
- Fichas técnicas.
- Inventarios.
- Compras.
- Costos.
- Personal.
- Indicadores.
- Administración.

Este documento describe únicamente la arquitectura. El estado de implementación de cada módulo se documenta en los archivos correspondientes.
