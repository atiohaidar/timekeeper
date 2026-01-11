/**
 * useTimekeeper Composable
 * 
 * Central state management for the Timekeeper Dashboard.
 * Handles agenda items, timer logic, status changes, and change logging.
 * 
 * All data is stored in local state (no backend).
 */

import { ref, computed, onUnmounted } from 'vue'

// ===== TYPES =====
export type AgendaStatus = 'waiting' | 'running' | 'done' | 'cancelled'

export interface Reminder {
    id: string
    offsetMinutes: number  // Relative: -5 = 5 min before start, +10 = 10 min after start
    division: string       // e.g., "Sound", "Logistik", "Konsumsi", "MC"
    message: string
    icon?: string          // Emoji icon for the reminder
}

export interface Agenda {
    id: string
    title: string
    pic: string                    // Person In Charge
    plannedStartTime: Date
    plannedDuration: number        // in minutes
    actualStartTime: Date | null
    actualEndTime: Date | null
    actualDurationSeconds?: number // Store the exact timer value
    status: AgendaStatus
    description: string
    notes: string
    order: number
    reminders: Reminder[]          // List of relative-time reminders
}

export interface ChangeLogEntry {
    id: string
    timestamp: Date
    type: 'delay' | 'cancel' | 'swap' | 'adjust' | 'start' | 'done'
    description: string
    agendaId: string
    agendaTitle: string
}

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
    // Start from the current minute, rounded down seconds
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

        // Add specific reminders based on title
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

// ===== COMPOSABLE =====
export function useTimekeeper() {
    // State
    const eventName = ref('Big Class 2 Islah 1 2022')
    const agendas = ref<Agenda[]>(createDummyAgendas())
    const selectedAgendaId = ref<string | null>(agendas.value[0]?.id ?? null)
    const changeLog = ref<ChangeLogEntry[]>([])
    const isChangeLogVisible = ref(false)

    // Timer state
    let timerInterval: ReturnType<typeof setInterval> | null = null
    const elapsedSeconds = ref(0)

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

    // Computed: Calculate estimated start times based on actual delays
    // Returns a Map of agendaId -> estimatedStartTime
    const estimatedStartTimes = computed(() => {
        const estimates = new Map<string, Date>()
        const sorted = sortedAgendas.value

        let nextEstimatedStart: Date | null = null

        for (let i = 0; i < sorted.length; i++) {
            const agenda = sorted[i]
            if (!agenda) continue

            // For cancelled agendas, skip but don't contribute to timeline
            if (agenda.status === 'cancelled') {
                estimates.set(agenda.id, agenda.plannedStartTime)
                continue
            }

            // First non-cancelled agenda or no delay yet
            if (nextEstimatedStart === null) {
                // If this agenda has already started, use actual start time
                if (agenda.actualStartTime) {
                    estimates.set(agenda.id, agenda.actualStartTime)
                    // Calculate when this agenda will/did end
                    if (agenda.actualEndTime) {
                        nextEstimatedStart = agenda.actualEndTime
                    } else {
                        // Still running - estimate based on planned duration from actual start
                        nextEstimatedStart = new Date(agenda.actualStartTime.getTime() + agenda.plannedDuration * 60 * 1000)
                    }
                } else {
                    // Not started yet - use planned time
                    estimates.set(agenda.id, agenda.plannedStartTime)
                    nextEstimatedStart = new Date(agenda.plannedStartTime.getTime() + agenda.plannedDuration * 60 * 1000)
                }
            } else {
                // Subsequent agendas - cascade from previous
                if (agenda.actualStartTime) {
                    // Already started - use actual
                    estimates.set(agenda.id, agenda.actualStartTime)
                    if (agenda.actualEndTime) {
                        nextEstimatedStart = agenda.actualEndTime
                    } else {
                        nextEstimatedStart = new Date(agenda.actualStartTime.getTime() + agenda.plannedDuration * 60 * 1000)
                    }
                } else {
                    // Not started - estimate based on when previous ends
                    estimates.set(agenda.id, nextEstimatedStart)
                    nextEstimatedStart = new Date(nextEstimatedStart.getTime() + agenda.plannedDuration * 60 * 1000)
                }
            }
        }

        return estimates
    })

    // Helper: Get estimated start time for an agenda
    function getEstimatedStartTime(agendaId: string): Date | null {
        return estimatedStartTimes.value.get(agendaId) ?? null
    }

    // ===== CHANGE LOG HELPERS =====
    function addChangeLog(
        type: ChangeLogEntry['type'],
        description: string,
        agenda: Agenda
    ) {
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
        const agenda = agendas.value.find(a => a.id === id)
        if (!agenda) return

        // Stop any currently running agenda first
        const current = runningAgenda.value
        if (current && current.id !== id) {
            stopAgenda(current.id, false)
        }

        // Start the new agenda
        agenda.status = 'running'
        agenda.actualStartTime = new Date()
        elapsedSeconds.value = 0

        // Start timer
        if (timerInterval) clearInterval(timerInterval)
        timerInterval = setInterval(() => {
            elapsedSeconds.value++
        }, 1000)

        addChangeLog('start', `Dimulai pada ${formatTime(new Date())}`, agenda)
    }

    function stopAgenda(id: string, markDone: boolean = true) {
        const agenda = agendas.value.find(a => a.id === id)
        if (!agenda) return

        // Stop timer
        if (timerInterval) {
            clearInterval(timerInterval)
            timerInterval = null
        }

        agenda.actualEndTime = new Date()
        agenda.actualDurationSeconds = elapsedSeconds.value // Save the final time

        if (markDone) {
            agenda.status = 'done'
            addChangeLog('done', `Selesai pada ${formatTime(new Date())}`, agenda)
        }

        elapsedSeconds.value = 0
    }

    function cancelAgenda(id: string) {
        const agenda = agendas.value.find(a => a.id === id)
        if (!agenda) return

        // If running, stop timer
        if (agenda.status === 'running' && timerInterval) {
            clearInterval(timerInterval)
            timerInterval = null
            elapsedSeconds.value = 0
        }

        agenda.status = 'cancelled'
        addChangeLog('cancel', 'Dibatalkan', agenda)

        // Auto-adjust subsequent agenda times
        recalculateStartTimes()
    }

    function adjustTime(id: string, minutes: number) {
        const agenda = agendas.value.find(a => a.id === id)
        if (!agenda) return

        agenda.plannedDuration += minutes
        if (agenda.plannedDuration < 5) agenda.plannedDuration = 5 // Minimum 5 minutes

        const action = minutes > 0 ? `+${minutes}` : `${minutes}`
        addChangeLog('adjust', `Durasi diubah ${action} menit`, agenda)

        // Recalculate subsequent start times
        recalculateStartTimes()
    }

    function updateNotes(id: string, notes: string) {
        const agenda = agendas.value.find(a => a.id === id)
        if (agenda) {
            agenda.notes = notes
        }
    }

    function reorderAgendas(fromIndex: number, toIndex: number) {
        const sorted = sortedAgendas.value
        const [moved] = sorted.splice(fromIndex, 1)

        // Guard against undefined (shouldn't happen in practice)
        if (!moved) return

        sorted.splice(toIndex, 0, moved)

        // Update order values
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

        // Use the planned start time of the first agenda as the base for recalculation
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

    // Cleanup on unmount
    onUnmounted(() => {
        if (timerInterval) {
            clearInterval(timerInterval)
        }
    })

    // ===== RETURN =====
    return {
        // State
        eventName,
        agendas,
        selectedAgendaId,
        changeLog,
        isChangeLogVisible,
        elapsedSeconds,

        // Computed
        selectedAgenda,
        runningAgenda,
        sortedAgendas,
        estimatedStartTimes,
        getEstimatedStartTime,

        // Actions
        selectAgenda,
        startAgenda,
        stopAgenda,
        cancelAgenda,
        adjustTime,
        updateNotes,
        reorderAgendas,
        toggleChangeLog
    }
}
