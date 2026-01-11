import { describe, it, expect, vi } from 'vitest'
import { useTimer } from './useTimer'

describe('useTimer', () => {
  it('starts timer', () => {
    const { seconds, isActive, start } = useTimer()
    expect(isActive.value).toBe(false)
    start()
    expect(isActive.value).toBe(true)
  })

  it('pauses and resets', () => {
    const { seconds, isActive, start, pause, reset } = useTimer()
    start()
    expect(isActive.value).toBe(true)
    pause()
    expect(isActive.value).toBe(false)
    reset()
    expect(seconds.value).toBe(0)
    expect(isActive.value).toBe(false)
  })
})