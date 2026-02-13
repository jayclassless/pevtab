import type { DOMWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'

import type { SavedPlan } from '~/utils/types'

import PlanHistory from '../PlanHistory.vue'

function makePlan(overrides: Partial<SavedPlan> = {}): SavedPlan {
  return {
    id: 'id-1',
    name: 'Plan A',
    planSource: 'source',
    planQuery: 'SELECT 1',
    savedAt: 1000,
    ...overrides,
  }
}

function findButton(wrapper: { findAll: (sel: string) => DOMWrapper<Element>[] }, text: string) {
  return wrapper.findAll('button').find((b) => b.text() === text)!
}

describe('PlanHistory', () => {
  it('shows "No saved plans yet." when empty', () => {
    const wrapper = mount(PlanHistory, {
      props: { plans: [], activePlanId: null },
    })
    expect(wrapper.text()).toContain('No saved plans yet.')
  })

  it('renders list items for each plan', () => {
    const plans = [makePlan({ id: '1' }), makePlan({ id: '2' })]
    const wrapper = mount(PlanHistory, {
      props: { plans, activePlanId: null },
    })
    expect(wrapper.findAll('[role="button"]')).toHaveLength(2)
  })

  it('displays plan name and formatted date', () => {
    const plan = makePlan({ name: 'My Plan', savedAt: 1700000000000 })
    const wrapper = mount(PlanHistory, {
      props: { plans: [plan], activePlanId: null },
    })
    expect(wrapper.text()).toContain('My Plan')
    expect(wrapper.text()).toContain(new Date(1700000000000).toLocaleString())
  })

  it('highlights active plan with active class', () => {
    const plans = [makePlan({ id: 'id-1' }), makePlan({ id: 'id-2' })]
    const wrapper = mount(PlanHistory, {
      props: { plans, activePlanId: 'id-1' },
    })
    const items = wrapper.findAll('[role="button"]')
    expect(items[0].classes()).toContain('active')
    expect(items[1].classes()).not.toContain('active')
  })

  it('emits select on item click', async () => {
    const plan = makePlan()
    const wrapper = mount(PlanHistory, {
      props: { plans: [plan], activePlanId: null },
    })
    await wrapper.find('[role="button"]').trigger('click')
    expect(wrapper.emitted('select')).toHaveLength(1)
    expect(wrapper.emitted('select')![0]).toEqual([plan])
  })

  it('first delete click shows confirm/cancel buttons (no emit)', async () => {
    const plan = makePlan()
    const wrapper = mount(PlanHistory, {
      props: { plans: [plan], activePlanId: null },
    })
    await wrapper.find('button[aria-label="Delete"]').trigger('click')

    expect(wrapper.emitted('delete')).toBeUndefined()
    expect(findButton(wrapper, 'Delete').exists()).toBe(true)
    expect(findButton(wrapper, 'Cancel').exists()).toBe(true)
  })

  it('confirm click emits delete with plan ID', async () => {
    const plan = makePlan({ id: 'plan-42' })
    const wrapper = mount(PlanHistory, {
      props: { plans: [plan], activePlanId: null },
    })
    await wrapper.find('button[aria-label="Delete"]').trigger('click')
    await findButton(wrapper, 'Delete').trigger('click')

    expect(wrapper.emitted('delete')).toHaveLength(1)
    expect(wrapper.emitted('delete')![0]).toEqual(['plan-42'])
  })

  it('cancel click restores delete button', async () => {
    const plan = makePlan()
    const wrapper = mount(PlanHistory, {
      props: { plans: [plan], activePlanId: null },
    })
    await wrapper.find('button[aria-label="Delete"]').trigger('click')
    expect(wrapper.find('button[aria-label="Delete"]').exists()).toBe(false)

    await findButton(wrapper, 'Cancel').trigger('click')
    expect(wrapper.find('button[aria-label="Delete"]').exists()).toBe(true)
  })
})
