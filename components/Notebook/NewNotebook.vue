<template>
  <form class="w-full grow" @submit.prevent="addNotebook">
    <label for="search" class="sr-only mb-2 text-sm font-medium text-gray-900">New notebook</label>
    <div class="relative">
      <div class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-500" viewBox="0 0 1024 1024">
          <path
            fill="currentColor"
            d="M192 128v768h640V128zm-32-64h704a32 32 0 0 1 32 32v832a32 32 0 0 1-32 32H160a32 32 0 0 1-32-32V96a32 32 0 0 1 32-32" />
          <path
            fill="currentColor"
            d="M672 128h64v768h-64zM96 192h128q32 0 32 32t-32 32H96q-32 0-32-32t32-32m0 192h128q32 0 32 32t-32 32H96q-32 0-32-32t32-32m0 192h128q32 0 32 32t-32 32H96q-32 0-32-32t32-32m0 192h128q32 0 32 32t-32 32H96q-32 0-32-32t32-32" />
        </svg>
      </div>
      <CommonBaseInput
        id="name"
        v-model="newBook"
        type="text"
        name="name"
        placeholder="Notebook name"
        required></CommonBaseInput>
      <CommonBaseButton type="submit">Add</CommonBaseButton>
    </div>
  </form>
</template>
<script lang="ts" setup>
import { useNotebookStore } from '~/stores/notebooks'

const emit = defineEmits<{
  (e: 'error', payload: string): void
}>()

const store = useNotebookStore()

const newBook = ref('')

const addNotebook = async () => {
  const resp = await store.addNotebook(newBook.value)

  if (resp.success) {
    newBook.value = ''
  } else {
    emit('error', resp.message)
  }
}
</script>
