<template>
  <UTree
    ref="tree"
    v-model:expanded="expanded"
    @toggle="(e, item) => toggle(item)"
    :nested="false"
    :unmount-on-hide="false"
    :items="notebook"
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
      <template v-else>
        {{ item.label }}
      </template>
    </template>
  </UTree>
</template>
<script lang="ts" setup>
const { notebook, type } = defineProps<{ notebook: NotebookTreeItemClient[]; type: 'root' | 'sidebar' }>()

const expanded = defineModel<string[] | undefined>({ required: false })

const notebookStore = useNotebookStore()
const openError: Ref<string | null> = ref(null)

const toggle = async (item: NotebookTreeItemClient) => {
  const resp = type === 'root' ? await notebookStore.toggleRootNotebook(item) : await notebookStore.toggleNotebook(item)
}
</script>
