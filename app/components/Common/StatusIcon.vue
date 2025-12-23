<template>
  <UIcon v-if="state === 'idle'" :name="icon" />
  <UIcon v-else-if="state === 'success'" name="i-lucide-circle-check" class="text-primary" />
  <UIcon v-else name="i-lucide-circle-x" class="text-error" />
</template>
<script lang="ts" setup>
const { state, icon } = defineProps<{
  state: ActionStatus
  icon: string
}>()
</script>
