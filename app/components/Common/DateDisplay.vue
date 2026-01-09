<template>
  <template v-if="date">
    {{ formatNoteDate(date, settingsStore.settings.isISODate) }}
  </template>
</template>

<script lang="ts" setup>
const { date } = defineProps<{ date: string | null }>()
const settingsStore = useSettingsStore()
</script>
