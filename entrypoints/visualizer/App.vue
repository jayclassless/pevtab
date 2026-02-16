<script setup lang="ts">
import { v4 as uuidv4 } from 'uuid'
import { Plan } from 'pev2'
import SidePanel from '~/components/SidePanel.vue'
import PlanForm from '~/components/PlanForm.vue'
import PlanHistory from '~/components/PlanHistory.vue'
import IconSun from '~/components/IconSun.vue'
import IconMoon from '~/components/IconMoon.vue'
import IconCircleHalf from '~/components/IconCircleHalf.vue'
import IconSortAlpha from '~/components/IconSortAlpha.vue'
import IconSortDate from '~/components/IconSortDate.vue'
import IconSortAsc from '~/components/IconSortAsc.vue'
import IconSortDesc from '~/components/IconSortDesc.vue'
import { getPlans, savePlan, removePlan, watchPlans } from '~/utils/planStorage'
import type { SavedPlan } from '~/utils/types'

type ThemeMode = 'auto' | 'light' | 'dark'
type SortField = 'name' | 'date'
type SortDir = 'asc' | 'desc'

const panelOpen = ref(true)
const planSource = ref('')
const planQuery = ref('')
const activePlanId = ref<string | null>(null)
const history = ref<SavedPlan[]>([])
const themeMode = ref<ThemeMode>('auto')
const sortField = ref<SortField>('date')
const sortDir = ref<SortDir>('desc')
const errorMessage = ref<string | null>(null)

const sortedHistory = computed(() => {
  const list = [...history.value]
  list.sort((a, b) => {
    const cmp = sortField.value === 'name' ? a.name.localeCompare(b.name) : a.savedAt - b.savedAt
    return sortDir.value === 'asc' ? cmp : -cmp
  })
  return list
})

const systemDark = window.matchMedia('(prefers-color-scheme: dark)')

function applyTheme() {
  const resolved =
    themeMode.value === 'auto' ? (systemDark.matches ? 'dark' : 'light') : themeMode.value
  document.documentElement.setAttribute('data-bs-theme', resolved)
}

watch(themeMode, (mode) => {
  storage.setItem('local:themeMode', mode)
  applyTheme()
})

async function loadHistory() {
  try {
    history.value = await getPlans()
  } catch {
    errorMessage.value = 'Failed to load saved plans.'
    return
  }
  if (sortedHistory.value.length > 0) {
    selectPlan(sortedHistory.value[0])
  }
}

function selectPlan(plan: SavedPlan) {
  planSource.value = plan.planSource
  planQuery.value = plan.planQuery
  activePlanId.value = plan.id
}

async function handleSubmit(payload: { planSource: string; planQuery: string; planName: string }) {
  const plan: SavedPlan = {
    id: uuidv4(),
    name: payload.planName || `Plan ${new Date().toLocaleString()}`,
    planSource: payload.planSource,
    planQuery: payload.planQuery,
    savedAt: Date.now(),
  }
  try {
    history.value = await savePlan(plan)
  } catch {
    errorMessage.value = 'Failed to save plan.'
    return
  }
  selectPlan(plan)
  panelOpen.value = false
}

async function deletePlan(id: string) {
  try {
    history.value = await removePlan(id)
  } catch {
    errorMessage.value = 'Failed to delete plan.'
  }
}

let unwatchPlans: (() => void) | undefined

onMounted(async () => {
  systemDark.addEventListener('change', applyTheme)
  const saved = await storage.getItem<ThemeMode>('local:themeMode')
  if (saved) themeMode.value = saved
  applyTheme()
  await loadHistory()
  unwatchPlans = watchPlans((plans) => {
    history.value = plans
    if (activePlanId.value && !plans.some((p) => p.id === activePlanId.value)) {
      if (sortedHistory.value.length > 0) {
        selectPlan(sortedHistory.value[0])
      } else {
        planSource.value = ''
        planQuery.value = ''
        activePlanId.value = null
      }
    }
  })
})

onUnmounted(() => {
  systemDark.removeEventListener('change', applyTheme)
  unwatchPlans?.()
})
</script>

<template>
  <div class="d-flex flex-column h-100">
    <div
      v-if="errorMessage"
      class="alert alert-danger alert-dismissible mb-0 rounded-0 flex-shrink-0"
      role="alert"
    >
      {{ errorMessage }}
      <button type="button" class="btn-close" aria-label="Close" @click="errorMessage = null" />
    </div>
    <div class="d-flex flex-row flex-grow-1 overflow-hidden">
      <SidePanel :open="panelOpen" @toggle="panelOpen = !panelOpen">
        <template #header>
          <PlanForm @submit="handleSubmit" />
          <hr />
        </template>
        <PlanHistory
          :plans="sortedHistory"
          :active-plan-id="activePlanId"
          @select="selectPlan"
          @delete="deletePlan"
        />
        <template #footer>
          <div class="border-top pt-2 mt-2 d-flex justify-content-center gap-3">
            <div class="btn-group btn-group-sm" role="group" aria-label="Sort by">
              <button
                type="button"
                class="btn"
                :class="sortField === 'date' ? 'btn-primary' : 'btn-outline-secondary'"
                title="Sort by date"
                @click="sortField = 'date'"
              >
                <IconSortDate />
              </button>
              <button
                type="button"
                class="btn"
                :class="sortField === 'name' ? 'btn-primary' : 'btn-outline-secondary'"
                title="Sort by name"
                @click="sortField = 'name'"
              >
                <IconSortAlpha />
              </button>
            </div>
            <div class="btn-group btn-group-sm" role="group" aria-label="Sort direction">
              <button
                type="button"
                class="btn"
                :class="sortDir === 'desc' ? 'btn-primary' : 'btn-outline-secondary'"
                title="Sort descending"
                @click="sortDir = 'desc'"
              >
                <IconSortDesc />
              </button>
              <button
                type="button"
                class="btn"
                :class="sortDir === 'asc' ? 'btn-primary' : 'btn-outline-secondary'"
                title="Sort ascending"
                @click="sortDir = 'asc'"
              >
                <IconSortAsc />
              </button>
            </div>
            <div class="vr"></div>
            <div class="btn-group btn-group-sm" role="group" aria-label="Theme">
              <button
                type="button"
                class="btn"
                :class="themeMode === 'light' ? 'btn-primary' : 'btn-outline-secondary'"
                title="Light"
                @click="themeMode = 'light'"
              >
                <IconSun />
              </button>
              <button
                type="button"
                class="btn"
                :class="themeMode === 'auto' ? 'btn-primary' : 'btn-outline-secondary'"
                title="System"
                @click="themeMode = 'auto'"
              >
                <IconCircleHalf />
              </button>
              <button
                type="button"
                class="btn"
                :class="themeMode === 'dark' ? 'btn-primary' : 'btn-outline-secondary'"
                title="Dark"
                @click="themeMode = 'dark'"
              >
                <IconMoon />
              </button>
            </div>
          </div>
        </template>
      </SidePanel>
      <div class="flex-grow-1 overflow-hidden d-flex flex-column">
        <Plan v-if="planSource" :plan-source="planSource" :plan-query="planQuery" />
        <div v-else class="d-flex align-items-center justify-content-center h-100 text-secondary">
          Paste an EXPLAIN plan to visualize it.
        </div>
      </div>
    </div>
  </div>
</template>

<style>
html,
body,
#app {
  height: 100%;
  margin: 0;
  display: flex;
  flex-direction: column;
}
</style>
