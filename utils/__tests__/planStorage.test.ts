import { describe, it, expect, beforeEach, vi } from 'vitest'
import { fakeBrowser } from 'wxt/testing'

import type { SavedPlan } from '../types'

import { getPlans, setPlans, savePlan, removePlan, watchPlans } from '../planStorage'

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

describe('planStorage', () => {
  beforeEach(() => {
    fakeBrowser.reset()
  })

  describe('getPlans', () => {
    it('returns [] when empty', async () => {
      expect(await getPlans()).toEqual([])
    })

    it('returns stored plans', async () => {
      const plans = [makePlan(), makePlan({ id: 'id-2', name: 'Plan B' })]
      await storage.setItem('local:plans', plans)
      expect(await getPlans()).toEqual(plans)
    })
  })

  describe('setPlans', () => {
    it('sets plans in storage', async () => {
      const plan = makePlan()
      await setPlans([plan])
      expect(await getPlans()).toEqual([plan])
    })

    it('overwrites existing plans', async () => {
      await storage.setItem('local:plans', [makePlan({ id: 'id-1' })])

      const newPlan = makePlan({ id: 'id-2', name: 'Plan B' })
      await setPlans([newPlan])

      expect(await getPlans()).toEqual([newPlan])
    })
  })

  describe('savePlan', () => {
    it('prepends to list', async () => {
      const existing = makePlan({ id: 'id-1' })
      await storage.setItem('local:plans', [existing])

      const newPlan = makePlan({ id: 'id-2', name: 'Plan B' })
      const result = await savePlan(newPlan)

      expect(result).toEqual([newPlan, existing])
      expect(await getPlans()).toEqual([newPlan, existing])
    })

    it('adds to empty storage', async () => {
      const plan = makePlan()
      const result = await savePlan(plan)

      expect(result).toEqual([plan])
      expect(await getPlans()).toEqual([plan])
    })
  })

  describe('removePlan', () => {
    it('removes matching plan', async () => {
      const plans = [makePlan({ id: 'id-1' }), makePlan({ id: 'id-2', name: 'Plan B' })]
      await storage.setItem('local:plans', plans)

      const result = await removePlan('id-1')
      expect(result).toEqual([plans[1]])
    })

    it('no-op for unknown ID', async () => {
      const plans = [makePlan({ id: 'id-1' })]
      await storage.setItem('local:plans', plans)

      const result = await removePlan('unknown')
      expect(result).toEqual(plans)
    })

    it('returns [] when last plan removed', async () => {
      await storage.setItem('local:plans', [makePlan({ id: 'id-1' })])

      const result = await removePlan('id-1')
      expect(result).toEqual([])
    })
  })

  describe('watchPlans', () => {
    it('fires callback with updated plans when storage changes', async () => {
      const cb = vi.fn()
      const unwatch = watchPlans(cb)

      const plans = [makePlan()]
      await storage.setItem('local:plans', plans)

      expect(cb).toHaveBeenCalledWith(plans)
      unwatch()
    })

    it('normalizes null to empty array', async () => {
      const cb = vi.fn()
      // Seed storage so the subsequent setItem triggers a change
      await storage.setItem('local:plans', [makePlan()])
      const unwatch = watchPlans(cb)
      cb.mockClear()

      await storage.setItem('local:plans', null as any)

      expect(cb).toHaveBeenCalledWith([])
      unwatch()
    })

    it('stops firing after unwatch is called', async () => {
      const cb = vi.fn()
      const unwatch = watchPlans(cb)

      unwatch()
      await storage.setItem('local:plans', [makePlan()])

      expect(cb).not.toHaveBeenCalled()
    })
  })
})
