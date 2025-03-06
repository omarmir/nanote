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
      <div v-if="notebookStore.currentLevel(notebook, type)" class="ml-8">
        <NoteNewNote class="mb-4" :notebook="notebook.name" @added="(note: Note) => emit('added', note)"></NoteNewNote>
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
import type { Note, Notebook } from '~/types/notebook'

const emit = defineEmits<{
  (e: 'added', payload: Note): void
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

const openError: Ref<string | null> = ref(null)
const openNotebook = async (possiblyRenamedNotebook: Notebook) => {
  const resp = await notebookStore.openNotebook(possiblyRenamedNotebook, type)
  if (!resp.success) openError.value = resp.message
}
</script>
