<script setup>
import BaseTarjeta from './BaseTarjeta.vue'

const CIFRAS = [
  { valor: '98 %', etiqueta: 'de la población abastecida con agua subterránea en los municipios bajo jurisdicción de CARSUCRE' },
  { valor: '6', etiqueta: 'municipios sobre la zona de recarga: Sincelejo, Corozal, Sampués, Morroa, Los Palmitos y Ovejas' },
  { valor: '2010–2026', etiqueta: 'periodo de los registros de nivel estático que integra el aplicativo' },
  { valor: '0', etiqueta: 'alternativas superficiales de respaldo para el abastecimiento regional' },
]

const ARQUITECTURA = [
  {
    capa: 'Front-end',
    detalle: 'Vue 3 + Vite + Tailwind CSS. MapLibre GL JS para el visor geoespacial 3D y Three.js para el corte geológico. Desplegado en Vercel.',
  },
  {
    capa: 'Base de datos',
    detalle: 'Supabase (PostgreSQL) con los registros piezométricos históricos migrados desde los archivos CSV de CARSUCRE, consultados desde el cliente con Row Level Security.',
  },
  {
    capa: 'Servicio de inferencia',
    detalle: 'Microservicio FastAPI que aísla el modelo LSTM y devuelve las proyecciones de los escenarios inercial y óptimo.',
  },
]

const ALCANCE = [
  { estado: 'listo', texto: 'Delimitación del acuífero y zona de recarga sobre relieve 3D (RF-03)' },
  { estado: 'listo', texto: 'Catálogo y ficha técnica de los pozos de monitoreo (RF-01, RF-02)' },
  { estado: 'listo', texto: 'Serie temporal de nivel estático con tendencia (RF-04, RF-13)' },
  { estado: 'listo', texto: 'Modelo estratigráfico interactivo de las ocho unidades geológicas' },
  { estado: 'pendiente', texto: 'Conexión a Supabase con el histórico oficial de CARSUCRE' },
  { estado: 'pendiente', texto: 'Filtros por municipio, rango de fechas y comparación de pozos (RF-06, RF-09 a RF-12)' },
  { estado: 'pendiente', texto: 'Proyección LSTM con escenarios inercial y óptimo (RF-16 a RF-19)' },
  { estado: 'pendiente', texto: 'Exportación CSV/PNG/PDF y módulo de administración (RF-20 a RF-26)' },
]
</script>

<template>
  <div class="scroll-fino h-full overflow-y-auto">
    <div class="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <p class="text-xs font-semibold uppercase tracking-wider text-agua">
        Corporación Universitaria del Caribe · CECAR
      </p>
      <h2 class="mt-2 text-2xl font-semibold leading-tight text-sky-50 sm:text-3xl">
        Aplicativo web interactivo para la visualización y análisis de datos hidrogeológicos del
        acuífero Morroa
      </h2>
      <p class="mt-3 text-sm leading-relaxed text-slate-300">
        Camilo Andrés Rodríguez Arrieta · Roger José Mendoza Fortich<br />
        Directores: Mg. Carlos Segundo Cohen Manrique · Ing. Namuel Francisco Solórzano Peralta<br />
        <span class="text-slate-400">Ingeniería de Sistemas · Sincelejo, Sucre · 2026</span>
      </p>

      <div class="mt-8 grid gap-3 sm:grid-cols-2">
        <div
          v-for="c in CIFRAS"
          :key="c.etiqueta"
          class="rounded-xl border border-borde/70 bg-profundo/60 p-4"
        >
          <p class="font-mono text-2xl text-agua">{{ c.valor }}</p>
          <p class="mt-1 text-xs leading-relaxed text-slate-400">{{ c.etiqueta }}</p>
        </div>
      </div>

      <section class="mt-10">
        <h3 class="text-base font-semibold text-sky-100">El problema</h3>
        <p class="mt-2 text-sm leading-relaxed text-slate-300">
          El acuífero Morroa es la fuente principal de abastecimiento de la mayor parte de la
          población de Sucre, sin alternativas superficiales de respaldo. CARSUCRE monitorea sus
          niveles estáticos y dinámicos desde hace décadas y la información existe: el problema no
          es la ausencia del dato, sino la forma en que se presenta. Las series piezométricas
          conservan la complejidad técnica propia de cualquier registro hidrogeológico, lo que las
          vuelve difíciles de interpretar para quienes toman las decisiones sobre el recurso —
          alcaldías, funcionarios de planeación, administradores de acueducto y comunidades.
        </p>
        <p class="mt-3 text-sm leading-relaxed text-slate-300">
          Esa asimetría técnica limita la participación de múltiples actores en la gestión del agua.
          Este aplicativo busca cerrar la brecha entre el dato crudo y la decisión informada:
          convertir los registros originales en algo que un administrador de acueducto pueda abrir
          en un navegador y entender sin ayuda especializada.
        </p>
      </section>

      <section class="mt-10">
        <h3 class="text-base font-semibold text-sky-100">Objetivo general</h3>
        <p class="mt-2 text-sm leading-relaxed text-slate-300">
          Desarrollar un aplicativo web interactivo para la visualización y análisis de los datos de
          nivel estático (2010–2026) del acuífero Morroa, mediante el uso de metodologías y procesos
          de la ingeniería de software, que facilite el acceso y análisis de la información.
        </p>
      </section>

      <section class="mt-10">
        <h3 class="text-base font-semibold text-sky-100">Arquitectura</h3>
        <div class="mt-3 space-y-2">
          <BaseTarjeta v-for="a in ARQUITECTURA" :key="a.capa">
            <p class="text-sm font-medium text-sky-100">{{ a.capa }}</p>
            <p class="mt-1 text-xs leading-relaxed text-slate-300">{{ a.detalle }}</p>
          </BaseTarjeta>
        </div>
      </section>

      <section class="mt-10">
        <h3 class="text-base font-semibold text-sky-100">Estado de este prototipo</h3>
        <ul class="mt-3 space-y-1.5">
          <li v-for="a in ALCANCE" :key="a.texto" class="flex items-start gap-2.5 text-sm">
            <span
              class="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
              :class="a.estado === 'listo' ? 'bg-emerald-400' : 'bg-slate-600'"
              aria-hidden="true"
            />
            <span :class="a.estado === 'listo' ? 'text-slate-200' : 'text-slate-400'">
              {{ a.texto }}
            </span>
          </li>
        </ul>
      </section>

      <section class="mt-10">
        <h3 class="text-base font-semibold text-sky-100">Fuentes y límites de los datos</h3>
        <ul class="mt-3 space-y-2 text-xs leading-relaxed text-slate-300">
          <li>
            <strong class="text-slate-200">Delimitación del acuífero y zona de recarga.</strong>
            Digitalizadas a partir del Mapa Geológico de la Formación Morroa y del mapa de Recarga
            Anual 2023 (IDEAM / Google Earth Engine), ancladas a las coordenadas oficiales de las
            cabeceras municipales. Son una aproximación cartográfica y se reemplazan por el
            shapefile oficial de CARSUCRE sustituyendo los archivos de
            <code class="rounded bg-abismo px-1 py-0.5 font-mono text-[11px]">public/data</code>.
          </li>
          <li>
            <strong class="text-slate-200">Columna estratigráfica.</strong> Unidades, siglas y
            colores tomados de la leyenda del mapa geológico. Los espesores corresponden a valores
            medios representativos del sector central y varían lateralmente en campo.
          </li>
          <li>
            <strong class="text-amber-200">Red de pozos y series piezométricas.</strong> Datos de
            demostración, coherentes en magnitud y tendencia con lo descrito en la literatura, que
            permiten validar la visualización mientras se integra el histórico oficial de CARSUCRE.
            No deben usarse con fines de gestión.
          </li>
          <li>
            <strong class="text-slate-200">Relieve.</strong> Terrain Tiles (AWS Open Data).
            <strong class="text-slate-200">Cartografía base.</strong> Esri, OpenTopoMap,
            OpenStreetMap y CARTO.
          </li>
        </ul>
      </section>

      <footer class="mt-12 border-t border-borde/50 pt-6 text-xs text-slate-500">
        Prototipo de la Fase 1 (Levantamiento de requerimientos y caracterización de datos
        hidrogeológicos). Construido con Vue 3, Tailwind CSS, MapLibre GL JS y Three.js.
      </footer>
    </div>
  </div>
</template>
