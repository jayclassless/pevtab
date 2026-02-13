<script setup lang="ts">
import type { SavedPlan } from '~/utils/types'

defineProps<{
  plans: SavedPlan[]
  activePlanId: string | null
}>()

const emit = defineEmits<{
  select: [plan: SavedPlan]
  delete: [id: string]
}>()

const confirmingId = ref<string | null>(null)

function formatDate(ts: number): string {
  return new Date(ts).toLocaleString()
}

function handleDelete(id: string) {
  if (confirmingId.value === id) {
    confirmingId.value = null
    emit('delete', id)
  } else {
    confirmingId.value = id
  }
}
</script>

<template>
  <div v-if="plans.length === 0" class="text-secondary small text-center py-2">
    No saved plans yet.
  </div>
  <ul v-else class="list-group list-group-flush">
    <li
      v-for="plan in plans"
      :key="plan.id"
      class="list-group-item list-group-item-action d-flex justify-content-between align-items-start"
      :class="{ active: plan.id === activePlanId }"
      role="button"
      @click="emit('select', plan)"
    >
      <div class="text-truncate me-2">
        <div class="fw-bold text-truncate">{{ plan.name }}</div>
        <small :class="plan.id === activePlanId ? 'text-white-50' : 'text-secondary'">{{
          formatDate(plan.savedAt)
        }}</small>
      </div>
      <button
        v-if="confirmingId !== plan.id"
        type="button"
        class="btn-close flex-shrink-0"
        aria-label="Delete"
        @click.stop="handleDelete(plan.id)"
      />
      <div v-else class="btn-group btn-group-sm flex-shrink-0">
        <button type="button" class="btn btn-danger" @click.stop="handleDelete(plan.id)">
          Delete
        </button>
        <button type="button" class="btn btn-outline-secondary" @click.stop="confirmingId = null">
          Cancel
        </button>
      </div>
    </li>
  </ul>
</template>
