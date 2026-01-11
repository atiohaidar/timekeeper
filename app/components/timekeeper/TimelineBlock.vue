<!--
  TimelineBlock.vue
  
  Single agenda block on the timeline.
  Height proportional to duration.
  Click to select.
-->
<script setup lang="ts">
import type { Agenda } from '~/stores/timekeeper'

// Props
const props = defineProps<{
  agenda: Agenda
  isSelected: boolean
  isRunning: boolean
  top: number
  height: number
  estimatedStartTime?: Date | null
  isEditMode?: boolean
}>()

// Emits
const emit = defineEmits<{
  select: [id: string]
  dragStart: [id: string]
  dragEnd: []
  dragOver: [id: string]
  drop: [id: string]
  adjust: [minutes: number]
}>()

// Resize logic
const isResizing = ref(false)
let startY = 0
let startDuration = 0

function startResize(e: MouseEvent) {
  if (!props.isEditMode) return
  e.preventDefault()
  e.stopPropagation()
  isResizing.value = true
  startY = e.clientY
  startDuration = props.agenda.plannedDuration
  
  window.addEventListener('mousemove', handleResize)
  window.addEventListener('mouseup', stopResize)
  document.body.style.cursor = 'ns-resize'
}

function handleResize(e: MouseEvent) {
  if (!isResizing.value) return
  
  // Calculate how many pixels the mouse moved
  const deltaY = e.clientY - startY
  
  // Convert pixels to minutes based on current height/duration ratio
  const pixelsPerMinute = props.height / props.agenda.plannedDuration
  const deltaMinutes = Math.round(deltaY / pixelsPerMinute)
  
  if (deltaMinutes !== 0) {
    // Only emit if the change is significant enough
    const newDuration = startDuration + deltaMinutes
    if (newDuration >= 5) {
      // Calculate how many minutes to adjust relative to CURRENT duration
      const adjustment = newDuration - props.agenda.plannedDuration
      if (adjustment !== 0) {
        emit('adjust', adjustment)
      }
    }
  }
}

function stopResize() {
  isResizing.value = false
  window.removeEventListener('mousemove', handleResize)
  window.removeEventListener('mouseup', stopResize)
  document.body.style.cursor = ''
}

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
    class="absolute left-2 right-2 rounded-lg border-2 px-3 py-2 cursor-pointer transition-all duration-200 overflow-hidden group select-none"
    :class="[
      statusClasses,
      isResizing && 'z-50 ring-2 ring-notebook-ink',
      isEditMode && 'hover:border-notebook-ink/40'
    ]"
    :style="{ top: `${top}px`, height: `${Math.max(height, 40)}px` }"
    :draggable="isEditMode && !isResizing"
    @click="emit('select', agenda.id)"
    @dragstart="isEditMode && emit('dragStart', agenda.id)"
    @dragend="isEditMode && emit('dragEnd')"
    @dragover.prevent="isEditMode && emit('dragOver', agenda.id)"
    @drop="isEditMode && emit('drop', agenda.id)"
  >
    <!-- Drag Handle (Edit Mode Only) -->
    <div 
      v-if="isEditMode"
      class="absolute left-0.5 top-0 bottom-0 flex items-center opacity-60 hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
    >
      <div class="text-[10px] leading-[3px] py-1 px-1 text-notebook-ink">
        ··<br/>··<br/>··<br/>··
      </div>
    </div>

    <!-- Resize Handle (Edit Mode Only) -->
    <div 
      v-if="isEditMode"
      class="absolute left-0 right-0 bottom-0 h-2 cursor-ns-resize hover:bg-notebook-ink/10 flex items-center justify-center opacity-0 group-hover:opacity-100"
      @mousedown.stop="startResize"
    >
      <div class="w-8 h-0.5 bg-notebook-ink/20 rounded-full"></div>
    </div>

    <!-- Title -->
    <h3 
      class="font-handwritten text-sm md:text-base font-bold text-notebook-ink truncate"
      :class="[
        agenda.status === 'cancelled' && 'line-through',
        isEditMode && 'ml-4'
      ]"
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
