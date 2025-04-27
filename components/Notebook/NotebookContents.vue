<template>
  <div>
    <div class="flex flex-row items-center gap-2">
      <slot name="manage"></slot>
      <NotebookRenameNotebook
        :notebook="notebook"
        :hide-rename="!onBackground"
        @toggle="toggleNotebook"></NotebookRenameNotebook>
    </div>
    <CommonDangerAlert v-if="openError">
      {{ openError }}
    </CommonDangerAlert>
    <div
      v-if="notebookStore.currentLevel(notebook, type)"
      :class="onBackground ? 'ml-8' : 'ml-6'"
      class="flex flex-col">
      <NotebookContentItems
        v-if="notebook.contents"
        :notebook-contents="notebook.contents"
        :on-background
        :type></NotebookContentItems>
      <NoteNewNote :notebook="notebook"></NoteNewNote>
    </div>
  </div>
</template>
<script lang="ts" setup async>
import type { Notebook, NotebookDisplay } from '~/types/notebook'

const { notebook, onBackground, type } = defineProps<{
  notebook: Notebook
  onBackground: boolean
  type: NotebookDisplay
}>()
const notebookStore = useNotebookStore()

const openError: Ref<string | null> = ref(null)
const toggleNotebook = async (possiblyRenamedNotebook: Notebook) => {
  const resp = await notebookStore.toggleNotebook(possiblyRenamedNotebook, type)
  if (!resp.success) openError.value = resp.message
}
</script>
