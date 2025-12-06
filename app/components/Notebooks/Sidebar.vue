<template>
  <div v-if="!collapsed">
    <div class="mb-2 flex flex-row items-center justify-between">
      <h2 class="text-sm font-bold">{{ t('Notebook', 2) }}</h2>
      <div class="flex flex-row" :class="{ invisible: expanded.length === 0 }">
        <UButton
          size="sm"
          variant="ghost"
          color="warning"
          icon="i-lucide-fold-vertical"
          class="cursor-pointer"
          @click="expanded = []"></UButton>
        <UButton
          :icon="settingsStore.settings.isDense ? 'i-custom-code-more' : 'i-custom-code-less'"
          variant="ghost"
          class="cursor-pointer"
          @click="settingsStore.toggleDenseMode()"></UButton>
      </div>
    </div>

    <UTree
      v-model:expanded="expanded"
      ref="tree"
      @toggle="toggle"
      :nested="false"
      :unmount-on-hide="false"
      :items="notebookStore.notebooks"
      :ui="{
        linkLabel: 'text-wrap text-left'
      }"
      expanded-icon="i-lucide-book-open"
      collapsed-icon="i-lucide-book">
      <template #item-leading="{ item }">
        <div v-if="item.isNote" class="flex flex-row items-center">
          <FileIcon :name="item.label" :is-markdown="item.isMarkdown"></FileIcon>
        </div>
      </template>
      <template #item-label="{ item }">
        <template v-if="item.isPlaceholder">
          <USkeleton class="h-2 w-36"></USkeleton>
        </template>
        <template v-else class="text-wrap">
          {{ item.label }}
        </template>
      </template>
    </UTree>
  </div>
</template>
<script lang="ts" setup>
const { collapsed } = defineProps<{ collapsed?: boolean }>()
import type { TreeItemToggleEvent } from 'reka-ui'

const { t } = useI18n()
const notebookStore = useNotebookStore()
const settingsStore = useSettingsStore()

const expanded = ref([])

const toggle = async (e: TreeItemToggleEvent<NotebookTreeItem>, item: NotebookTreeItem) =>
  await notebookStore.toggleNotebook(item)
</script>
