import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'

import SidePanel from '../SidePanel.vue'

describe('SidePanel', () => {
  it('sets width 400px when open=true', () => {
    const wrapper = mount(SidePanel, { props: { open: true } })
    expect(wrapper.find('div').attributes('style')).toContain('width: 400px')
  })

  it('shows content via v-show when open', () => {
    const wrapper = mount(SidePanel, {
      props: { open: true },
      slots: { default: '<p>Content</p>' },
    })
    const panel = wrapper.find('.panel-content')
    expect(panel.isVisible()).toBe(true)
  })

  it('hides content via v-show when closed', () => {
    const wrapper = mount(SidePanel, {
      props: { open: false },
      slots: { default: '<p>Content</p>' },
    })
    const panel = wrapper.find('.panel-content')
    expect(panel.attributes('style')).toContain('display: none')
  })

  it('renders header, default, and footer slot content', () => {
    const wrapper = mount(SidePanel, {
      props: { open: true },
      slots: {
        header: '<span class="h">Header</span>',
        default: '<span class="d">Default</span>',
        footer: '<span class="f">Footer</span>',
      },
    })
    expect(wrapper.find('.h').text()).toBe('Header')
    expect(wrapper.find('.d').text()).toBe('Default')
    expect(wrapper.find('.f').text()).toBe('Footer')
  })

  it('emits toggle on button click', async () => {
    const wrapper = mount(SidePanel, { props: { open: true } })
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('toggle')).toHaveLength(1)
  })

  it('shows \u00AB when open', () => {
    const wrapper = mount(SidePanel, { props: { open: true } })
    expect(wrapper.find('button').text()).toBe('\u00AB')
  })

  it('shows \u00BB when closed', () => {
    const wrapper = mount(SidePanel, { props: { open: false } })
    expect(wrapper.find('button').text()).toBe('\u00BB')
  })
})
