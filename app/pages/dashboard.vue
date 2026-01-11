<!--
  dashboard.vue
  
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
  selectAgenda,
  startAgenda,
  stopAgenda,
  cancelAgenda,
  adjustTime,
  updateNotes,
  reorderAgendas,
  toggleChangeLog
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
  <div class="h-screen flex flex-col overflow-hidden notebook-paper-ruled">
    <!-- Top Bar -->
    <header class="flex-shrink-0 bg-notebook-paper-dark border-b-2 border-notebook-lines px-6 py-4">
      <div class="flex items-center justify-between">
        <!-- Left: Event name -->
        <div class="flex-1">
          <h1 class="font-handwritten-alt text-2xl font-bold text-notebook-ink">
            📅 {{ eventName }}
          </h1>
          <p class="font-handwritten text-sm text-notebook-ink-light">
            {{ formattedDate }}
          </p>
        </div>

        <!-- Center: Live indicator -->
        <div class="flex-shrink-0 mx-4">
          <div v-if="runningAgenda" class="live-indicator">
            LIVE EVENT MODE
          </div>
          <div v-else class="font-handwritten text-notebook-ink-light">
            ⏸️ Standby
          </div>
        </div>

        <!-- Right: Clock -->
        <div class="flex-shrink-0 text-right">
          <p class="font-handwritten-alt text-4xl font-bold text-notebook-ink">
            {{ formattedTime }}
          </p>
        </div>
      </div>
    </header>

    <!-- Main content: Split view -->
    <div class="flex-1 flex overflow-hidden">
      <!-- Left Panel: Agenda List (40%) -->
      <aside class="w-2/5 border-r-2 border-notebook-margin overflow-hidden">
        <TimekeeperAgendaList
          :agendas="sortedAgendas"
          :selected-id="selectedAgendaId"
          :running-id="runningAgenda?.id ?? null"
          @select="selectAgenda"
          @reorder="reorderAgendas"
        />
      </aside>

      <!-- Right Panel: Agenda Detail (60%) -->
      <main class="w-3/5 overflow-hidden">
        <TimekeeperAgendaDetail
          :agenda="selectedAgenda"
          :elapsed-seconds="elapsedSeconds"
          @start="startAgenda"
          @stop="stopAgenda"
          @cancel="cancelAgenda"
          @adjust="adjustTime"
          @update-notes="updateNotes"
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
