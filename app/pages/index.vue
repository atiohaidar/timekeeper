<!--
  index.vue (formerly dashboard.vue)
  
  Main Timekeeper Dashboard page.
  Split view: Left (40%) agenda list, Right (60%) detail panel.
  
  UX Decisions:
  - Top bar always visible with event info and clock
  - "LIVE EVENT MODE" indicator for visual urgency
  - Notebook paper background throughout
-->
<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useTimekeeperStore } from '~/stores/timekeeper'
import { useToast } from '~/composables/useToast'
import type { Agenda } from '~/types'



const store = useTimekeeperStore()
const {
  eventName,
  agendas,
  changeLog,
  isChangeLogVisible,
  elapsedSeconds,
  selectedAgenda: agenda,
  runningAgenda,
  currentTime: storeCurrentTime,
  isSimulated,
  isPaused
} = storeToRefs(store)

const currentTime = computed(() => storeCurrentTime.value)

const {
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
  deleteReminder,
  downloadReport,
  exportCurrentAgendas,
  undo,
  redo,
  resetData,
  toggleSimulation,
  togglePause,
  setSimulationTime
} = store

const toast = useToast()

// Loading state
const isLoading = ref(true)

// Modals
// Modals
const isImportVisible = ref(false)
const isMenuOpen = ref(false)
const menuRef = ref<HTMLElement | null>(null)

// Add/Edit Modal State
const isEditModalVisible = ref(false)
const editTargetId = ref<string | null>(null)
const insertAfterTargetId = ref<string | null>(null)

function openAddModal(insertAfterId?: string) {
  editTargetId.value = null
  insertAfterTargetId.value = insertAfterId || null
  isEditModalVisible.value = true
}

function openEditModal(id: string) {
  editTargetId.value = id
  insertAfterTargetId.value = null
  isEditModalVisible.value = true
}

// Event Name Editing
const isEditingEventName = ref(false)
const eventNameInput = ref<HTMLInputElement | null>(null)
const showHiddenControls = ref(false)

function startEditingEventName() {
  isEditingEventName.value = true
  nextTick(() => {
    eventNameInput.value?.focus()
  })
}

function stopEditingEventName() {
  isEditingEventName.value = false
}

// Click outside to close menu
onMounted(() => {
  document.addEventListener('click', (e) => {
    if (menuRef.value && !menuRef.value.contains(e.target as Node)) {
      isMenuOpen.value = false
    }
  })
})

// Real-time clock logic is now handled by the store
// We just watch storeCurrentTime

const startHour = computed(() => {
  if (agendas.value.length === 0) return 8
  const minTime = Math.min(...agendas.value.map((a: Agenda) => a.plannedStartTime.getHours()))
  return Math.max(0, minTime - 1)
})

const endHour = computed(() => {
  if (agendas.value.length === 0) return 22
  const maxEndTime = Math.max(...agendas.value.map((a: Agenda) => {
    const endTime = new Date(a.plannedStartTime.getTime() + a.plannedDuration * 60 * 1000)
    return endTime.getHours() + (endTime.getMinutes() > 0 ? 1 : 0)
  }))
  return Math.min(24, maxEndTime + 1)
})

const pixelsPerMinute = computed(() => {
  if (agendas.value.length === 0) return 4
  const minDuration = Math.min(...agendas.value.map((a: Agenda) => a.plannedDuration))
  const scaled = Math.round(60 / Math.max(1, minDuration))
  return Math.max(2, Math.min(12, scaled))
})

onMounted(() => {
  // Simulate initial data loading
  setTimeout(() => {
    isLoading.value = false
  }, 500)
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

// Enhanced actions with toast notifications
function handleStartAgenda(id: string) {
  startAgenda(id)
  const agenda = agendas.value.find(a => a.id === id)
  if (agenda) {
    toast.success(`Agenda "${agenda.title}" berhasil dimulai! 🎉`)
  }
}

function handleStopAgenda(id: string) {
  stopAgenda(id)
  const agenda = agendas.value.find(a => a.id === id)
  if (agenda) {
    toast.success(`Agenda "${agenda.title}" selesai! ✅`)
  }
}

function handleCancelAgenda(id: string) {
  cancelAgenda(id)
  const agenda = agendas.value.find(a => a.id === id)
  if (agenda) {
    toast.warning(`Agenda "${agenda.title}" dibatalkan`)
  }
}

function handleAdjustTime(id: string, minutes: number) {
  const success = adjustTime(id, minutes)
  if (success) {
    toast.info(`Durasi disesuaikan ${minutes > 0 ? '+' : ''}${minutes} menit`)
  }
}

function handleSimulationTimeInput(e: Event) {
  const target = e.target as HTMLInputElement
  if (!target.value) return

  const [h, m] = target.value.split(':').map(Number)
  if (h !== undefined && m !== undefined) {
    const newTime = new Date(currentTime.value)
    newTime.setHours(h, m)
    setSimulationTime(newTime)
  }
}

// Page meta
useHead({
  title: 'Timekeeper Dashboard'
})
</script>

<template>
  <div class="h-screen flex flex-col overflow-hidden bg-notebook-paper">
    <!-- Toast Container -->
    <TimekeeperToastContainer />

    <!-- Top Bar -->
    <header class="flex-shrink-0 bg-notebook-paper-dark border-b-2 border-notebook-lines px-4 py-3 md:px-6 md:py-4">
      <div class="flex flex-col md:flex-row items-center justify-between gap-2 md:gap-0">
        <!-- Left: Event name -->
        <div class="flex-1 text-center md:text-left w-full md:w-auto">
          <div v-if="isEditingEventName" class="flex items-center gap-2">
              <input 
                  v-model="eventName" 
                  class="font-handwritten-alt text-xl md:text-2xl font-bold text-notebook-ink bg-transparent border-b border-notebook-ink/50 focus:outline-none w-full"
                  @blur="stopEditingEventName"
                  @keyup.enter="stopEditingEventName"
                  ref="eventNameInput"
              />
          </div>
          <div v-else class="flex items-center justify-center md:justify-start gap-2 group cursor-pointer" @click="startEditingEventName">
              <h1 class="font-handwritten-alt text-xl md:text-2xl font-bold text-notebook-ink border-b border-transparent group-hover:border-notebook-ink/20 transition-colors">
                📅 {{ eventName }}
              </h1>
              <span class="opacity-0 group-hover:opacity-100 transition-opacity text-notebook-ink/50 text-sm">✏️</span>
          </div>
          <p class="font-handwritten text-sm text-notebook-ink-light">
            {{ formattedDate }}
          </p>
        </div>

        <!-- Center Tools & Indicator -->
        <div class="flex-shrink-0 my-2 md:my-0 flex items-center gap-4">
          <div v-if="runningAgenda" class="live-indicator">
            LIVE EVENT MODE
          </div>
          <div v-else class="font-handwritten text-notebook-ink-light">
            ⏸️ Standby
          </div>

          <!-- Tools Dropdown -->
          <div class="relative" ref="menuRef">
            <button 
              @click="isMenuOpen = !isMenuOpen"
              class="text-sm bg-notebook-paper border border-notebook-lines px-3 py-1 rounded shadow-sm hover:shadow-md hover:bg-yellow-50 transition-all font-handwritten text-notebook-ink flex items-center gap-2"
            >
              📁 Menu Data
            </button>

            <!-- Dropdown Menu -->
            <Transition name="scale">
              <div 
                v-if="isMenuOpen"
                class="absolute right-0 top-full mt-2 w-48 bg-notebook-paper border-2 border-notebook-lines rounded-lg shadow-xl z-50 overflow-hidden"
              >
                <div class="p-2 space-y-1">
                  <button 
                      @click="() => { isImportVisible = true; isMenuOpen = false }"
                      class="w-full text-left px-3 py-2 text-sm font-handwritten hover:bg-blue-50 hover:text-blue-600 rounded flex items-center gap-2 transition-colors"
                  >
                      📥 Import dari Excel
                  </button>
                  <button 
                      @click="() => { exportCurrentAgendas(); isMenuOpen = false }"
                      class="w-full text-left px-3 py-2 text-sm font-handwritten hover:bg-yellow-50 hover:text-yellow-600 rounded flex items-center gap-2 transition-colors"
                  >
                      📁 Simpan ke Excel
                  </button>
                  <button 
                    @click="() => { downloadReport(); isMenuOpen = false }"
                    class="w-full text-left px-3 py-2 text-sm font-handwritten hover:bg-green-50 hover:text-green-600 rounded flex items-center gap-2 transition-colors"
                  >
                      📊 Laporan (CSV)
                  </button>
                </div>
                <!-- Decorative bottom edge -->
                <div class="h-1 bg-notebook-lines/20 border-t border-dashed border-notebook-lines"></div>
              </div>
            </Transition>
          </div>
        </div>

        <!-- Right: Clock & Simulation Controls -->
        <div class="flex-shrink-0 text-center md:text-right w-full md:w-auto flex flex-col items-end">
          <p 
            class="font-typewriter text-3xl md:text-4xl font-bold text-notebook-ink tracking-widest cursor-pointer hover:opacity-75 transition-opacity"
            @click="showHiddenControls = !showHiddenControls"
            title="Klik untuk opsi developer"
          >
            {{ formattedTime }}
          </p>
          
          <!-- Simulation Controls (Small) -->
          <div class="mt-1 flex items-center gap-2 justify-end" :class="{ 'invisible': !isSimulated && !showHiddenControls }">
             <button 
               v-if="!isSimulated && showHiddenControls"
               @click="toggleSimulation"
               class="text-[10px] text-gray-400 hover:text-notebook-ink border border-transparent hover:border-notebook-ink/30 px-1 rounded transition-colors"
               title="Aktifkan Mode Simulasi Waktu"
             >
               ⏱️ Test Waktu
             </button>
             <div v-else-if="isSimulated" class="flex items-center gap-1 bg-yellow-50 border border-yellow-200 rounded px-1.5 py-0.5">
                <span class="text-[10px] font-bold text-yellow-700 mr-1">SIMULASI</span>
                
                <button 
                  @click="togglePause"
                  class="text-xs w-5 h-5 flex items-center justify-center rounded hover:bg-yellow-200 text-notebook-ink"
                  :title="isPaused ? 'Resume' : 'Pause'"
                >
                  {{ isPaused ? '▶️' : '⏸️' }}
                </button>
                
                <input 
                  type="time" 
                  :value="currentTime.toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})"
                  @input="handleSimulationTimeInput"
                  class="text-[10px] bg-white border border-yellow-300 rounded px-1 w-16 text-center font-mono focus:outline-none focus:ring-1 focus:ring-yellow-500"
                />

                <button 
                   @click="toggleSimulation"
                   class="text-[10px] text-red-500 hover:text-red-700 ml-1"
                   title="Kembali ke Waktu Nyata"
                >
                   ✖
                </button>
             </div>
          </div>
        </div>
      </div>

   
    </header>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex-1 flex overflow-hidden">
      <aside class="w-full md:w-3/5 border-r-2 border-notebook-margin">
        <TimekeeperLoadingSkeleton variant="agenda-list" :count="5" />
      </aside>
      <main class="w-full md:w-2/5">
        <TimekeeperLoadingSkeleton variant="agenda-detail" />
      </main>
    </div>

    <!-- Main content: Split view -->
    <div v-else class="flex-1 flex flex-col md:flex-row overflow-hidden">
      <!-- Left Panel: Timeline View -->
      <aside class="w-full md:w-3/5 h-1/2 md:h-auto border-b-2 md:border-b-0 md:border-r-2 border-notebook-margin overflow-hidden flex-shrink-0">
        <TimekeeperTimelineView @add="openAddModal($event)" />
      </aside>

      <!-- Right Panel: Agenda Detail -->
      <main class="w-full md:w-2/5 h-1/2 md:h-auto overflow-hidden">
        <TimekeeperAgendaDetail
          @start="handleStartAgenda"
          @stop="handleStopAgenda"
          @cancel="handleCancelAgenda"
          @adjust="handleAdjustTime"
          @edit="openEditModal"
          @add-after="openAddModal"
        />
      </main>
    </div>

    <!-- Change Log Panel -->
    <TimekeeperChangeLog />

    <!-- Import Modal -->
    <TimekeeperImportAgendasModal 
      :is-visible="isImportVisible"
      @close="isImportVisible = false"
    />

    <TimekeeperAddEditAgendaModal
      :is-visible="isEditModalVisible"
      :agenda-id="editTargetId"
      :insert-after-id="insertAfterTargetId"
      @close="isEditModalVisible = false"
      @saved="isEditModalVisible = false"
    />
  </div>
</template>

<style scoped>
.scale-enter-active,
.scale-leave-active {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.scale-enter-from,
.scale-leave-to {
  transform: scale(0.95) translateY(-10px);
  opacity: 0;
}
</style>
