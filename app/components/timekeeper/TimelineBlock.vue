<!--
  TimelineBlock.vue
  
  Single agenda block on the timeline.
  Height proportional to duration.
  Click to select.
-->
<script setup lang="ts">
import type { Agenda } from '~/composables/useTimekeeper'

// Props
const props = defineProps<{
  agenda: Agenda
  isSelected: boolean
  isRunning: boolean
  top: number
  height: number
  estimatedStartTime?: Date | null
}>()

// Emits
const emit = defineEmits<{
  select: [id: string]
}>()

// Format time
function formatTime(date: Date): string {
  return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

// Check if there's a delay (estimated differs from planned by more than 1 min)
const hasDelay = computed(() => {
  if (!props.estimatedStartTime) return false
  const diff = Math.abs(props.estimatedStartTime.getTime() - props.agenda.plannedStartTime.getTime())
  return diff > 60000 // More than 1 minute difference
})

// Status colors
const statusClasses = computed(() => {
  if (props.agenda.status === 'cancelled') return 'bg-gray-200 opacity-60 line-through'
  if (props.agenda.status === 'done') return 'bg-green-100 border-green-400'
  if (props.isRunning) return 'bg-yellow-100 border-yellow-400 animate-pulse-soft'
  if (props.isSelected) return 'bg-blue-50 border-blue-400'
  return 'bg-notebook-paper-dark border-notebook-ink/20'
})
</script>

<template>
  <div
    class="absolute left-2 right-2 rounded-lg border-2 px-3 py-2 cursor-pointer transition-all duration-200 overflow-hidden"
    :class="statusClasses"
    :style="{ top: `${top}px`, height: `${Math.max(height, 40)}px` }"
    @click="emit('select', agenda.id)"
  >
    <!-- Title -->
    <h3 
      class="font-handwritten text-sm md:text-base font-bold text-notebook-ink truncate"
      :class="{ 'line-through': agenda.status === 'cancelled' }"
    >
      {{ agenda.title }}
    </h3>

    <!-- Time range (if enough height) -->
    <p 
      v-if="height >= 50"
      class="font-typewriter text-xs text-notebook-ink-light"
    >
      <span v-if="hasDelay" class="line-through text-gray-400">{{ formatTime(agenda.plannedStartTime) }}</span>
      <span v-if="hasDelay" class="text-pen-red font-bold ml-1">→ {{ formatTime(estimatedStartTime!) }}</span>
      <span v-else>{{ formatTime(agenda.plannedStartTime) }}</span>
      <span class="ml-1">· {{ agenda.plannedDuration }}m</span>
    </p>

    <!-- PIC (if enough height) -->
    <p 
      v-if="height >= 70"
      class="font-handwritten text-xs text-notebook-ink-light truncate"
    >
      👤 {{ agenda.pic }}
    </p>

    <!-- Status indicator -->
    <div class="absolute top-2 right-2 text-lg">
      {{ 
        agenda.status === 'cancelled' ? '❌' :
        agenda.status === 'done' ? '✅' :
        isRunning ? '⏱️' : '⏳'
      }}
    </div>
  </div>
</template>
