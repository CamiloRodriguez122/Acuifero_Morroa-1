# Acuífero Morroa · Visor hidrogeológico 3D

Aplicativo web interactivo para la visualización y análisis de los datos hidrogeológicos del
acuífero Morroa (Sucre, Colombia).

Corporación Universitaria del Caribe – CECAR · Ingeniería de Sistemas · 2026
Camilo Andrés Rodríguez Arrieta · Roger José Mendoza Fortich
Directores: Mg. Carlos Segundo Cohen Manrique · Ing. Namuel Francisco Solórzano Peralta

Este repositorio contiene el **prototipo de visualización de la Fase 1**: la capa visible del
aplicativo descrito en la propuesta, centrada en el mapa 3D del acuífero. La conexión a Supabase,
el microservicio de inferencia LSTM y los módulos de exportación y administración corresponden a
fases posteriores.

## Qué incluye

**Mapa 3D (`Mapa 3D`)** — visor geoespacial sobre relieve real:

- Delimitación del acuífero y de su zona de recarga sobre un modelo digital de elevación, con
  control de exageración vertical, cuatro fondos cartográficos y vistas de cámara predefinidas.
- Pozos de monitoreo como columnas 3D cuya altura es proporcional a la profundidad del nivel del
  agua y cuyo color codifica la tasa de descenso.
- Bloque estratigráfico levantado sobre la huella real del acuífero, con las ocho unidades
  geológicas, separables y ocultables una a una.
- Buscador y filtro de pozos por municipio, ficha técnica y serie temporal 2010–2025 con línea de
  tendencia por mínimos cuadrados.

**Corte geológico (`Corte geológico`)** — bloque diagramático en Three.js:

- Las ocho unidades de la columna estratigráfica a su profundidad real, orbitables y separables.
- Superficie piezométrica actual y proyectada, y un pozo tipo con su columna de agua.
- Ficha de cada unidad: litología, rol hidrogeológico y rango de profundidad.

**El proyecto** — diagnóstico, objetivo, arquitectura, estado del prototipo y fuentes de datos.

## Puesta en marcha

```bash
npm install
npm run dev      # servidor de desarrollo
npm run build    # compila a dist/
npm run preview  # sirve dist/ en el puerto 4173
npm run lint     # ESLint (configuración plana) sobre .js y .vue
```

No requiere llaves de API ni variables de entorno: todas las teselas provienen de servicios
públicos abiertos.

## Arquitectura

| Capa | Tecnología |
| --- | --- |
| Interfaz | Vue 3 (`<script setup>`) + Vite + Tailwind CSS 4 |
| Visor geoespacial | MapLibre GL JS 5 (terreno raster-dem, `fill-extrusion`) |
| Corte geológico | Three.js (WebGL, `OrbitControls`) |
| Despliegue | Vercel (sitio estático) |

El estado del visor (capas activas, escalas, pozo seleccionado) vive en un único store creado con
`crearEstadoVisor()` y distribuido con `provide` / `inject`; el mapa y el corte lo comparten, de
modo que separar las unidades en una vista se refleja en la otra.

```
src/
├── App.vue                        Estructura, navegación y paneles
├── components/                    Componentes de interfaz
├── composables/
│   ├── useEstadoVisor.js          Store compartido (provide/inject)
│   ├── useMapaAcuifero.js         Ciclo de vida del mapa MapLibre
│   └── useCorteGeologico.js       Escena Three.js del corte
└── data/
    ├── formaciones.js             Columna estratigráfica
    └── mapa.js                    Fondos, cámara y municipios
public/data/                       Capas GeoJSON
scripts/gen_geodata.py             Genera las capas GeoJSON
```

## Datos

| Capa | Archivo | Origen |
| --- | --- | --- |
| Delimitación del acuífero | `public/data/acuifero-morroa.geojson` | Digitalizada sobre el Mapa Geológico de la Fm. Morroa y el mapa de Recarga Anual 2023 |
| Zona de recarga | `public/data/zona-recarga.geojson` | Franja de afloramiento de la Fm. Morroa |
| Pozos y series | `public/data/pozos.geojson` | **Datos de demostración** |

Todo está en WGS84 (EPSG:4326). `scripts/gen_geodata.py` regenera los tres archivos.

### Límites de los datos actuales

- **La delimitación es una aproximación cartográfica.** Los vértices se digitalizaron a partir de
  los mapas disponibles y se anclaron a las coordenadas oficiales de las cabeceras municipales. Se
  reemplaza por el shapefile oficial de CARSUCRE/IDEAM sustituyendo el GeoJSON correspondiente: el
  visor no asume nada sobre su forma.
- **Los espesores de las unidades** son valores medios representativos del sector central del
  acuífero (Sincelejo – Corozal – Morroa) y varían lateralmente en campo.
- **La red de pozos y sus series piezométricas son datos de demostración**, coherentes en magnitud
  y tendencia con lo descrito en la literatura, generados para validar la visualización mientras se
  integra el histórico oficial de CARSUCRE. **No deben usarse con fines de gestión.** La interfaz
  lo advierte en cada ficha de pozo.

### Fuentes de teselas

Relieve: [Terrain Tiles](https://registry.opendata.aws/terrain-tiles/) (AWS Open Data).
Cartografía base: Esri World Imagery, OpenTopoMap, OpenStreetMap y CARTO.

## Nota sobre el bloque estratigráfico del mapa

La especificación de estilos de MapLibre no admite extrusiones bajo el nivel del terreno
(`fill-extrusion-base` tiene mínimo 0), de modo que las unidades geológicas no pueden dibujarse
hacia abajo sobre el mapa. Se representan como un **bloque diagramático levantado** sobre la huella
real del acuífero: conserva el orden estratigráfico (Qal arriba, Tct abajo) y el espesor relativo
de cada unidad, y su cara superior equivale a la superficie del terreno. El corte vertical a
profundidad real se presenta en la vista de **Corte geológico**, construida con Three.js.

## Siguientes pasos

1. Sustituir las capas GeoJSON por la cartografía oficial de CARSUCRE.
2. Migrar los registros piezométricos a Supabase y leerlos desde el cliente (RF-01, RF-04).
3. Filtros por rango de fechas y comparación de pozos (RF-06, RF-09 a RF-12).
4. Integrar el microservicio FastAPI con el modelo LSTM y los escenarios inercial y óptimo
   (RF-16 a RF-19).
5. Exportación CSV/PNG/PDF y módulo de administración con carga validada (RF-20 a RF-26).
