<template>
  <button
    :disabled="disabled || isLoading"
    :class="{ 'bg-red-500 hover:bg-red-700': theme === 'danger' }"
    class="flex flex-row items-center gap-2 rounded-md bg-accent px-4 py-1 text-xs font-medium text-white hover:bg-accent-hover focus:outline-none focus:ring-4 focus:ring-neutral-300 disabled:bg-gray-300"
    @click="$emit('click')">
    <Icon v-if="showLoading && isLoading" name="lucide:loader-circle" class="size-4 animate-spin" />
    <slot></slot>
  </button>
</template>
<script lang="ts" setup>
import type { Theme } from '~/types/ui'

const {
  theme = 'primary',
  showLoading = false,
  disabled = false,
  isLoading = false
} = defineProps<{ isLoading?: boolean; disabled?: boolean; showLoading?: boolean; theme?: Theme }>()
defineEmits(['click'])
</script>
