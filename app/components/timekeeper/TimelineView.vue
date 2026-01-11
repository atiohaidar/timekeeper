<!--
  TimelineView.vue
  
  Main timeline container component.
  Renders a vertical time grid with:
  - Time labels on the left
  - Agenda blocks in the center
  - Reminder pins on the right
  - "Now Indicator" red line
-->
<script setup lang="ts">
import type { Agenda, Reminder } from '~/composables/useTimekeeper'

// Props
const props = defineProps<{
  agendas: Agenda[]
  selectedId: string | null
  runningId: string | null
  estimatedStartTimes?: Map<string, Date>
  eventStartHour?: number  // Default 8
  eventEndHour?: number    // Default 13
}>()

// Drag State
const draggedId = ref<string | null>(null)
const dragOverId = ref<string | null>(null)
const isEditMode = ref(false)

function handleDragStart(id: string) {
  if (!isEditMode.value) return 
  draggedId.value = id
}

function handleDragEnd() {
  draggedId.value = null
  dragOverId.value = null
}

function handleDragOver(id: string) {
  dragOverId.value = id
}

function handleDrop(toId: string) {
  if (draggedId.value && draggedId.value !== toId) {
    const fromIndex = props.agendas.findIndex(a => a.id === draggedId.value)
    const toIndex = props.agendas.findIndex(a => a.id === toId)
    
    if (fromIndex !== -1 && toIndex !== -1) {
      emit('reorder', fromIndex, toIndex)
    }
  }
  handleDragEnd()
}

// Emits for resizing
const emit = defineEmits<{
  select: [id: string]
  reorder: [fromIndex: number, toIndex: number]
  adjust: [id: string, minutes: number]
}>()

// Timeline configuration - calculate from agenda data
const startHour = computed(() => {
  if (props.agendas.length === 0) return 8
  const minTime = Math.min(...props.agendas.map(a => a.plannedStartTime.getHours()))
  return Math.max(0, minTime - 1) // 1 hour padding before first event
})

const endHour = computed(() => {
  if (props.agendas.length === 0) return 22
  const maxEndTime = Math.max(...props.agendas.map(a => {
    const endTime = new Date(a.plannedStartTime.getTime() + a.plannedDuration * 60 * 1000)
    return endTime.getHours() + (endTime.getMinutes() > 0 ? 1 : 0)
  }))
  return Math.min(24, maxEndTime + 1) // 1 hour padding after last event
})

const totalHours = computed(() => endHour.value - startHour.value)

// Dynamic scale: Adjust pixelsPerMinute so the shortest item is at least 60px high
const pixelsPerMinute = computed(() => {
  if (props.agendas.length === 0) return 4
  const minDuration = Math.min(...props.agendas.map(a => a.plannedDuration))
  // Target 60px for the shortest item, but keep scale between 2 and 12
  const scaled = Math.round(60 / Math.max(1, minDuration))
  return Math.max(2, Math.min(12, scaled))
})

// Current time for "Now Indicator"
const currentTime = ref(new Date())
let clockInterval: ReturnType<typeof setInterval> | null = null
const timelineContainer = ref<HTMLElement | null>(null)

function scrollToNow(smooth = true) {
  if (!timelineContainer.value || !isNowVisible.value) return
  
  // Calculate center position
  const containerHeight = timelineContainer.value.clientHeight
  const targetScroll = nowIndicatorTop.value - (containerHeight / 3) // Focus slightly above center
  
  timelineContainer.value.scrollTo({
    top: Math.max(0, targetScroll),
    behavior: smooth ? 'smooth' : 'auto'
  })
}

onMounted(() => {
  clockInterval = setInterval(() => {
    currentTime.value = new Date()
  }, 1000)

  // Initial scroll after a short delay to ensure rendering is complete
  setTimeout(() => {
    scrollToNow(false)
  }, 500)
})

onUnmounted(() => {
  if (clockInterval) clearInterval(clockInterval)
})

// Calculate top position for a given time
function getTopPosition(date: Date): number {
  const hours = date.getHours()
  const minutes = date.getMinutes()
  const totalMinutes = (hours - startHour.value) * 60 + minutes
  return totalMinutes * pixelsPerMinute.value
}

// Calculate height for a given duration
function getHeight(durationMinutes: number): number {
  return durationMinutes * pixelsPerMinute.value
}

// Now indicator position
const nowIndicatorTop = computed(() => {
  return getTopPosition(currentTime.value)
})

// Check if now is within timeline range
const isNowVisible = computed(() => {
  const hours = currentTime.value.getHours()
  return hours >= startHour.value && hours < endHour.value
})

// Generate granular time labels based on zoom level
const timeLabels = computed(() => {
  const labels = []
  const ppm = pixelsPerMinute.value
  
  // Decide interval based on zoom: 60m, 30m, or 15m
  let interval = 60
  if (ppm >= 8) interval = 15
  else if (ppm >= 4) interval = 30

  const totalMinutes = (endHour.value - startHour.value) * 60
  
  for (let m = 0; m <= totalMinutes; m += interval) {
    const h = startHour.value + Math.floor(m / 60)
    const mins = m % 60
    const isHour = mins === 0
    
    labels.push({
      label: `${String(h).padStart(2, '0')}:${String(mins).padStart(2, '0')}`,
      top: m * ppm,
      isHour
    })
  }
  return labels
})

// Flatten all reminders with their absolute times and calculate non-overlapping positions
interface AbsoluteReminder extends Reminder {
  absoluteTime: Date
  agendaTitle: string
  agendaId: string
  adjustedTop: number  // Adjusted position to avoid overlap
}

const PIN_HEIGHT = 60 // Approximate height of a pin in pixels

const allReminders = computed((): AbsoluteReminder[] => {
  const reminders: AbsoluteReminder[] = []
  for (const agenda of props.agendas) {
    // Use estimated start time if available, otherwise fall back to planned
    const agendaStartTime = props.estimatedStartTimes?.get(agenda.id) || agenda.plannedStartTime
    
    for (const reminder of agenda.reminders) {
      const absoluteTime = new Date(agendaStartTime.getTime() + reminder.offsetMinutes * 60 * 1000)
      const baseTop = getTopPosition(absoluteTime)
      reminders.push({
        ...reminder,
        absoluteTime,
        agendaTitle: agenda.title,
        agendaId: agenda.id,
        adjustedTop: baseTop
      })
    }
  }
  
  // Sort by time
  reminders.sort((a, b) => a.absoluteTime.getTime() - b.absoluteTime.getTime())
  
  // Detect and fix overlaps
  for (let i = 1; i < reminders.length; i++) {
    const prev = reminders[i - 1]
    const curr = reminders[i]
    if (!prev || !curr) continue
    // If current pin would overlap with previous one
    if (curr.adjustedTop < prev.adjustedTop + PIN_HEIGHT) {
      curr.adjustedTop = prev.adjustedTop + PIN_HEIGHT
    }
  }
  
  return reminders
})

// Total timeline height
const timelineHeight = computed(() => totalHours.value * 60 * pixelsPerMinute.value)
</script>

<template>
  <div ref="timelineContainer" class="h-full overflow-y-auto bg-notebook-paper">
    <!-- Header -->
    <div class="sticky top-0 z-20 bg-notebook-paper border-b-2 border-notebook-lines px-4 py-3 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <h2 class="font-handwritten-alt text-xl md:text-2xl font-bold text-notebook-ink">
          📋 Timeline Acara
        </h2>
        
        <!-- Go to Now Button -->
        <button 
          v-if="isNowVisible"
          class="text-[10px] font-bold text-red-500 border border-red-500/30 rounded px-1.5 py-0.5 hover:bg-red-50 hover:border-red-500 transition-all flex items-center gap-1.5"
          title="Ke Waktu Sekarang"
          @click="() => scrollToNow()"
        >
          <span class="relative flex h-2 w-2">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          SEKARANG
        </button>
      </div>
      
      <!-- Edit Mode Toggle -->
      <button 
        class="btn-sketchy text-xs py-1 px-3 flex items-center gap-2"
        :class="isEditMode ? 'bg-pen-red/10 text-pen-red border-pen-red shadow-none translate-y-0.5' : 'text-notebook-ink-light'"
        @click="isEditMode = !isEditMode"
      >
        <span v-if="isEditMode">🔓 MODE EDIT AKTIF</span>
        <span v-else>🔒 MODE VIEW</span>
        <span class="text-lg">{{ isEditMode ? '✏️' : '👁️' }}</span>
      </button>
    </div>

    <!-- Timeline Grid -->
    <div class="relative flex" :style="{ minHeight: `${timelineHeight}px` }">
      
      <!-- Left: Time Labels -->
      <div class="w-16 md:w-20 flex-shrink-0 border-r border-notebook-lines relative">
        <div
          v-for="time in timeLabels"
          :key="time.label"
          class="absolute left-0 right-0 text-right pr-2 -translate-y-1/2"
          :style="{ top: `${time.top}px` }"
        >
          <span 
            class="font-typewriter text-xs transition-opacity duration-300"
            :class="time.isHour ? 'text-notebook-ink font-bold font-pixel' : 'text-notebook-ink/40 text-[10px]'"
          >
            {{ time.label }}
          </span>
        </div>
      </div>

      <!-- Center: Agenda Blocks -->
      <div class="flex-1 relative border-r-2 border-notebook-margin">
        <!-- Grid lines -->
        <div
          v-for="time in timeLabels"
          :key="`line-${time.label}`"
          class="absolute left-0 right-0 border-t transition-colors duration-300"
          :class="time.isHour ? 'border-notebook-lines' : 'border-notebook-lines/30 border-dashed'"
          :style="{ top: `${time.top}px` }"
        />

        <!-- Agenda blocks -->
        <TimekeeperTimelineBlock
          v-for="agenda in agendas"
          :key="agenda.id"
          :agenda="agenda"
          :is-selected="selectedId === agenda.id"
          :is-running="runningId === agenda.id"
          :is-edit-mode="isEditMode"
          :class="[
            draggedId === agenda.id && 'opacity-40 grayscale',
            dragOverId === agenda.id && draggedId !== agenda.id && 'ring-4 ring-notebook-ink/20 ring-offset-2'
          ]"
          :top="getTopPosition(estimatedStartTimes?.get(agenda.id) ?? agenda.plannedStartTime)"
          :height="getHeight(agenda.plannedDuration)"
          :estimated-start-time="estimatedStartTimes?.get(agenda.id) ?? null"
          @select="emit('select', $event)"
          @drag-start="handleDragStart"
          @drag-end="handleDragEnd"
          @drag-over="handleDragOver"
          @drop="handleDrop"
          @adjust="emit('adjust', agenda.id, $event)"
        />

        <!-- Now Indicator -->
        <div
          v-if="isNowVisible"
          class="absolute left-0 right-0 z-30 pointer-events-none transition-all duration-1000 ease-linear"
          :style="{ top: `${nowIndicatorTop}px` }"
        >
          <div class="flex items-center">
            <!-- Pulsing Dot -->
            <div class="relative flex items-center justify-center -ml-1.5">
              <div class="absolute w-4 h-4 bg-red-500 rounded-full animate-ping opacity-75"></div>
              <div class="relative w-3 h-3 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)]"></div>
            </div>
            
            <!-- Red Line with Shadow -->
            <div class="flex-1 h-0.5 bg-red-500 shadow-[0_0_4px_rgba(239,68,68,0.5)]"></div>

            <!-- Current Time Label -->
            <div class="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded ml-1 shadow-sm font-typewriter">
              {{ currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Reminder Pins -->
      <div class="w-40 md:w-56 flex-shrink-0 relative">
        <!-- Grid lines (faded) -->
        <div
          v-for="time in timeLabels"
          :key="`pin-line-${time.label}`"
          class="absolute left-0 right-0 border-t transition-colors duration-300"
          :class="time.isHour ? 'border-notebook-lines/30' : 'border-notebook-lines/10 border-dashed'"
          :style="{ top: `${time.top}px` }"
        />

        <!-- Reminder pins -->
        <TimekeeperTimelinePin
          v-for="reminder in allReminders"
          :key="reminder.id"
          :reminder="reminder"
          :top="reminder.adjustedTop"
        />
      </div>
    </div>
  </div>
</template>
