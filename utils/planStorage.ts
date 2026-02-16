import type { SavedPlan } from './types'

const STORAGE_KEY = 'local:plans'

export async function getPlans(): Promise<SavedPlan[]> {
  return (await storage.getItem<SavedPlan[]>(STORAGE_KEY)) ?? []
}

export async function setPlans(plans: SavedPlan[]): Promise<void> {
  await storage.setItem(STORAGE_KEY, plans)
}

export async function savePlan(plan: SavedPlan): Promise<SavedPlan[]> {
  const plans = await getPlans()
  plans.unshift(plan)
  await storage.setItem(STORAGE_KEY, plans)
  return plans
}

export async function removePlan(id: string): Promise<SavedPlan[]> {
  const plans = (await getPlans()).filter((p) => p.id !== id)
  await storage.setItem(STORAGE_KEY, plans)
  return plans
}

export function watchPlans(cb: (plans: SavedPlan[]) => void): () => void {
  return storage.watch<SavedPlan[] | null>(STORAGE_KEY, (newValue) => {
    cb(newValue ?? [])
  })
}
