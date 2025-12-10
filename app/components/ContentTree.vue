<template>
  <UTree
    ref="tree"
    v-model:expanded="expanded"
    :nested="false"
    :unmount-on-hide="false"
    :items="notebook"
    expanded-icon="i-lucide-book-open"
    collapsed-icon="i-lucide-book"
    @toggle="(e, item) => toggle(item)">
    <template #item-leading="{ item }">
      <div v-if="item.isNote" class="self-start">
        <FileIcon :name="item.label" :is-markdown="item.isMarkdown" />
      </div>
    </template>
    <template #item-label="{ item }">
      <template v-if="item.isPlaceholder">
        <USkeleton class="h-2 w-36" />
      </template>
      <template v-else>
        <div class="text-left">
          {{ item.label }}
        </div>
        <div
          v-if="!settingsStore.settings.isDense && item.isNote"
          class="mt-0.5 flex flex-row gap-2 text-neutral-500 dark:text-neutral-400">
          <small>
            {{ t('Updated') }}:
            <CommonDateDisplay :date="item.updatedAt" />
          </small>
        </div>
      </template>
    </template>
  </UTree>
</template>

<script lang="ts" setup>
const { notebook, type } = defineProps<{ notebook: NotebookTreeItemClient[]; type: 'root' | 'sidebar' }>()

const expanded = defineModel<string[] | undefined>({ required: false })
const { t } = useI18n()

const notebookStore = useNotebookStore()
const settingsStore = useSettingsStore()

const openError: Ref<string | null> = ref(null)

const toggle = async (item: NotebookTreeItemClient) => {
  const resp = type === 'root' ? await notebookStore.toggleRootNotebook(item) : await notebookStore.toggleNotebook(item)
  if (!resp.success) {
    openError.value = resp.message
  } else {
    openError.value = null
  }
}
</script>
