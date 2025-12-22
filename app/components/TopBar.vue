<template>
  <UDashboardNavbar :title="name ?? t('navigation.home')" :ui="{ right: 'gap-3' }">
    <template #leading>
      <UDashboardSidebarCollapse />
    </template>
    <template #right>
      <div class="flex flex-row items-center gap-2">
        <div v-if="noteOpts" class="flex flex-row items-center gap-2">
          <UButton
            :icon="noteOpts.isReadOnly ? 'i-lucide-pencil' : 'i-lucide-pencil-off'"
            variant="ghost"
            :aria-pressed="noteOpts.isReadOnly"
            size="md"
            :aria-label="t('toggleEdit')"
            :title="t('toggleEdit')"
            @click="$emit('edit')" />
        </div>
        <ThemePicker />
        <UButton
          :icon="settingsStore.settings.isDense ? 'i-custom-code-more' : 'i-custom-code-less'"
          variant="ghost"
          size="md"
          :aria-label="t('toggleMetadata')"
          :title="t('toggleMetadata')"
          :aria-pressed="settingsStore.settings.isDense"
          @click="settingsStore.toggleDenseMode()" />
        <UButton
          to="https://github.com/omarmir/nanote"
          icon="i-custom-simple-icons-github"
          target="_blank"
          size="md"
          :aria-label="t('github')"
          :title="t('github')"
          variant="ghost"
          color="neutral" />
      </div>
    </template>
  </UDashboardNavbar>
</template>

<script lang="ts" setup>
const { name, noteOpts } = defineProps<{ name?: string; noteOpts?: { isReadOnly: boolean } }>()
const { t } = useI18n()

const settingsStore = useSettingsStore()

defineEmits(['edit', 'share', 'pdf', 'delete', 'rename', 'readonly'])
</script>
