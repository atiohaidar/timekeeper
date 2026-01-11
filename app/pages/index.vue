<!--
  index.vue (formerly dashboard.vue)
  
  Main Timekeeper Dashboard page.
  Split view: Left (40%) agenda list, Right (60%) detail panel.
  
  UX Decisions:
  - Top bar always visible with event info and clock
  - "LIVE EVENT MODE" indicator for visual urgency
  - Notebook paper background throughout
  - ChangeLog panel toggleable from right edge
-->
<script setup lang="ts">
import { useTimekeeper } from '~/composables/useTimekeeper'

// Import composable
const {
  eventName,
  agendas,
  selectedAgendaId,
  changeLog,
  isChangeLogVisible,
  elapsedSeconds,
  selectedAgenda,
  runningAgenda,
  sortedAgendas,
  estimatedStartTimes,
  getEstimatedStartTime,
  selectAgenda,
  startAgenda,
  stopAgenda,
  cancelAgenda,
  adjustTime,
  updateNotes,
  reorderAgendas,
  toggleChangeLog,
  addReminder,
  updateReminder,
  deleteReminder
} = useTimekeeper()

// Real-time clock
const currentTime = ref(new Date())
let clockInterval: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  clockInterval = setInterval(() => {
    currentTime.value = new Date()
  }, 1000)
})

onUnmounted(() => {
  if (clockInterval) clearInterval(clockInterval)
})

// Format clock display
const formattedTime = computed(() => {
  return currentTime.value.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
})

const formattedDate = computed(() => {
  return currentTime.value.toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

// Page meta
useHead({
  title: 'Timekeeper Dashboard'
})
</script>

<template>
  <div class="h-screen flex flex-col overflow-hidden bg-notebook-paper">
    <!-- Top Bar -->
    <header class="flex-shrink-0 bg-notebook-paper-dark border-b-2 border-notebook-lines px-4 py-3 md:px-6 md:py-4">
      <div class="flex flex-col md:flex-row items-center justify-between gap-2 md:gap-0">
        <!-- Left: Event name -->
        <div class="flex-1 text-center md:text-left w-full md:w-auto">
          <h1 class="font-handwritten-alt text-xl md:text-2xl font-bold text-notebook-ink">
            📅 {{ eventName }}
          </h1>
          <p class="font-handwritten text-sm text-notebook-ink-light">
            {{ formattedDate }}
          </p>
        </div>

        <!-- Center: Live indicator -->
        <div class="flex-shrink-0 my-2 md:my-0 md:mx-4">
          <div v-if="runningAgenda" class="live-indicator">
            LIVE EVENT MODE
          </div>
          <div v-else class="font-handwritten text-notebook-ink-light">
            ⏸️ Standby
          </div>
        </div>

        <!-- Right: Clock -->
        <div class="flex-shrink-0 text-center md:text-right w-full md:w-auto">
          <p class="font-typewriter text-3xl md:text-4xl font-bold text-notebook-ink tracking-widest">
            {{ formattedTime }}
          </p>
        </div>
      </div>
    </header>

    <!-- Main content: Split view -->
    <div class="flex-1 flex flex-col md:flex-row overflow-hidden">
      <!-- Left Panel: Timeline View (60% desktop, 50% mobile) -->
      <aside class="w-full md:w-3/5 h-1/2 md:h-auto border-b-2 md:border-b-0 md:border-r-2 border-notebook-margin overflow-hidden flex-shrink-0">
        <TimekeeperTimelineView
          :agendas="sortedAgendas"
          :selected-id="selectedAgendaId"
          :running-id="runningAgenda?.id ?? null"
          :estimated-start-times="estimatedStartTimes"
          @select="selectAgenda"
          @reorder="reorderAgendas"
          @adjust="adjustTime"
        />
      </aside>

      <!-- Right Panel: Agenda Detail (40% desktop, 50% mobile) -->
      <main class="w-full md:w-2/5 h-1/2 md:h-auto overflow-hidden">
        <TimekeeperAgendaDetail
          :agenda="selectedAgenda"
          :elapsed-seconds="elapsedSeconds"
          :estimated-start-time="selectedAgenda ? getEstimatedStartTime(selectedAgenda.id) : null"
          :running-agenda="runningAgenda"
          @start="startAgenda"
          @stop="stopAgenda"
          @cancel="cancelAgenda"
          @adjust="adjustTime"
          @update-notes="updateNotes"
          @add-reminder="addReminder"
          @update-reminder="updateReminder"
          @delete-reminder="deleteReminder"
        />
      </main>
    </div>

    <!-- Change Log Panel -->
    <TimekeeperChangeLog
      :entries="changeLog"
      :is-visible="isChangeLogVisible"
      @toggle="toggleChangeLog"
    />
  </div>
</template>
