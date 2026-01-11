<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useTimekeeperStore } from '~/stores/timekeeper'
import type { Agenda } from '~/types'

const props = defineProps<{
  isVisible: boolean
  agendaId?: string | null // If provided, we are editing
  insertAfterId?: string | null // If provided, we insert after this one
}>()

const emit = defineEmits<{
  close: []
  saved: [id: string]
}>()

const store = useTimekeeperStore()
const { agendas, sortedAgendas } = storeToRefs(store)
const { addAgenda, updateAgenda } = store

const form = ref({
  title: '',
  pic: '',
  duration: 15,
  description: '',
  startTime: '08:00'
})

const isEditing = computed(() => !!props.agendaId)
const selectedInsertAfterId = ref<string | null>(null)
const { formatTime } = useTimeFormatter()

// Initialize form
watch(() => props.isVisible, (visible) => {
  if (visible) {
    // Reset or set initial
    selectedInsertAfterId.value = props.insertAfterId || null
    
    if (props.agendaId) {
      const agenda = agendas.value.find((a: Agenda) => a.id === props.agendaId)
      if (agenda) {
        form.value = {
          title: agenda.title,
          pic: agenda.pic,
          duration: agenda.plannedDuration,
          description: agenda.description,
          startTime: formatTimeToInput(agenda.plannedStartTime)
        }
      }
    } else {
      // ... default case
      form.value = {
        title: '',
        pic: '',
        duration: 15,
        description: '',
        startTime: '08:00'
      }
      
      // If we have existing agendas, maybe inherit start time from last one's end?
      // Actually the store handles calculation, but we might want to show it.
      if (sortedAgendas.value.length > 0 && !props.insertAfterId) {
          const last = sortedAgendas.value[sortedAgendas.value.length - 1]
          if (last) {
            const end = new Date(last.plannedStartTime.getTime() + last.plannedDuration * 60000)
            form.value.startTime = formatTimeToInput(end)
          }
      } else if (props.insertAfterId) {
          const prev = agendas.value.find((a: Agenda) => a.id === props.insertAfterId)
          if (prev) {
              const prevEnd = new Date(prev.plannedStartTime.getTime() + prev.plannedDuration * 60000)
              form.value.startTime = formatTimeToInput(prevEnd)
          }
      }
    }
  }
})

function formatTimeToInput(date: Date): string {
  return date.toLocaleTimeString('id-ID', { hour12: false, hour: '2-digit', minute: '2-digit' }).replace('.', ':')
}

function handleSave() {
  const [h, m] = form.value.startTime.split(':').map(Number)
  const startDate = new Date()
  startDate.setHours(h || 0, m || 0, 0, 0)

  const agendaData = {
    title: form.value.title,
    pic: form.value.pic,
    plannedDuration: form.value.duration,
    description: form.value.description,
    plannedStartTime: startDate
  }

  let savedId = ''
  if (isEditing.value && props.agendaId) {
    updateAgenda(props.agendaId, agendaData)
    savedId = props.agendaId
  } else {
    // Use the selected insert point, falling back to prop if logic fails (though v-model handles it)
    savedId = addAgenda(agendaData, selectedInsertAfterId.value || undefined)
  }

  emit('saved', savedId)
  close()
}

function close() {
  emit('close')
}
</script>

<template>
  <Transition name="fade">
    <div v-if="isVisible" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-notebook-ink/50 backdrop-blur-sm">
      <div class="bg-notebook-paper w-full max-w-lg rounded-lg shadow-xl border-2 border-notebook-lines flex flex-col">
        <!-- Header -->
        <div class="p-4 border-b-2 border-notebook-lines flex justify-between items-center bg-yellow-50/50">
          <h2 class="font-handwritten-alt text-2xl font-bold text-notebook-ink">
            {{ isEditing ? '✏️ Edit Agenda' : '➕ Tambah Agenda Baru' }}
          </h2>
          <button @click="close" class="text-notebook-ink-light hover:text-pen-red text-2xl">
            &times;
          </button>
        </div>

        <!-- Form -->
        <div class="p-6 space-y-4">
          <!-- Judul -->
          <div>
            <label class="block font-handwritten text-sm text-notebook-ink-light mb-1">Judul Agenda:</label>
            <input 
              v-model="form.title"
              type="text"
              class="w-full px-3 py-2 border-2 border-notebook-ink rounded font-handwritten text-lg focus:ring-2 focus:ring-blue-400"
              placeholder="Contoh: Pembukaan Acara"
              autofocus
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <!-- PIC -->
            <div>
              <label class="block font-handwritten text-sm text-notebook-ink-light mb-1">PIC:</label>
              <input 
                v-model="form.pic"
                type="text"
                class="w-full px-3 py-2 border-2 border-notebook-ink rounded font-handwritten focus:ring-2 focus:ring-blue-400"
                placeholder="Nama/Divisi"
              />
            </div>
            <!-- Durasi -->
            <div>
              <label class="block font-handwritten text-sm text-notebook-ink-light mb-1">Durasi (Menit):</label>
              <input 
                v-model.number="form.duration"
                type="number"
                min="1"
                class="w-full px-3 py-2 border-2 border-notebook-ink rounded font-typewriter focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>

          <!-- Start Time (Only if first) -->
          <div v-if="!isEditing && sortedAgendas.length === 0" class="p-3 bg-yellow-50 rounded border border-notebook-lines dashed">
            <label class="block font-handwritten text-sm text-notebook-ink-light mb-1">🕒 Jam Mulai:</label>
            <input 
              v-model="form.startTime"
              type="time"
              class="px-2 py-1 border border-notebook-ink rounded font-typewriter text-lg"
            />
          </div>

          <!-- Insert Placement (New Agenda Only) -->
          <div v-else-if="!isEditing && sortedAgendas.length > 0">
             <label class="block font-handwritten text-sm text-notebook-ink-light mb-1">📍 Sisipkan Setelah:</label>
             <select 
               v-model="selectedInsertAfterId"
               class="w-full px-3 py-2 border-2 border-notebook-ink rounded font-handwritten focus:ring-2 focus:ring-blue-400"
             >
                <option :value="null">⏬ Paling Akhir</option>
                <option v-for="agenda in sortedAgendas" :key="agenda.id" :value="agenda.id">
                  {{ agenda.title }} ({{ formatTime(agenda.plannedStartTime) }})
                </option>
             </select>
          </div>

          <!-- Deskripsi -->
          <div>
            <label class="block font-handwritten text-sm text-notebook-ink-light mb-1">Deskripsi:</label>
            <textarea 
              v-model="form.description"
              class="w-full px-3 py-2 border-2 border-notebook-ink rounded font-handwritten min-h-[80px] focus:ring-2 focus:ring-blue-400"
              placeholder="Detail kegiatan..."
            ></textarea>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-4 border-t-2 border-notebook-lines bg-gray-50 flex justify-end gap-3">
          <button @click="close" class="btn-sketchy px-4 py-2 text-sm italic">
            Batal
          </button>
          <button 
            @click="handleSave" 
            class="btn-sketchy btn-sketchy-primary px-6 py-2 text-sm"
            :disabled="!form.title"
          >
            {{ isEditing ? 'Simpan Perubahan' : 'Tambahkan Agenda' }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
