import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAppStore } from './app'

describe('useAppStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('increments counter', () => {
    const store = useAppStore()
    expect(store.counter).toBe(0)
    store.increment()
    expect(store.counter).toBe(1)
  })

  it('decrements counter', () => {
    const store = useAppStore()
    store.increment()
    expect(store.counter).toBe(1)
    store.decrement()
    expect(store.counter).toBe(0)
  })

  it('computes isEven', () => {
    const store = useAppStore()
    expect(store.isEven).toBe(true) // 0 is even
    store.increment()
    expect(store.isEven).toBe(false) // 1 is odd
    store.increment()
    expect(store.isEven).toBe(true) // 2 is even
  })
})