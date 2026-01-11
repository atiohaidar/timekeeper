<!--
  AgendaDetail.vue
  
  Detail view for selected agenda item.
  Shows full info, live timer, notes, and action buttons.
  
  UX Decisions:
  - Large handwritten title for quick identification
  - Live timer with animated pulse when running
  - Hand-drawn progress bar shows time completion
  - Sketchy buttons with hover wobble effect
  - Notes textarea styled like notebook paper
-->
<script setup lang="ts">
import type { Agenda } from '~/composables/useTimekeeper'

// Props
const props = defineProps<{
  agenda: Agenda | null
  elapsedSeconds: number
  estimatedStartTime?: Date | null
}>()

// Emits
const emit = defineEmits<{
  start: [id: string]
  stop: [id: string]
  cancel: [id: string]
  adjust: [id: string, minutes: number]
  updateNotes: [id: string, notes: string]
}>()

// Computed: formatted elapsed time
const elapsedFormatted = computed(() => {
  const minutes = Math.floor(props.elapsedSeconds / 60)
  const seconds = props.elapsedSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
})

// Computed: progress percentage
const progressPercent = computed(() => {
  if (!props.agenda) return 0
  const totalSeconds = props.agenda.plannedDuration * 60
  const percent = (props.elapsedSeconds / totalSeconds) * 100
  return Math.min(percent, 100)
})

// Computed: time status (on time, overtime)
const timeStatus = computed(() => {
  if (!props.agenda) return 'normal'
  const totalSeconds = props.agenda.plannedDuration * 60
  if (props.elapsedSeconds > totalSeconds) return 'overtime'
  if (props.elapsedSeconds > totalSeconds * 0.8) return 'warning'
  return 'normal'
})

// Format planned start time and end time
function formatTime(date: Date): string {
  return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

// Computed: original planned end time
const plannedEndTime = computed(() => {
  if (!props.agenda) return ''
  const endTime = new Date(props.agenda.plannedStartTime.getTime() + props.agenda.plannedDuration * 60000)
  return formatTime(endTime)
})

// Computed: estimated end time based on the cascading schedule
const estimatedEndTime = computed(() => {
  if (!props.agenda) return ''
  const start = props.estimatedStartTime || props.agenda.plannedStartTime
  const endTime = new Date(start.getTime() + props.agenda.plannedDuration * 60000)
  return formatTime(endTime)
})

// Check if there's a delay (estimated differs from planned by more than 1 min)
const hasDelay = computed(() => {
  if (!props.agenda || !props.estimatedStartTime) return false
  const diff = Math.abs(props.estimatedStartTime.getTime() - props.agenda.plannedStartTime.getTime())
  return diff > 60000 // More than 1 minute difference
})

// Local notes state for two-way binding
const localNotes = ref('')

watch(() => props.agenda, (newAgenda) => {
  if (newAgenda) {
    localNotes.value = newAgenda.notes
  }
}, { immediate: true })

// Debounced notes update
let notesTimeout: ReturnType<typeof setTimeout> | null = null
function handleNotesInput() {
  if (notesTimeout) clearTimeout(notesTimeout)
  notesTimeout = setTimeout(() => {
    if (props.agenda) {
      emit('updateNotes', props.agenda.id, localNotes.value)
    }
  }, 500)
}
</script>

<template>
  <div class="h-full flex flex-col bg-notebook-paper p-4 md:p-6 overflow-y-auto">
    <!-- Empty state -->
    <div v-if="!agenda" class="flex-1 flex items-center justify-center">
      <div class="text-center">
        <p class="font-handwritten text-2xl text-notebook-ink-light">
          👈 Pilih agenda dari daftar
        </p>
      </div>
    </div>

    <!-- Agenda detail -->
    <template v-else>
      <!-- Title -->
      <div class="mb-6">
        <h1 
          :class="[
            'font-handwritten-alt text-4xl font-bold text-notebook-ink leading-tight',
            agenda.status === 'cancelled' && 'line-through opacity-60'
          ]"
        >
          {{ agenda.title }}
        </h1>
        
        <!-- Status badge -->
        <span 
          :class="[
            'inline-block mt-2 badge-status',
            agenda.status === 'waiting' && 'badge-waiting',
            agenda.status === 'running' && 'badge-running',
            agenda.status === 'done' && 'badge-done',
            agenda.status === 'cancelled' && 'badge-cancelled'
          ]"
        >
          {{ 
            agenda.status === 'waiting' ? '⏳ Menunggu' :
            agenda.status === 'running' ? '⏱️ Sedang Berlangsung' :
            agenda.status === 'done' ? '✅ Selesai' :
            '❌ Dibatalkan'
          }}
        </span>
      </div>

      <!-- Description (Sticky Note Style) -->
      <div class="mb-8 mx-auto max-w-xl transform -rotate-1 hover:rotate-0 transition-transform duration-300">
        <div class="bg-yellow-100 p-4 shadow-md border border-yellow-200">
          <div class="w-8 h-3 bg-yellow-200/50 mx-auto -mt-6 mb-2"></div> <!-- Tape effect -->
          <p class="font-handwritten text-lg text-notebook-ink leading-relaxed text-center">
            "{{ agenda.description }}"
          </p>
        </div>
      </div>

      <!-- Info grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
        <!-- PIC -->
        <div class="border-sketchy-light p-4 bg-notebook-paper-dark">
          <p class="font-handwritten text-sm text-notebook-ink-light mb-1">👤 Penanggung Jawab</p>
          <p class="font-handwritten text-xl text-notebook-ink">{{ agenda.pic }}</p>
        </div>

        <!-- Planned time -->
        <div class="border-sketchy-light p-4 bg-notebook-paper-dark">
          <p class="font-handwritten text-sm text-notebook-ink-light mb-1">🕐 Jadwal Rencana</p>
          <p 
            class="font-typewriter text-lg text-notebook-ink"
            :class="{ 'line-through opacity-40': hasDelay }"
          >
            {{ agenda ? formatTime(agenda.plannedStartTime) : '' }} - {{ plannedEndTime }}
          </p>
          
          <div v-if="hasDelay" class="mt-2 pt-2 border-t border-dashed border-notebook-lines/30">
            <p class="font-handwritten text-xs text-pen-red mb-1">📍 Realita / Estimasi Saat Ini:</p>
            <p class="font-typewriter text-xl font-bold text-pen-red animate-pulse-soft">
              {{ estimatedStartTime ? formatTime(estimatedStartTime) : '' }} - {{ estimatedEndTime }}
            </p>
          </div>
        </div>

        <!-- Planned duration -->
        <div class="border-sketchy-light p-4 bg-notebook-paper-dark">
          <p class="font-handwritten text-sm text-notebook-ink-light mb-1">⏱️ Durasi Rencana</p>
          <p class="font-typewriter text-xl font-bold text-notebook-ink">{{ agenda.plannedDuration }} menit</p>
        </div>

        <!-- Actual running time -->
        <div 
          :class="[
            'border-sketchy-light p-4',
            timeStatus === 'overtime' ? 'bg-red-100' :
            timeStatus === 'warning' ? 'bg-yellow-100' :
            'bg-notebook-paper-dark'
          ]"
        >
          <p class="font-handwritten text-sm text-notebook-ink-light mb-1">⏲️ Waktu Berjalan</p>
          <p 
            :class="[
              'font-typewriter text-3xl md:text-4xl font-bold tracking-widest',
              timeStatus === 'overtime' ? 'text-pen-red' :
              timeStatus === 'warning' ? 'text-yellow-700' :
              'text-notebook-ink',
              agenda.status === 'running' && 'animate-pulse-soft'
            ]"
          >
            {{ 
              agenda.status === 'running' ? elapsedFormatted : 
              agenda.status === 'done' && agenda.actualDurationSeconds !== undefined ? 
              `${String(Math.floor(agenda.actualDurationSeconds / 60)).padStart(2, '0')}:${String(agenda.actualDurationSeconds % 60).padStart(2, '0')}` : 
              '--:--' 
            }}
          </p>
        </div>
      </div>

      <!-- Progress bar -->
      <div v-if="agenda.status === 'running'" class="mb-6">
        <p class="font-handwritten text-sm text-notebook-ink-light mb-2">Progress</p>
        <div class="progress-bar-hand">
          <div 
            class="progress-bar-hand-fill" 
            :style="{ width: `${progressPercent}%` }"
          ></div>
        </div>
        <p class="font-handwritten text-sm text-notebook-ink-light mt-1 text-right">
          {{ Math.round(progressPercent) }}%
        </p>
      </div>

      <!-- Primary Control Zone -->
      <div v-if="agenda.status === 'waiting' || agenda.status === 'running'" class="flex justify-center mb-8">
        <!-- Start button -->
        <button
          v-if="agenda.status === 'waiting'"
          class="btn-sketchy-large btn-sketchy-primary"
          @click="emit('start', agenda.id)"
        >
          ▶️ MULAI ACARA
        </button>

        <!-- Stop button -->
        <button
          v-if="agenda.status === 'running'"
          class="btn-sketchy-large btn-sketchy-success"
          @click="emit('stop', agenda.id)"
        >
          ✅ SELESAI
        </button>
      </div>

      <!-- Secondary Actions (Adjustments) -->
      <div v-if="agenda.status !== 'done' && agenda.status !== 'cancelled'" class="flex flex-wrap items-center justify-center gap-4 mb-6 pt-4 border-t border-dashed border-notebook-lines">
        <span class="font-handwritten text-notebook-ink-light text-sm">Atur Waktu:</span>
        <button
          class="btn-sketchy text-sm py-1 px-3"
          @click="emit('adjust', agenda.id, -5)"
        >
          -5 menit
        </button>
        <button
          class="btn-sketchy text-sm py-1 px-3"
          @click="emit('adjust', agenda.id, 5)"
        >
          +5 menit
        </button>

        <div class="w-px h-6 bg-notebook-lines mx-2"></div>

        <button
          class="btn-sketchy btn-sketchy-danger text-sm py-1 px-3"
          @click="emit('cancel', agenda.id)"
        >
          ❌ Batalkan
        </button>
      </div>

      <!-- Notes section -->
      <div class="flex-1 flex flex-col min-h-[200px]">
        <p class="font-handwritten text-sm text-notebook-ink-light mb-2">📝 Catatan</p>
        <textarea
          v-model="localNotes"
          class="textarea-notebook flex-1 w-full min-h-[150px]"
          placeholder="Tulis catatan di sini..."
          @input="handleNotesInput"
        ></textarea>
      </div>
    </template>
  </div>
</template>
