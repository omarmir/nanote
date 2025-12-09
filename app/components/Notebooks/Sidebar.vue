<template>
  <div v-if="!collapsed">
    <div class="mb-2 flex flex-row items-center justify-between">
      <h2 class="text-sm font-bold">
        {{ t('Notebook', 2) }}
      </h2>
      <UButton
        size="sm"
        variant="ghost"
        color="warning"
        icon="i-lucide-fold-vertical"
        :class="{ invisible: expanded.length === 0 }"
        @click="expanded = []" />
    </div>
    <ContentTree
      v-if="notebookStore.notebooks"
      v-model:expanded="expanded"
      type="sidebar"
      :notebook="notebookStore.notebooks" />
  </div>
</template>

<script lang="ts" setup>
const { collapsed } = defineProps<{ collapsed?: boolean }>()

const { t } = useI18n()
const notebookStore = useNotebookStore()
const expanded = ref([])
</script>
