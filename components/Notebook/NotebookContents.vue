<template>
  <div>
    <NotebookRenameNotebook
      :notebook="notebook"
      :hide-rename="!onBackground"
      @toggle="openNotebook"></NotebookRenameNotebook>
    <div v-if="showChildren">
      <CommonDangerAlert v-if="openError">
        {{ openError }}
      </CommonDangerAlert>
      <div class="ml-8">
        <NoteNewNote
          v-if="notebookContents"
          class="mb-4"
          :notebook="notebook.name"
          @added="(note: Note) => emit('added', note)"></NoteNewNote>
        <NotebookContentItems :notebook-contents="notebookContents" :on-background :type></NotebookContentItems>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup async>
import type { Note, Notebook, NotebookContents } from '~/types/notebook'

const emit = defineEmits<{
  (e: 'added', payload: Note): void
  (e: 'opened', payload: NotebookContents | null): void
}>()
const {
  notebook,
  onBackground,
  type,
  showChildren = true
} = defineProps<{
  notebook: Notebook
  onBackground: boolean
  type: 'main' | 'sidebar'
  showChildren?: boolean
}>()
const notebookStore = useNotebookStore()

const openNotebook = async (possiblyRenamedNotebook: Notebook) =>
  await notebookStore.openNotebook(possiblyRenamedNotebook, type)
</script>
