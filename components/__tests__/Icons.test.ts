import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'

import IconCircleHalf from '../IconCircleHalf.vue'
import IconGithub from '../IconGithub.vue'
import IconMoon from '../IconMoon.vue'
import IconSortAlpha from '../IconSortAlpha.vue'
import IconSortAsc from '../IconSortAsc.vue'
import IconSortDate from '../IconSortDate.vue'
import IconSortDesc from '../IconSortDesc.vue'
import IconSun from '../IconSun.vue'

const icons = [
  ['IconSun', IconSun],
  ['IconMoon', IconMoon],
  ['IconCircleHalf', IconCircleHalf],
  ['IconGithub', IconGithub],
  ['IconSortAlpha', IconSortAlpha],
  ['IconSortDate', IconSortDate],
  ['IconSortAsc', IconSortAsc],
  ['IconSortDesc', IconSortDesc],
] as const

describe.each(icons)('%s', (_name, component) => {
  it('renders <svg> with correct attributes', () => {
    const wrapper = mount(component)
    const svg = wrapper.find('svg')
    expect(svg.exists()).toBe(true)
    expect(svg.attributes('width')).toBe('16')
    expect(svg.attributes('height')).toBe('16')
    expect(svg.attributes('fill')).toBe('currentColor')
  })

  it('contains at least one <path>', () => {
    const wrapper = mount(component)
    expect(wrapper.findAll('path').length).toBeGreaterThanOrEqual(1)
  })
})
