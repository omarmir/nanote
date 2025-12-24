<template>
  <UButton :size :label :color :variant @click="runFn">
    <template #leading>
      <UIcon v-if="state === 'idle'" :name="icon" />
      <UIcon v-else-if="state === 'pending'" name="i-lucide-loader-circle" class="animate-spin" />
      <UIcon v-else-if="state === 'success'" name="i-lucide-circle-check" class="text-primary" />
      <UIcon v-else name="i-lucide-circle-x" class="text-error" />
    </template>
  </UButton>
</template>
<script lang="ts" setup>
import type { ButtonProps } from '@nuxt/ui'
const { size, label, color, variant, icon, asyncFn } = defineProps<
  ButtonProps & { icon: string; asyncFn: () => Promise<Result<boolean>> }
>()

const state: Ref<ActionStatus> = ref('idle')

const runFn = async () => {
  state.value = 'pending'
  const resp = await asyncFn()
  if (resp.success) {
    state.value = 'success'
  } else {
    state.value = 'error'
  }
  setTimeout(() => {
    state.value = 'idle'
  }, 5000)
}
</script>
