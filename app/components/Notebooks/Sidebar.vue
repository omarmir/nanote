<template>
  <div v-if="!collapsed">
    <div class="mb-1 flex flex-row items-center justify-between">
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
    <TreeNotebooks
      :compact="true"
      v-if="notebookStore.notebooks"
      v-model:expanded="expanded"
      @toggle="toggle"
      type="sidebar"
      :items="notebookStore.notebooks" />
  </div>
</template>

<script lang="ts" setup>
const { collapsed } = defineProps<{ collapsed?: boolean }>()

const { t } = useI18n()
const notebookStore = useNotebookStore()
const expanded = ref([])
const openError: Ref<string | null> = ref(null)

const toggle = async (item: NotebookTreeItemClient) => {
  const resp = await notebookStore.toggleNotebook(item)
  if (!resp.success) {
    openError.value = resp.message
  } else {
    openError.value = null
  }
}
</script>
