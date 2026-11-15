# Panel Administrativo — COTATUR / MINTUR

Panel de control y gestión operativa para la fiscalización, trazado y administración turística de Venezuela.
Desarrollado con **React 19**, **Vite** y **Leaflet**.

---

## 🏛️ Características Principales

- **Identidad Institucional Dinámica (Multi-marca):**
  - Adapta logos y colores institucionales automáticamente: muestra **COTATUR** para usuarios con cuenta `@cotatur.gob.ve`, y **MINTUR** para cuentas de alcance nacional.
- **Control Territorial por Región / Estado:**
  - Los coordinadores estadales y operadores solo gestionan entidades de su jurisdicción territorial asignada.
- **Wizards Multi-Paso:**
  - **DestinosCRUD:** Formulario por pasos (Datos generales $\to$ Ubicación GPS con mapa $\to$ Web y Opcionales).
  - **RouteDesigner:** Diseñador secuencial de rutas turísticas (Datos de ruta $\to$ Paradas secuenciales con reordenamiento $\to$ Estimaciones y vista previa).
  - **ValidationWizard:** Asistente de auditoría y fiscalización de recaudos para prestadores turísticos.
- **Gestión en Tiempo Real:**
  - `NotificationCenter` conectado por WebSockets (`Socket.IO`) que alerta al funcionario cuando un prestador se registra desde la web.
- **Cartografía Avanzada:**
  - `MapaControl` con soporte de capas de calor (Heatmaps), clustering de destinos y carga de polígonos GeoJSON de los 24 estados.
- **Papelera y Gobernanza:**
  - Módulo centralizado de papelera (`Papelera.jsx`) con restauración granular y soft delete.
- **Temas:**
  - Soporte completo de Modo Claro, Modo Oscuro y Automático según el sistema.

---

## 🛠️ Comandos de Desarrollo

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo (puerto 8001)
npm run dev

# Iniciar en modo offline (puerto 8101)
npm run dev:offline

# Compilar para producción
npm run build
```

---

## 🌐 Conectividad
- **Desarrollo:** `http://localhost:8001` conectando al backend en `http://localhost:8000/api`
- **Modo Offline:** `http://localhost:8101` conectando al backend en `http://localhost:8100/api`
