<template>
  <CommonBaseCard class="px-9 py-5">
    <h1 class="mb-2 flex flex-row items-center gap-2 text-xl">
      <svg xmlns="http://www.w3.org/2000/svg" class="size-5" viewBox="0 0 1024 1024">
        <path
          fill="currentColor"
          d="M192 128v768h640V128zm-32-64h704a32 32 0 0 1 32 32v832a32 32 0 0 1-32 32H160a32 32 0 0 1-32-32V96a32 32 0 0 1 32-32" />
        <path
          fill="currentColor"
          d="M672 128h64v768h-64zM96 192h128q32 0 32 32t-32 32H96q-32 0-32-32t32-32m0 192h128q32 0 32 32t-32 32H96q-32 0-32-32t32-32m0 192h128q32 0 32 32t-32 32H96q-32 0-32-32t32-32m0 192h128q32 0 32 32t-32 32H96q-32 0-32-32t32-32" />
      </svg>
      {{ notebook }}
    </h1>
    <NoteNotebookNotes
      v-if="notebook && !error"
      :notebook="notebook"
      :notes
      :on-background="true"
      @added="addNote"></NoteNotebookNotes>
    <CommonDangerAlert v-if="error" class="mb-4 mt-4">{{ error.data.message }}</CommonDangerAlert>
  </CommonBaseCard>
</template>
<script lang="ts" setup>
import type { Note } from '~/types/notebook'

const route = useRoute()
const notebook: string = typeof route.params.notebook === 'string' ? route.params.notebook : route.params.notebook[0]

const { data: notes, error } = useFetch<Note[]>(`/api/${notebook}/notes`, { immediate: true })

const addNote = (note: Note) => {
  if (note.notebook === notebook) {
    notes.value?.push(note)
  }
}
</script>
