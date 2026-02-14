import type { VueWrapper } from '@vue/test-utils'

import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'

import PlanForm from '../PlanForm.vue'

function findByLabel(wrapper: VueWrapper, text: string) {
  const label = wrapper.findAll('label').find((l) => l.text() === text)!
  return wrapper.find(`#${label.attributes('for')}`)
}

describe('PlanForm', () => {
  it('renders all form fields', () => {
    const wrapper = mount(PlanForm)
    expect(findByLabel(wrapper, 'Plan').exists()).toBe(true)
    expect(findByLabel(wrapper, 'Query').exists()).toBe(true)
    expect(findByLabel(wrapper, 'Name').exists()).toBe(true)
    expect(wrapper.find('button[type="submit"]').text()).toBe('Visualize')
  })

  it('emits submit with correct payload', async () => {
    const wrapper = mount(PlanForm)
    await findByLabel(wrapper, 'Plan').setValue('EXPLAIN output')
    await findByLabel(wrapper, 'Query').setValue('SELECT 1')
    await findByLabel(wrapper, 'Name').setValue('My Plan')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('submit')).toHaveLength(1)
    expect(wrapper.emitted('submit')![0]).toEqual([
      { planSource: 'EXPLAIN output', planQuery: 'SELECT 1', planName: 'My Plan' },
    ])
  })

  it('clears all fields after submit', async () => {
    const wrapper = mount(PlanForm)
    await findByLabel(wrapper, 'Plan').setValue('source')
    await findByLabel(wrapper, 'Query').setValue('query')
    await findByLabel(wrapper, 'Name').setValue('name')
    await wrapper.find('form').trigger('submit')

    expect((findByLabel(wrapper, 'Plan').element as HTMLTextAreaElement).value).toBe('')
    expect((findByLabel(wrapper, 'Query').element as HTMLTextAreaElement).value).toBe('')
    expect((findByLabel(wrapper, 'Name').element as HTMLInputElement).value).toBe('')
  })

  it('works with only required field filled', async () => {
    const wrapper = mount(PlanForm)
    await findByLabel(wrapper, 'Plan').setValue('EXPLAIN output')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('submit')![0]).toEqual([
      { planSource: 'EXPLAIN output', planQuery: '', planName: '' },
    ])
  })

  it('plan source textarea has required attribute', () => {
    const wrapper = mount(PlanForm)
    expect(findByLabel(wrapper, 'Plan').attributes('required')).toBeDefined()
  })
})
