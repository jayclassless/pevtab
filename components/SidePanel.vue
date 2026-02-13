<script setup lang="ts">
defineProps<{
  open: boolean
}>();

defineEmits<{
  toggle: []
}>();
</script>

<template>
  <div
    class="d-flex flex-shrink-0 border-end bg-body-tertiary overflow-hidden"
    :style="{ width: open ? '400px' : undefined }"
  >
    <div v-show="open" class="flex-grow-1 panel-content" style="min-width: 0">
      <div class="flex-shrink-0 p-3 pb-0">
        <slot name="header" />
      </div>
      <div class="flex-grow-1 overflow-auto px-3 py-2">
        <slot />
      </div>
      <div class="flex-shrink-0 px-3 pb-3">
        <slot name="footer" />
      </div>
    </div>
    <button
      class="btn btn-sm align-self-start m-1 flex-shrink-0"
      type="button"
      @click="$emit('toggle')"
    >
      {{ open ? '\u00AB' : '\u00BB' }}
    </button>
  </div>
</template>

<style scoped>
.panel-content {
  display: flex;
  flex-direction: column;
}
</style>
