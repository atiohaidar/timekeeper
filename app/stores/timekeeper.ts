import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

import type { Agenda, AgendaStatus, ChangeLogEntry, Reminder } from '~/types'

// ===== TYPES =====
// imported from ~/types

// ===== HELPER =====
function generateId(): string {
    return Math.random().toString(36).substring(2, 9)
}

function formatTime(date: Date): string {
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

// ===== DUMMY DATA =====
function createDummyAgendas(): Agenda[] {
    const baseTime = new Date()
    baseTime.setSeconds(0, 0)

    const items = [
        { title: 'Briefing Panitia + Persiapan Acara', duration: 30, pic: 'Koordinator Lapangan', desc: 'Briefing akhir koordinasi panitia sebelum acara dimulai.' },
        { title: 'Open Gate dan Registrasi Peserta', duration: 30, pic: 'Kesekretariatan', desc: 'Peserta mulai memasuki ruangan dan melakukan absen.' },
        { title: 'Pembukaan MC', duration: 10, pic: 'MC', desc: 'Pembukaan formal oleh Master of Ceremony.' },
        { title: 'Tilawah Al-Qur\'an', duration: 5, pic: 'Petugas Tilawah', desc: 'Pembacaan ayat suci Al-Qur\'an.' },
        { title: 'Pre-test', duration: 10, pic: 'Tim Materi', desc: 'Pengerjaan soal pre-test untuk mengukur pemahaman awal.' },
        { title: 'Ice Breaking', duration: 15, pic: 'MC', desc: 'Sesi perenggangan agar peserta lebih rileks.' },
        { title: 'Pembacaan CV #1', duration: 5, pic: 'MC', desc: 'Pembacaan riwayat hidup pemateri pertama.' },
        { title: 'Penyampaian Materi #1', duration: 45, pic: 'Pemateri 1', desc: 'Penyampaian inti materi sesi pertama.' },
        { title: 'Tanya Jawab #1', duration: 15, pic: 'MC', desc: 'Sesi diskusi dan tanya jawab dengan pemateri pertama.' },
        { title: 'Penyerahan Plakat + Dokumentasi #1', duration: 5, pic: 'Pimpinan Acara', desc: 'Penyerahan kenang-kenangan dan foto bersama pemateri pertama.' },
        { title: 'Games', duration: 20, pic: 'Divisi Acara', desc: 'Game interaktif untuk menjaga antusiasme peserta.' },
        { title: 'Pembacaan CV #2', duration: 5, pic: 'MC', desc: 'Pembacaan riwayat hidup pemateri kedua.' },
        { title: 'Penyampaian Materi #2', duration: 45, pic: 'Pemateri 2', desc: 'Penyampaian inti materi sesi kedua.' },
        { title: 'Tanya Jawab #2', duration: 15, pic: 'MC', desc: 'Sesi diskusi dan tanya jawab dengan pemateri kedua.' },
        { title: 'Penyerahan Plakat + Dokumentasi #2', duration: 5, pic: 'Pimpinan Acara', desc: 'Penyerahan kenang-kenangan dan foto bersama pemateri kedua.' },
        { title: 'Post-test', duration: 10, pic: 'Tim Materi', desc: 'Pengerjaan soal post-test untuk evaluasi akhir.' },
        { title: 'Doa', duration: 5, pic: 'Petugas Doa', desc: 'Pembacaan doa penutup.' },
        { title: 'Penutupan', duration: 5, pic: 'MC', desc: 'Penutupan acara oleh MC.' }
    ]

    let cumulativeTime = 0
    return items.map((item, index) => {
        const plannedStartTime = new Date(baseTime.getTime() + cumulativeTime * 60 * 1000)
        cumulativeTime += item.duration

        let reminders: Reminder[] = []

        if (item.title === 'Briefing Panitia + Persiapan Acara') {
            reminders.push({ id: generateId(), offsetMinutes: 0, division: 'Panitia', message: 'Siapkan presensi & snack', icon: '📋' })
        } else if (item.title === 'Tilawah Al-Qur\'an') {
            reminders.push({ id: generateId(), offsetMinutes: 0, division: 'Acara', message: 'Mic & Al-Qur\'an siap', icon: '📖' })
        } else if (item.title === 'Penyampaian Materi #1') {
            reminders.push({ id: generateId(), offsetMinutes: -10, division: 'Logistik', message: 'Cek Laptop & Proyektor', icon: '📽️' })
        } else if (item.title === 'Games') {
            reminders.push({ id: generateId(), offsetMinutes: 0, division: 'Acara', message: 'Siapkan hadiah/doorprize', icon: '🎁' })
        } else if (item.title === 'Post-test') {
            reminders.push({ id: generateId(), offsetMinutes: 0, division: 'Akademik', message: 'Bagikan link post-test', icon: '🔗' })
        }

        return {
            id: generateId(),
            title: item.title,
            description: item.desc,
            pic: item.pic,
            plannedStartTime,
            plannedDuration: item.duration,
            actualStartTime: null,
            actualEndTime: null,
            status: 'waiting',
            notes: '',
            order: index,
            reminders
        }
    })
}

export const useTimekeeperStore = defineStore('timekeeper', () => {
    // State
    const eventName = ref('Big Class 2 Islah 1 2022')
    const agendas = ref<Agenda[]>(createDummyAgendas())
    const selectedAgendaId = ref<string | null>(agendas.value[0]?.id ?? null)
    const changeLog = ref<ChangeLogEntry[]>([])
    const isChangeLogVisible = ref(false)
    const isEditMode = ref(false)

    // Time & Simulation
    const currentTime = ref(new Date())
    const isSimulated = ref(false)
    const isPaused = ref(false)
    let simulationInterval: ReturnType<typeof setInterval> | null = null

    // Persistent storage keys
    let timerInterval: ReturnType<typeof setInterval> | null = null
    const elapsedSeconds = ref(0)

    // Undo/Redo
    const STORAGE_KEY = 'timekeeper-v1'
    const undoStack = ref<string[]>([])
    const redoStack = ref<string[]>([])
    const isUndoing = ref(false)

    // ===== COMPUTED =====
    const selectedAgenda = computed(() => {
        if (!selectedAgendaId.value) return null
        return agendas.value.find(a => a.id === selectedAgendaId.value) ?? null
    })

    const runningAgenda = computed(() => {
        return agendas.value.find(a => a.status === 'running') ?? null
    })

    const sortedAgendas = computed(() => {
        return [...agendas.value].sort((a, b) => a.order - b.order)
    })

    const estimatedStartTimes = computed(() => {
        const estimates = new Map<string, Date>()
        const sorted = sortedAgendas.value

        let nextEstimatedStart: Date | null = null

        for (let i = 0; i < sorted.length; i++) {
            const agenda = sorted[i]
            if (!agenda) continue

            if (agenda.status === 'cancelled') {
                estimates.set(agenda.id, agenda.plannedStartTime)
                continue
            }

            if (nextEstimatedStart === null) {
                if (agenda.actualStartTime) {
                    estimates.set(agenda.id, agenda.actualStartTime)
                    if (agenda.actualEndTime) {
                        nextEstimatedStart = agenda.actualEndTime
                    } else {
                        nextEstimatedStart = new Date(agenda.actualStartTime.getTime() + agenda.plannedDuration * 60 * 1000)
                    }
                } else {
                    estimates.set(agenda.id, agenda.plannedStartTime)
                    nextEstimatedStart = new Date(agenda.plannedStartTime.getTime() + agenda.plannedDuration * 60 * 1000)
                }
            } else {
                if (agenda.actualStartTime) {
                    estimates.set(agenda.id, agenda.actualStartTime)
                    if (agenda.actualEndTime) {
                        nextEstimatedStart = agenda.actualEndTime
                    } else {
                        nextEstimatedStart = new Date(agenda.actualStartTime.getTime() + agenda.plannedDuration * 60 * 1000)
                    }
                } else {
                    estimates.set(agenda.id, nextEstimatedStart)
                    nextEstimatedStart = new Date(nextEstimatedStart.getTime() + agenda.plannedDuration * 60 * 1000)
                }
            }
        }

        return estimates
    })

    function getEstimatedStartTime(agendaId: string): Date | null {
        return estimatedStartTimes.value.get(agendaId) ?? null
    }

    // ===== PERSISTENCE & UNDO SYSTEM =====
    function snapshot() {
        if (isUndoing.value) return
        undoStack.value.push(JSON.stringify(agendas.value))
        if (undoStack.value.length > 50) undoStack.value.shift()
        redoStack.value = []
    }

    function undo() {
        const lastState = undoStack.value.pop()
        if (!lastState) return

        isUndoing.value = true
        redoStack.value.push(JSON.stringify(agendas.value))

        try {
            agendas.value = JSON.parse(lastState, dateReviver)
            recalculateStartTimes()
        } finally {
            isUndoing.value = false
        }
    }

    function redo() {
        const nextState = redoStack.value.pop()
        if (!nextState) return

        isUndoing.value = true
        undoStack.value.push(JSON.stringify(agendas.value))

        try {
            agendas.value = JSON.parse(nextState, dateReviver)
            recalculateStartTimes()
        } finally {
            isUndoing.value = false
        }
    }

    function canUndo() {
        return undoStack.value.length > 0
    }

    function canRedo() {
        return redoStack.value.length > 0
    }

    function dateReviver(_key: string, value: any) {
        if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
            return new Date(value)
        }
        return value
    }

    function saveToStorage() {
        if (import.meta.client) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(agendas.value))
        }
    }

    function loadFromStorage() {
        if (import.meta.client) {
            const stored = localStorage.getItem(STORAGE_KEY)
            if (stored) {
                try {
                    agendas.value = JSON.parse(stored, dateReviver)
                    // If stored agendas are stale (e.g. from yesterday), we might want to shift them to today?
                    // For now, we assume user manages dates.
                    recalculateStartTimes()
                } catch (e) {
                    console.error('Failed to load state', e)
                }
            }
        }
    }

    function resetData() {
        if (confirm('Reset data ke default?')) {
            if (import.meta.client) localStorage.removeItem(STORAGE_KEY)
            agendas.value = createDummyAgendas()
            undoStack.value = []
            redoStack.value = []
            elapsedSeconds.value = 0
            selectedAgendaId.value = agendas.value[0]?.id ?? null
        }
    }

    function importAgendas(newAgendas: Agenda[], replace: boolean) {
        snapshot()

        if (replace) {
            agendas.value = newAgendas.map((a, i) => ({ ...a, order: i }))
            selectedAgendaId.value = agendas.value[0]?.id ?? null
        } else {
            // Append
            const lastOrder = Math.max(...agendas.value.map(a => a.order), -1)
            const appended = newAgendas.map((a, i) => ({ ...a, order: lastOrder + 1 + i }))
            agendas.value.push(...appended)
        }

        recalculateStartTimes()
        saveToStorage()
        addChangeLog('adjust', `Import ${newAgendas.length} agenda`, agendas.value[0] || newAgendas[0] || { id: 'unknown', title: 'Imported Data' } as Agenda)
    }

    function downloadReport() {
        if (!import.meta.client) return

        const headers = ['Judul', 'PIC', 'Status', 'Rencana Mulai', 'Rencana Durasi (m)', 'Aktual Mulai', 'Aktual Selesai', 'Aktual Durasi (m)', 'Catatan']
        const csvContent = [
            headers.join(','),
            ...agendas.value.map(a => {
                const actualDur = a.actualDurationSeconds ? (a.actualDurationSeconds / 60).toFixed(1) : ''
                const row = [
                    `"${a.title.replace(/"/g, '""')}"`,
                    `"${a.pic.replace(/"/g, '""')}"`,
                    a.status,
                    formatTime(a.plannedStartTime),
                    a.plannedDuration,
                    a.actualStartTime ? formatTime(a.actualStartTime) : '-',
                    a.actualEndTime ? formatTime(a.actualEndTime) : '-',
                    actualDur,
                    `"${a.notes.replace(/"/g, '""')}"`
                ]
                return row.join(',')
            })
        ].join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', `laporan-timekeeper-${new Date().toISOString().slice(0, 10)}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    function exportCurrentAgendas() {
        if (!import.meta.client) return

        // Exact 7-column format for re-importing
        const headers = ['Judul Agenda', 'Durasi (menit)', 'PIC', 'Deskripsi', 'Rem-Waktu', 'Rem-Divisi', 'Rem-Pesan']

        const rows = agendas.value.sort((a, b) => a.order - b.order).map(a => {
            const rem = a.reminders[0] || { offsetMinutes: '', division: '', message: '' }
            return [
                `"${a.title.replace(/"/g, '""')}"`,
                a.plannedDuration,
                `"${a.pic.replace(/"/g, '""')}"`,
                `"${a.description.replace(/"/g, '""')}"`,
                rem.offsetMinutes,
                `"${rem.division.replace(/"/g, '""')}"`,
                `"${rem.message.replace(/"/g, '""')}"`
            ].join(',')
        })

        const csvContent = "\uFEFF" + [headers.join(','), ...rows].join('\n') // Added BOM for Excel UTF-8

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', `rundown-editable-${new Date().toISOString().slice(0, 10)}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    // Persist on change
    watch(agendas, () => {
        saveToStorage()
    }, { deep: true })

    // Init
    if (import.meta.client) {
        setTimeout(() => {
            loadFromStorage()
        }, 0)

        // Central Clock Loop
        setInterval(() => {
            if (isSimulated.value) {
                if (!isPaused.value) {
                    // Advance time by 1 second in simulation mode
                    currentTime.value = new Date(currentTime.value.getTime() + 1000)
                }
            } else {
                // Sync with real time
                currentTime.value = new Date()
            }

            // If an agenda is running, validation logic (elapsedSeconds) is handled separately
            // But we might want to sync runningAgenda elapsed time with this central clock in the future.
            // For now, let's keep the existing localized timer interval for runningAgenda 
            // BUT, if we are in simulation mode, the runningAgenda timer interval (setInterval 1000ms) 
            // might drift if we speed up simulation. 
            // Ideally, elapsedSeconds should be calculated diff: (currentTime - actualStartTime).

            if (runningAgenda.value && runningAgenda.value.actualStartTime) {
                // Recalculate elapsed seconds based on the store's currentTime
                const start = runningAgenda.value.actualStartTime
                const diffMs = currentTime.value.getTime() - start.getTime()
                elapsedSeconds.value = Math.floor(diffMs / 1000)
            }
        }, 1000)
    }

    // ===== SIMULATION ACTIONS =====
    function toggleSimulation() {
        isSimulated.value = !isSimulated.value
        // When entering simulation, start from 'now' or keep current time? 
        // Let's keep current time static initially if we pause?
        // Actually, let's just detach from real clock.
        if (!isSimulated.value) {
            isPaused.value = false
        }
    }

    function setSimulationTime(date: Date) {
        isSimulated.value = true
        currentTime.value = date
        // Adjust running agenda start time if necessary to preserve elapsed duration?
        // Or should we shift everything?
        // User request is simple: "dummy code for time".
        // Let's just set the clock. 
        // NOTE: If an agenda is running, shifting current time abruptly might cause negative elapsed time 
        // or huge elapsed time if we don't adjust actualStartTime. 
        // For simple testing, we just jump.
    }

    function togglePause() {
        isPaused.value = !isPaused.value
    }

    // ===== CHANGE LOG HELPERS =====
    function addChangeLog(type: ChangeLogEntry['type'], description: string, agenda: Agenda) {
        changeLog.value.unshift({
            id: generateId(),
            timestamp: new Date(),
            type,
            description,
            agendaId: agenda.id,
            agendaTitle: agenda.title
        })
    }

    // ===== ACTIONS =====
    function selectAgenda(id: string) {
        selectedAgendaId.value = id
    }

    function startAgenda(id: string) {
        snapshot()
        const agenda = agendas.value.find(a => a.id === id)
        if (!agenda) return

        const current = runningAgenda.value
        if (current && current.id !== id) {
            stopAgenda(current.id, false)
        }

        agenda.status = 'running'
        agenda.actualStartTime = new Date()
        elapsedSeconds.value = 0

        if (timerInterval) clearInterval(timerInterval)
        // We rely on the central clock loop to update elapsedSeconds now
        // But we still need to clear the old interval if it exists from older logic

        addChangeLog('start', `Dimulai pada ${formatTime(new Date())}`, agenda)
    }

    function stopAgenda(id: string, markDone: boolean = true) {
        snapshot()
        const agenda = agendas.value.find(a => a.id === id)
        if (!agenda) return

        if (timerInterval) {
            clearInterval(timerInterval)
            timerInterval = null
        }

        agenda.actualEndTime = new Date()
        agenda.actualDurationSeconds = elapsedSeconds.value

        if (markDone) {
            agenda.status = 'done'
            addChangeLog('done', `Selesai pada ${formatTime(new Date())}`, agenda)

            const sorted = sortedAgendas.value
            const currentIndex = sorted.findIndex(a => a.id === id)
            if (currentIndex !== -1 && currentIndex < sorted.length - 1) {
                const nextAgenda = sorted.slice(currentIndex + 1).find(a => a.status !== 'cancelled')
                if (nextAgenda) {
                    selectedAgendaId.value = nextAgenda.id
                }
            }
        }
        elapsedSeconds.value = 0
    }

    function cancelAgenda(id: string) {
        snapshot()
        const agenda = agendas.value.find(a => a.id === id)
        if (!agenda) return

        if (agenda.status === 'running' && timerInterval) {
            clearInterval(timerInterval)
            timerInterval = null
            elapsedSeconds.value = 0
        }

        agenda.status = 'cancelled'
        addChangeLog('cancel', 'Dibatalkan', agenda)

        const sorted = sortedAgendas.value
        const currentIndex = sorted.findIndex(a => a.id === id)
        if (currentIndex !== -1 && currentIndex < sorted.length - 1) {
            const nextAgenda = sorted.slice(currentIndex + 1).find(a => a.status === 'waiting')
            if (nextAgenda) {
                selectedAgendaId.value = nextAgenda.id
            }
        }
        recalculateStartTimes()
    }

    function adjustTime(id: string, minutes: number) {
        snapshot()
        const agenda = agendas.value.find(a => a.id === id)
        if (!agenda) return false

        if (minutes < 0 && agenda.plannedDuration + minutes < 1) {
            const toast = useToast()
            toast.warning('Durasi minimal adalah 1 menit')
            return false
        }

        agenda.plannedDuration += minutes
        if (agenda.plannedDuration < 1) agenda.plannedDuration = 1

        const action = minutes > 0 ? `+${minutes}` : `${minutes}`
        addChangeLog('adjust', `Durasi diubah ${action} menit`, agenda)
        recalculateStartTimes()
        return true
    }

    function updateNotes(id: string, notes: string) {
        const agenda = agendas.value.find(a => a.id === id)
        if (agenda) {
            agenda.notes = notes
        }
    }

    function addAgenda(data: Partial<Agenda>, insertAfterId?: string) {
        snapshot()
        const id = Math.random().toString(36).substring(2, 9)
        const sorted = sortedAgendas.value

        let newOrder = sorted.length
        let startTime = new Date()

        if (insertAfterId) {
            const index = sorted.findIndex(a => a.id === insertAfterId)
            if (index !== -1) {
                newOrder = index + 1
                // Shift existing orders
                agendas.value.forEach(a => {
                    if (a.order >= newOrder) a.order++
                })
            }
        } else if (sorted.length === 0 && data.plannedStartTime) {
            startTime = new Date(data.plannedStartTime)
        }

        const newAgenda: Agenda = {
            id,
            title: data.title || 'Agenda Baru',
            pic: data.pic || '-',
            plannedStartTime: startTime,
            plannedDuration: data.plannedDuration || 15,
            actualStartTime: null,
            actualEndTime: null,
            status: 'waiting',
            description: data.description || '',
            notes: '',
            order: newOrder,
            reminders: []
        }

        agendas.value.push(newAgenda)
        recalculateStartTimes()
        saveToStorage()
        return id
    }

    function updateAgenda(id: string, updates: Partial<Agenda>) {
        snapshot()
        const agenda = agendas.value.find(a => a.id === id)
        if (agenda) {
            Object.assign(agenda, updates)
            recalculateStartTimes()
            saveToStorage()
        }
    }

    function deleteAgenda(id: string) {
        snapshot()
        const index = agendas.value.findIndex(a => a.id === id)
        if (index !== -1) {
            const deleted = agendas.value.splice(index, 1)[0]
            // Re-normalize orders
            sortedAgendas.value.forEach((a, i) => {
                a.order = i
            })
            if (selectedAgendaId.value === id) {
                selectedAgendaId.value = null
            }
            recalculateStartTimes()
            saveToStorage()
        }
    }

    function reorderAgendas(fromIndex: number, toIndex: number) {
        snapshot()
        const sorted = sortedAgendas.value
        const [moved] = sorted.splice(fromIndex, 1)
        if (!moved) return

        sorted.splice(toIndex, 0, moved)

        sorted.forEach((agenda, index) => {
            const original = agendas.value.find(a => a.id === agenda.id)
            if (original) original.order = index
        })

        addChangeLog('swap', `Dipindahkan ke urutan ${toIndex + 1}`, moved)
        recalculateStartTimes()
    }

    function recalculateStartTimes() {
        const sorted = sortedAgendas.value
        if (!sorted[0]) return

        let currentTime = new Date(sorted[0].plannedStartTime)

        for (const agenda of sorted) {
            if (agenda.status === 'cancelled') continue

            const original = agendas.value.find(a => a.id === agenda.id)
            if (original) {
                original.plannedStartTime = new Date(currentTime)
                currentTime = new Date(currentTime.getTime() + original.plannedDuration * 60 * 1000)
            }
        }
    }

    function toggleChangeLog() {
        isChangeLogVisible.value = !isChangeLogVisible.value
    }

    function addReminder(agendaId: string, reminder: Omit<Reminder, 'id'>) {
        snapshot()
        const agenda = agendas.value.find(a => a.id === agendaId)
        if (!agenda) return

        const newReminder: Reminder = {
            ...reminder,
            id: generateId()
        }

        agenda.reminders.push(newReminder)
    }

    function updateReminder(agendaId: string, reminderId: string, updates: Partial<Omit<Reminder, 'id'>>) {
        snapshot()
        const agenda = agendas.value.find(a => a.id === agendaId)
        if (!agenda) return

        const reminder = agenda.reminders.find(r => r.id === reminderId)
        if (!reminder) return

        Object.assign(reminder, updates)
    }

    function deleteReminder(agendaId: string, reminderId: string) {
        snapshot()
        const agenda = agendas.value.find(a => a.id === agendaId)
        if (!agenda) return

        const index = agenda.reminders.findIndex(r => r.id === reminderId)
        if (index !== -1) {
            agenda.reminders.splice(index, 1)
        }
    }

    return {
        eventName,
        agendas,
        selectedAgendaId,
        changeLog,
        isChangeLogVisible,
        isEditMode,
        currentTime,
        isSimulated,
        isPaused,
        elapsedSeconds,
        selectedAgenda,
        runningAgenda,
        sortedAgendas,
        estimatedStartTimes,
        undoStack,
        redoStack,
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
        undo,
        redo,
        resetData,
        importAgendas,
        downloadReport,
        exportCurrentAgendas,
        addAgenda,
        updateAgenda,
        deleteAgenda,
        toggleSimulation,
        setSimulationTime,
        togglePause
    }
})
