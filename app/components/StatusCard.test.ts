import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import StatusCard from '../components/StatusCard.vue'

describe('StatusCard (Integration)', () => {
  it('renders props correctly and applies styles', () => {
    const wrapper = mount(StatusCard, {
      props: {
        title: 'Test Title',
        value: 'Test Value',
        color: '#ff0000'
      }
    })

    // Check rendered content
    expect(wrapper.text()).toContain('Test Title')
    expect(wrapper.text()).toContain('Test Value')

    // Check styles applied (browser converts hex to rgb)
    const card = wrapper.find('.card')
    expect(card.attributes('style')).toContain('border-left: 5px solid rgb(255, 0, 0)')
  })

  it('renders without color prop (default)', () => {
    const wrapper = mount(StatusCard, {
      props: {
        title: 'No Color',
        value: 42
      }
    })

    const card = wrapper.find('.card')
    expect(card.attributes('style')).toContain('border-left: 5px solid rgb(66, 184, 131)') // default #42b883
  })

  it('handles different value types', () => {
    const wrapper = mount(StatusCard, {
      props: {
        title: 'Number',
        value: 123
      }
    })
    expect(wrapper.text()).toContain('123')

    const wrapper2 = mount(StatusCard, {
      props: {
        title: 'String',
        value: 'Hello'
      }
    })
    expect(wrapper2.text()).toContain('Hello')
  })
})