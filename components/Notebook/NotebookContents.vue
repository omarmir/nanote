<template>
  <div class="flex flex-col">
    <div class="flex flex-row items-center gap-2">
      <slot name="manage"></slot>
      <NotebookRenameNotebook
        :notebook="notebook"
        :hide-rename="!onBackground"
        @toggle="openNotebook"></NotebookRenameNotebook>
    </div>
    <div v-if="showChildren">
      <CommonDangerAlert v-if="openError">
        {{ openError }}
      </CommonDangerAlert>
      <div v-if="notebookStore.currentLevel(notebook, type)" class="ml-8">
        <NoteNewNote class="mb-4" :notebook="notebook"></NoteNewNote>
        <NotebookContentItems
          v-if="notebook.contents"
          :notebook-contents="notebook.contents"
          :on-background
          :type></NotebookContentItems>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup async>
import type { Notebook, NotebookDisplay } from '~/types/notebook'

const {
  notebook,
  onBackground,
  type,
  showChildren = true
} = defineProps<{
  notebook: Notebook
  onBackground: boolean
  type: NotebookDisplay
  showChildren?: boolean
}>()
const notebookStore = useNotebookStore()

const openError: Ref<string | null> = ref(null)
const openNotebook = async (possiblyRenamedNotebook: Notebook) => {
  const resp = await notebookStore.openNotebook(possiblyRenamedNotebook, type)
  if (!resp.success) openError.value = resp.message
}
</script>
