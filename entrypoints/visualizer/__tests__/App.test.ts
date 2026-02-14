import { mount, flushPromises } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fakeBrowser } from 'wxt/testing'

import type { SavedPlan } from '~/utils/types'

import PlanHistory from '~/components/PlanHistory.vue'
import SidePanel from '~/components/SidePanel.vue'

vi.mock('uuid', () => ({
  v4: vi.fn(() => 'test-uuid'),
}))

vi.mock('pev2', () => ({
  Plan: { name: 'Plan', template: '<div class="pev2-stub" />' },
}))

function makePlan(overrides: Partial<SavedPlan> = {}): SavedPlan {
  return {
    id: 'id-1',
    name: 'Plan A',
    planSource: '[ { "Plan": { "Node Type": "Seq Scan" } } ]',
    planQuery: 'SELECT 1',
    savedAt: 1000,
    ...overrides,
  }
}

let matchMediaDark = false

beforeEach(() => {
  fakeBrowser.reset()
  matchMediaDark = false

  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({
      matches: matchMediaDark,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))
  )
})

async function mountApp(plans: SavedPlan[] = []) {
  await storage.setItem('local:plans', plans)
  const { default: App } = await import('../App.vue')
  const wrapper = mount(App)
  await flushPromises()
  return wrapper
}

describe('App', () => {
  it('loads plans from storage on mount and selects first', async () => {
    const plans = [makePlan({ id: '1', name: 'First' }), makePlan({ id: '2', name: 'Second' })]
    const wrapper = await mountApp(plans)

    const history = wrapper.findComponent(PlanHistory)
    expect(history.props('plans')).toHaveLength(2)
    expect(history.props('activePlanId')).toBe('1')
  })

  it('selects first plan in sorted order on mount', async () => {
    // Storage order: Old first, Newer second
    // But default sort is date desc, so Newer should be selected
    const plans = [
      makePlan({ id: '1', name: 'Old', savedAt: 1000 }),
      makePlan({ id: '2', name: 'Newer', savedAt: 2000 }),
    ]
    const wrapper = await mountApp(plans)

    const history = wrapper.findComponent(PlanHistory)
    expect(history.props('activePlanId')).toBe('2')
  })

  it('shows placeholder when no plans exist', async () => {
    const wrapper = await mountApp([])
    expect(wrapper.text()).toContain('Paste an EXPLAIN plan to visualize it.')
  })

  describe('theme', () => {
    it('applies light theme', async () => {
      await storage.setItem('local:themeMode', 'light')
      await mountApp()
      expect(document.documentElement.getAttribute('data-bs-theme')).toBe('light')
    })

    it('applies dark theme', async () => {
      await storage.setItem('local:themeMode', 'dark')
      await mountApp()
      expect(document.documentElement.getAttribute('data-bs-theme')).toBe('dark')
    })

    it('auto resolves to dark when system prefers dark', async () => {
      matchMediaDark = true
      vi.stubGlobal(
        'matchMedia',
        vi.fn(() => ({
          matches: true,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        }))
      )
      await storage.setItem('local:themeMode', 'auto')
      await mountApp()
      expect(document.documentElement.getAttribute('data-bs-theme')).toBe('dark')
    })

    it('auto resolves to light when system prefers light', async () => {
      matchMediaDark = false
      await storage.setItem('local:themeMode', 'auto')
      await mountApp()
      expect(document.documentElement.getAttribute('data-bs-theme')).toBe('light')
    })

    it('clicking theme buttons updates theme', async () => {
      const wrapper = await mountApp()

      await wrapper.find('button[title="Dark"]').trigger('click')
      await flushPromises()
      expect(document.documentElement.getAttribute('data-bs-theme')).toBe('dark')

      await wrapper.find('button[title="Light"]').trigger('click')
      await flushPromises()
      expect(document.documentElement.getAttribute('data-bs-theme')).toBe('light')

      await wrapper.find('button[title="System"]').trigger('click')
      await flushPromises()
      // matchMediaDark is false by default, so auto resolves to light
      expect(document.documentElement.getAttribute('data-bs-theme')).toBe('light')
    })
  })

  describe('submit', () => {
    it('creates plan with UUID, saves, selects, and closes panel', async () => {
      const wrapper = await mountApp()
      const vm = wrapper.vm as Record<string, any>

      await vm.handleSubmit({
        planSource: 'new source',
        planQuery: 'SELECT 2',
        planName: 'My Plan',
      })
      await flushPromises()

      expect(vm.history).toHaveLength(1)
      expect(vm.history[0].id).toBe('test-uuid')
      expect(vm.history[0].name).toBe('My Plan')
      expect(vm.activePlanId).toBe('test-uuid')
      expect(vm.panelOpen).toBe(false)

      // Verify persisted to storage
      const stored = await storage.getItem<SavedPlan[]>('local:plans')
      expect(stored).toHaveLength(1)
      expect(stored![0].id).toBe('test-uuid')
    })

    it('auto-generates name when planName is empty', async () => {
      const wrapper = await mountApp()
      const vm = wrapper.vm as Record<string, any>

      await vm.handleSubmit({
        planSource: 'source',
        planQuery: '',
        planName: '',
      })
      await flushPromises()

      expect(vm.history[0].name).toMatch(/^Plan /)
    })
  })

  describe('delete', () => {
    it('removes plan, selects next or clears display', async () => {
      const plans = [
        makePlan({ id: '1', name: 'First', savedAt: 2000 }),
        makePlan({ id: '2', name: 'Second', savedAt: 1000 }),
      ]
      const wrapper = await mountApp(plans)

      // Click delete on first plan, then confirm
      const items = wrapper.findComponent(PlanHistory).findAll('[role="button"]')
      await items[0].find('button[aria-label="Delete"]').trigger('click')
      await items[0]
        .findAll('button')
        .find((b) => b.text() === 'Delete')!
        .trigger('click')
      await flushPromises()

      const updatedHistory = wrapper.findComponent(PlanHistory)
      expect(updatedHistory.props('plans')).toHaveLength(1)
      expect(updatedHistory.props('activePlanId')).toBe('2')
    })

    it('selects the first plan in sorted order after deletion', async () => {
      const plans = [
        makePlan({ id: '1', name: 'Active', savedAt: 3000 }),
        makePlan({ id: '2', name: 'Old', savedAt: 1000 }),
        makePlan({ id: '3', name: 'Recent', savedAt: 2000 }),
      ]
      const wrapper = await mountApp(plans)

      // Default sort is date desc, so order is: Active(3000), Recent(2000), Old(1000)
      // Select the active plan (first in sorted order)
      const history = wrapper.findComponent(PlanHistory)
      expect(history.props('activePlanId')).toBe('1')

      // Delete active plan (id '1')
      const items = history.findAll('[role="button"]')
      await items[0].find('button[aria-label="Delete"]').trigger('click')
      await items[0]
        .findAll('button')
        .find((b) => b.text() === 'Delete')!
        .trigger('click')
      await flushPromises()

      // Should select 'Recent' (id '3', savedAt 2000) — the new first in date desc order
      // NOT 'Old' (id '2') which would be first in raw storage order
      const updatedHistory = wrapper.findComponent(PlanHistory)
      expect(updatedHistory.props('activePlanId')).toBe('3')
    })

    it('clears display when last plan deleted', async () => {
      const wrapper = await mountApp([makePlan({ id: '1' })])

      const item = wrapper.findComponent(PlanHistory).find('[role="button"]')
      await item.find('button[aria-label="Delete"]').trigger('click')
      await item
        .findAll('button')
        .find((b) => b.text() === 'Delete')!
        .trigger('click')
      await flushPromises()

      expect(wrapper.text()).toContain('Paste an EXPLAIN plan to visualize it.')
    })
  })

  describe('sorting', () => {
    it('defaults to date desc', async () => {
      const plans = [
        makePlan({ id: '1', name: 'Older', savedAt: 1000 }),
        makePlan({ id: '2', name: 'Newer', savedAt: 2000 }),
      ]
      const wrapper = await mountApp(plans)

      const history = wrapper.findComponent(PlanHistory)
      const sorted = history.props('plans') as SavedPlan[]
      expect(sorted[0].name).toBe('Newer')
      expect(sorted[1].name).toBe('Older')
    })

    it('toggles sort field and direction', async () => {
      const plans = [
        makePlan({ id: '1', name: 'Beta', savedAt: 2000 }),
        makePlan({ id: '2', name: 'Alpha', savedAt: 1000 }),
      ]
      const wrapper = await mountApp(plans)

      // Click "Sort by name" button
      await wrapper.find('button[title="Sort by name"]').trigger('click')
      await flushPromises()

      let history = wrapper.findComponent(PlanHistory)
      let sorted = history.props('plans') as SavedPlan[]
      // name + desc (default dir is desc)
      expect(sorted[0].name).toBe('Beta')
      expect(sorted[1].name).toBe('Alpha')

      // Click "Sort ascending"
      await wrapper.find('button[title="Sort ascending"]').trigger('click')
      await flushPromises()

      history = wrapper.findComponent(PlanHistory)
      sorted = history.props('plans') as SavedPlan[]
      expect(sorted[0].name).toBe('Alpha')
      expect(sorted[1].name).toBe('Beta')

      // Click "Sort descending" to go back
      await wrapper.find('button[title="Sort descending"]').trigger('click')
      await flushPromises()

      history = wrapper.findComponent(PlanHistory)
      sorted = history.props('plans') as SavedPlan[]
      expect(sorted[0].name).toBe('Beta')

      // Click "Sort by date" to switch back
      await wrapper.find('button[title="Sort by date"]').trigger('click')
      await flushPromises()

      history = wrapper.findComponent(PlanHistory)
      sorted = history.props('plans') as SavedPlan[]
      expect(sorted[0].name).toBe('Beta') // savedAt 2000, desc
    })
  })

  it('panel toggle works', async () => {
    const wrapper = await mountApp()
    const panel = wrapper.findComponent(SidePanel)
    const findToggle = () =>
      panel.findAll('button').find((b) => ['\u00AB', '\u00BB'].includes(b.text()))!

    expect(panel.props('open')).toBe(true)
    await findToggle().trigger('click')
    expect(panel.props('open')).toBe(false)
    await findToggle().trigger('click')
    expect(panel.props('open')).toBe(true)
  })
})
