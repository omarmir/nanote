<template>
  <div v-if="!collapsed">
    <div class="mb-2 flex flex-row items-center justify-between">
      <h2 class="text-sm font-bold">{{ t('Notebook', 2) }}</h2>
      <UButton
        size="sm"
        variant="ghost"
        color="warning"
        icon="i-lucide-fold-vertical"
        class="cursor-pointer"
        :class="{ invisible: expanded.length === 0 }"
        @click="expanded = []" />
    </div>
    <ContentTree
      type="sidebar"
      v-if="notebookStore.notebooks"
      :notebook="notebookStore.notebooks"
      v-model:expanded="expanded"></ContentTree>
  </div>
</template>
<script lang="ts" setup>
const { collapsed } = defineProps<{ collapsed?: boolean }>()

const { t } = useI18n()
const notebookStore = useNotebookStore()
const settingsStore = useSettingsStore()

const expanded = ref([])
</script>
