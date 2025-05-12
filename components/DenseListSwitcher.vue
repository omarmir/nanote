<template>
  <button
    class="flex flex-row items-center text-accent"
    title="Toggle dense view of notebooks and notes"
    @click="settingsStore.toggleDenseMode()">
    <Icon v-if="settingsStore.settings.isDense" name="lucide:chevrons-left-right-ellipsis"></Icon>
    <Icon v-else name="lucide:chevrons-left-right"></Icon>
  </button>
</template>
<script lang="ts" setup>
const settingsStore = useSettingsStore()
</script>
