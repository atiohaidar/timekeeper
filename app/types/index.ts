export type AgendaStatus = 'waiting' | 'running' | 'done' | 'cancelled'

export interface Reminder {
    id: string
    offsetMinutes: number
    division: string
    message: string
    icon?: string
}

export interface Agenda {
    id: string
    title: string
    pic: string
    plannedStartTime: Date
    plannedDuration: number
    actualStartTime: Date | null
    actualEndTime: Date | null
    actualDurationSeconds?: number
    status: AgendaStatus
    description: string
    notes: string
    order: number
    reminders: Reminder[]
}

export interface ChangeLogEntry {
    id: string
    timestamp: Date
    type: 'delay' | 'cancel' | 'swap' | 'adjust' | 'start' | 'done'
    description: string
    agendaId: string
    agendaTitle: string
}
