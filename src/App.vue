<script setup>
import { computed, ref, shallowRef } from 'vue'
import EncabezadoApp from './components/EncabezadoApp.vue'
import MapaAcuifero3D from './components/MapaAcuifero3D.vue'
import CorteGeologico3D from './components/CorteGeologico3D.vue'
import PanelCapas from './components/PanelCapas.vue'
import ListaPozos from './components/ListaPozos.vue'
import FichaPozo from './components/FichaPozo.vue'
import SeccionProyecto from './components/SeccionProyecto.vue'
import { crearEstadoVisor } from './composables/useEstadoVisor.js'

const estado = crearEstadoVisor()
const vista = ref('mapa')
const panelLateral = ref('capas')
// En pantallas pequeñas el panel arranca cerrado para no tapar el mapa.
const panelAbierto = ref(typeof window === 'undefined' || window.innerWidth >= 768)
const mapaRef = shallowRef(null)
const pozos = ref([])

const pozoActivo = computed(() => estado.pozoSeleccionado.value)

function alCargarDatos(datos) {
  pozos.value = datos.pozos.features.map((f) => f.properties)
}

function seleccionarPozo(p) {
  estado.pozoSeleccionado.value = p
  if (vista.value !== 'mapa') vista.value = 'mapa'
}

function seleccionarDesdeLista(p) {
  seleccionarPozo(p)
  mapaRef.value?.enfocarPozo(p)
}
</script>

<template>
  <div class="flex h-full flex-col bg-abismo">
    <EncabezadoApp :vista="vista" @cambiar-vista="vista = $event" />

    <main class="relative min-h-0 flex-1">
      <!-- ------------------------------------------------ Vista: mapa 3D -->
      <div v-show="vista === 'mapa'" class="flex h-full min-h-0">
        <!-- Panel lateral izquierdo -->
        <!-- Cortina para cerrar el panel en pantallas pequeñas -->
        <div
          v-if="panelAbierto"
          class="absolute inset-0 z-20 bg-abismo/60 md:hidden"
          aria-hidden="true"
          @click="panelAbierto = false"
        />

        <div
          class="absolute inset-y-0 left-0 z-30 flex w-[86%] max-w-[320px] shrink-0 flex-col border-r border-borde/70 bg-profundo/95 backdrop-blur transition-all md:static md:max-w-none md:bg-profundo/70 md:backdrop-blur-none"
          :class="[
            panelAbierto ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
            panelAbierto ? 'md:w-[304px]' : 'md:w-0 md:overflow-hidden',
          ]"
        >
          <div class="flex shrink-0 gap-1 border-b border-borde/60 p-2">
            <button
              v-for="p in [
                { id: 'capas', nombre: 'Capas' },
                { id: 'pozos', nombre: 'Pozos' },
              ]"
              :key="p.id"
              type="button"
              class="flex-1 rounded-lg px-3 py-1.5 text-xs font-medium transition"
              :class="
                panelLateral === p.id
                  ? 'bg-agua/15 text-sky-100 ring-1 ring-agua/40'
                  : 'text-slate-300 hover:bg-white/5'
              "
              @click="panelLateral = p.id"
            >
              {{ p.nombre }}
            </button>
          </div>
          <div class="min-h-0 flex-1">
            <PanelCapas
              v-show="panelLateral === 'capas'"
              :rotando="mapaRef?.rotando ?? false"
              @volar="mapaRef?.volarA($event)"
              @rotar="mapaRef?.rotar()"
            />
            <ListaPozos
              v-show="panelLateral === 'pozos'"
              :pozos="pozos"
              :seleccionado="pozoActivo?.codigo ?? null"
              @seleccionar="seleccionarDesdeLista"
            />
          </div>
        </div>

        <!-- Mapa -->
        <div class="relative min-w-0 flex-1">
          <MapaAcuifero3D
            ref="mapaRef"
            @pozo="seleccionarPozo"
            @listo="alCargarDatos"
          />
          <button
            type="button"
            class="absolute left-3 top-3 z-10 rounded-lg border border-borde/70 bg-profundo/90 px-2.5 py-1.5 text-xs text-slate-200 transition hover:bg-white/10"
            :aria-expanded="panelAbierto"
            @click="panelAbierto = !panelAbierto"
          >
            {{ panelAbierto ? '‹ Ocultar panel' : 'Capas y pozos ›' }}
          </button>
        </div>

        <!-- Ficha del pozo -->
        <div v-if="pozoActivo" class="hidden w-[336px] shrink-0 lg:block">
          <FichaPozo
            :pozo="pozoActivo"
            @cerrar="estado.pozoSeleccionado.value = null"
            @enfocar="mapaRef?.enfocarPozo($event)"
          />
        </div>
      </div>

      <!-- ------------------------------------------ Vista: corte geológico -->
      <div v-if="vista === 'corte'" class="h-full">
        <CorteGeologico3D />
      </div>

      <!-- ------------------------------------------------ Vista: proyecto -->
      <div v-if="vista === 'proyecto'" class="h-full">
        <SeccionProyecto />
      </div>

      <!-- Ficha del pozo en pantallas pequeñas -->
      <div
        v-if="pozoActivo && vista === 'mapa'"
        class="absolute inset-x-0 bottom-0 z-20 max-h-[62%] lg:hidden"
      >
        <FichaPozo
          :pozo="pozoActivo"
          class="border-t border-borde"
          @cerrar="estado.pozoSeleccionado.value = null"
          @enfocar="mapaRef?.enfocarPozo($event)"
        />
      </div>
    </main>
  </div>
</template>
