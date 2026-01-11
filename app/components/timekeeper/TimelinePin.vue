<!--
  TimelinePin.vue
  
  Reminder/alert pin on the timeline sidebar.
  Positioned at absolute time.
-->
<script setup lang="ts">
import type { Reminder } from '~/stores/timekeeper'

interface AbsoluteReminder extends Reminder {
  absoluteTime: Date
  agendaTitle: string
  agendaId: string
}

// Props
const props = defineProps<{
  reminder: AbsoluteReminder
  top: number
}>()

// Format time
function formatTime(date: Date): string {
  return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

// Division colors
const divisionClasses = computed(() => {
  const division = props.reminder.division.toLowerCase()
  if (division.includes('sound') || division.includes('musik')) return 'bg-blue-100 border-blue-300'
  if (division.includes('logistik') || division.includes('perlengkapan')) return 'bg-orange-100 border-orange-300'
  if (division.includes('konsumsi') || division.includes('snack')) return 'bg-green-100 border-green-300'
  if (division.includes('mc') || division.includes('pembawa')) return 'bg-purple-100 border-purple-300'
  return 'bg-gray-100 border-gray-300'
})
</script>

<template>
  <div
    class="absolute left-1 right-1 rounded border px-2 py-1 text-xs"
    :class="divisionClasses"
    :style="{ top: `${top}px` }"
  >
    <!-- Icon and time -->
    <div class="flex items-center gap-1 mb-0.5">
      <span>{{ reminder.icon || '📌' }}</span>
      <span class="font-typewriter text-[10px] text-gray-500">
        {{ formatTime(reminder.absoluteTime) }}
      </span>
    </div>

    <!-- Division -->
    <p class="font-handwritten font-bold text-notebook-ink truncate">
      {{ reminder.division }}
    </p>

    <!-- Message -->
    <p class="font-handwritten text-notebook-ink-light truncate">
      {{ reminder.message }}
    </p>
  </div>
</template>
