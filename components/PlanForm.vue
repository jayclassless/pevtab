<script setup lang="ts">
const emit = defineEmits<{
  submit: [payload: { planSource: string; planQuery: string; planName: string }]
}>()

const planSource = ref('')
const planQuery = ref('')
const planName = ref('')

function onSubmit() {
  emit('submit', {
    planSource: planSource.value,
    planQuery: planQuery.value,
    planName: planName.value,
  })
  planSource.value = ''
  planQuery.value = ''
  planName.value = ''
}
</script>

<template>
  <form @submit.prevent="onSubmit">
    <div class="mb-2">
      <label class="form-label mb-1" for="plan-source">Plan</label>
      <textarea
        id="plan-source"
        v-model="planSource"
        class="form-control font-monospace"
        style="font-size: 0.75rem"
        rows="5"
        placeholder="EXPLAIN output"
        required
      />
      <div class="form-text">
        For best results, use
        <code>EXPLAIN (ANALYZE, COSTS, VERBOSE, BUFFERS, FORMAT JSON)</code>
        <br />
        psql users can export the plan to a file using:
        <br />
        <code>psql -XqAt -f explain.sql &gt; analyze.json</code>
      </div>
    </div>
    <div class="mb-2">
      <label class="form-label mb-1" for="plan-query">Query</label>
      <textarea
        id="plan-query"
        v-model="planQuery"
        class="form-control font-monospace"
        style="font-size: 0.75rem"
        rows="5"
        placeholder="SQL query (optional)"
      />
    </div>
    <div class="mb-2">
      <label class="form-label mb-1" for="plan-name">Name</label>
      <input
        id="plan-name"
        v-model="planName"
        class="form-control"
        type="text"
        placeholder="Plan name (optional)"
      />
    </div>
    <button type="submit" class="btn btn-primary w-100">Visualize</button>
  </form>
</template>
