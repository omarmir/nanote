<template>
  <form class="w-full grow" @submit.prevent="addNotebook">
    <label for="search" class="sr-only mb-2 text-sm font-medium text-gray-900">Note</label>
    <div class="relative mr-4 max-w-lg">
      <div class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3">
        <svg xmlns="http://www.w3.org/2000/svg" class="size-5 text-gray-400" viewBox="0 0 24 24">
          <path fill="currentColor" d="M4 22V2h10l6 6v14zm9-13V4H6v16h12V9zM6 4v5zv16z" />
        </svg>
      </div>
      <CommonBaseInput id="name" v-model="newNote" placeholder="Note name" required class="mt-2"></CommonBaseInput>
      <!-- <input
        id="name"
        v-model="newNote"
        :class="{ 'border-gray-300 text-gray-900': onBackground, 'border-gray-700 text-gray-400': !onBackground }"
        type="text"WS
        name="name"
        class="my-2 block w-full rounded-md border bg-transparent p-2 pe-16 ps-10 text-sm focus:outline-0 focus:ring-1"
        placeholder="Note name"
        required /> -->
      <CommonThemeButton type="submit" class="absolute bottom-[7px] end-2">Add</CommonThemeButton>
    </div>
    <CommonDangerAlert v-if="error" class="mb-0 mr-4">{{ error }}</CommonDangerAlert>
  </form>
</template>
<script lang="ts" setup>
import type { Note } from '~/types/notebook'
const { notebook } = defineProps<{ notebook: string }>()

const store = useNoteStore()
const noteBookStore = useNotebookStore()

const newNote: Ref<string | null> = ref('')
const error: Ref<string | null> = ref(null)
const emit = defineEmits<{
  (e: 'added', payload: Note): void
}>()
const addNotebook = async () => {
  if (!newNote.value) {
    error.value = 'Name is required.'
    return
  }

  const resp = await store.addNote(notebook, newNote.value, noteBookStore.currentNotebook)

  if (resp.success) {
    newNote.value = null
    error.value = null
    emit('added', resp.data)
  } else {
    error.value = resp.message
  }
}
</script>
