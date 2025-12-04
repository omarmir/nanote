<template>
  <div>
    <div class="mb-2 flex flex-row items-center justify-between">
      <h2 class="text-sm font-bold">{{ t('Notebook', 2) }}</h2>
      <UButton
        size="sm"
        variant="ghost"
        color="warning"
        icon="i-lucide-fold-vertical"
        class="cursor-pointer"
        :class="{ invisible: expanded.length === 0 }"
        @click="expanded = []"></UButton>
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
        <UIcon
          name="i-custom-quill-markdown"
          class="text-primary size-5 shrink-0"
          v-if="item.isNote && item.isMarkdown"></UIcon>
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
import type { TreeItemToggleEvent } from 'reka-ui'

const { t } = useI18n()
const notebookStore = useNotebookStore()

const expanded = ref([])

const toggle = async (e: TreeItemToggleEvent<NotebookTreeItem>, item: NotebookTreeItem) =>
  await notebookStore.toggleNotebook(item)
</script>
