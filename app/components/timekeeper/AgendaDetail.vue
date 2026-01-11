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
import type { Agenda } from '~/types'
import { storeToRefs } from 'pinia'
import { useTimekeeperStore } from '~/stores/timekeeper'
import { useToast } from '~/composables/useToast'

const store = useTimekeeperStore()
const toast = useToast()

// Getting state and actions from store
const {
  selectedAgenda: agenda,
  elapsedSeconds,
  runningAgenda,
} = storeToRefs(store)

const {
  getEstimatedStartTime,
  startAgenda,
  stopAgenda,
  cancelAgenda,
  adjustTime,
  updateNotes
} = store

const estimatedStartTime = computed(() => {
  return agenda.value ? getEstimatedStartTime(agenda.value.id) : null
})

// Emits
const emit = defineEmits<{
  start: [id: string]
  stop: [id: string]
  cancel: [id: string]
  adjust: [id: string, minutes: number]
  updateNotes: [id: string, notes: string]
  addReminder: [agendaId: string, reminder: { offsetMinutes: number, division: string, message: string, icon?: string }]
  updateReminder: [agendaId: string, reminderId: string, updates: { offsetMinutes?: number, division?: string, message?: string, icon?: string }]
  deleteReminder: [agendaId: string, reminderId: string]
}>()

// Timer logic moved to AgendaTimer.vue

const { formatTime } = useTimeFormatter()


// Computed: original planned end time
const plannedEndTime = computed(() => {
  if (!agenda.value) return ''
  const endTime = new Date(agenda.value.plannedStartTime.getTime() + agenda.value.plannedDuration * 60000)
  return formatTime(endTime)
})

// Computed: estimated end time based on the cascading schedule
const estimatedEndTime = computed(() => {
  if (!agenda.value) return ''
  const start = estimatedStartTime.value || agenda.value.plannedStartTime
  const endTime = new Date(start.getTime() + agenda.value.plannedDuration * 60000)
  return formatTime(endTime)
})

// Check if there's a delay (estimated differs from planned by more than 1 min)
const hasDelay = computed(() => {
  if (!agenda.value || !estimatedStartTime.value) return false
  const diff = Math.abs(estimatedStartTime.value.getTime() - agenda.value.plannedStartTime.getTime())
  return diff > 60000 // More than 1 minute difference
})

// Local notes state for two-way binding
const localNotes = ref('')
const containerRef = ref<HTMLElement | null>(null)

watch(agenda, (newAgenda) => {
  if (newAgenda) {
    localNotes.value = newAgenda.notes
    // Scroll to top when agenda changes
    nextTick(() => {
      if (containerRef.value) {
        containerRef.value.scrollTop = 0
      }
    })
  }
}, { immediate: true })

// Debounced notes update
let notesTimeout: ReturnType<typeof setTimeout> | null = null
function handleNotesInput() {
  if (notesTimeout) clearTimeout(notesTimeout)
  notesTimeout = setTimeout(() => {
    if (agenda.value) {
      updateNotes(agenda.value.id, localNotes.value)
    }
  }, 500)
}

// Reminder logic moved to AgendaReminders.vue


// ===== START CONFIRMATION =====
const showStartConfirmation = ref(false)
const pendingStartId = ref<string | null>(null)

function handleStart() {
  if (!agenda.value) return
  
  // Show confirmation modal for starting
  showStartConfirmation.value = true
  pendingStartId.value = agenda.value.id
}

function confirmStart() {
  if (pendingStartId.value) {
    emit('start', pendingStartId.value)
  }
  showStartConfirmation.value = false
  pendingStartId.value = null
}

function cancelStart() {
  showStartConfirmation.value = false
  pendingStartId.value = null
}

// ===== STOP/FINISH CONFIRMATION =====
const showStopConfirmation = ref(false)

function handleStop() {
  if (!agenda.value) return
  showStopConfirmation.value = true
}

function confirmStop() {
  if (agenda.value) {
    emit('stop', agenda.value.id)
  }
  showStopConfirmation.value = false
}

function cancelStop() {
  showStopConfirmation.value = false
}

// ===== CANCEL CONFIRMATION =====
const showCancelConfirmation = ref(false)

function handleCancel() {
  if (!agenda.value) return
  showCancelConfirmation.value = true
}

function confirmCancel() {
  if (agenda.value) {
    emit('cancel', agenda.value.id)
  }
  showCancelConfirmation.value = false
}

function cancelCancelAction() {
  showCancelConfirmation.value = false
}

// Computed messages for modals
const startConfirmationMessage = computed(() => {
  if (runningAgenda.value && runningAgenda.value.id !== agenda.value?.id) {
    return `Agenda "${runningAgenda.value?.title}" sedang berjalan. Apakah kamu yakin ingin menghentikannya dan memulai agenda "${agenda.value?.title}"?`
  }
  return `Apakah kamu yakin ingin memulai agenda "${agenda.value?.title}" sekarang?`
})

const stopConfirmationMessage = computed(() => {
  return `Apakah agenda "${agenda.value?.title}" sudah benar-benar selesai?`
})

const cancelConfirmationMessage = computed(() => {
  return `Apakah kamu yakin ingin membatalkan agenda "${agenda.value?.title}"? Tindakan ini tidak dapat dibatalkan.`
})

// ===== CUSTOM TIME ADJUSTMENT =====
const customAdjustMinutes = ref(0)

function incrementAdjust() {
  customAdjustMinutes.value++
}

function decrementAdjust() {
  if (!agenda.value) return
  // Safety check: don't allow delta that makes duration < 1
  if (agenda.value.plannedDuration + (customAdjustMinutes.value - 1) < 1) {
    toast.warning('Durasi tidak bisa kurang dari 1 menit')
    return
  }
  customAdjustMinutes.value--
}

function applyCustomAdjust() {
  if (!agenda.value || customAdjustMinutes.value === 0) return
  
  // Final safety check before emit
  if (agenda.value.plannedDuration + customAdjustMinutes.value < 1) {
    toast.warning('Hasil akhir durasi minimal 1 menit')
    return
  }

  emit('adjust', agenda.value.id, customAdjustMinutes.value)
  customAdjustMinutes.value = 0
}
</script>

<template>
  <div ref="containerRef" class="h-full flex flex-col bg-notebook-paper p-4 md:p-6 overflow-y-auto">
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
      <!-- Title with highlight -->
      <div class="mb-6 relative">
        <h1 
          :class="[
            'font-handwritten-alt text-4xl font-bold text-notebook-ink leading-tight',
            agenda.status === 'cancelled' && 'line-through opacity-60'
          ]"
        >
          <span class="text-highlight">{{ agenda.title }}</span>
        </h1>
        
        <!-- Grade Badge Decoration -->
        <!-- <div v-if="agenda.status === 'done'" class="grade-badge">
          A+
        </div> -->
        
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

      <!-- Description (Enhanced Sticky Note) -->
      <div class="mb-8 mx-auto max-w-xl relative">
        <div class="sticky-note">
          <p class="font-handwritten text-lg text-notebook-ink leading-relaxed">
            ✨ {{ agenda.description }}
          </p>
        </div>
        
        <!-- Pencil Decoration -->
        <div class="pencil-decoration" style="bottom: -15px; right: -30px;"></div>
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
        <TimekeeperAgendaTimer 
          :agenda="agenda"
          :elapsed-seconds="elapsedSeconds"
        />
      </div>


      <!-- Primary Control Zone -->
      <div v-if="agenda.status === 'waiting' || agenda.status === 'running'" class="flex justify-center mb-8">
        <!-- Start button -->
        <button
          v-if="agenda.status === 'waiting'"
          class="btn-sketchy-large btn-sketchy-primary"
          @click="handleStart"
        >
          ▶️ MULAI ACARA
        </button>

        <!-- Stop button -->
        <button
          v-if="agenda.status === 'running'"
          class="btn-sketchy-large btn-sketchy-success"
          @click="handleStop"
        >
          ✅ SELESAI
        </button>
      </div>

      <!-- Secondary Actions (Adjustments) -->
      <div v-if="agenda.status !== 'done' && agenda.status !== 'cancelled'" class="mb-6 pt-4 border-t border-dashed border-notebook-lines">
        <p class="font-handwritten text-notebook-ink-light text-sm mb-3 text-center">⏱️ Atur Waktu Durasi</p>
        
        <div class="flex items-center justify-center gap-3 mb-4">
          <!-- Decrement Button -->
          <button
            class="btn-sketchy w-10 h-10 text-lg font-bold flex items-center justify-center"
            @click="decrementAdjust"
            title="Kurangi 1 menit"
          >
            −
          </button>
          
          <!-- Custom Input -->
          <div class="flex items-center gap-2">
            <input
              v-model.number="customAdjustMinutes"
              type="number"
              class="w-20 px-3 py-2 text-center border-2 border-notebook-ink rounded font-typewriter text-lg font-bold"
              placeholder="0"
            />
            <span class="font-handwritten text-sm text-notebook-ink-light">menit</span>
          </div>
          
          <!-- Increment Button -->
          <button
            class="btn-sketchy w-10 h-10 text-lg font-bold flex items-center justify-center"
            @click="incrementAdjust"
            title="Tambah 1 menit"
          >
            +
          </button>
        </div>
        
        <!-- Apply Button -->
        <div class="flex justify-center gap-2">
          <button
            class="btn-sketchy btn-sketchy-primary text-sm py-2 px-6"
            :disabled="customAdjustMinutes === 0"
            @click="applyCustomAdjust"
          >
            ✓ Terapkan
          </button>
        </div>
        
        <div class="border-t border-dashed border-notebook-lines my-4"></div>
        
        <!-- Cancel Button -->
        <div class="flex justify-center">
          <button
            class="btn-sketchy btn-sketchy-danger text-sm py-1 px-3"
            @click="handleCancel"
          >
            ❌ Batalkan Agenda
          </button>
        </div>
      </div>

      <TimekeeperAgendaReminders 
        :agenda-id="agenda.id"
        :reminders="agenda.reminders"
      />


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

    <!-- Start Confirmation Modal -->
    <TimekeeperConfirmationModal
      :is-visible="showStartConfirmation"
      title="Konfirmasi Mulai Agenda"
      :message="startConfirmationMessage"
      confirm-text="Ya, Lanjutkan"
      cancel-text="Batal"
      type="warning"
      @confirm="confirmStart"
      @cancel="cancelStart"
    />

    <!-- Cancel Confirmation Modal -->
    <TimekeeperConfirmationModal
      :is-visible="showCancelConfirmation"
      title="Batalkan Agenda?"
      :message="cancelConfirmationMessage"
      confirm-text="Ya, Batalkan"
      cancel-text="Tidak"
      type="danger"
      @confirm="confirmCancel"
      @cancel="cancelCancelAction"
    />

    <!-- Stop Confirmation Modal -->
    <TimekeeperConfirmationModal
      :is-visible="showStopConfirmation"
      title="Selesaikan Agenda?"
      :message="stopConfirmationMessage"
      confirm-text="Ya, Selesai"
      cancel-text="Belum"
      type="success"
      @confirm="confirmStop"
      @cancel="cancelStop"
    />
  </div>
</template>
