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

// Helper to deselect agenda safely
function deselectAgenda() {
    // @ts-ignore - Store might expect string|null but types say string
    selectAgenda(null)
}

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
  
  // Responsive check
  checkScreenSize()
  window.addEventListener('resize', checkScreenSize)
})

onUnmounted(() => {
    // Check if window exists (SSR safety)
    if (typeof window !== 'undefined') {
        window.removeEventListener('resize', checkScreenSize)
    }
})

// Responsive Logic
const isLargeScreen = ref(true)
function checkScreenSize() {
    isLargeScreen.value = window.innerWidth >= 1024
}

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

    <!-- Top Navigation / Header -->
    <header class="flex-shrink-0 bg-notebook-paper-dark border-b-2 border-notebook-lines px-3 py-1.5 lg:px-6 lg:py-4">
      <!-- Mobile: Ultra Compact Single Line -->
      <div class="flex lg:hidden items-center justify-between gap-2 text-sm relative">
        <!-- Event Name (Truncated) -->
        <div class="flex flex-col min-w-0 flex-1">
          <div class="flex items-center gap-1 min-w-0">
            <span class="text-base">📅</span>
            <span class="font-handwritten-alt font-bold text-notebook-ink truncate cursor-pointer" @click="startEditingEventName" :title="eventName">
              {{ eventName }}
            </span>
          </div>
          <span class="font-handwritten text-[10px] text-notebook-ink-light ml-5">
            {{ formattedDate }}
          </span>
        </div>

        <!-- Clock -->
        <div class="font-typewriter font-bold text-notebook-ink tracking-wide cursor-pointer text-sm" @click="showHiddenControls = !showHiddenControls">
          {{ currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) }}
        </div>

        <!-- Status Icon -->
        <div class="flex items-center gap-1.5">
          <button 
            v-if="runningAgenda" 
            class="text-lg"
            title="LIVE EVENT MODE"
          >
            🔴
          </button>
          <button 
            v-else
            class="text-lg opacity-60"
            title="Standby"
          >
            ⏸️
          </button>

          <!-- Menu Icon -->
          <button 
            @click="isMenuOpen = !isMenuOpen"
            class="text-lg hover:scale-110 transition-transform relative z-50"
            title="Menu Data"
          >
            📁
          </button>
        </div>

        <!-- Dropdown Menu (fixed positioning) -->
        <Transition name="scale">
          <div 
            v-if="isMenuOpen"
            class="fixed right-3 top-16 w-48 bg-notebook-paper border-2 border-notebook-lines rounded-lg shadow-xl z-[60] overflow-hidden"
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
            <div class="h-1 bg-notebook-lines/20 border-t border-dashed border-notebook-lines"></div>
          </div>
        </Transition>
      </div>

      <!-- Desktop: Original Layout -->
      <div class="hidden lg:flex flex-row items-center justify-between gap-0">
        
        <!-- Left: Event name -->
        <div class="flex order-2 lg:order-none flex-1 text-center lg:text-left w-full lg:w-auto flex-col items-center lg:items-start">
          <div v-if="isEditingEventName" class="flex items-center gap-2">
              <input 
                  v-model="eventName" 
                  class="font-handwritten-alt text-lg lg:text-2xl font-bold text-notebook-ink bg-transparent border-b border-notebook-ink/50 focus:outline-none w-full text-center lg:text-left"
                  @blur="stopEditingEventName"
                  @keyup.enter="stopEditingEventName"
                  ref="eventNameInput"
              />
          </div>
          <div v-else class="flex items-center justify-center lg:justify-start gap-2 group cursor-pointer" @click="startEditingEventName">
              <h1 class="font-handwritten-alt text-lg lg:text-2xl font-bold text-notebook-ink border-b border-transparent group-hover:border-notebook-ink/20 transition-colors">
                📅 {{ eventName }}
              </h1>
              <span class="opacity-0 group-hover:opacity-100 transition-opacity text-notebook-ink/50 text-sm">✏️</span>
          </div>
          <p class="font-handwritten text-xs lg:text-sm text-notebook-ink-light">
            {{ formattedDate }}
          </p>
        </div>

        <!-- Center Tools & Indicator -->
        <div class="flex-shrink-0 order-3 lg:order-none my-1 lg:my-0 flex items-center gap-4">
          <div v-if="runningAgenda" class="live-indicator scale-90 lg:scale-100">
            LIVE EVENT MODE
          </div>
          <div v-else class="font-handwritten text-notebook-ink-light text-sm lg:text-base">
            ⏸️ Standby
          </div>

          <!-- Tools Dropdown -->
          <div class="relative" ref="menuRef">
            <button 
              @click="isMenuOpen = !isMenuOpen"
              class="text-xs lg:text-sm bg-notebook-paper border border-notebook-lines px-2 py-1 lg:px-3 rounded shadow-sm hover:shadow-md hover:bg-yellow-50 transition-all font-handwritten text-notebook-ink flex items-center gap-2"
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
        <div class="order-first lg:order-last flex-shrink-0 text-center lg:text-right w-full lg:w-auto flex flex-col items-center lg:items-end mb-1 lg:mb-0">
          <p 
            class="font-typewriter text-2xl lg:text-4xl font-bold text-notebook-ink tracking-widest cursor-pointer hover:opacity-75 transition-opacity"
            @click="showHiddenControls = !showHiddenControls"
            title="Klik untuk opsi developer"
          >
            {{ formattedTime }}
          </p>
          
          <!-- Simulation Controls (Small) -->
          <div class="mt-1 flex items-center gap-2 justify-center lg:justify-end" :class="{ 'invisible': !isSimulated && !showHiddenControls }">
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
      <aside class="w-full lg:w-3/5 border-r-2 border-notebook-margin">
        <TimekeeperLoadingSkeleton variant="agenda-list" :count="5" />
      </aside>
      <main class="w-full lg:w-2/5 hidden lg:block">
        <TimekeeperLoadingSkeleton variant="agenda-detail" />
      </main>
    </div>

    <!-- Main content: Responsive View -->
    <div v-else class="flex-1 flex overflow-hidden relative">
      <!-- Left Panel: Timeline View -->
      <aside class="w-full h-full lg:w-3/5 lg:border-r-2 border-notebook-margin overflow-hidden flex-shrink-0">
        <TimekeeperTimelineView @add="openAddModal($event)" />
      </aside>

      <!-- Mobile Backdrop -->
      <Transition name="fade">
        <div 
          v-if="agenda && !isLargeScreen"
          class="lg:hidden fixed inset-0 bg-black/30 w-full h-full z-30 backdrop-blur-sm"
          @click="deselectAgenda()"
        ></div>
      </Transition>

      <!-- Right Panel: Using Transition for Mobile Slide-Up -->
      <Transition name="slide-up">
        <main 
          v-show="agenda || isLargeScreen"
          class="
            fixed bottom-0 left-0 right-0 h-[85vh] z-40
            bg-notebook-paper rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.2)]
            flex flex-col overflow-hidden border-t-4 border-notebook-margin

            lg:static lg:w-2/5 lg:h-full lg:z-auto lg:bg-transparent
            lg:shadow-none lg:rounded-none lg:border-t-0 lg:flex
          "
        >
          <!-- Mobile Drag Handle / Close -->
          <div class="lg:hidden flex-shrink-0 flex items-center justify-center p-2 border-b border-notebook-lines/30 relative bg-notebook-paper rounded-t-3xl">
            <div class="w-16 h-1.5 bg-notebook-ink/20 rounded-full"></div>
            <button 
              class="absolute right-4 top-1/2 -translate-y-1/2 text-notebook-ink/50 hover:text-notebook-ink p-2"
              @click="deselectAgenda()"
            >
              ✕
            </button>
          </div>

          <TimekeeperAgendaDetail
            @start="handleStartAgenda"
            @stop="handleStopAgenda"
            @cancel="handleCancelAgenda"
            @adjust="handleAdjustTime"
            @edit="openEditModal"
            @add-after="openAddModal"
          />
        </main>
      </Transition>
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

/* Slide Up Transition (Mobile Only) */
@media (max-width: 1024px) {
  .slide-up-enter-active,
  .slide-up-leave-active {
    transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1); /* Custom ease-out */
  }

  .slide-up-enter-from,
  .slide-up-leave-to {
    transform: translateY(100%);
  }
}


.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
