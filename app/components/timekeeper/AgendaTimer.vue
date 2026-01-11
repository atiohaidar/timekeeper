<!--
  AgendaTimer.vue
  
  Displays the large active timer and progress bar for the current agenda.
  Visualizes "running", "overtime", and "warning" states.
-->
<script setup lang="ts">
import type { Agenda } from '~/types'

const props = defineProps<{
  agenda: Agenda
  elapsedSeconds: number
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

// Computed: display value
const displayTime = computed(() => {
    if (props.agenda.status === 'running') return elapsedFormatted.value
    
    if (props.agenda.status === 'done' && props.agenda.actualDurationSeconds !== undefined) {
        const minutes = Math.floor(props.agenda.actualDurationSeconds / 60)
        const seconds = props.agenda.actualDurationSeconds % 60
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    }

    return '--:--'
})
</script>

<template>
  <div 
    :class="[
      'border-sketchy-light p-4 transition-colors duration-300',
      timeStatus === 'overtime' ? 'bg-red-100' :
      timeStatus === 'warning' ? 'bg-yellow-100' :
      'bg-notebook-paper-dark'
    ]"
  >
    <p class="font-handwritten text-sm text-notebook-ink-light mb-1">⏲️ Waktu Berjalan</p>
    
    <!-- Big Timer Display -->
    <p 
      :class="[
        'font-typewriter text-3xl md:text-4xl font-bold tracking-widest',
        timeStatus === 'overtime' ? 'text-pen-red' :
        timeStatus === 'warning' ? 'text-yellow-700' :
        'text-notebook-ink',
        agenda.status === 'running' && 'animate-pulse-soft'
      ]"
    >
      {{ displayTime }}
    </p>

    <!-- Progress Bar (Visible only when running) -->
    <div v-if="agenda.status === 'running'" class="mt-3">
        <div class="progress-bar-hand h-2 bg-notebook-lines/20 rounded-full overflow-hidden">
            <div 
            class="progress-bar-hand-fill h-full bg-notebook-ink transition-all duration-300" 
            :style="{ width: `${progressPercent}%` }"
            ></div>
        </div>
        <p class="font-handwritten text-xs text-notebook-ink-light mt-1 text-right">
            {{ Math.round(progressPercent) }}%
        </p>
    </div>
  </div>
</template>
