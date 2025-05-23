<template>
  <div>
    <Icon v-if="savingState === 'saving'" name="lucide:loader-circle" class="animate-spin text-amber-500"></Icon>
    <Icon v-if="savingState === 'pending'" name="lucide:circle-ellipsis" class="text-amber-500"></Icon>
    <Icon v-else-if="savingState === 'success'" name="lucide:circle-check" class="text-emerald-600"></Icon>
  </div>
</template>
<script lang="ts" setup>
import type { SavingState } from '~/types/notebook'

const { savingState } = defineProps<{ savingState: SavingState }>()
</script>
