<!--
  AgendaReminders.vue
  
  Manages reminders for a specific agenda.
  Handles list view, adding, editing, and deleting reminders.
-->
<script setup lang="ts">
import type { Reminder } from '~/types'
import { useTimekeeperStore } from '~/stores/timekeeper'
import { useToast } from '~/composables/useToast'

const props = defineProps<{
  agendaId: string
  reminders: Reminder[]
}>()

const store = useTimekeeperStore()
const toast = useToast()
const { addReminder, updateReminder, deleteReminder } = store

// State
const isAdding = ref(false)
const editingId = ref<string | null>(null)
const form = ref({
  offsetMinutes: 0,
  division: '',
  message: '',
  icon: ''
})

function resetForm() {
  form.value = { offsetMinutes: 0, division: '', message: '', icon: '' }
  isAdding.value = false
  editingId.value = null
}

function startAdd() {
  resetForm()
  isAdding.value = true
}

function startEdit(reminder: Reminder) {
  editingId.value = reminder.id
  isAdding.value = false
  form.value = {
    offsetMinutes: reminder.offsetMinutes,
    division: reminder.division,
    message: reminder.message,
    icon: reminder.icon || ''
  }
}

function save() {
  if (editingId.value) {
    updateReminder(props.agendaId, editingId.value, form.value)
    toast.success('Reminder berhasil diperbarui')
  } else {
    addReminder(props.agendaId, form.value)
    toast.success('Reminder baru ditambahkan')
  }
  resetForm()
}

function remove(id: string) {
  if (confirm('Hapus reminder ini?')) {
    deleteReminder(props.agendaId, id)
    toast.success('Reminder dihapus')
  }
}

function cancel() {
  resetForm()
}
</script>

<template>
  <div class="mb-6 border-t-2 border-dashed border-notebook-lines pt-6">
    <div class="flex items-center justify-between mb-3">
      <p class="font-handwritten text-lg text-notebook-ink flex items-center gap-2">
        📌 Reminder & Alerts
      </p>
      <button
        v-if="!isAdding && !editingId"
        class="btn-sketchy text-xs py-1 px-2"
        @click="startAdd"
      >
        + Tambah
      </button>
    </div>

    <!-- List -->
    <div v-if="reminders.length > 0" class="space-y-2 mb-3">
      <div
        v-for="reminder in reminders"
        :key="reminder.id"
        class="border-sketchy-light p-3 bg-notebook-paper-dark flex items-start gap-3"
        :class="editingId === reminder.id && 'ring-2 ring-notebook-ink/20'"
      >
        <div class="text-2xl flex-shrink-0">{{ reminder.icon || '📍' }}</div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1">
            <span class="font-typewriter text-xs font-bold text-notebook-ink/60">
              {{ reminder.offsetMinutes >= 0 ? `+${reminder.offsetMinutes}m` : `${reminder.offsetMinutes}m` }}
            </span>
            <span class="text-xs px-1.5 py-0.5 bg-notebook-ink/10 rounded font-handwritten">
              {{ reminder.division }}
            </span>
          </div>
          <p class="font-handwritten text-sm text-notebook-ink">{{ reminder.message }}</p>
        </div>
        <div class="flex gap-1">
          <button
            class="text-xs text-notebook-ink/40 hover:text-notebook-ink"
            @click="startEdit(reminder)"
          >
            ✏️
          </button>
          <button
            class="text-xs text-pen-red/40 hover:text-pen-red"
            @click="remove(reminder.id)"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>

    <!-- Form -->
    <div v-if="isAdding || editingId" class="border-sketchy p-3 bg-yellow-50/30 space-y-3">
      <p class="font-handwritten text-sm font-bold text-notebook-ink">
        {{ editingId ? '✏️ Edit Reminder' : '➕ Tambah Reminder Baru' }}
      </p>
      
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="font-handwritten text-xs text-notebook-ink-light">
            Waktu (menit) <span class="text-pen-red">*</span>
          </label>
          <input
            v-model.number="form.offsetMinutes"
            type="number"
            class="w-full px-2 py-1 border border-notebook-lines rounded font-typewriter text-sm"
            placeholder="-5 atau +10"
            required
            @keydown.enter="save"
          />
        </div>
        <div>
          <label class="font-handwritten text-xs text-notebook-ink-light">
            Divisi <span class="text-pen-red">*</span>
          </label>
          <input
            v-model="form.division"
            type="text"
            class="w-full px-2 py-1 border border-notebook-lines rounded font-handwritten text-sm"
            placeholder="Sound, MC, dll"
            required
            @keydown.enter="save"
          />
        </div>
      </div>

      <div>
        <label class="font-handwritten text-xs text-notebook-ink-light">
          Pesan <span class="text-pen-red">*</span>
        </label>
        <input
          v-model="form.message"
          type="text"
          class="w-full px-2 py-1 border border-notebook-lines rounded font-handwritten text-sm"
          placeholder="Siapkan mic..."
          required
          @keydown.enter="save"
        />
      </div>

      <div>
        <label class="font-handwritten text-xs text-notebook-ink-light">Icon (emoji)</label>
        <input
          v-model="form.icon"
          type="text"
          class="w-full px-2 py-1 border border-notebook-lines rounded font-handwritten text-sm"
          placeholder="🔊 📽️ 🎤"
          maxlength="2"
          @keydown.enter="save"
        />
      </div>

      <div class="flex gap-2">
        <button class="btn-sketchy btn-sketchy-primary text-xs py-1 px-3 flex-1" @click="save">
          {{ editingId ? 'Simpan' : 'Tambah' }}
        </button>
        <button class="btn-sketchy text-xs py-1 px-3" @click="cancel">
          Batal
        </button>
      </div>
    </div>
  </div>
</template>
