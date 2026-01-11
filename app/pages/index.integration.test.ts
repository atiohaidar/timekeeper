import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createApp } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import { useAppStore } from '../stores/app'

// Create a minimal component for testing store interaction
const TestComponent = {
  template: `
    <div>
      <p>Counter: {{ appStore.counter }}</p>
      <p>Status: {{ appStore.isEven ? 'Genap' : 'Ganjil' }}</p>
      <button class="increment-btn" @click="appStore.increment">+</button>
      <button class="decrement-btn" @click="appStore.decrement">-</button>
    </div>
  `,
  setup() {
    const appStore = useAppStore()
    return { appStore }
  }
}

describe('Component-Store Integration', () => {
  let app: any

  beforeEach(() => {
    app = createApp({})
    const pinia = createPinia()
    app.use(pinia)
    setActivePinia(pinia)
  })

  it('updates counter when buttons clicked', async () => {
    const wrapper = mount(TestComponent, {
      global: {
        plugins: [app.config.globalProperties.$pinia || createPinia()]
      }
    })

    // Initial state
    expect(wrapper.text()).toContain('Counter: 0')
    expect(wrapper.text()).toContain('Status: Genap')

    // Click increment
    await wrapper.find('.increment-btn').trigger('click')
    expect(wrapper.text()).toContain('Counter: 1')
    expect(wrapper.text()).toContain('Status: Ganjil')

    // Click decrement
    await wrapper.find('.decrement-btn').trigger('click')
    expect(wrapper.text()).toContain('Counter: 0')
    expect(wrapper.text()).toContain('Status: Genap')
  })

  it('reactive updates work across multiple components', async () => {
    const wrapper1 = mount(TestComponent, {
      global: {
        plugins: [app.config.globalProperties.$pinia || createPinia()]
      }
    })
    const wrapper2 = mount(TestComponent, {
      global: {
        plugins: [app.config.globalProperties.$pinia || createPinia()]
      }
    })

    // Both start at 0
    expect(wrapper1.text()).toContain('Counter: 0')
    expect(wrapper2.text()).toContain('Counter: 0')

    // Increment on first component
    await wrapper1.find('.increment-btn').trigger('click')

    // Both should update (shared store)
    expect(wrapper1.text()).toContain('Counter: 1')
    expect(wrapper2.text()).toContain('Counter: 1')
  })
})