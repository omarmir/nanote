<template>
  <div class="w-full">
    <div
      v-if="notebookStore.currentLevel(notebook, type)"
      class="flex flex-col gap-2"
      :class="type === 'main' ? 'ml-8' : 'ml-6'">
      <NotebookContentItems
        v-if="notebook.contents"
        :notebook-contents="notebook.contents"
        :type></NotebookContentItems>
      <NoteNewNote :notebook="notebook"></NoteNewNote>
    </div>
  </div>
</template>
<script lang="ts" setup async>
import type { Notebook, NotebookDisplay } from '~/types/notebook'

const { notebook, type } = defineProps<{
  notebook: Notebook
  type: NotebookDisplay
}>()
const notebookStore = useNotebookStore()
</script>
