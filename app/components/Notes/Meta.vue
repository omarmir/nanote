<template>
  <div class="flex flex-row items-center gap-4">
    <div v-if="updated" class="text-sm text-gray-500 dark:text-gray-300">
      {{
        d(updated, {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric'
        })
      }}
    </div>
    <UIcon v-if="savingState === 'pending'" name="i-lucide-loader-circle" class="text-warning animate-spin" />
    <UIcon v-if="savingState === 'success'" name="i-lucide-circle-check" class="text-primary" />
  </div>
</template>

<script lang="ts" setup>
const { updated, savingState } = defineProps<{ updated: Date | null; savingState: SavingState }>()
const { d } = useI18n()
</script>
