<template>
  <UDashboardNavbar title="Home" :ui="{ right: 'gap-3' }">
    <template #leading>
      <UDashboardSidebarCollapse />
    </template>
    <template #right>
      <div class="flex flex-row items-center gap-2">
        <ThemePicker class="size-5 cursor-pointer"></ThemePicker>
        <UButton
          :icon="settingsStore.settings.isDense ? 'i-custom-code-more' : 'i-custom-code-less'"
          variant="ghost"
          class="cursor-pointer"
          size="md"
          @click="settingsStore.toggleDenseMode()"></UButton>
        <UButton
          to="https://github.com/omarmir/nanote"
          icon="i-custom-simple-icons-github"
          target="_blank"
          size="md"
          variant="ghost"
          color="neutral" />
      </div>
    </template>
  </UDashboardNavbar>
</template>
<script lang="ts" setup>
const settingsStore = useSettingsStore()
</script>
