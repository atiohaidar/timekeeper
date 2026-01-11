import { describe, it, expect } from 'vitest'
import { useTimeFormatter } from './useTimeFormatter'

describe('useTimeFormatter', () => {
    const { formatTime, formatDate, formatDuration } = useTimeFormatter()

    describe('formatTime', () => {
        it('formats a valid date object correctly', () => {
            const date = new Date('2023-01-01T14:30:00')
            // NOTE: This might fail depending on the system locale if not forced, but we forced id-ID in the composable.
            // However, Node.js environment might not have full ICU data. 
            // We expect HH.mm or HH:mm depending on implementation. 
            // Let's check the implementation: it uses 'id-ID'.
            const result = formatTime(date)
            expect(result).toMatch(/\d{2}[:.]\d{2}/)
        })

        it('handles null/undefined', () => {
            expect(formatTime(null)).toBe('--:--')
            expect(formatTime(undefined)).toBe('--:--')
        })
    })

    describe('formatDuration', () => {
        it('formats minutes only', () => {
            expect(formatDuration(45)).toBe('45m')
        })

        it('formats hours and minutes', () => {
            expect(formatDuration(90)).toBe('1j 30m')
        })

        it('formats exact hours', () => {
            expect(formatDuration(120)).toBe('2j 0m')
        })
    })
})
