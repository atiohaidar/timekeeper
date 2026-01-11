<!--
  ImportAgendasModal.vue
  
  Allows parsing pasted data from Excel/Google Sheets.
  Format: Title | Duration | PIC | Description
-->
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTimekeeperStore } from '~/stores/timekeeper'
import { useToast } from '~/composables/useToast'
import type { Agenda } from '~/types'

// ...
const toast = useToast()

function copyTemplate() {
  const content = `Judul Agenda	Durasi (menit)	PIC	Deskripsi	Rem-Waktu	Rem-Divisi	Rem-Pesan
Pembukaan	5	MC	Di Panggung Utama	-5	Sound	Musik Opening
Sambutan Ketua	10	Ketua Panitia	Sambutan singkat			
Materi Inti	45	Pemateri	Sesi tanya jawab di akhir	-10	LO	Siapkan minum & snack`
  
  navigator.clipboard.writeText(content).then(() => {
    toast.success('Template tabel (7 kolom) berhasil disalin!')
  })
}

function copyAiPrompt() {
  const prompt = `Saya ingin membuat rundown acara. Tolong buatkan tabel dengan 7 kolom persis seperti berikut (pisahkan dengan Tab agar bisa dipaste ke Excel):
1. Judul Agenda
2. Durasi (angka menit saja)
3. PIC
4. Deskripsi
5. Reminder Menit (contoh: -5 atau 10)
6. Reminder Divisi (contoh: Sound)
7. Reminder Pesan (contoh: Siapkan Mic)

Tolong buatkan jadwal untuk acara: [JUDUL ACARA]
Isi acara: [DETAIL KEGIATAN]`

  navigator.clipboard.writeText(prompt).then(() => {
    toast.info('Prompt AI (7 Kolom) berhasil disalin!')
  })
}
const props = defineProps<{
  isVisible: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const store = useTimekeeperStore()
const { importAgendas } = store

const rawInput = ref('')
const hasHeader = ref(true)
const startTime = ref('08:00') // Default start time
const fileInput = ref<HTMLInputElement | null>(null)

// Handle File Upload
function handleFileUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    rawInput.value = e.target?.result as string
  }
  reader.readAsText(file)
}

function triggerFileSelect() {
  fileInput.value?.click()
}

// Helper to generate IDs
function generateId(): string {
    return Math.random().toString(36).substring(2, 9)
}

// ... 

// Preview data parsing
const parsedPreview = computed(() => {
  if (!rawInput.value.trim()) return []

  const rows = rawInput.value.trim().split(/\r?\n/)
  if (rows.length === 0) return []
  
  const startIdx = hasHeader.value ? 1 : 0
  const dataRows = rows.slice(startIdx)
  
  return dataRows.map(row => {
    // Smart Delimiter Detection: Prefer Tab (Excel), fallback to Comma (CSV)
    let cols = row.split('\t')
    if (cols.length < 2) {
      // Try comma, but handle quoted strings correctly (basic version)
      cols = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
    }
    
    // Clean up quotes from CSV parsing
    const clean = (val: string | undefined) => (val || '').trim().replace(/^"|"$/g, '').replace(/""/g, '"')

    const title = clean(cols[0]) || 'Tanpa Judul'
    const rawDur = clean(cols[1]) || '1'
    const duration = parseInt(rawDur.replace(/[^0-9]/g, '')) || 1
    const pic = clean(cols[2]) || '-'
    const description = clean(cols[3]) || ''
    
    // Parse Reminder from separate columns (4, 5, 6)
    const remTime = clean(cols[4])
    const remDiv = clean(cols[5])
    const remMsg = clean(cols[6])
    
    const reminders = []
    
    if (remTime && remDiv && remMsg) {
      reminders.push({
        id: generateId(),
        offsetMinutes: parseInt(remTime) || 0,
        division: remDiv,
        message: remMsg,
        icon: '⏰'
      })
    }
    
    return {
      title,
      duration,
      pic,
      description,
      reminders
    }
  }).filter(item => item.title)
})

function handleImport(replace: boolean) {
  if (parsedPreview.value.length === 0) return

  // Create Base Date from startTime input
  const [hours, minutes] = startTime.value.split(':').map(Number)
  const baseDate = new Date()
  baseDate.setHours(hours || 0, minutes || 0, 0, 0)
  
  let currentStartTime = new Date(baseDate)

  const newAgendas = parsedPreview.value.map((item, index) => {
    const start = new Date(currentStartTime)
    const end = new Date(start.getTime() + item.duration * 60000)
    
    // Update for next item
    currentStartTime = end

    return {
      id: generateId(),
      title: item.title,
      pic: item.pic,
      plannedStartTime: start, 
      plannedDuration: item.duration,
      actualStartTime: null,
      actualEndTime: null,
      status: 'waiting',
      description: item.description,
      notes: '',
      order: 0, // Will be set by store logic if appending/replacing
      reminders: item.reminders
    } as Agenda
  })
  
  importAgendas(newAgendas, replace)
  resetAndClose()
}

function resetAndClose() {
  rawInput.value = ''
  emit('close')
}
</script>

<template>
  <Transition name="fade">
    <div v-if="isVisible" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-notebook-ink/50 backdrop-blur-sm">
      <div class="bg-notebook-paper w-full max-w-3xl rounded-lg shadow-xl border-2 border-notebook-lines flex flex-col max-h-[90vh]">
        <!-- Header -->
        <div class="p-4 border-b-2 border-notebook-lines flex justify-between items-center bg-yellow-50/50">
          <h2 class="font-handwritten-alt text-2xl font-bold text-notebook-ink">
            📥 Import Jadwal
          </h2>
          <button @click="resetAndClose" class="text-notebook-ink-light hover:text-pen-red text-2xl">
            &times;
          </button>
        </div>

        <!-- Content -->
        <div class="p-6 overflow-y-auto flex-1">
          
          <div class="mb-6 bg-blue-50/50 p-4 rounded border border-blue-200">
            <h3 class="font-bold text-notebook-ink mb-2 text-sm uppercase tracking-wide">💡 Cara Import dari Spreadsheet</h3>
            
            <div class="flex flex-wrap gap-2 mb-3">
              <button 
                @click="copyTemplate"
                class="text-xs bg-white border border-blue-300 text-blue-700 px-2 py-1 rounded hover:bg-blue-50 flex items-center gap-1"
              >
                📋 Copy Tabel Template
              </button>
              <button 
                @click="copyAiPrompt"
                class="text-xs bg-white border border-purple-300 text-purple-700 px-2 py-1 rounded hover:bg-purple-50 flex items-center gap-1"
              >
                🤖 Copy Prompt AI
              </button>
            </div>

            <p class="text-xs text-notebook-ink mb-2 leading-relaxed">
              1. <b>Copy</b> template tabel atau prompt AI di atas.<br>
              2. <b>Siapkan data</b> di Excel/Spreadsheet atau minta AI buatkan.<br>
              3. <b>Copy hasil tabel</b> dari Excel.<br>
              4. <b>Paste</b> di kotak di bawah ini.
            </p>
            
            <div class="flex items-center gap-2 mt-2 pt-2 border-t border-blue-200/50">
               <input type="checkbox" id="header" v-model="hasHeader" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
               <label for="header" class="text-xs text-notebook-ink">Abaikan baris pertama (Header)</label>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 h-full min-h-[300px]">
            <!-- Input Area -->
            <div class="flex flex-col">
               <div class="flex items-center justify-between mb-1">
                  <label class="font-handwritten text-sm text-notebook-ink-light">Paste Data Excel Di Sini:</label>
                  <button 
                    @click="triggerFileSelect"
                    class="text-[10px] bg-gray-100 border border-gray-300 px-2 py-0.5 rounded hover:bg-gray-200"
                  >
                    📂 Pilih File .csv
                  </button>
                  <input 
                    ref="fileInput"
                    type="file" 
                    accept=".csv,.txt"
                    class="hidden" 
                    @change="handleFileUpload"
                  >
               </div>
               <textarea 
                 v-model="rawInput"
                 class="flex-1 w-full p-3 font-mono text-xs border-2 border-notebook-ink rounded focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                 placeholder="Contoh:&#10;Pembukaan	10	MC	Di aula utama&#10;Sambutan	15	Ketua	-"
               ></textarea>
               
               <div class="mt-4 p-3 bg-yellow-50 rounded border border-notebook-lines dashed">
                  <label class="font-handwritten text-sm text-notebook-ink-light block mb-1">
                    🕒 Jam Mulai Agenda Pertama:
                  </label>
                  <input 
                    v-model="startTime"
                    type="time"
                    class="px-2 py-1 border border-notebook-ink rounded font-typewriter text-lg"
                  />
                  <p class="text-[10px] text-gray-500 mt-1">
                    Agenda berikutnya akan otomatis menyesuaikan berdasarkan durasi.
                  </p>
               </div>
            </div>

            <!-- Preview Area -->
            <div class="flex flex-col">
              <label class="font-handwritten text-sm text-notebook-ink-light mb-1">Preview Hasil ({{ parsedPreview.length }} item):</label>
              <div class="flex-1 border-2 border-notebook-lines bg-white rounded overflow-hidden flex flex-col">
                <div class="overflow-y-auto flex-1">
                  <table class="w-full text-left text-xs">
                    <thead class="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th class="p-2 font-bold text-notebook-ink w-1/3">Judul</th>
                        <th class="p-2 font-bold text-notebook-ink text-center">Menit</th>
                        <th class="p-2 font-bold text-notebook-ink">PIC</th>
                        <th class="p-2 font-bold text-notebook-ink">Reminder</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                      <tr v-for="(item, idx) in parsedPreview" :key="idx" class="hover:bg-yellow-50/30">
                        <td class="p-2 truncate max-w-[120px]" :title="item.title">{{ item.title }}</td>
                        <td class="p-2 text-center">{{ item.duration }}</td>
                        <td class="p-2 truncate max-w-[60px]" :title="item.pic">{{ item.pic }}</td>
                        <td class="p-2">
                          <div v-if="item.reminders && item.reminders.length > 0" class="text-[10px] leading-tight">
                            <span class="font-bold text-blue-600">{{ item.reminders[0]?.offsetMinutes }}m</span>
                            <span class="mx-1 opacity-50">|</span>
                            <span class="text-notebook-ink truncate">{{ item.reminders[0]?.message }}</span>
                          </div>
                          <span v-else class="text-gray-300">-</span>
                        </td>
                      </tr>
                      <tr v-if="parsedPreview.length === 0">
                        <td colspan="3" class="p-8 text-center text-gray-400 italic">
                          Belum ada data valid...
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

        </div>

        <!-- Footer -->
        <div class="p-4 border-t-2 border-notebook-lines bg-gray-50 flex justify-end gap-3">
          <button 
            @click="handleImport(false)" 
            class="btn-sketchy px-4 py-2 text-sm"
            :disabled="parsedPreview.length === 0"
            :class="parsedPreview.length === 0 ? 'opacity-50 cursor-not-allowed' : ''"
          >
            ➕ Tambahkan ke Paling Bawah
          </button>
          <button 
            @click="handleImport(true)" 
            class="btn-sketchy btn-sketchy-primary px-4 py-2 text-sm"
            :disabled="parsedPreview.length === 0"
            :class="parsedPreview.length === 0 ? 'opacity-50 cursor-not-allowed' : ''"
          >
            🔄 Ganti Semua Jadwal
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
