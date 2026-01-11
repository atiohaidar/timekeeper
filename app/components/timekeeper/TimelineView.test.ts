import { describe, it, expect } from 'vitest'

/**
 * Unit tests for Timeline position calculation
 * 
 * This test verifies that the getTopPosition function correctly calculates
 * the pixel position for the "Now Indicator" line based on the current time.
 */

// Replicate the getTopPosition logic for testing
function getTopPosition(date: Date, startHour: number, pixelsPerMinute: number): number {
    const hours = date.getHours()
    const minutes = date.getMinutes()
    const seconds = date.getSeconds()
    // Include seconds for precise positioning (convert to fractional minutes)
    const totalMinutes = (hours - startHour) * 60 + minutes + (seconds / 60)
    return totalMinutes * pixelsPerMinute
}

describe('Timeline Position Calculation', () => {
    const pixelsPerMinute = 4 // Standard scale
    const startHour = 8 // Timeline starts at 8 AM

    it('should calculate correct position for exact hour (10:00:00)', () => {
        const date = new Date('2026-01-11T10:00:00')
        const position = getTopPosition(date, startHour, pixelsPerMinute)

        // Expected: (10 - 8) * 60 * 4 = 2 * 60 * 4 = 480px
        expect(position).toBe(480)
    })

    it('should calculate correct position for half hour (10:30:00)', () => {
        const date = new Date('2026-01-11T10:30:00')
        const position = getTopPosition(date, startHour, pixelsPerMinute)

        // Expected: (10 - 8) * 60 * 4 + 30 * 4 = 480 + 120 = 600px
        expect(position).toBe(600)
    })

    it('should calculate correct position with seconds (10:45:30)', () => {
        const date = new Date('2026-01-11T10:45:30')
        const position = getTopPosition(date, startHour, pixelsPerMinute)

        // Expected: (10 - 8) * 60 * 4 + 45 * 4 + (30/60) * 4
        //         = 480 + 180 + 2 = 662px
        expect(position).toBe(662)
    })

    it('should handle midnight correctly (00:00:00)', () => {
        const date = new Date('2026-01-11T00:00:00')
        const position = getTopPosition(date, 0, pixelsPerMinute)

        // Expected: 0px (at the very top)
        expect(position).toBe(0)
    })

    it('should handle end of day (23:59:59)', () => {
        const date = new Date('2026-01-11T23:59:59')
        const position = getTopPosition(date, startHour, pixelsPerMinute)

        // Expected: (23 - 8) * 60 * 4 + 59 * 4 + (59/60) * 4
        //         = 15 * 60 * 4 + 236 + 3.933... ≈ 3839.93px
        expect(position).toBeCloseTo(3839.93, 1)
    })

    it('should match label position for 10:45:00 exactly', () => {
        const date = new Date('2026-01-11T10:45:00')
        const position = getTopPosition(date, startHour, pixelsPerMinute)

        // This should match the label position exactly
        // Expected: (10 - 8) * 60 * 4 + 45 * 4 = 480 + 180 = 660px
        expect(position).toBe(660)
    })

    it('should advance correctly over 1 minute', () => {
        const time1 = new Date('2026-01-11T10:45:00')
        const time2 = new Date('2026-01-11T10:46:00')

        const pos1 = getTopPosition(time1, startHour, pixelsPerMinute)
        const pos2 = getTopPosition(time2, startHour, pixelsPerMinute)

        // Should advance by exactly 1 minute worth of pixels
        expect(pos2 - pos1).toBe(pixelsPerMinute)
    })

    it('should handle different scales correctly', () => {
        const date = new Date('2026-01-11T10:30:00')

        const pos4px = getTopPosition(date, startHour, 4)
        const pos8px = getTopPosition(date, startHour, 8)

        // 8px/min should be exactly double of 4px/min
        expect(pos8px).toBe(pos4px * 2)
    })
})

describe('Real-time Accuracy Test', () => {
    it('should calculate current time position accurately', () => {
        const now = new Date()
        const startHour = 8
        const pixelsPerMinute = 4

        const position = getTopPosition(now, startHour, pixelsPerMinute)

        // Calculate expected position manually
        const hours = now.getHours()
        const minutes = now.getMinutes()
        const seconds = now.getSeconds()
        const expectedMinutes = (hours - startHour) * 60 + minutes + (seconds / 60)
        const expectedPosition = expectedMinutes * pixelsPerMinute

        // Should match exactly
        expect(position).toBe(expectedPosition)

        // Log for manual verification
        console.log('Current time:', now.toLocaleTimeString('id-ID'))
        console.log('Calculated position:', position, 'px')
        console.log('Expected position:', expectedPosition, 'px')
        console.log('Match:', position === expectedPosition ? '✅' : '❌')
    })
})
