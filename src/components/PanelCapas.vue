<script setup>
import { computed } from 'vue'
import { FORMACIONES, ROLES } from '../data/formaciones.js'
import { FONDOS, VISTAS } from '../data/mapa.js'
import { usarEstadoVisor } from '../composables/useEstadoVisor.js'
import ControlInterruptor from './ControlInterruptor.vue'
import ControlRango from './ControlRango.vue'

defineProps({
  rotando: { type: Boolean, default: false },
})
const emit = defineEmits(['volar', 'rotar'])

const estado = usarEstadoVisor()
const estratos = estado.estratosVisibles

const todosVisibles = computed(() => estratos.value.length === FORMACIONES.length)

function alternarEstrato(id) {
  const i = estratos.value.indexOf(id)
  estratos.value = i === -1 ? [...estratos.value, id] : estratos.value.filter((x) => x !== id)
}

function alternarTodos() {
  estratos.value = todosVisibles.value ? ['Tpm'] : FORMACIONES.map((f) => f.id)
}

function soloAcuifero() {
  estratos.value = ['Tpm']
}
</script>

<template>
  <div class="scroll-fino flex h-full flex-col gap-4 overflow-y-auto p-4">
    <!-- Fondo cartográfico -->
    <div>
      <p class="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
        Fondo cartográfico
      </p>
      <div class="grid grid-cols-2 gap-1.5">
        <button
          v-for="f in FONDOS"
          :key="f.id"
          type="button"
          class="rounded-lg border px-2.5 py-1.5 text-xs transition"
          :class="
            estado.fondo.value === f.id
              ? 'border-agua bg-agua/15 text-sky-100'
              : 'border-borde/70 text-slate-300 hover:border-borde hover:bg-white/5'
          "
          @click="estado.fondo.value = f.id"
        >
          {{ f.nombre }}
        </button>
      </div>
    </div>

    <!-- Vistas de cámara -->
    <div>
      <p class="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
        Ir a
      </p>
      <div class="flex flex-wrap gap-1.5">
        <button
          v-for="v in VISTAS"
          :key="v.id"
          type="button"
          class="rounded-full border border-borde/70 px-2.5 py-1 text-xs text-slate-300 transition hover:border-agua hover:bg-agua/10 hover:text-sky-100"
          @click="emit('volar', v)"
        >
          {{ v.nombre }}
        </button>
      </div>
      <div class="mt-2 flex gap-1.5">
        <button
          type="button"
          class="flex-1 rounded-lg border px-2.5 py-1.5 text-xs transition"
          :class="
            rotando
              ? 'border-agua bg-agua/15 text-sky-100'
              : 'border-borde/70 text-slate-300 hover:bg-white/5'
          "
          @click="emit('rotar')"
        >
          {{ rotando ? 'Detener giro' : 'Girar vista' }}
        </button>
      </div>
    </div>

    <!-- Capas del visor -->
    <div>
      <p class="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
        Capas
      </p>
      <ControlInterruptor
        v-model="estado.capas.value.terreno"
        etiqueta="Relieve 3D"
        descripcion="Modelo digital de elevación sobre el terreno"
      />
      <ControlRango
        v-if="estado.capas.value.terreno"
        v-model="estado.exageracion.value"
        etiqueta="Exageración vertical"
        :min="1"
        :max="4"
        :paso="0.1"
        sufijo="×"
      />
      <ControlInterruptor
        v-model="estado.capas.value.acuifero"
        etiqueta="Delimitación del acuífero"
        descripcion="Huella del sistema acuífero Morroa"
      />
      <ControlInterruptor
        v-model="estado.capas.value.recarga"
        etiqueta="Zona de recarga"
        descripcion="Franja de afloramiento de la Fm. Morroa"
        color="#22d3ee"
      />
      <ControlInterruptor
        v-model="estado.capas.value.pozos"
        etiqueta="Pozos de monitoreo"
        descripcion="Altura ∝ profundidad del nivel del agua"
        color="#fbbf24"
      />
      <ControlRango
        v-if="estado.capas.value.pozos"
        v-model="estado.escalaPozos.value"
        etiqueta="Escala de las columnas"
        :min="10"
        :max="150"
        :paso="5"
        sufijo="×"
        :decimales="0"
      />
      <ControlInterruptor
        v-model="estado.capas.value.municipios"
        etiqueta="Cabeceras municipales"
        color="#fde68a"
      />
    </div>

    <!-- Bloque estratigráfico -->
    <div>
      <p class="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
        Bloque estratigráfico
      </p>
      <ControlInterruptor
        v-model="estado.capas.value.bloque"
        etiqueta="Mostrar unidades geológicas"
        descripcion="Columna levantada sobre la huella real, en orden Qal → Tct"
        color="#7fe7e0"
      />
      <template v-if="estado.capas.value.bloque">
        <ControlRango
          v-model="estado.alturaSuelo.value"
          etiqueta="Elevar bloque"
          :min="0"
          :max="6000"
          :paso="100"
          sufijo=" m"
          :decimales="0"
        />
        <ControlRango
          v-model="estado.exageracionBloque.value"
          etiqueta="Exageración del bloque"
          :min="2"
          :max="30"
          :paso="1"
          sufijo="×"
          :decimales="0"
        />
        <ControlRango
          v-model="estado.separacion.value"
          etiqueta="Separar capas"
          :min="0"
          :max="1"
          :paso="0.05"
          :decimales="2"
        />
        <div class="mt-1 flex gap-1.5 px-2">
          <button
            type="button"
            class="flex-1 rounded-lg border border-borde/70 px-2 py-1 text-xs text-slate-300 transition hover:bg-white/5"
            @click="alternarTodos"
          >
            {{ todosVisibles ? 'Ocultar todas' : 'Ver todas' }}
          </button>
          <button
            type="button"
            class="flex-1 rounded-lg border border-borde/70 px-2 py-1 text-xs text-slate-300 transition hover:bg-white/5"
            @click="soloAcuifero"
          >
            Solo acuífero
          </button>
        </div>
      </template>
    </div>

    <!-- Leyenda estratigráfica interactiva -->
    <div>
      <p class="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
        Unidades geológicas
      </p>
      <ul class="space-y-0.5">
        <li v-for="f in FORMACIONES" :key="f.id">
          <button
            type="button"
            class="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition"
            :class="
              estado.estratosVisibles.value.includes(f.id) ? 'hover:bg-white/5' : 'opacity-40 hover:bg-white/5'
            "
            @click="alternarEstrato(f.id)"
            @mouseenter="estado.formacionActiva.value = f.id"
          >
            <span
              class="h-4 w-4 shrink-0 rounded border border-black/40"
              :style="{ backgroundColor: f.color }"
            />
            <span class="min-w-0 flex-1">
              <span class="block truncate text-sm text-slate-100">{{ f.nombre }}</span>
              <span class="block text-xs text-slate-400">
                {{ f.sigla }} · {{ ROLES[f.rol].etiqueta }} · {{ f.techo }}–{{ f.base }} m
              </span>
            </span>
            <span
              v-if="f.principal"
              class="shrink-0 rounded-full bg-agua/20 px-1.5 py-0.5 text-[10px] font-medium text-agua-claro"
            >
              acuífero
            </span>
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>
